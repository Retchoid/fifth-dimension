import tempfile,unittest,json,csv,sys
from pathlib import Path
from unittest.mock import patch
from set_tools import SetStore,availability,populate,reorder,replace_track,undo_order,replacements,suggestions
from set_export import export_set
from inventory import read_crate
from learning import identity
from dpm import atomic_json
from test_dpm import track
import desktop

class EditorTests(unittest.TestCase):
 def rows(self,root,n=8):
  rows=[]
  for i in range(n):
   path=root/f'{i} café tune.wav';path.write_bytes(b'audio unchanged')
   rows.append(dict(track(path),id=str(i),digest=str(i),name=path.name,current_stage='Gathering',bpm=160,measured_bpm=160,camelot='8A',scores={'Energy':4+i*.1,'Darkness':6},duration_seconds=120))
  return rows
 def test_auto_build_has_unique_available_tracks_and_reports_shortage(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.rows(root);Path(rows[2]['path']).unlink();rows[1]['bpm']=120
   store=SetStore(root/'sets.json');p=store.create('x','range');result=populate(store,p['id'],availability(rows),10)
   ids=[e['track_id'] for e in p['entries']];self.assertEqual(6,len(ids));self.assertEqual(6,len(set(ids)));self.assertNotIn('2',ids);self.assertNotIn('1',ids);self.assertEqual(4,result['unfilled']);self.assertEqual(1,result['unavailable_excluded'])
 def test_duplicate_path_can_rescue_an_unavailable_primary(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);row=self.rows(root,1)[0];row['duplicate_paths']=[row['path']];row['path']=str(root/'absent.wav');row['missing']=True
   live=availability([row])[0];self.assertTrue(live['available']);self.assertFalse(live['missing']);self.assertEqual(row['duplicate_paths'][0],live['playback_path'])
 def test_drag_move_persists_and_undo_restores_ratings(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);store=SetStore(root/'sets.json');p=store.create('x','range')
   for i in range(4):store.add(p['id'],str(i))
   store.edit_entry(p['id'],1,rating='good');reorder(store,p['id'],0,3)
   self.assertEqual(['1','2','3','0'],[e['track_id'] for e in SetStore(store.path).get(p['id'])['entries']]);self.assertTrue(all(e['rating']=='unreviewed' for e in p['entries']))
   undo_order(store,p['id']);self.assertEqual('0',p['entries'][0]['track_id']);self.assertEqual('good',p['entries'][1]['rating'])
 def test_swap_rechecks_availability_and_excludes_used_tracks(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.rows(root);store=SetStore(root/'sets.json');p=store.create('x','range')
   for i in range(3):store.add(p['id'],str(i))
   store.edit_entry(p['id'],2,rating='good');ranked=replacements(store,p['id'],availability(rows),1)
   self.assertTrue(all(r['id'] not in {'0','1','2'} for r in ranked['rows']));self.assertTrue(all('outgoing' in r for r in ranked['rows']))
   replace_track(store,p['id'],1,rows[4]);self.assertEqual('4',p['entries'][1]['track_id']);self.assertEqual('unreviewed',p['entries'][2]['rating'])
   Path(rows[5]['path']).unlink()
   with self.assertRaises(ValueError):replace_track(store,p['id'],1,rows[5])
   with self.assertRaises(ValueError):replace_track(store,p['id'],1,rows[0])
   self.assertEqual('4',p['entries'][1]['track_id'])
 def test_export_exact_order_and_original_audio_integrity(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.rows(root,4);store=SetStore(root/'sets.json');p=store.create('My Set','range')
   for i in [2,0,3,1]:store.add(p['id'],str(i))
   result=export_set(p,rows,root/'out');manifest=json.loads((root/'out/manifest.json').read_text());self.assertEqual(['2','0','3','1'],manifest['ordered_track_ids'])
   lines=[s for s in (root/'out/My Set.m3u8').read_text(encoding='utf-8').splitlines() if not s.startswith('#')];self.assertEqual([rows[i]['path'] for i in [2,0,3,1]],lines)
   with (root/'out/My Set-running-order.csv').open(encoding='utf-8-sig') as f:records=list(csv.DictReader(f))
   self.assertEqual(lines,[r['path'] for r in records]);self.assertEqual(['1','2','3','4'],[r['position'] for r in records])
   if sys.platform!='win32':
    crate=next((root/'out/internal').glob('*.crate'));self.assertEqual([str(Path(s).relative_to('/')) for s in lines],read_crate(crate))
   self.assertTrue(all(Path(r['path']).read_bytes()==b'audio unchanged' for r in rows));self.assertEqual(4,result['tracks'])
 def test_export_fails_clearly_for_offline_or_unmatched_entry(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.rows(root,1);p={'id':'p','title':'x','entries':[{'track_id':'0'},{'track_id':None,'unmatched_path':'unknown'}]}
   with self.assertRaisesRegex(ValueError,'positions 2'):export_set(p,rows,root/'out')
   self.assertFalse((root/'out').exists())
 def test_state_empty_library_auto_build_does_not_raise_or_invent_placeholders(self):
  with tempfile.TemporaryDirectory() as td:
   state=desktop.State(Path(td));result=state.set_action({'operation':'create','auto_populate':True,'replace_index':0})
   self.assertEqual([],result['plan']['entries']);self.assertEqual(18,result['plan']['generation']['unfilled']);self.assertIsNone(result['replacements'])
 def test_state_auto_build_configure_undo_and_export(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.rows(root,10);atomic_json(root/'dpm_results.json',rows);state=desktop.State(root)
   made=state.set_action({'operation':'create','auto_populate':True,'mode':'range','count':5,'replace_index':0});key=made['plan']['id'];before=[e.copy() for e in made['plan']['entries']]
   result=state.set_action({'operation':'configure','id':key,'title':'Changed','mode':'range','arc':made['plan']['arc'],'limits':made['plan']['limits'],'count':3,'replace_index':0})
   self.assertEqual(3,len(result['plan']['entries']));state.set_action({'operation':'undo_order','id':key});self.assertEqual(before,state.sets.get(key)['entries']);self.assertEqual('New set',state.sets.get(key)['title'])
   with patch.object(state,'choose_folder',return_value=root):exported=state.set_action({'operation':'export','id':key,'format':'playlist'})
   self.assertEqual(5,exported['exported']['tracks'])

 def test_planning_cards_enforce_exact_stage_and_energy_and_exclude_used(self):
  from set_tools import planning_cards
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.rows(root,8);rows[3]['current_stage']='Confidence';rows[4]['scores']['Energy']=8;Path(rows[5]['path']).unlink()
   store=SetStore(root/'sets.json');p=store.create('card',arc=[{'stage':'Gathering','tracks':3,'energy_from':4,'energy_to':4}]);store.add(p['id'],'0')
   card=planning_cards(store,p['id'],availability(rows))[0]
   self.assertEqual((3.5,4.5),(card['match_min'],card['match_max']));self.assertTrue(card['rows']);self.assertTrue(all(t['id'] not in {'0','3','4','5'} for t in card['rows']))
   self.assertTrue(all(3.5<=t['energy']<=4.5 for t in card['rows']))
 def test_planning_card_preview_changes_matches_without_mutating_set(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.rows(root);rows[0]['scores']['Energy']=8;atomic_json(root/'dpm_results.json',rows);state=desktop.State(root)
   made=state.set_action({'operation':'create','mode':'arc'});key=made['plan']['id'];before=(root/'sets.json').read_bytes()
   preview=state.set_action({'operation':'preview','id':key,'mode':'arc','arc':[{'stage':'Gathering','tracks':3,'energy_from':4,'energy_to':4}], 'limits':made['plan']['limits']})
   self.assertNotIn('0',[r['id'] for r in preview['phase_cards'][0]['rows']]);self.assertEqual(before,(root/'sets.json').read_bytes());self.assertFalse(state.labels)
