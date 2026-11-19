import unittest,math
from transitions import *
class TransitionTests(unittest.TestCase):
 def test_wheel_symmetry_and_wrap(self):
  keys=[f'{i}{letter}' for i in range(1,13) for letter in 'AB']
  for a in keys:
   for b in keys:self.assertEqual(camelot_distance(a,b),camelot_distance(b,a))
  self.assertEqual(1,camelot_distance('12A','1A'));self.assertEqual(1,camelot_distance('8A','8B'))
  self.assertEqual(7,camelot_distance('1A','7B'))
  self.assertLess(harmonic_score('1A','6A'),harmonic_score('1A','4A'))
 def test_energy_continuity(self):
  self.assertEqual(100,energy_delta_score(4,5,1))
  self.assertEqual(70,energy_delta_score(4,5.5))
  self.assertAlmostEqual(70,energy_delta_score(4,5.5000001),places=4)
  with self.assertRaises(ValueError):energy_delta_score(1,2,tolerance=0)
 def test_missing_values_and_weights(self):
  result=transition_details({'camelot':'8A'},{'camelot':'8A'})
  self.assertEqual(100,result['score']);self.assertEqual(.4,result['coverage']);self.assertIsNone(result['components']['bpm'])
  self.assertIsNone(transition_score({},{}))
  with self.assertRaises(ValueError):transition_score({}, {},weights={'harmonic':1})
 def test_arc_and_optional_half_time(self):
  source={'path':'source','camelot':'8A','energy':4,'bpm':85}
  rise={'path':'rise','camelot':'8A','energy':6,'bpm':85}
  fall={'path':'fall','camelot':'8A','energy':2,'bpm':85}
  self.assertEqual('rise',rank_next(source,[fall,rise],2)[0][0]['path'])
  self.assertEqual('fall',rank_next(source,[fall,rise],-2)[0][0]['path'])
  score,interpreted=bpm_score(85,170,True);self.assertEqual(100,score);self.assertEqual(85,interpreted)
  self.assertEqual(0,bpm_score(85,170,False)[0])
if __name__=='__main__':unittest.main()
