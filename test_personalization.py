import json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import dpm,learning,gui
from test_dpm import track

class PersonalizationTests(unittest.TestCase):
 def test_correction_changes_unseen_neighbor_and_preserves_original(self):
  labeled=dict(track('labeled.wav'),digest='labeled')
  unseen=dict(track('unseen.wav'),digest='unseen')
  self.assertEqual('Gathering',learning.current_stage(unseen,{}))
  labels={'labeled':{'stage':'Chaos','features':learning.features(labeled)}}
  self.assertEqual('Chaos',learning.recommend(unseen,labels)[0])
  self.assertEqual('Chaos',learning.current_stage(unseen,labels))
  self.assertEqual('Gathering',unseen['suggested_stage'])
 def test_own_manual_label_always_controls_current_category(self):
  item=dict(track('track.wav'),digest='manual')
  labels={'manual':{'stage':'Sunrise','features':[]}}
  self.assertEqual('Sunrise',learning.current_stage(item,labels))
 def test_unrelated_training_preserves_distant_prediction(self):
  item=track('distant.wav','Sunrise')
  example=track('example.wav','Chaos')
  labels={'other':{'stage':'Chaos','features':learning.features(example)}}
  self.assertEqual('Sunrise',learning.recommend(item,labels)[0])
 def test_rescan_and_reload_keep_training_effect(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);audio=root/'audio';audio.mkdir();p=audio/'test.wav';p.write_bytes(b'same')
   out=root/'results.json';label_file=root/'labels.json'
   digest=dpm.file_digest(p)
   labels={digest:{'stage':'Chaos','features':learning.features(track(p))}}
   label_file.write_text(json.dumps(labels))
   argv=['dpm.py',str(audio),'--merge','--db',str(root/'cache.db'),'--output',str(out)]
   with patch('sys.argv',argv),patch.object(dpm,'duration_seconds',return_value=120),patch.object(dpm,'analyze',side_effect=track) as analyze:
    dpm.main();dpm.main();self.assertEqual(1,analyze.call_count)
   app=object.__new__(gui.App);app.labels={};app.library=lambda:None
   with patch.object(gui,'LABEL',label_file),patch.object(gui,'RESULT',out):app.load()
   self.assertEqual('Chaos',learning.current_stage(app.tracks[0],app.labels))
   self.assertEqual('Gathering',app.tracks[0]['suggested_stage'])

if __name__=='__main__':unittest.main()
