import unittest,tempfile,json,sqlite3
from pathlib import Path
from contextlib import closing
from unittest.mock import patch
import desktop,test_set_editor
from dpm import atomic_json
from profiles import ProfileStore
from source_scope import scope_rows,validate_sources
from set_tools import append_tracks,undo_order
from set_export import export_set

class ProfileSourceTests(unittest.TestCase):
 def test_profiles_preserve_original_and_isolate_training_settings_sets(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=test_set_editor.EditorTests().rows(root,8);atomic_json(root/'dpm_results.json',rows);state=desktop.State(root)
   state.assign(['0'],'Confidence');state.set_tempo(['0'],value=170);made=state.set_action({'operation':'create','mode':'range','auto_populate':True,'count':3});original=(root/'labels.json').read_bytes();key=made['plan']['id']
   fresh=state.profile_action({'operation':'create','name':'Fresh'})
   self.assertEqual(0,fresh['stored']);self.assertEqual(0,fresh['reviewed']);self.assertFalse(fresh['set_summaries']);self.assertNotEqual(root,state.data)
   self.assertEqual(fresh['profile']['id'],desktop.State(root).snapshot()['profile']['id'])
   restored=state.profile_action({'operation':'switch','id':'default'});self.assertEqual(8,restored['stored']);self.assertEqual(1,restored['reviewed']);self.assertEqual(key,state.sets.summary()[0]['id']);self.assertEqual(original,(root/'labels.json').read_bytes());self.assertEqual(170,state.overrides['0']['bpm'])
   reused=state.profile_action({'operation':'create','name':'New training','reuse_analysis':True});self.assertEqual(8,reused['stored']);self.assertEqual(0,reused['reviewed']);self.assertFalse(state.overrides);self.assertFalse(state.sets.summary());self.assertEqual(160,state.average_bpm)
   self.assertTrue(all(not r['manual_stage'] for r in state.rows))
 def test_sqlite_reuse_and_failed_create_do_not_damage_original(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);store=ProfileStore(root)
   with closing(sqlite3.connect(root/'cache.sqlite3')) as db:db.execute('create table cache (value)');db.execute('insert into cache values (42)');db.commit()
   record=store.create('reuse','default')
   with closing(sqlite3.connect(store.path(record['id'])/'cache.sqlite3')) as db:self.assertEqual(42,db.execute('select value from cache').fetchone()[0])
   before=store.file.read_bytes()
   with patch.object(store,'save',side_effect=OSError('disk full')):
    with self.assertRaises(OSError):store.create('fail')
   self.assertEqual(before,store.file.read_bytes());self.assertEqual(1,len(list((root/'profiles').iterdir())))
 def test_profile_switch_is_blocked_while_scan_runs(self):
  with tempfile.TemporaryDirectory() as td:
   state=desktop.State(Path(td));state.proc=object()
   with self.assertRaisesRegex(ValueError,'scan'):state.profile_action({'operation':'create','name':'blocked'})
   self.assertEqual(1,len(state.profiles.summary()))
 def test_folder_scope_recursive_multiple_and_duplicate_path(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);a=root/'genre';b=root/'genre-other';sub=a/'sub';sub.mkdir(parents=True);b.mkdir();rows=test_set_editor.EditorTests().rows(sub,3);other=test_set_editor.EditorTests().rows(b,2)
   self.assertEqual(3,len(scope_rows(rows+other,[str(a)])));self.assertEqual(5,len(scope_rows(rows+other,[str(a),str(b)])))
   alias=b/'duplicate.wav';alias.write_bytes(b'audio unchanged');rows[0]['duplicate_paths']=[str(alias)]
   scoped=scope_rows(rows,[str(b)]);self.assertEqual(1,len(scoped));self.assertEqual(str(alias.resolve()),scoped[0]['source_path']);self.assertEqual(5,len(scope_rows(rows+other,[])))
   with self.assertRaises(ValueError):validate_sources(['relative'])
 def test_scoped_generation_preview_and_undo(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);a=root/'a';b=root/'b';a.mkdir();b.mkdir();rows=test_set_editor.EditorTests().rows(a,8);other=test_set_editor.EditorTests().rows(b,8)
   for i,row in enumerate(other):row.update(digest=str(i+20),id=str(i+20))
   atomic_json(root/'dpm_results.json',rows+other);state=desktop.State(root)
   made=state.set_action({'operation':'create','mode':'range','auto_populate':True,'count':4,'source_folders':[str(a)]});p=made['plan'];self.assertTrue(p['entries']);self.assertTrue(all(int(e['track_id'])<8 for e in p['entries']))
   before=(root/'sets.json').read_bytes();preview=state.set_action({'operation':'preview','id':p['id'],'mode':'range','arc':p['arc'],'limits':p['limits'],'source_folders':[str(b)]});self.assertEqual(8,preview['source_count']);self.assertEqual(before,(root/'sets.json').read_bytes())
   state.set_action({'operation':'configure','title':p['title'],'id':p['id'],'mode':'range','arc':p['arc'],'limits':p['limits'],'source_folders':[str(b)],'count':4});self.assertTrue(all(int(e['track_id'])>=20 for e in p['entries']));undo_order(state.sets,p['id']);self.assertEqual([str(a.resolve())],p['source_folders'])
 def test_text_export_exact_order_zero_ratings_and_source_copy(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=test_set_editor.EditorTests().rows(root,3);rows[1]['scores'].update(Energy=0,Aggression=0,Unknown=None);alias=root/'alternate.wav';alias.write_bytes(b'audio unchanged')
   p={'id':'set','title':'Text set','entries':[{'track_id':'1','path_hint':str(alias)},{'track_id':'0'}]}
   with patch('set_export.sys.platform','win32'):result=export_set(p,rows,root/'out','text')
   text=(root/'out/Text set.txt').read_text(encoding='utf-8');self.assertIn('Energy: 0',text);self.assertIn('Aggression: 0',text);self.assertNotIn('Unknown:',text);self.assertLess(text.index('alternate.wav'),text.index('0 café tune.wav'));self.assertFalse(result['playlist']);self.assertEqual(['1','0'],json.loads((root/'out/manifest.json').read_text())['ordered_track_ids']);self.assertTrue(all(Path(r['path']).read_bytes()==b'audio unchanged' for r in rows))
