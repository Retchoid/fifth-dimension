import json,tempfile,threading,unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from urllib.request import Request,urlopen
from urllib.error import HTTPError
import desktop,tempo,inventory
from dpm import atomic_json
from test_dpm import track

class TempoTests(unittest.TestCase):
 def test_scalar_tag_formats(self):
  self.assertEqual('174',tempo.scalar_tag([174]))
  self.assertEqual('172.5',tempo.scalar_tag(SimpleNamespace(text=['172.5'])))
  self.assertEqual('176',tempo.scalar_tag([b'176']))
  self.assertIsNone(tempo.scalar_tag([]))
 def test_mutagen_reads_mp4_vorbis_and_id3(self):
  for tags in ({'tmpo':[174]},{'BPM':['174']},{'TBPM':SimpleNamespace(text=['174'])}):
   with patch('mutagen.File',return_value=SimpleNamespace(tags=tags)):
    self.assertEqual('174',inventory.read_key_bpm_tags(Path('fake.mp3'))['bpm'])
 def test_metadata_priority_and_octave_conflict(self):
  result=tempo.resolve_tempo(87,174,[86.9,87.1])
  self.assertEqual(174,result['bpm']);self.assertEqual('file_tag',result['bpm_source'])
  self.assertEqual('tag_octave_difference',result['tempo_status']);self.assertTrue(result['tempo_review_required'])
 def test_preferred_range_does_not_override_tags_or_force_other_music(self):
  base=dict(track('x'),digest='x',bpm=87,measured_bpm=87)
  self.assertEqual(174,tempo.apply_override(base,{},(140,176))['bpm'])
  self.assertEqual('range_estimate',tempo.apply_override(base,{},(140,176))['bpm_source'])
  self.assertEqual(87,tempo.apply_override(dict(base,tag_bpm=87),{},(140,176))['bpm'])
  self.assertEqual(123,tempo.apply_override(base,{'x':{'bpm':123}},(140,176))['bpm'])
  self.assertEqual(120,tempo.apply_override(dict(base,bpm=120,measured_bpm=120),{},(140,176))['bpm'])
  self.assertEqual(87,tempo.apply_override(base,{},None)['bpm'])
 def test_refines_quantized_tracker_without_changing_metrical_level(self):
  # Alternating 29/30-frame intervals at 44.1kHz removes the single-bin bias.
  frames=[0]
  for i in range(100):frames.append(frames[-1]+(29 if i%3==0 else 30))
  refined=tempo.refine_tracker_bpm(172.266,frames,44100,512)
  self.assertGreater(refined,173);self.assertLess(refined,175)
  self.assertEqual(87,tempo.refine_tracker_bpm(87,[0,30],44100,512))
 def test_invalid_bpm_not_fabricated(self):
  for value in [None,'[174]','nonsense',True,float('nan'),0,401]:self.assertIsNone(tempo.valid_bpm(value))

class DesktopTests(unittest.TestCase):
 def make_state(self,root):
  item=dict(track(root/'music.wav'),digest='same-content',duration_seconds=120,bpm=87,measured_bpm=87,camelot='8A')
  atomic_json(root/'dpm_results.json',[item]);return desktop.State(root)
 def test_manual_tempo_survives_reload_and_does_not_change_analysis(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);state=self.make_state(root)
   self.assertEqual(174,state.rows[0]['bpm'])
   state.set_tempo(['same-content'],value=172);state.reload()
   self.assertEqual(172,state.rows[0]['bpm']);self.assertEqual('manual',state.rows[0]['bpm_source'])
   self.assertEqual(87,json.loads((root/'dpm_results.json').read_text())[0]['bpm'])
   state.set_tempo(['same-content'],clear=True);self.assertEqual(174,state.rows[0]['bpm'])
 def test_category_assignment_counts_and_undo(self):
  with tempfile.TemporaryDirectory() as td:
   state=self.make_state(Path(td));state.assign(['same-content'],'Chaos')
   self.assertEqual('Chaos',state.rows[0]['current_stage']);self.assertEqual(1,state.snapshot()['counts']['Chaos'])
   state.undo_labels();self.assertEqual('Gathering',state.rows[0]['current_stage'])
 def test_http_requires_token_and_rejects_foreign_origin(self):
  with tempfile.TemporaryDirectory() as td:
   state=self.make_state(Path(td));server=desktop.Server(('127.0.0.1',0),state)
   thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start();url=f'http://127.0.0.1:{server.server_port}'
   try:
    with self.assertRaises(HTTPError) as error:urlopen(url+'/api/state')
    self.assertEqual(403,error.exception.code)
    with urlopen(Request(url+'/api/state',headers={'X-DPM-Token':server.token})) as result:self.assertEqual(1,json.loads(result.read())['eligible'])
    req=Request(url+'/api/labels',data=json.dumps({'ids':['same-content'],'stage':'Chaos'}).encode(),headers={'X-DPM-Token':server.token,'Content-Type':'application/json','Origin':'https://unrelated.invalid'})
    with self.assertRaises(HTTPError) as error:urlopen(req)
    self.assertEqual(403,error.exception.code);self.assertFalse(state.labels)
   finally:server.shutdown();server.server_close();thread.join()
 def test_tag_refresh_and_manual_override_priority(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);(root/'music.wav').write_bytes(b'not decoded')
   state=self.make_state(root);state.set_tempo(['same-content'],value=170)
   with patch.object(inventory,'read_key_bpm_tags',return_value={'bpm':'174','key':'8A'}):
    state.refresh_tags();state.worker.join(5)
   self.assertEqual(174,state.tracks[0]['tag_bpm']);self.assertEqual(170,state.rows[0]['bpm'])

if __name__=='__main__':unittest.main()
