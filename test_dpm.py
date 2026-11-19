"""Synthetic regression tests. Tiny placeholder files are never decoded."""
import contextlib
import io
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import backtest
import dpm
import gui
import learning


def track(path, stage='Gathering'):
    return {'path': str(path), 'suggested_stage': stage, 'alternate_stage': 'Sunrise',
            'scores': dict(zip(dpm.NAMES, dpm.STAGES[stage]))}


class ScannerTests(unittest.TestCase):
    def test_boundary_duplicates_cache_and_disconnected_drive(self):
        with tempfile.TemporaryDirectory() as home:
            base = Path(home)
            root = base / 'music'
            root.mkdir()
            for name, content in {'short.wav': b'sample', 'a.wav': b'track',
                                  'b.wav': b'track', 'long.wav': b'other'}.items():
                (root / name).write_bytes(content)
            db = base / 'cache.sqlite3'
            out = base / 'results.json'
            argv = ['dpm.py', str(base / 'Volumes' / '23'), str(root), str(root),
                    '--db', str(db), '--output', str(out)]
            # Seed a compatible current-extractor cache entry in the existing schema.
            with sqlite3.connect(db) as conn:
                conn.execute('CREATE TABLE cache (digest TEXT PRIMARY KEY, payload TEXT NOT NULL)')
                conn.execute('INSERT INTO cache VALUES (?,?)',
                             (dpm.CACHE_NAMESPACE + dpm.file_digest(root / 'long.wav'),
                              json.dumps(track('old location'))))
            def duration(path):
                return {'short.wav': 89.999, 'long.wav': 90.001}.get(path.name, 90.0)
            with patch('sys.argv', argv), patch.object(dpm, 'duration_seconds', side_effect=duration), \
                 patch.object(dpm, 'analyze', side_effect=track) as analyze, contextlib.redirect_stdout(io.StringIO()):
                dpm.main()
                analyze.assert_called_once()
                entries = json.loads(out.read_text())
                self.assertEqual([90.0, 90.0], sorted(r['duration_seconds'] for r in entries))
                self.assertEqual({'a.wav', 'b.wav', 'long.wav'},
                                 {Path(p).name for r in entries for p in [r['path'], *r['duplicate_paths']]})
                self.assertIn('Short files skipped: 1', out.with_suffix('.scan.log').read_text())
                self.assertIn('Missing or inaccessible root:', out.with_suffix('.scan.log').read_text())
                self.assertIn('/Volumes/23', out.with_suffix('.scan.log').read_text())
                dpm.main()
                analyze.assert_called_once()
                (root / 'a.wav').write_bytes(b'modified audio')
                dpm.main()
                self.assertEqual(2, analyze.call_count)
            previous = out.read_bytes()
            with patch('sys.argv', ['dpm.py', str(base / 'Volumes' / '23'), '--output', str(out)]), \
                 contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit):
                dpm.main()
            self.assertEqual(previous, out.read_bytes())

    def test_folder_scans_preserve_other_folders(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            out = base / 'results.json'
            common = ['--merge', '--db', str(base / 'cache.db'), '--output', str(out)]
            with patch.object(dpm, 'duration_seconds', return_value=90), \
                 patch.object(dpm, 'analyze', side_effect=track), contextlib.redirect_stdout(io.StringIO()):
                for folder in ('first', 'second'):
                    root = base / folder
                    root.mkdir()
                    (root / 'track.wav').write_bytes(b'same audio')
                    with patch('sys.argv', ['dpm.py', str(root), *common]):
                        dpm.main()
                rows = json.loads(out.read_text())
                self.assertEqual(1, len(rows))
                self.assertEqual([str((base / 'first' / 'track.wav').resolve())], rows[0]['duplicate_paths'])
                (root / 'track.wav').write_bytes(b'different audio')
                with patch('sys.argv', ['dpm.py', str(root), *common]):
                    dpm.main()
                rows = json.loads(out.read_text())
                self.assertEqual(2, len(rows))
                self.assertTrue(all(not row['duplicate_paths'] for row in rows))

    def test_long_sets_never_hashed_and_legacy_sets_filtered(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory); out=root/'results.json'
            (root/'set.wav').write_bytes(b'set')
            (root/'track.wav').write_bytes(b'track')
            out.write_text(json.dumps([dict(track('/offline/set.wav'),duration_seconds=7200)]))
            with patch('sys.argv',['dpm.py',str(root),'--merge','--output',str(out),'--db',str(root/'cache.db')]), patch.object(dpm,'duration_seconds',side_effect=lambda p:7200 if p.name=='set.wav' else 900), patch.object(dpm,'file_digest',wraps=dpm.file_digest) as digest, patch.object(dpm,'analyze',side_effect=track), contextlib.redirect_stdout(io.StringIO()):
                dpm.main()
            self.assertEqual([root/'track.wav'],[call.args[0] for call in digest.call_args_list])
            self.assertEqual(1,len(json.loads(out.read_text())))

    def test_camelot_all_24(self):
        wheel = [('G#', 'B'), ('D#', 'F#'), ('A#', 'C#'), ('F', 'G#'),
                 ('C', 'D#'), ('G', 'A#'), ('D', 'F'), ('A', 'C'),
                 ('E', 'G'), ('B', 'D'), ('F#', 'A'), ('C#', 'E')]
        notes = 'C C# D D# E F F# G G# A A# B'.split()
        for number, (minor, major) in enumerate(wheel, 1):
            self.assertEqual(f'{number}A', dpm.camelot_code(notes.index(minor), 'minor'))
            self.assertEqual(f'{number}B', dpm.camelot_code(notes.index(major), 'major'))


class LearningTests(unittest.TestCase):
    def test_assignment_undo_and_persistence(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(gui, 'LABEL', Path(directory) / 'labels.json'):
            item = dict(track('moved.wav'), digest='same-content')
            app = object.__new__(gui.App)
            app.queue, app.labels, app.board = [item], {}, lambda: None
            app.assign(item, 'Chaos')
            persisted = json.loads(gui.LABEL.read_text())
            self.assertEqual('Chaos', persisted['same-content']['stage'])
            self.assertEqual([], learning.batch([dict(item, path='new name.wav')], persisted))
            app.undo()
            self.assertEqual({}, json.loads(gui.LABEL.read_text()))
            self.assertEqual([item], app.queue)

    def test_batch_correction_and_undo_preserve_core(self):
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory() as directory, patch.object(gui,'LABEL',Path(directory)/'labels.json'):
            items=[dict(track('one.wav'),digest='one'),dict(track('two.wav'),digest='two')]
            app=object.__new__(gui.App); app.labels={}; app.visible=items
            app.tree=SimpleNamespace(selection=lambda:('0','1'))
            app.category=SimpleNamespace(get=lambda:'Chaos'); app.library=lambda:None
            app.assign_library()
            self.assertEqual({'one','two'},set(json.loads(gui.LABEL.read_text())))
            self.assertTrue(all(t['suggested_stage']=='Gathering' for t in items))
            app.undo_library(); self.assertEqual({},json.loads(gui.LABEL.read_text()))

    def test_nonfinite_features_are_ignored(self):
        item = track('test.wav')
        item['scores']['Darkness'] = float('nan')
        self.assertIsNone(learning.features(item)[0])
        self.assertEqual('Gathering', learning.recommend(item, {})[0])

    def test_held_out_labels_never_reach_model(self):
        train = [('train-id', 'Gathering', track('train.wav'))]
        test = [('test-id', 'Sunrise', track('test.wav', 'Sunrise'))]
        with patch.object(backtest, 'recommend', wraps=learning.recommend) as recommend:
            report = backtest.evaluate(train, test)
        self.assertEqual({'train-id'}, set(recommend.call_args.args[1]))
        self.assertEqual(1, report['personalized']['top1_accuracy'])
        self.assertEqual(1, report['personalized']['macro_f1_test_supported'])
        self.assertEqual(1, report['core']['confusion_actual_by_predicted']['Sunrise']['Sunrise'])

    def test_manifest_blocks_exact_duplicates_and_recording_group_overlap(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'a.wav').write_bytes(b'first')
            (root / 'b.wav').write_bytes(b'first')
            manifest = root / 'test.csv'
            header = 'path,stage,split,group\na.wav,Gathering,train,one\n'
            manifest.write_text(header + 'b.wav,Sunrise,test,two\n')
            with self.assertRaisesRegex(ValueError, 'Duplicate'):
                backtest.load_manifest(manifest)
            (root / 'b.wav').write_bytes(b'other')
            manifest.write_text(header + 'b.wav,Sunrise,test,ONE\n')
            with self.assertRaisesRegex(ValueError, 'spans splits'):
                backtest.load_manifest(manifest)
            manifest.write_text(header + 'b.wav,Sunrise,test,two\n')
            self.assertEqual(2, len(backtest.load_manifest(manifest)))


if __name__ == '__main__':
    unittest.main()
