import json,math,sqlite3,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import audio_v2 as audio
import crate_export as crates
import dpm,inventory,learning
from test_dpm import track

class AudioTests(unittest.TestCase):
 def test_sampling_and_edge_lengths(self):
  self.assertEqual([(0,48),(15,60),(42,48)],audio.sample_windows(90))
  for start,length in audio.sample_windows(900):self.assertLessEqual(start+length,900)
  self.assertEqual((2,2),audio.edge_lengths([0,0,1],[1,0,0],1,1))
 def test_percentile_ties_and_missing_context(self):
  self.assertEqual(.5,audio.percentile([1,1,1],1))
  self.assertEqual(.5,audio.percentile([1],1))
  tracks=[]
  for i in range(20):tracks.append(dict(track('/offline/'+str(i)),digest=str(i),duration_seconds=120,feature_version=audio.FEATURE_VERSION,
    raw_features={k:float(i+1) for k in audio.REQUIRED}))
  result=audio.apply_library_scores(tracks)
  self.assertEqual(20,result['scored']);self.assertIsNone(tracks[0]['scores']['Transition Compatibility'])
  self.assertEqual(10,tracks[0]['scores']['Darkness']);self.assertEqual(10,tracks[-1]['scores']['Energy'])
  self.assertEqual(1,len({t['reference_id'] for t in tracks}))
  original_ref=tracks[0]['reference_id'];tracks[0]['missing']=True
  self.assertEqual(0,audio.apply_library_scores(tracks)['scored'])
  tracks[0]['missing']=False;tracks[-1]['raw_features']['band_air']=99
  audio.apply_library_scores(tracks);self.assertNotEqual(original_ref,tracks[0]['reference_id'])
 def test_rebind_preserves_label_and_original_vector(self):
  item=dict(track('new.wav'),digest='same',score_version='new',reference_id='ref')
  old={'same':{'stage':'Chaos','features':[1]*12}}
  new=learning.rebind_labels([item],old)
  self.assertEqual('Chaos',new['same']['stage']);self.assertEqual([1]*12,new['same']['original_features'])
  self.assertEqual(learning.features(item),new['same']['features']);self.assertEqual([1]*12,old['same']['features'])
 def test_schema_mismatch_cannot_train_new_scores(self):
  item=dict(track('x'),score_version='new')
  old={'x':{'stage':'Chaos','features':learning.features(item)}}
  self.assertEqual(learning.recommend(item,{}),learning.recommend(item,old))
 def test_field_manual_all_stages_and_keys(self):
  data=json.loads((Path(__file__).parent/'field_manual.json').read_text())
  self.assertEqual(list(dpm.STAGES),[s['name'] for s in data['stages']])
  for row in data['wheel']:
   self.assertEqual(row['n']+'A',inventory.normalize_key(row['minor']))
   self.assertEqual(row['n']+'B',inventory.normalize_key(row['major']))

class ExportTests(unittest.TestCase):
 def test_harmonic_wrap_and_volume_paths(self):
  self.assertEqual(1,crates.key_penalty('12A','1A'));self.assertEqual(1,crates.key_penalty('8A','8B'))
  self.assertEqual(2.5,crates.key_penalty(None,'8A'));self.assertEqual(1,crates.bpm_cost(100,125))
  self.assertEqual((Path('/Volumes/USB'),Path('Music/x.mp3')),crates.volume_path('/Volumes/USB/Music/x.mp3'))
 def test_export_roundtrip_manual_override_and_file_integrity(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);p=root/'tune.mp3';p.write_bytes(b'music-untouched')
   item=dict(track(p),digest='one',duration_seconds=120,bpm=100,camelot='8A',secondary_eligible=True)
   label={'one':{'stage':'Sunrise','features':learning.features(item)}}
   manifest=crates.preview([item],label,root/'export')
   files=list((root/'export').rglob('*8 Sunrise.crate'));self.assertEqual(1,len(files));self.assertFalse(list((root/'export').rglob('*1 Gathering.crate')))
   self.assertEqual([str(p.relative_to('/'))],inventory.read_crate(files[0]))
   self.assertEqual(b'music-untouched',p.read_bytes());self.assertTrue((root/'export'/'8 Sunrise.m3u8').is_file())
   with self.assertRaises(FileExistsError):crates.preview([item],label,root/'export')
 def test_install_backup_and_open_serato_rejection(self):
  from types import SimpleNamespace
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);p=root/'tune.mp3';p.write_bytes(b'music')
   item=dict(track(p),duration_seconds=120,bpm=100,camelot='8A')
   export=root/'export';crates.preview([item],{},export)
   home=root/'home';target=home/'Music'/'_Serato_'/'Subcrates';target.mkdir(parents=True)
   name=next(export.rglob('*.crate')).name;(target/name).write_bytes(b'old crate');(target/'other.crate').write_bytes(b'keep')
   with patch.object(crates.sys,'platform','darwin'),patch.object(crates.subprocess,'run',return_value=SimpleNamespace(stdout='Serato DJ Pro')):
    with self.assertRaises(RuntimeError):crates.install_preview(export,home)
   with patch.object(crates.sys,'platform','darwin'),patch.object(crates.subprocess,'run',return_value=SimpleNamespace(stdout='Finder\npython')):
    report=crates.install_preview(export,home)
   self.assertEqual(len(json.loads((export/'manifest.json').read_text())['crates']),report['installed']);self.assertIn(b'old crate',[p.read_bytes() for p in Path(report['backup']).glob('*.crate')])
   self.assertEqual(b'keep',(target/'other.crate').read_bytes());self.assertEqual(b'music',p.read_bytes())

class ReferenceTests(unittest.TestCase):
 def test_heldout_features_do_not_change_frozen_reference(self):
  def make(i):return dict(track('/offline/'+str(i)),digest=str(i),duration_seconds=120,feature_version=audio.FEATURE_VERSION,raw_features={k:float(i+1) for k in audio.REQUIRED})
  reference=[make(i) for i in range(20)];heldout=make(100)
  audio.apply_library_scores(reference,reference_tracks=reference);snapshot=[dict(t['scores']) for t in reference];ref=reference[0]['reference_id']
  audio.apply_library_scores([heldout],reference_tracks=reference)
  self.assertEqual(ref,heldout['reference_id']);self.assertEqual(snapshot,[t['scores'] for t in reference])
  self.assertTrue(all(value is None or 0<=value<=10 for value in heldout['scores'].values()))
 def test_v1_inventory_migrates_without_losing_tracks(self):
  with tempfile.TemporaryDirectory() as td:
   path=Path(td)/'inventory.sqlite3'
   with sqlite3.connect(path) as c:
    c.executescript(inventory.SCHEMA[0]);c.execute('PRAGMA user_version=1');c.execute("INSERT INTO tracks(path,status) VALUES('original','unknown_duration')")
   c=inventory.connect(path)
   self.assertEqual(2,c.execute('PRAGMA user_version').fetchone()[0]);self.assertEqual('original',c.execute('SELECT path FROM tracks').fetchone()[0])
   self.assertEqual(0,c.execute('SELECT COUNT(*) FROM predictions').fetchone()[0])
