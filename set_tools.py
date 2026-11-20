"""Ordered set planning, analysis and explicitly reviewed transition learning.

Set order is distinct from category labels and from casual audition playback.
"""
import csv,json,math,time,uuid,copy
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

def suggestions(store,key,rows,source_id=None,limit=30,position=None):
 plan=store.get(key);lookup={identity(t):t for t in rows};all_entries=plan['entries'];entries=all_entries if position is None else all_entries[:position];source=lookup.get(source_id or (entries[-1].get('track_id') if entries else None))
 used={e.get('track_id') for e in all_entries};limits=plan['limits'];target=stage_at(plan,len(entries));result=[]
 options=validate_options(plan.get('options'));energy_target=target_at(plan,len(entries));previous_target=target_at(plan,len(entries)-1) if entries else None
 source_energy=number(source.get('scores',{}).get('Energy')) if source else None
 baseline=previous_target if previous_target is not None else source_energy
 delta=energy_target-baseline if energy_target is not None and baseline is not None else 0
 delta=max(-10,min(10,delta))
 if plan['mode']=='arc' and target is None and position is None:return {'target_stage':None,'complete':True,'rows':[]}
 for t in rows:
  if identity(t) in used or t.get('missing') or t.get('available') is False:continue
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
   positions.append({'index':i,'missing':True,'name':entry.get('unmatched_path','Unmatched imported track'),'id':entry.get('track_id')});continue
  stage=entry.get('stage') or item['current_stage'];duration=number(item.get('duration_seconds')) or 0
  bpm=number(item.get('bpm'));energy=number(item.get('scores',{}).get('Energy'));counts[stage]+=1
  if bpm is not None:bpms.append(bpm)
  positions.append({'index':i,'id':identity(item),'name':item.get('name',Path(item['path']).name),'stage':stage,'stage_number':stage_number(stage),
    'category':item['current_stage'],'camelot':item.get('camelot'),'scores':item.get('scores',{}),'unavailable':item.get('available') is False,'bpm':bpm,'energy':energy,'offset':elapsed,'duration':duration,'rating':entry.get('rating','unreviewed')})
  elapsed+=duration
  if i:
   previous=lookup.get(plan['entries'][i-1].get('track_id'))
   if previous and previous.get('available') is not False and item.get('available') is not False:
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
  'known_tracks':sum(not p.get('missing') for p in positions),'unavailable_tracks':sum(bool(p.get('missing') or p.get('unavailable')) for p in positions),'duration_before_overlaps':elapsed,
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


def playable_path(track):
 for text in [track.get('path'),*track.get('duplicate_paths',[])]:
  if not text:continue
  try:
   if Path(text).is_file():return str(Path(text))
  except OSError:pass
 return None

def availability(rows):
 result=[]
 for row in rows:
  path=playable_path(row);result.append(dict(row,available=path is not None,missing=path is None,playback_path=path))
 return result

def stage_at(plan,position):
 if plan['mode']!='arc':return None
 for phase in plan['arc']:
  if position<phase['tracks']:return phase['stage']
  position-=phase['tracks']
 return None

def checkpoint(plan):
 plan['undo_entries']=copy.deepcopy(plan['entries'])
 plan['undo_config']={k:copy.deepcopy(v) for k,v in plan.items() if k in {'title','mode','arc','limits','options','preset','range_count'}}
 plan['undo_generation']=copy.deepcopy(plan.get('generation'))

def reset_ratings(plan):
 for entry in plan['entries']:entry['rating']='unreviewed'

def reorder(store,key,index,to_index):
 plan=store.get(key);index=int(index);to_index=int(to_index);length=len(plan['entries'])
 if not(0<=index<length and 0<=to_index<length):raise ValueError('Track position is outside this set')
 if index==to_index:return
 checkpoint(plan);plan['entries'].insert(to_index,plan['entries'].pop(index));reset_ratings(plan);store.save()

def undo_order(store,key):
 plan=store.get(key)
 if 'undo_entries' not in plan:raise ValueError('No set edit to undo')
 plan['entries']=plan.pop('undo_entries');generation=plan.pop('undo_generation',None)
 config=plan.pop('undo_config',None)
 if config is not None:
  for k in {'title','mode','arc','limits','options','preset','range_count'}:
   if k in config:plan[k]=config[k]
   else:plan.pop(k,None)
 if generation is None:plan.pop('generation',None)
 else:plan['generation']=generation
 store.save()

def replace_track(store,key,index,item):
 plan=store.get(key);index=int(index)
 if not 0<=index<len(plan['entries']):raise ValueError('Track position is outside this set')
 if not playable_path(item):raise ValueError('Replacement track is unavailable. Reconnect its drive and refresh suggestions.')
 if any(e.get('track_id')==identity(item) for i,e in enumerate(plan['entries']) if i!=index):raise ValueError('That track is already in this set')
 checkpoint(plan);old=plan['entries'][index]
 plan['entries'][index]={'track_id':identity(item),'stage':old.get('stage') or item['current_stage'],'rating':'unreviewed'}
 if index+1<len(plan['entries']):plan['entries'][index+1]['rating']='unreviewed'
 store.save()

