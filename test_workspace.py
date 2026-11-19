import tempfile,unittest,json
from pathlib import Path
from unittest.mock import patch
from playback import NativePlayer
from set_tools import SetStore,suggestions,analyze_set,import_tracklist,preference_bonus,validate_plan
from harmonics import keys,matrix,variations
import test_desktop

class Audio:
 def __init__(self):self.time=0;self.playing=False
 def prepareToPlay(self):return True
 def play(self):self.playing=True;return True
 def pause(self):self.playing=False
 def stop(self):self.playing=False
 def currentTime(self):return self.time
 def setCurrentTime_(self,n):self.time=n
 def duration(self):return 200
 def isPlaying(self):return self.playing

class WorkspaceTests(unittest.TestCase):
 def test_native_seek_pause_resume_and_clamp(self):
  p=NativePlayer(lambda _:Audio());p.load('a','a.wav');p.seek(72.3)
  self.assertEqual(72.3,p.snapshot()['position']);p.pause();self.assertEqual('paused',p.snapshot()['state'])
  p.seek(500);self.assertEqual(200,p.snapshot()['position']);p.resume();self.assertEqual(0,p.snapshot()['position'])
  p.seek(-1);self.assertEqual(0,p.snapshot()['position'])
  with self.assertRaises(ValueError):p.seek(float('nan'))
  p.stop();self.assertFalse(p.snapshot()['seekable'])
 def test_all_harmonic_combinations(self):
  self.assertEqual(24,len(keys()));self.assertEqual(576,sum(len(r['targets']) for r in matrix()))
  for key in keys():
   rows=variations(key['code']);self.assertEqual(24,len(rows));self.assertEqual(0,rows[0]['hops']);self.assertEqual(key['code'],rows[0]['code'])
  self.assertEqual(1,next(r for r in variations('12A') if r['code']=='1A')['hops'])
 def rows(self):
  return [dict(digest=str(i),id=str(i),path=f'/music/{i}.wav',name=f'{i}.wav',current_stage='Gathering',bpm=160,camelot='8A',scores={'Energy':4},duration_seconds=120) for i in range(4)]
 def test_reviewed_set_changes_ranking_and_relearn_is_idempotent(self):
  with tempfile.TemporaryDirectory() as td:
   store=SetStore(Path(td)/'sets.json');p=store.create('test','range');rows=self.rows()
   store.add(p['id'],'0');store.add(p['id'],'2');store.edit_entry(p['id'],1,rating='good');store.learn(p['id'],rows)
   before=preference_bonus(rows[0],rows[2],store.data['learned']);self.assertGreater(before,0)
   store.learn(p['id'],rows);self.assertEqual(before,preference_bonus(rows[0],rows[2],store.data['learned']))
   q=store.create('new','range');store.add(q['id'],'0');rank=suggestions(store,q['id'],rows)
   self.assertEqual('2',rank['rows'][0]['id']);store.unlearn(p['id']);self.assertEqual(0,preference_bonus(rows[0],rows[2],store.data['learned']))
   self.assertEqual(2,len(SetStore(store.path).data['sets']))
 def test_arc_repeats_ranges_and_reorder_invalidates_ratings(self):
  with tempfile.TemporaryDirectory() as td:
   store=SetStore(Path(td)/'sets.json');p=store.create('two arcs',arc=[{'stage':'Gathering','tracks':1},{'stage':'Chaos','tracks':1},{'stage':'Gathering','tracks':1}])
   store.add(p['id'],'0');self.assertEqual('Chaos',store.next_stage(p['id']));store.add(p['id'],'1');self.assertEqual('Gathering',store.next_stage(p['id']))
   store.edit_entry(p['id'],1,rating='good');store.edit_entry(p['id'],1,move=-1);self.assertEqual('unreviewed',p['entries'][1]['rating'])
   p['limits']['bpm_max']=150;self.assertFalse(suggestions(store,p['id'],self.rows())['rows'])
 def test_import_retains_unknown_and_does_not_invent_transition(self):
  with tempfile.TemporaryDirectory() as td:
   path=Path(td)/'set.m3u';path.write_text('/music/0.wav\n/missing.wav\n/music/2.wav\n')
   entries,missing=import_tracklist(path,self.rows());self.assertEqual(3,len(entries));self.assertEqual(1,len(missing))
   a=analyze_set({'entries':entries},self.rows());self.assertFalse(a['transitions']);self.assertTrue(a['positions'][1]['missing'])
 def test_recheck_forces_worker_updates_and_preserves_manual_bpm(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);(root/'music.wav').write_bytes(b'fake');s=test_desktop.DesktopTests().make_state(root);s.set_tempo(['same-content'],value=170)
   with patch('bpm_recheck.analyze_tempo',return_value={'bpm':174,'measured_bpm':174,'tempo_recheck_version':'forced'}) as detector:
    s.recheck_bpm(['same-content']);s.worker.join(5);detector.assert_called_once()
   records=json.loads((root/'dpm_results.json').read_text());records[0]['measured_bpm']=87;(root/'dpm_results.json').write_text(json.dumps(records));s.reload()
   self.assertEqual(174,s.tracks[0]['measured_bpm']);self.assertEqual(170,s.rows[0]['bpm']);self.assertFalse(s.job['running']);self.assertEqual(1,s.job['done']);self.assertFalse(s.job['errors'])
 def test_unreviewed_set_cannot_train(self):
  with tempfile.TemporaryDirectory() as td:
   store=SetStore(Path(td)/'sets.json');p=store.create('test');store.add(p['id'],'0');store.add(p['id'],'1')
   with self.assertRaises(ValueError):store.learn(p['id'],self.rows())
