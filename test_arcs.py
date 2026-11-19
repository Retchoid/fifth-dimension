import tempfile,unittest
from pathlib import Path
from arc_presets import PRESETS,preset_phases,target_at,curve,validate_options
from set_tools import SetStore,suggestions,harmonic_movement,validate_plan

class ArcTests(unittest.TestCase):
 def rows(self):
  return [dict(digest=str(i),id=str(i),path=f'/music/{i}.wav',current_stage='Gathering',bpm=160,camelot='8A',scores={'Energy':e},duration_seconds=120) for i,e in enumerate([4,3,7,9])]
 def test_six_templates_and_peak_position(self):
  self.assertEqual(6,len(PRESETS))
  for key in PRESETS:
   phases=preset_phases(key);plan={'mode':'arc','arc':phases};values=curve(plan)
   self.assertTrue(values);self.assertTrue(all(0<=r['energy']<=10 for r in values));self.assertTrue(all(p['tracks']==3 for p in phases))
  c=curve({'mode':'arc','arc':preset_phases('journey')});peak=max(range(len(c)),key=lambda i:c[i]['energy']);self.assertGreater(peak/len(c),.5);self.assertLess(peak/len(c),.75)
 def test_target_interpolation_and_range_ignores_curve(self):
  p={'mode':'arc','arc':[{'stage':'Gathering','tracks':3,'energy_from':3,'energy_to':5}]}
  self.assertEqual([3,4,5],[target_at(p,i) for i in range(3)]);self.assertIsNone(target_at(p,3));p['mode']='range';self.assertIsNone(target_at(p,1))
 def test_curve_changes_actual_ranking(self):
  with tempfile.TemporaryDirectory() as td:
   store=SetStore(Path(td)/'sets.json');p=store.create('curve',arc=[{'stage':'Gathering','tracks':3,'energy_from':3,'energy_to':9}]);store.add(p['id'],'0');rows=self.rows()
   build=suggestions(store,p['id'],rows);self.assertEqual(3,build['desired_energy_delta']);self.assertEqual('2',build['rows'][0]['id'])
   p['arc'][0].update(energy_from=4,energy_to=2);fall=suggestions(store,p['id'],rows);self.assertEqual(-1,fall['desired_energy_delta']);self.assertEqual('1',fall['rows'][0]['id'])
 def test_directed_risk_lifts_do_not_treat_every_distance_five_as_semitone_up(self):
  a={'camelot':'8A'};up={'camelot':'3A'};down={'camelot':'1A'};mode={'camelot':'3B'}
  self.assertEqual(5,harmonic_movement(a,up)['hops']);self.assertTrue(harmonic_movement(a,up,True)['boost_enabled']);self.assertEqual(60,harmonic_movement(a,up,True)['score'])
  self.assertFalse(harmonic_movement(a,down,True)['boost_enabled']);self.assertFalse(harmonic_movement(a,mode,True)['boost_enabled']);self.assertFalse(harmonic_movement(a,up,False)['boost_enabled'])
 def test_boost_only_in_enabled_rising_peak(self):
  with tempfile.TemporaryDirectory() as td:
   store=SetStore(Path(td)/'sets.json');p=store.create('peak',arc=[{'stage':'Gathering','tracks':3,'energy_from':7,'energy_to':9}],options={'allow_boost':True});store.add(p['id'],'0');rows=self.rows();rows[1]['camelot']='3A'
   result=suggestions(store,p['id'],rows);self.assertTrue(next(r for r in result['rows'] if r['id']=='1')['harmonic_move']['boost_enabled'])
   p['arc'][0].update(energy_from=9,energy_to=7);result=suggestions(store,p['id'],rows);self.assertFalse(next(r for r in result['rows'] if r['id']=='1')['harmonic_move']['boost_enabled'])
 def test_bad_targets_weights_and_legacy_plan(self):
  limits={'bpm_min':140,'bpm_max':176,'energy_min':0,'energy_max':10}
  with self.assertRaises(ValueError):validate_plan('arc',[{'stage':'Gathering','tracks':3,'energy_from':2}],limits)
  with self.assertRaises(ValueError):validate_options({'weights':{'harmonic':0,'energy':0,'bpm':0}})
  with self.assertRaises(ValueError):validate_options({'weights':{'harmonic':float('nan'),'energy':1,'bpm':1}})
  self.assertIsNone(target_at({'mode':'arc','arc':[{'stage':'Gathering','tracks':3}]},0))