def replacements(store,key,rows,index,limit=12):
 index=int(index);plan=store.get(key)
 if not 0<=index<len(plan['entries']):raise ValueError('Track position is outside this set')
 ranked=suggestions(store,key,rows,position=index,limit=len(rows));lookup={identity(t):t for t in rows}
 following=lookup.get(plan['entries'][index+1].get('track_id')) if index+1<len(plan['entries']) else None
 for row in ranked['rows']:
  if following and following.get('available') is not False:
   candidate=lookup[row['id']];desired=(target_at(plan,index+1) or 0)-(target_at(plan,index) or 0)
   onward=transition_details(candidate,following,desired,validate_options(plan.get('options'))['weights'])
   row['outgoing']=onward;row['score']=round(.65*row['score']+.35*((onward['score'] or 0)-30*(1-onward['coverage'])),2)
 ranked['rows'].sort(key=lambda x:(-x['score'],x['id']));ranked['rows']=ranked['rows'][:limit]
 return ranked

def populate(store,key,rows,count=None):
 plan=store.get(key)
 requested=sum(p['tracks'] for p in plan['arc']) if plan['mode']=='arc' else (20 if count is None else count)
 if isinstance(requested,bool) or not isinstance(requested,(int,float)) or int(requested)!=requested or not 1<=requested<=500:raise ValueError('Build a set of 1–500 tracks; shorten long arc phases if necessary')
 requested=int(requested);draft=copy.deepcopy(plan);draft['entries']=[]
 # Build separately. Existing order/ratings remain intact if ranking fails.
 class View:
  data=store.data
  def get(self,_):return draft
 view=View();fallbacks=0
 for _ in range(requested):
  ranked=suggestions(view,key,rows,limit=1)
  if not ranked['rows']:break
  choice=ranked['rows'][0];target=stage_at(draft,len(draft['entries']));item=next(t for t in rows if identity(t)==choice['id'])
  draft['entries'].append({'track_id':choice['id'],'stage':target or item['current_stage'],'rating':'unreviewed'})
  fallbacks+=not choice['stage_match']
 checkpoint(plan);plan['entries']=draft['entries'];plan['range_count']=requested
 plan['generation']={'requested':requested,'filled':len(plan['entries']),'unfilled':requested-len(plan['entries']),'stage_fallbacks':fallbacks,
  'unavailable_excluded':sum(t.get('available') is False for t in rows)}
 store.save();return plan['generation']


def planning_cards(store,key,rows,limit=3):
 """Strict per-section matches, separate from the full builder's soft stage fit."""
 plan=store.get(key);used={e.get('track_id') for e in plan['entries']};limits=plan['limits'];cards=[];start=0
 phases=plan['arc'] if plan['mode']=='arc' else [{'stage':None,'tracks':plan.get('range_count',20)}]
 lookup={identity(t):t for t in rows}
 for i,phase in enumerate(phases):
  a,b=number(phase.get('energy_from')),number(phase.get('energy_to'))
  low=max(limits['energy_min'],min(a,b)-.5) if a is not None and b is not None else limits['energy_min']
  high=min(limits['energy_max'],max(a,b)+.5) if a is not None and b is not None else limits['energy_max']
  matching=[]
  for t in rows:
   energy,bpm=number(t.get('scores',{}).get('Energy')),number(t.get('bpm'))
   if t.get('available') is False or t.get('missing'):continue
   if phase.get('stage') and t['current_stage']!=phase['stage']:continue
   if energy is None or bpm is None or not(low<=energy<=high and limits['bpm_min']<=bpm<=limits['bpm_max']):continue
   matching.append(t)
  unused={identity(t) for t in matching if identity(t) not in used}
  ranked=suggestions(store,key,rows,position=start,limit=len(rows))['rows']
  choices=[]
  for ranked_row in ranked:
   if ranked_row['id'] not in unused:continue
   t=lookup[ranked_row['id']];choices.append({'id':identity(t),'name':t.get('name',Path(t['path']).name),'bpm':t.get('bpm'),'camelot':t.get('camelot'),'energy':t.get('scores',{}).get('Energy'),'score':ranked_row['score']})
   if len(choices)>=limit:break
  cards.append({'index':i,'stage':phase.get('stage'),'tracks':phase['tracks'],'start':start,'end':start+phase['tracks'],
   'energy_from':a,'energy_to':b,'match_min':low,'match_max':high,'matching_count':len(matching),'unused_count':len(unused),'rows':choices})
  start+=phase['tracks']
 return cards
