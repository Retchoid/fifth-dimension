"""Ordered set planning, analysis and explicitly reviewed transition learning.

Set order is distinct from category labels and from casual audition playback.
"""
import csv,json,math,time,uuid
from pathlib import Path
from collections import Counter
from dpm import COLORS,atomic_json
from transitions import transition_details,number
from learning import identity
from arc_presets import target_at,curve,validate_options
STAGES=list(COLORS)

def stage_number(name):return STAGES.index(name)+1 if name in STAGES else None

def validate_plan(mode,arc,limits):
 if mode not in {'arc','range'}:raise ValueError('Choose arc or range mode')
 if not isinstance(arc,list) or len(arc)>32:raise ValueError('Use at most 32 arc phases')
 checked=[]
 for phase in arc:
  stage=phase.get('stage');count=phase.get('tracks',1)
  if stage not in STAGES or isinstance(count,bool) or int(count)!=count or not 1<=int(count)<=50:raise ValueError('Each arc phase needs a stage and 1–50 tracks')
  item={'stage':stage,'tracks':int(count)}
  a,b=phase.get('energy_from'),phase.get('energy_to')
  if a is not None or b is not None:
   a,b=number(a),number(b)
   if a is None or b is None or not(0<=a<=10 and 0<=b<=10):raise ValueError('Phase energy targets must both be 0–10')
   item.update(energy_from=a,energy_to=b)
  checked.append(item)
 if mode=='arc' and not checked:raise ValueError('Add at least one arc phase')
 low,high,emin,emax=[number(limits.get(k)) for k in ['bpm_min','bpm_max','energy_min','energy_max']]
 if any(x is None for x in (low,high,emin,emax)) or not(20<=low<=high<=400 and 0<=emin<=emax<=10):raise ValueError('Set ranges: BPM 20–400; energy 0–10')
 return checked,{'bpm_min':low,'bpm_max':high,'energy_min':emin,'energy_max':emax}

class SetStore:
 def __init__(self,path):
  self.path=Path(path)
  self.data=json.loads(self.path.read_text()) if self.path.exists() else {'version':1,'sets':{},'learned':{}}
  if not isinstance(self.data,dict) or self.data.get('version')!=1:raise ValueError('Unsupported set workspace format')
 def save(self):atomic_json(self.path,self.data)
 def get(self,key):
  if key not in self.data['sets']:raise ValueError('Set not found')
  return self.data['sets'][key]
 def create(self,title,mode='arc',arc=None,limits=None,options=None):
  arc=arc if arc is not None else [{'stage':s,'tracks':2} for s in STAGES]
  limits=limits or {'bpm_min':140,'bpm_max':176,'energy_min':0,'energy_max':10}
  arc,limits=validate_plan(mode,arc,limits);options=validate_options(options);key=uuid.uuid4().hex
  self.data['sets'][key]={'id':key,'title':str(title).strip()[:100] or 'Untitled set','mode':mode,'arc':arc,'limits':limits,'options':options,'entries':[],'created':time.time()}
  self.save();return self.get(key)
 def update(self,key,title,mode,arc,limits,options=None):
  arc,limits=validate_plan(mode,arc,limits);options=validate_options(options);plan=self.get(key)
  plan.update(title=str(title).strip()[:100] or 'Untitled set',mode=mode,arc=arc,limits=limits,options=options);self.save();return plan
 def add(self,key,track_id,stage=None):
  plan=self.get(key)
  if len(plan['entries'])>=500:raise ValueError('A set may contain at most 500 entries')
  if stage is not None and stage not in STAGES:raise ValueError('Invalid stage')
  plan['entries'].append({'track_id':track_id,'stage':stage,'rating':'unreviewed'});self.save()
 def edit_entry(self,key,index,stage=None,rating=None,move=None,remove=False):
  plan=self.get(key);index=int(index)
  if not 0<=index<len(plan['entries']):raise ValueError('Entry not found')
  entry=plan['entries'][index]
  if remove:plan['entries'].pop(index)
  elif move is not None:
   target=index+int(move)
   if not 0<=target<len(plan['entries']):return
   plan['entries'].insert(target,plan['entries'].pop(index))
  else:
   if stage is not None:
    if stage not in STAGES and stage!='':raise ValueError('Invalid stage')
    entry['stage']=stage or None
   if rating is not None:
    if rating not in {'good','poor','unreviewed'}:raise ValueError('Invalid transition rating')
    entry['rating']=rating
  if remove or move is not None:
   for e in plan['entries']:e['rating']='unreviewed'
  self.save()
 def next_stage(self,key):
  plan=self.get(key)
  if plan['mode']!='arc':return None
  position=len(plan['entries'])
  for phase in plan['arc']:
   if position<phase['tracks']:return phase['stage']
   position-=phase['tracks']
  return None
 def learn(self,key,rows):
  plan=self.get(key);lookup={identity(t):t for t in rows};transitions=[];bpms=[]
  for i,entry in enumerate(plan['entries']):
   item=lookup.get(entry.get('track_id'))
   if item and number(item.get('bpm')) is not None:bpms.append(float(item['bpm']))
   if not i or entry.get('rating') not in {'good','poor'}:continue
   previous=lookup.get(plan['entries'][i-1].get('track_id'))
   if not previous or not item:continue
   transitions.append({'from':identity(previous),'to':identity(item),
    'from_stage':plan['entries'][i-1].get('stage') or previous['current_stage'],'to_stage':entry.get('stage') or item['current_stage'],
    'rating':entry['rating'],'energy_delta':energy_delta(previous,item)})
  if not transitions:raise ValueError('Rate at least one transition Good or Poor before learning')
  self.data['learned'][key]={'title':plan['title'],'updated':time.time(),'transitions':transitions,'average_bpm':sum(bpms)/len(bpms) if bpms else None}
  self.save();return {'transitions':len(transitions),'sets':len(self.data['learned'])}
 def unlearn(self,key):self.data['learned'].pop(key,None);self.save()
 def summary(self):return [{'id':s['id'],'title':s['title'],'mode':s['mode'],'tracks':len(s['entries']),'learned':s['id'] in self.data['learned']} for s in self.data['sets'].values()]

