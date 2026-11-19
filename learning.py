import math, random
from collections import Counter
from dpm import STAGES,NAMES

def identity(t): return t.get('digest') or t['path']
def features(t):
 s=t.get('scores',{}); return [finite(s.get(n)) for n in NAMES]

def finite(value):
 return value if isinstance(value, (int, float)) and math.isfinite(value) else None
def recommend(t,labels):
 """Local example votes blended with fixed priors; ranking, not probability.

 Missing dimensions are ignored. Distant examples have exponentially less
 influence; no labels means precisely the original prototype ranking.
 """
 x=features(t)
 def distance(other):
  terms=[(a-b)**2 for a,b in zip(x,other) if a is not None and b is not None]
  return sum(terms)/len(terms) if terms else None
 distances={stage:distance(prior) for stage,prior in STAGES.items()}
 stored=t.get('stage_distances')
 if isinstance(stored,dict) and set(stored)==set(STAGES) and all(finite(v) is not None for v in stored.values()): distances=stored
 baseline=sorted(STAGES,key=lambda stage:distances[stage] if distances[stage] is not None else 100)
 if all(value is None for value in distances.values()): return baseline
 best=min(value for value in distances.values() if value is not None)
 priors={stage:math.exp(-((value if value is not None else 100)-best)/4) for stage,value in distances.items()}
 normalizer=sum(priors.values())
 votes=dict.fromkeys(STAGES,0.0)
 neighbors=[]
 for key,label in labels.items():
  if label.get('score_version','legacy')!=t.get('score_version','legacy'): continue
  if label.get('stage') not in STAGES: continue
  values=[finite(value) for value in label.get('features',[])]
  delta=distance(values)
  if delta is not None: neighbors.append((delta,str(key),label['stage']))
 # A bounded neighborhood limits domination by heavily reviewed categories.
 for delta,key,stage in sorted(neighbors)[:7]: votes[stage]+=math.exp(-delta/0.5)
 support=sum(votes.values())
 if support < 1e-12: return baseline
 strength=min(1.0,support)
 combined={stage:0.25*priors[stage]/normalizer + strength*votes[stage]/support for stage in STAGES}
 return sorted(STAGES,key=lambda stage:(-combined[stage],baseline.index(stage)))

def current_stage(t,labels):
 manual=labels.get(identity(t),{}).get('stage')
 return manual if manual in STAGES else recommend(t,labels)[0]

def batch(tracks,labels,n=20):
 pools={s:[] for s in STAGES}
 for t in tracks:
  if identity(t) not in labels: pools[current_stage(t,labels)].append(t)
 for p in pools.values(): random.shuffle(p)
 out=[]
 while len(out)<n and any(pools.values()):
  for p in pools.values():
   if p and len(out)<n: out.append(p.pop())
 return out

def profile(labels):
 counts=Counter(v['stage'] for v in labels.values()); return counts


def rebind_labels(tracks,labels):
 """Refresh saved example vectors from current analyses; manual stages never change.

 Keep a copy of the original vector for audit. Legacy labels for offline tracks
 remain usable with legacy tracks but are not mixed into a new score schema.
 """
 rebound={key:dict(value) for key,value in labels.items()}
 for track in tracks:
  key=identity(track)
  if key not in rebound:continue
  label=rebound[key];version=track.get('score_version','legacy')
  if label.get('score_version','legacy')!=version or label.get('reference_id')!=track.get('reference_id'):
   if 'original_features' not in label:label['original_features']=label.get('features',[])
   label.update(features=features(track),score_version=version,reference_id=track.get('reference_id'))
 return rebound
