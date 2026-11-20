import tempfile,unittest,json
from pathlib import Path
from unittest.mock import patch
import desktop,test_set_editor
from dpm import atomic_json
from set_export import export_set

class ManualTagTests(unittest.TestCase):
 def state(self,root):
  rows=test_set_editor.EditorTests().rows(root,6)
  for row in rows:row['banger']=True
  atomic_json(root/'dpm_results.json',rows)
  return desktop.State(root)
 def test_bangers_are_manual_only_and_never_train_designation(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);state=self.state(root);self.assertFalse(any(t['banger'] for t in state.rows));before=[t['current_stage'] for t in state.rows]
   state.tag_bangers(['0','1'],True);self.assertEqual(2,state.snapshot()['bangers']);self.assertFalse(state.labels);self.assertEqual(before,[t['current_stage'] for t in state.rows]);self.assertTrue(state.find('0')['banger']);self.assertEqual('user',state.find('0')['banger_source'])
   state.assign(['0'],'Chaos');self.assertTrue(state.find('0')['banger']);state.reload();self.assertTrue(state.find('0')['banger']);state.tag_bangers(['0'],False);self.assertFalse(state.find('0')['banger']);self.assertEqual('Chaos',state.find('0')['current_stage']);self.assertEqual(1,desktop.State(root).snapshot()['bangers'])
 def test_invalid_batch_and_disk_failure_are_atomic(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);state=self.state(root);state.tag_bangers(['0'],True);before=(root/'manual_tags.json').read_bytes()
   with self.assertRaises(ValueError):state.tag_bangers(['1','absent'],True)
   with self.assertRaises(ValueError):state.tag_bangers(['1'],'true')
   self.assertEqual(before,(root/'manual_tags.json').read_bytes())
   with patch('desktop.atomic_json',side_effect=OSError('disk full')):
    with self.assertRaises(OSError):state.tag_bangers(['1'],True)
   self.assertFalse(state.find('1')['banger'])
 def test_tags_stay_in_profile_and_are_not_copied_with_analysis(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);state=self.state(root);state.tag_bangers(['0'],True);state.profile_action({'operation':'create','name':'New ears','reuse_analysis':True});self.assertEqual(0,state.snapshot()['bangers']);self.assertFalse((state.data/'manual_tags.json').exists());state.profile_action({'operation':'switch','id':'default'});self.assertTrue(state.find('0')['banger'])
 def test_clear_designation_restores_learned_placement_and_undo(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);state=self.state(root);state.assign(['0'],'Chaos');state.tag_bangers(['0'],True);state.clear_labels(['0']);self.assertFalse(state.labels);self.assertIsNone(state.find('0')['manual_stage']);self.assertTrue(state.find('0')['banger']);state.undo_labels();self.assertEqual('Chaos',state.find('0')['manual_stage'])
 def test_text_and_csv_exports_include_only_explicit_bangers(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);state=self.state(root);state.tag_bangers(['1'],True);made=state.set_action({'operation':'append_many','ids':['1','0'],'title':'Tagged set'});result=export_set(made['plan'],state.rows,root/'out','text');text=(root/'out/Tagged set.txt').read_text(encoding='utf-8');self.assertEqual(1,text.count('[BANGER — your tag]'));self.assertIn('banger',(root/'out/Tagged set-running-order.csv').read_text(encoding='utf-8-sig').splitlines()[0])