def energy_delta(a,b):
 x,y=number(a.get('scores',{}).get('Energy')),number(b.get('scores',{}).get('Energy'))
 return y-x if x is not None and y is not None else None

def preference_bonus(source,target,learned):
 exact=0;stage=0;count=0
 for history in learned.values():
  for pair in history.get('transitions',[]):
   sign=1 if pair['rating']=='good' else -1
   if pair['from']==identity(source) and pair['to']==identity(target):exact+=sign
   if pair['from_stage']==source['current_stage'] and pair['to_stage']==target['current_stage']:stage+=sign;count+=1
 # Bounded influences, not probabilities; sparse history cannot dominate acoustics.
 bonus=4*math.tanh(exact/2)+(2*stage/(count+3) if count else 0)
 return round(bonus,3)

def suggestions(store,key,rows,source_id=None,limit=30):
 plan=store.get(key);lookup={identity(t):t for t in rows};entries=plan['entries'];source=lookup.get(source_id or (entries[-1].get('track_id') if entries else None))
 used={e.get('track_id') for e in entries};limits=plan['limits'];target=store.next_stage(key);result=[]
 options=validate_options(plan.get('options'));energy_target=target_at(plan,len(entries));previous_target=target_at(plan,len(entries)-1) if entries else None
 source_energy=number(source.get('scores',{}).get('Energy')) if source else None
 baseline=previous_target if previous_target is not None else source_energy
 delta=energy_target-baseline if energy_target is not None and baseline is not None else 0
 delta=max(-10,min(10,delta))
 if plan['mode']=='arc' and target is None:return {'target_stage':None,'complete':True,'rows':[]}
 for t in rows:
  if identity(t) in used or t.get('missing'):continue
  bpm=number(t.get('bpm'));energy=number(t.get('scores',{}).get('Energy'))
  if bpm is None or not limits['bpm_min']<=bpm<=limits['bpm_max']:continue
  if energy is None or not limits['energy_min']<=energy<=limits['energy_max']:continue
  detail=transition_details(source,t,delta,options['weights']) if source else {'score':70.0,'coverage':0,'components':{},'method':'opening-order'}
  movement=harmonic_movement(source,t,options['allow_boost'] and energy_target is not None and energy_target>=8 and delta>0) if source else None
  if movement and detail['components'].get('harmonic') is not None:
   parts=detail['components'];parts['harmonic']=movement['score'];w=options['weights'];denom=sum(w[k] for k,v in parts.items() if v is not None)
   detail['score']=round(sum(w[k]*v for k,v in parts.items() if v is not None)/denom,2) if denom else None
  stage_cost=0 if target is None or t['current_stage']==target else 18
  # In arc mode favor the desired phase. No hard category wall if the library lacks it.
  bonus=preference_bonus(source,t,store.data['learned']) if source else 0
  rank=(detail['score'] or 0)-30*(1-detail['coverage'])-stage_cost+bonus-(abs(energy-energy_target)*6 if energy_target is not None else 0)
  if source is None:rank=(100-abs(energy-(energy_target if energy_target is not None else 3))*6)-stage_cost
  result.append({'id':identity(t),'score':round(rank,2),'transition':detail,'history_bonus':bonus,'target_energy':energy_target,'desired_energy_delta':delta,'harmonic_move':movement,'stage_match':target is None or t['current_stage']==target})
 result.sort(key=lambda row:(-row['score'],row['id']))
 return {'target_stage':target,'target_energy':energy_target,'desired_energy_delta':delta,'complete':False,'rows':result[:limit]}

