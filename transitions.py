"""Transparent, provisional transition ranking. Scores are not probabilities.

Camelot distance counts wheel hops, never semitones. Energy is explicitly 0–10.
Missing components remain unavailable; the score reports evidence coverage.
"""
import math,re

def parse_camelot(code):
 if not isinstance(code,str):raise ValueError('Camelot code must be text')
 match=re.fullmatch(r'(1[0-2]|[1-9])([ABab])',code.strip())
 if not match:raise ValueError(f'Invalid Camelot: {code}')
 return int(match[1]),match[2].upper()

def camelot_distance(a,b):
 an,al=parse_camelot(a);bn,bl=parse_camelot(b)
 gap=min(abs(an-bn),12-abs(an-bn))
 return gap+(al!=bl)

def harmonic_score(from_code,to_code,allow_energy_boost=True):
 """0–100 heuristic. Wider moves do not imply an actual energy lift."""
 distance=camelot_distance(from_code,to_code)
 return {0:100.0,1:90.0,2:75.0 if allow_energy_boost else 55.0,
         3:50.0,4:30.0,5:20.0,6:10.0,7:0.0}[distance]

def number(value):
 if isinstance(value,bool):return None
 try:value=float(value)
 except (ValueError,TypeError):return None
 return value if math.isfinite(value) else None

def energy_delta_score(from_energy,to_energy,target_delta=0,tolerance=1.5):
 source,target,delta,tol=map(number,(from_energy,to_energy,target_delta,tolerance))
 if any(value is None for value in (source,target,delta,tol)) or tol<=0:raise ValueError('Finite energy values and positive tolerance required')
 if not (0<=source<=10 and 0<=target<=10 and -10<=delta<=10):raise ValueError('Use energy 0–10 and target delta -10 to 10')
 error=abs(target-source-delta)
 return 100-30*error/tol if error<=tol else max(0.0,70-15*(error-tol))

def bpm_score(a,b,allow_half_double=False):
 a,b=number(a),number(b)
 if a is None or b is None or a<=0 or b<=0:return None,None
 options=[b*factor for factor in (.5,1,2)] if allow_half_double else [b]
 interpreted=min(options,key=lambda value:abs(value-a))
 return max(0.0,100-400*abs(interpreted-a)/a),interpreted

def transition_details(from_track,to_track,desired_energy_delta=0,weights=None,allow_half_double=False):
 weights={'harmonic':.4,'energy':.35,'bpm':.25} if weights is None else weights
 if set(weights)!={'harmonic','energy','bpm'} or any(number(v) is None or number(v)<0 for v in weights.values()) or sum(map(float,weights.values()))<=0:
  raise ValueError('Use nonnegative harmonic, energy and bpm weights with a positive sum')
 if number(desired_energy_delta) is None or not -10<=float(desired_energy_delta)<=10:raise ValueError('Energy delta must be -10 to 10')
 weights={key:float(value)/sum(map(float,weights.values())) for key,value in weights.items()}
 try:h=harmonic_score(from_track.get('camelot'),to_track.get('camelot'))
 except ValueError:h=None
 def energy(track):return number(track.get('energy',track.get('scores',{}).get('Energy')))
 a,b=energy(from_track),energy(to_track)
 e=energy_delta_score(a,b,desired_energy_delta) if a is not None and b is not None else None
 bpm,interpreted=bpm_score(from_track.get('bpm'),to_track.get('bpm'),allow_half_double)
 components={'harmonic':h,'energy':e,'bpm':bpm}
 coverage=sum(weights[key] for key,value in components.items() if value is not None)
 score=sum(weights[key]*value for key,value in components.items() if value is not None)/coverage if coverage else None
 return {'score':round(score,2) if score is not None else None,'coverage':round(coverage,4),
         'components':components,'desired_energy_delta':float(desired_energy_delta),'interpreted_to_bpm':interpreted,
         'half_double_used':interpreted is not None and interpreted!=number(to_track.get('bpm')),
         'method':'provisional-wheel-energy-tempo-v1'}

def transition_score(from_track,to_track,desired_energy_delta=0,weights=None):
 """Return the heuristic score, or None when all input components are missing."""
 return transition_details(from_track,to_track,desired_energy_delta,weights)['score']

def rank_next(source,candidates,desired_energy_delta=0,allow_half_double=False):
 scored=[(track,transition_details(source,track,desired_energy_delta,allow_half_double=allow_half_double)) for track in candidates]
 # Penalize missing evidence explicitly rather than inventing a BPM/key/energy.
 return sorted(scored,key=lambda item:((100-(item[1]['score'] or 0))+30*(1-item[1]['coverage']),item[0].get('path','')))
