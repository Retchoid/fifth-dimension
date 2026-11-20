import tempfile,unittest,json,copy
from pathlib import Path
from set_tools import SetStore,availability,planning_cards,append_tracks,undo_order,remember_suggestions
import test_set_editor
from dpm import atomic_json
import desktop

class AdditionTests(unittest.TestCase):
 def make_rows(self,root,n=20):
  rows=test_set_editor.EditorTests().rows(root,n)
  for row in rows:row['scores']['Energy']=4
  return rows
 def test_card_add_is_insert_not_swap_and_undo_restores_section(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.make_rows(root);store=SetStore(root/'sets.json');p=store.create('x',arc=[{'stage':'Gathering','tracks':3,'energy_from':4,'energy_to':4},{'stage':'Confidence','tracks':2,'energy_from':5,'energy_to':5}])
   for i in range(5):store.add(p['id'],str(i),'Gathering' if i<3 else 'Confidence')
   original=copy.deepcopy(p['entries']);result=append_tracks(store,p['id'],[rows[8]],0,['8','9','10'])
   self.assertEqual(1,result['count']);self.assertEqual(['0','1','2','8','3','4'],[e['track_id'] for e in p['entries']]);self.assertEqual(4,p['arc'][0]['tracks'])
   undo_order(store,p['id']);self.assertEqual(original,p['entries']);self.assertEqual(3,p['arc'][0]['tracks']);self.assertEqual({},p.get('suggestion_history',{}))
 def test_unapplied_card_criteria_can_be_saved_and_added_without_rebuild(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.make_rows(root);store=SetStore(root/'sets.json');p=store.create('x',arc=[{'stage':'Gathering','tracks':3,'energy_from':3,'energy_to':3}]);store.add(p['id'],'0')
   criteria={'title':'Edited','mode':'arc','arc':[{'stage':'Gathering','tracks':3,'energy_from':4,'energy_to':4}],'limits':p['limits']}
   append_tracks(store,p['id'],[rows[8]],0,criteria=criteria)
   self.assertEqual(['0','8'],[e['track_id'] for e in p['entries']]);self.assertEqual(4,p['arc'][0]['energy_from']);self.assertEqual('Edited',p['title'])
 def test_adding_rotates_entire_card_and_never_suggests_added_track(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.make_rows(root);store=SetStore(root/'sets.json');p=store.create('x',arc=[{'stage':'Gathering','tracks':3,'energy_from':4,'energy_to':4}]);live=availability(rows)
   before=planning_cards(store,p['id'],live)[0];seen=[r['id'] for r in before['rows']];append_tracks(store,p['id'],[next(t for t in rows if t['id']==seen[0])],0,seen)
   after=planning_cards(SetStore(store.path),p['id'],live)[0];self.assertEqual(3,len(after['rows']));self.assertFalse(set(seen)&{r['id'] for r in after['rows']})
 def test_small_pool_reports_recycling_instead_of_inventing_suggestions(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.make_rows(root,2);store=SetStore(root/'sets.json');p=store.create('x','range');live=availability(rows)
   before=planning_cards(store,p['id'],live)[0];remember_suggestions(p,0,[r['id'] for r in before['rows']]);store.save();after=planning_cards(store,p['id'],live)[0]
   self.assertTrue(after['recycled']);self.assertEqual(2,len(after['rows']));append_tracks(store,p['id'],[rows[0]],0,['0','1']);self.assertEqual(['1'],[r['id'] for r in planning_cards(store,p['id'],live)[0]['rows']])
 def test_library_chunk_preserves_display_order_skips_duplicates_and_undoes_once(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.make_rows(root);store=SetStore(root/'sets.json');p=store.create('x','range');store.add(p['id'],'0')
   result=append_tracks(store,p['id'],[rows[2],rows[5],rows[1],rows[2]])
   self.assertEqual(['0','2','5','1'],[e['track_id'] for e in p['entries']]);self.assertEqual((3,1),(result['count'],result['duplicates']));undo_order(store,p['id']);self.assertEqual(['0'],[e['track_id'] for e in p['entries']])
 def test_failed_chunk_and_capacity_limit_do_not_partially_add(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.make_rows(root);store=SetStore(root/'sets.json');p=store.create('x','range');store.add(p['id'],'0');before=store.path.read_bytes();Path(rows[4]['path']).unlink()
   with self.assertRaises(ValueError):append_tracks(store,p['id'],[rows[2],rows[4]])
   self.assertEqual(before,store.path.read_bytes());self.assertEqual(['0'],[e['track_id'] for e in p['entries']])
   p['entries']=[{'track_id':'old-'+str(i),'stage':'Gathering','rating':'unreviewed'} for i in range(500)];store.save()
   with self.assertRaisesRegex(ValueError,'500'):append_tracks(store,p['id'],[rows[2]])
   self.assertEqual(500,len(p['entries']))
 def test_library_can_create_empty_destination_and_add_a_chunk(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.make_rows(root);atomic_json(root/'dpm_results.json',rows);state=desktop.State(root)
   result=state.set_action({'operation':'append_many','id':None,'ids':['3','1','7'],'title':'Library chunk'})
   self.assertEqual('Library chunk',result['plan']['title']);self.assertEqual(['3','1','7'],[e['track_id'] for e in result['plan']['entries']]);self.assertEqual(3,result['added']['count']);self.assertFalse(state.labels)
 def test_repeated_sections_do_not_display_the_same_suggestions(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.make_rows(root);store=SetStore(root/'sets.json');p=store.create('x',arc=[{'stage':'Gathering','tracks':3,'energy_from':4,'energy_to':4}]*2)
   cards=planning_cards(store,p['id'],availability(rows));self.assertTrue(cards[0]['rows'] and cards[1]['rows']);self.assertFalse({r['id'] for r in cards[0]['rows']}&{r['id'] for r in cards[1]['rows']})

 def test_library_add_also_refreshes_affected_category_suggestions(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);rows=self.make_rows(root);atomic_json(root/'dpm_results.json',rows);state=desktop.State(root)
   result=state.set_action({'operation':'create','mode':'range'});key=result['plan']['id'];seen={r['id'] for r in result['phase_cards'][0]['rows']}
   after=state.set_action({'operation':'append_many','id':key,'ids':['15']});self.assertFalse(seen&{r['id'] for r in after['phase_cards'][0]['rows']});self.assertNotIn('15',[r['id'] for r in after['phase_cards'][0]['rows']])
