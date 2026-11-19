"""Editable creative set templates, not crowd-response predictions."""
PRESETS={
 'journey':{'name':'Journey','use':'Longer sets with a build, peak and descent','phases':[('Gathering',3,4),('Confidence',4,6),('Peak Hype',6,8),('Chaos',8,9.5),('Rebirth',7,5),('Sunrise',5,3.5)]},
 'peak':{'name':'Peak Time','use':'High energy with small valleys for contrast','phases':[('Peak Hype',8,9),('Locked In',9,8),('Chaos',8,10),('Locked In',9,8.5)]},
 'warmup':{'name':'Warm-Up','use':'Gradual opening build; adjust the handover ceiling to the next DJ','phases':[('Gathering',2,3),('Confidence',3,4),('Confidence',4,5.5),('Locked In',5.5,7)]},
 'closing':{'name':'Cool-Down / Closing','use':'A deliberate descent at the end of the night','phases':[('Locked In',8,7),('Sketch Hours',7,5.5),('Rebirth',5.5,4),('Sunrise',4,2.5)]},
 'steady':{'name':'Chill / Steady','use':'Low to mid energy within a narrow band','phases':[('Gathering',3,3.5),('Confidence',3.5,4),('Gathering',4,3.5),('Sunrise',3.5,3)]},
 'multipeak':{'name':'Long-set multi-peak','use':'Two builds and peaks separated by an intentional reset','phases':[('Gathering',3,4),('Confidence',4,6),('Peak Hype',6,8),('Chaos',8,9),('Rebirth',5,4),('Confidence',4,6),('Peak Hype',6,8),('Chaos',8,9.5),('Sunrise',7,3)]}}
def preset_phases(key,block=3):
 if key not in PRESETS:raise ValueError('Unknown arc preset')
 return [{'stage':s,'tracks':block,'energy_from':a,'energy_to':b} for s,a,b in PRESETS[key]['phases']]
def target_at(plan,position):
 if plan.get('mode')!='arc':return None
 for phase in plan['arc']:
  if position<phase['tracks']:
   a,b=phase.get('energy_from'),phase.get('energy_to')
   if a is None or b is None:return None
   return round(a+(b-a)*position/max(1,phase['tracks']-1),3)
  position-=phase['tracks']
 return None
def curve(plan):return [{'position':i+1,'energy':target_at(plan,i)} for i in range(sum(p['tracks'] for p in plan['arc']))] if plan.get('mode')=='arc' else []
def validate_options(value=None):
 value=value or {};weights=value.get('weights',{'harmonic':.4,'energy':.35,'bpm':.25})
 import math
 if set(weights)!={'harmonic','energy','bpm'}:raise ValueError('Supply harmonic, energy and BPM weights')
 if any(isinstance(v,bool) or not isinstance(v,(int,float)) or not math.isfinite(v) or v<0 for v in weights.values()) or sum(weights.values())<=0:raise ValueError('Weights must be finite, nonnegative and sum above zero')
 return {'weights':weights,'allow_boost':bool(value.get('allow_boost',False))}