def analyze_set(plan,rows):
 lookup={identity(t):t for t in rows};positions=[];transitions=[];counts=Counter();elapsed=0;bpms=[];notes=[]
 for i,entry in enumerate(plan['entries']):
  item=lookup.get(entry.get('track_id'))
  if item is None:
   positions.append({'index':i,'missing':True,'name':entry.get('unmatched_path','Unavailable library track')});continue
  stage=entry.get('stage') or item['current_stage'];duration=number(item.get('duration_seconds')) or 0
  bpm=number(item.get('bpm'));energy=number(item.get('scores',{}).get('Energy'));counts[stage]+=1
  if bpm is not None:bpms.append(bpm)
  positions.append({'index':i,'id':identity(item),'name':item.get('name',Path(item['path']).name),'stage':stage,'stage_number':stage_number(stage),
    'category':item['current_stage'],'bpm':bpm,'energy':energy,'offset':elapsed,'duration':duration,'rating':entry.get('rating','unreviewed')})
  elapsed+=duration
  if i:
   previous=lookup.get(plan['entries'][i-1].get('track_id'))
   if previous:
    delta=energy_delta(previous,item);options=validate_options(plan.get('options'));target=target_at(plan,i);prior=target_at(plan,i-1)
    intended=(target-prior) if target is not None and prior is not None else 0
    detail=transition_details(previous,item,intended,options['weights'])
    movement=harmonic_movement(previous,item,options['allow_boost'] and target is not None and target>=8 and intended>0)
    if movement and detail['components'].get('harmonic') is not None:
     parts=detail['components'];parts['harmonic']=movement['score'];w=options['weights'];denom=sum(w[k] for k,v in parts.items() if v is not None)
     detail['score']=round(sum(w[k]*v for k,v in parts.items() if v is not None)/denom,2) if denom else None
    transitions.append({'from_index':i-1,'to_index':i,**detail,'energy_delta':delta,'rating':entry.get('rating','unreviewed')})
    if delta is not None and abs(delta)>3:notes.append(f'Track {i+1}: energy changes by {delta:+.1f}; check the handoff.')
 if any(p.get('missing') for p in positions):notes.append('Unmatched or unavailable records remain in order; transitions across them are not scored.')
 if any(lookup.get(e.get('track_id'),{}).get('tempo_review_required') for e in plan['entries']):notes.append('Some BPM values are still estimates or need verification.')
 return {'positions':positions,'transitions':transitions,'stage_counts':dict(counts),'track_count':len(positions),
  'known_tracks':sum(not p.get('missing') for p in positions),'duration_before_overlaps':elapsed,
  'average_bpm':round(sum(bpms)/len(bpms),2) if bpms else None,'notes':notes,'target_curve':curve(plan)}

def import_tracklist(path,rows):
 path=Path(path);entries=[];unmatched=[];lookup={str(Path(t['path']).resolve()):t for t in rows};names={}
 for t in rows:names.setdefault(Path(t['path']).name.casefold(),[]).append(t)
 if path.stat().st_size>5_000_000:raise ValueError('Tracklist is too large')
 if path.suffix.lower()=='.csv':
  with path.open(encoding='utf-8-sig',newline='') as f:
   reader=csv.DictReader(f)
   if 'path' not in (reader.fieldnames or []):raise ValueError('CSV needs a path column; optional stage column')
   records=[(r['path'],r.get('stage') or r.get('category')) for r in reader]
 elif path.suffix.lower() in {'.m3u','.m3u8'}:records=[(line.strip(),None) for line in path.read_text(encoding='utf-8-sig').splitlines() if line.strip() and not line.startswith('#')]
 else:raise ValueError('Use an ordered M3U/M3U8 or CSV tracklist')
 if len(records)>500:raise ValueError('Use at most 500 tracklist entries')
 for text,stage in records:
  candidate=Path(text).expanduser();absolute=str((path.parent/candidate).resolve());item=lookup.get(absolute);method='path'
  if item is None:
   matches=names.get(candidate.name.casefold(),[])
   if len(matches)==1:item=matches[0];method='unique filename'
  if item is None:
   unmatched.append(text);entries.append({'track_id':None,'unmatched_path':text,'stage':None,'rating':'unreviewed'})
  else:entries.append({'track_id':identity(item),'stage':stage if stage in STAGES else None,'rating':'unreviewed','match_method':method})
 return entries,unmatched


def harmonic_movement(source,target,allow_boost=False):
 from transitions import parse_camelot,camelot_distance,harmonic_score
 try:a,am=parse_camelot(source.get('camelot'));b,bm=parse_camelot(target.get('camelot'))
 except ValueError:return None
 forward=(b-a)%12;distance=camelot_distance(source['camelot'],target['camelot'])
 boost=am==bm and forward in {2,7}
 risky=distance>1
 return {'forward_steps':forward,'hops':distance,'core':not risky,'riskier':risky,
  'boost_enabled':bool(boost and allow_boost),'score':75.0 if boost and forward==2 and allow_boost else 60.0 if boost and forward==7 and allow_boost else harmonic_score(source['camelot'],target['camelot'],False),
  'label':('Optional +2 whole-tone lift' if forward==2 else 'Optional +7 semitone lift') if boost and allow_boost else 'Core harmonic move' if not risky else 'Wider move: audition a short/filtered blend'}
