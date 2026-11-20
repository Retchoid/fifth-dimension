"""Local desktop companion UI, served only on loopback with a per-session token.

No CDN, online account, remote server or audio upload. Native macOS dialogs and
playback are launched as argument arrays; file changes are limited to DPM state
and explicitly selected exports.
"""
import argparse,hashlib,json,math,os,secrets,subprocess,sys,threading,time,traceback
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from dpm import atomic_json,COLORS
from learning import identity,features,recommend,current_stage,rebind_labels,batch
from tempo import apply_override,valid_bpm,resolve_tempo

BASE=Path(__file__).resolve().parent
VERSION='0.14-win-beta'

def read_json(path,default):
 if not path.exists():return default
 value=json.loads(path.read_text())
 if not isinstance(value,type(default)):raise ValueError(f'Invalid DPM state format: {path.name}')
 return value

def clean_json(value):
 if isinstance(value,float) and not math.isfinite(value):return None
 if isinstance(value,dict):return {k:clean_json(v) for k,v in value.items()}
 if isinstance(value,list):return [clean_json(v) for v in value]
 return value

class State:
 def __init__(self,data):
  self.profile_root=Path(data);self.profile_root.mkdir(parents=True,exist_ok=True)
  from profiles import ProfileStore
  self.profiles=ProfileStore(self.profile_root);self.data=self.profiles.path(self.profiles.data['active']);self.data.mkdir(parents=True,exist_ok=True);self.lock=threading.RLock()
  self.labels={};self.tracks=[];self.overrides={};self.rows=[];self.revision=0
  self.undo=None;self.proc=None;self.audio=None;self.audio_id=None;self.audio_handle=None
  self.settings=read_json(self.data/'settings.json',{})
  self.status='Ready';self.minimum=self.settings.get('minimum',90);self.maximum=self.settings.get('maximum',900);self.worker=None;self.last_export=None
  self.tempo_minimum=self.settings.get('tempo_minimum',140);self.tempo_maximum=self.settings.get('tempo_maximum',176);self.prefer_range=self.settings.get('prefer_range',True)
  from playback import NativePlayer
  from set_tools import SetStore
  self.player=NativePlayer();self.sets=SetStore(self.data/'sets.json');self.job_cancel=threading.Event()
  self.average_bpm=self.settings.get('average_bpm',160);self.job=None
  self.reload()
 def reload(self):
  with self.lock:
   self.tracks=read_json(self.data/'dpm_results.json',[])
   self.labels=rebind_labels(self.tracks,read_json(self.data/'labels.json',{}))
   self.overrides=read_json(self.data/'tempo_overrides.json',{})
   rechecks=read_json(self.data/'tempo_rechecks.json',{})
   self.rows=[]
   for track in self.tracks:
    track.update(rechecks.get(identity(track),{}))
    item=apply_override(track,self.overrides,(self.tempo_minimum,self.tempo_maximum) if self.prefer_range else None);item['id']=identity(track)
    item['learned_stage']=recommend(item,self.labels)[0]
    item['manual_stage']=self.labels.get(identity(track),{}).get('stage')
    item['current_stage']=item['manual_stage'] if item['manual_stage'] in COLORS else item['learned_stage']
    from set_tools import stage_number
    item['stage_number']=stage_number(item['current_stage'])
    item['name']=Path(item['path']).name
    self.rows.append(item)
   self.revision+=1
 def eligible(self):
  return [t for t in self.rows if isinstance(t.get('duration_seconds'),(int,float)) and self.minimum<=t['duration_seconds']<=self.maximum]
 def find(self,key):
  item=next((t for t in self.rows if t['id']==key),None)
  if item is None:raise ValueError('Track not found; refresh the library')
  return item
 def snapshot(self,revision=None):
  with self.lock:
   playback=self.player.snapshot()
   self.audio_id=playback['id']
   counts=dict.fromkeys(COLORS,0)
   for item in self.eligible():counts[item['current_stage']]+=1
   result={'profile':self.profiles.current(),'profiles':self.profiles.summary(),'version':VERSION,'revision':self.revision,'status':self.status,'counts':counts,
           'reviewed':len(self.labels),'stored':len(self.rows),'eligible':len(self.eligible()),
           'scan_running':self.proc is not None,'busy':self.worker is not None and self.worker.is_alive(),
           'playing':self.audio_id,'playback':playback,'average_bpm':self.average_bpm,'job':self.job,'set_summaries':self.sets.summary(),'minimum':self.minimum,'maximum':self.maximum,'tempo_minimum':self.tempo_minimum,'tempo_maximum':self.tempo_maximum,'prefer_range':self.prefer_range,
           'can_undo':self.undo is not None,'last_export':self.last_export,'colors':COLORS}
   if str(revision)!=str(self.revision):result['tracks']=self.rows
   return result
 def assign(self,keys,stage):
  if stage not in COLORS:raise ValueError('Choose one of the eight categories')
  if not keys:raise ValueError('Select at least one track')
  with self.lock:
   tracks=[self.find(k) for k in set(keys)];previous=dict(self.labels)
   undo={item['id']:self.labels.get(item['id']) for item in tracks}
   for item in tracks:self.labels[item['id']]={'stage':stage,'features':features(item),'path':item['path'],
     'core':item['suggested_stage'],'score_version':item.get('score_version','legacy'),'reference_id':item.get('reference_id')}
   try:atomic_json(self.data/'labels.json',self.labels)
   except Exception:self.labels=previous;raise
   self.undo=undo;self.reload();self.status=f'Saved {len(tracks)} category correction'+('s' if len(tracks)!=1 else '')+'. Recommendations updated.'
 def undo_labels(self):
  with self.lock:
   if self.undo is None:return
   previous=dict(self.labels)
   for key,old in self.undo.items():
    if old is None:self.labels.pop(key,None)
    else:self.labels[key]=old
   try:atomic_json(self.data/'labels.json',self.labels)
   except Exception:self.labels=previous;raise
   self.undo=None;self.reload();self.status='Last category correction undone.'
 def set_tempo(self,keys,value=None,factor=None,clear=False):
  with self.lock:
   items=[self.find(k) for k in set(keys)]
   if not items:raise ValueError('Select a track first')
   updates=dict(self.overrides)
   for item in items:
    if clear:updates.pop(item['id'],None);continue
    bpm=valid_bpm((item.get('bpm') or 0)*float(factor) if factor is not None else value)
    if bpm is None:raise ValueError('BPM must be between 20 and 400')
    updates[item['id']]={'bpm':bpm,'updated':time.time()}
   atomic_json(self.data/'tempo_overrides.json',updates);self.overrides=updates;self.reload()
   self.status='Saved BPM correction. Music files and tags are unchanged.' if not clear else 'BPM correction cleared.'
 def stop(self):
  self.player.stop();self.audio_id=None
 def play(self,key):
  with self.lock:
   item=self.find(key);current=self.player.snapshot()
   if current['id']==key:
    if current['state']=='playing':self.player.pause()
    else:self.player.resume()
   else:
    path=next((p for p in [item['path'],*item.get('duplicate_paths',[])] if Path(p).is_file()),None)
    if not path:raise ValueError('Track unavailable. Reconnect its drive.')
    self.player.load(key,path)
   self.audio_id=key;self.status='Loaded '+item['name']
 def seek(self,seconds):return self.player.seek(seconds)
 def profile_action(self,args):
  with self.lock:
   if self.proc is not None or (self.worker and self.worker.is_alive()):raise ValueError('Finish or cancel the current scan/analysis before switching DJ profiles')
   operation=args.get('operation');key=args.get('id')
   if operation=='create':
    record=self.profiles.create(args.get('name',''),self.profiles.data['active'] if args.get('reuse_analysis') else None);key=record['id']
   elif operation!='switch':raise ValueError('Choose create or switch profile')
   self.profiles.get(key);directory=self.profiles.path(key);directory.mkdir(parents=True,exist_ok=True)
   settings=read_json(directory/'settings.json',{})
   from set_tools import SetStore
   sets=SetStore(directory/'sets.json')
   fields=['data','settings','sets','labels','tracks','rows','overrides','undo','minimum','maximum','tempo_minimum','tempo_maximum','prefer_range','average_bpm','last_export','job','worker','status','revision']
   previous={name:getattr(self,name) for name in fields};self.stop()
   try:
    self.data=directory;self.settings=settings;self.sets=sets;self.undo=None;self.last_export=None;self.job=None;self.worker=None
    self.minimum=settings.get('minimum',90);self.maximum=settings.get('maximum',900);self.tempo_minimum=settings.get('tempo_minimum',140);self.tempo_maximum=settings.get('tempo_maximum',176);self.prefer_range=settings.get('prefer_range',True);self.average_bpm=settings.get('average_bpm',160)
    self.reload();self.profiles.activate(key);self.status='DJ profile: '+self.profiles.current()['name']+'. Training, sets and settings are separate.'
   except Exception:
    for name,value in previous.items():setattr(self,name,value)
    raise
   return self.snapshot()
 def choose_file(self,prompt):
  if sys.platform=='win32':
   from platform_support import choose_path
   return choose_path(prompt)
  if sys.platform!='darwin':raise ValueError('Native file selection requires the Mac app')
  result=subprocess.run(['/usr/bin/osascript','-e',f'POSIX path of (choose file with prompt {json.dumps(prompt)})'],capture_output=True,text=True)
  return Path(result.stdout.strip()) if result.returncode==0 else None
 def recheck_bpm(self,keys):
  if self.proc is not None or (self.worker and self.worker.is_alive()):raise ValueError('Wait for the current library operation')
  with self.lock:
   targets=[dict(self.find(key)) for key in dict.fromkeys(keys)]
   if not targets:raise ValueError('Select at least one track to recheck')
  self.job_cancel.clear();self.job={'kind':'bpm','done':0,'total':len(targets),'errors':[],'running':True}
  average,low,high,prefer=self.average_bpm,self.tempo_minimum,self.tempo_maximum,self.prefer_range
  def work():
   from bpm_recheck import analyze_tempo
   try:
    for item in targets:
     if self.job_cancel.is_set():break
     try:
      path=next((Path(p) for p in [item['path'],*item.get('duplicate_paths',[])] if Path(p).is_file()),None)
      if path is None:raise ValueError('Drive or file unavailable')
      before=path.stat();result=analyze_tempo(path,average,low,high,prefer);after=path.stat()
      if (before.st_size,before.st_mtime_ns)!=(after.st_size,after.st_mtime_ns):raise ValueError('File changed during recheck; rescan it')
      with self.lock:
       records=read_json(self.data/'dpm_results.json',[])
       for row in records:
        if identity(row)==item['id']:row.update(result)
       rechecks=read_json(self.data/'tempo_rechecks.json',{});rechecks[item['id']]=result
       atomic_json(self.data/'tempo_rechecks.json',rechecks)
       atomic_json(self.data/'dpm_results.json',records);self.reload()
     except Exception as exc:self.job['errors'].append(item['name']+': '+str(exc))
     self.job['done']+=1;self.status=f"Rechecking audio BPM… {self.job['done']}/{self.job['total']}"
    self.status=f"BPM recheck {'cancelled' if self.job_cancel.is_set() else 'complete'}: {self.job['done']}/{self.job['total']}; {len(self.job['errors'])} errors. Manual BPM corrections retained."
   finally:self.job['running']=False
  self.worker=threading.Thread(target=work,daemon=True);self.worker.start()
 def set_action(self,args):
  from set_tools import suggestions,analyze_set,import_tracklist,availability,populate,replacements,reorder,replace_track,undo_order,checkpoint,playable_path,planning_cards,append_tracks,remember_suggestions
  with self.lock:
   operation=args.get('operation','list');key=args.get('id');exported=None;added=None
   live_rows=availability(self.rows) if operation!='list' else self.rows
   eligible_ids={t['id'] for t in self.eligible()};live_eligible=[t for t in live_rows if t['id'] in eligible_ids]
   from source_scope import validate_sources,scope_rows
   if operation=='pick_source':
    path=self.choose_folder('Choose a music folder to draw this set from')
    return {'folder':str(path.resolve()) if path is not None else None}
   if operation=='preview':
    from copy import deepcopy
    from set_tools import validate_plan
    from arc_presets import validate_options
    plan=deepcopy(self.sets.get(key));arc,limits=validate_plan(args['mode'],args['arc'],args['limits'])
    plan.update(mode=args['mode'],arc=arc,limits=limits,options=validate_options(args.get('options')),source_folders=validate_sources(args.get('source_folders',plan.get('source_folders',[]))))
    class View:
     data=self.sets.data
     def get(self,_):return plan
    pool=scope_rows(live_eligible,plan.get('source_folders',[]))
    return {'phase_cards':planning_cards(View(),key,pool),'source_count':len(pool)}
   if operation in {'append_many','append_phase'}:
    ids=args.get('ids',[])
    if not isinstance(ids,list) or not ids or len(ids)>500 or any(not isinstance(i,str) for i in ids):raise ValueError('Choose 1–500 tracks to add')
    items=[self.find(track_id) for track_id in ids]
    for item in items:
     if not playable_path(item):raise ValueError('Track unavailable: '+item['name']+'. Nothing was added.')
    if key is None:
     from arc_presets import preset_phases
     plan=self.sets.create(args.get('title','Library selection'),'range',preset_phases('journey'),args.get('limits'));key=plan['id']
    affected={t['current_stage'] for t in items};shown={}
    if operation=='append_many':shown={str(c['index']):[r['id'] for r in c['rows']] for c in planning_cards(self.sets,key,live_eligible) if c['stage'] is None or c['stage'] in affected}
    added=append_tracks(self.sets,key,items,args.get('phase_index') if operation=='append_phase' else None,args.get('seen_ids'),args.get('criteria'),shown)
    self.status=f"Added {added['count']} tracks to set; {added['duplicates']} already present."
   elif operation=='more_suggestions':
    plan=self.sets.get(key);index=args.get('phase_index',0)
    if not isinstance(index,int) or isinstance(index,bool) or not 0<=index<(len(plan['arc']) if plan['mode']=='arc' else 1):raise ValueError('Section not found')
    remember_suggestions(plan,index,args.get('seen_ids',[]));self.sets.save()
   elif operation=='create':
    from arc_presets import preset_phases
    arc=args.get('arc',preset_phases(args.get('preset','journey')))
    plan=self.sets.create(args.get('title','New set'),args.get('mode','arc'),arc,args.get('limits'),args.get('options'));key=plan['id']
    plan['preset']=args.get('preset','journey');plan['source_folders']=validate_sources(args.get('source_folders',[]))
    if args.get('auto_populate'):populate(self.sets,key,scope_rows(live_eligible,self.sets.get(key).get('source_folders',[])),args.get('count'))
    else:self.sets.save()
   elif operation in {'update','configure'}:
    from set_tools import validate_plan
    validate_plan(args['mode'],args['arc'],args['limits'])
    requested=sum(p['tracks'] for p in args['arc']) if args['mode']=='arc' else args.get('count',20)
    if operation=='configure' and (isinstance(requested,bool) or not isinstance(requested,(int,float)) or int(requested)!=requested or not 1<=requested<=500):raise ValueError('Build a set of 1–500 tracks')
    from copy import deepcopy
    previous_config={k:deepcopy(v) for k,v in self.sets.get(key).items() if k in {'title','mode','arc','limits','options','preset','range_count','source_folders'}}
    sources=validate_sources(args.get('source_folders',self.sets.get(key).get('source_folders',[])))
    self.sets.update(key,args['title'],args['mode'],args['arc'],args['limits'],args.get('options'))
    self.sets.get(key)['preset']=args.get('preset','custom');self.sets.get(key)['source_folders']=sources
    if operation=='configure':
     populate(self.sets,key,scope_rows(live_eligible,self.sets.get(key).get('source_folders',[])),args.get('count'));self.sets.get(key)['undo_config']=previous_config;self.sets.save()
    else:self.sets.save()
   elif operation=='generate':populate(self.sets,key,scope_rows(live_eligible,self.sets.get(key).get('source_folders',[])),args.get('count'))
   elif operation=='move':reorder(self.sets,key,args['index'],args['to_index'])
   elif operation=='swap':
    matches=scope_rows([self.find(args['track_id'])],self.sets.get(key).get('source_folders',[]))
    if not matches:raise ValueError('Choose a replacement from this set’s source folders')
    replace_track(self.sets,key,args['index'],matches[0])
   elif operation=='undo_order':undo_order(self.sets,key)
   elif operation=='export':
    from set_export import export_set
    from datetime import datetime
    plan=self.sets.get(key)
    if not plan['entries']:raise ValueError('Build or add tracks before exporting')
    bad=[str(i+1) for i,e in enumerate(plan['entries']) if not next((r for r in live_rows if r['id']==e.get('track_id') and r.get('available')),None)]
    if bad:raise ValueError('Reconnect, swap or remove unavailable positions '+', '.join(bad)+' before exporting')
    parent=self.choose_folder('Choose where to export this set')
    if parent is not None:
     destination=parent/('5D-DPM-set-'+datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
     exported=export_set(plan,live_rows,destination,args.get('format','both'));self.status='Set exported in your exact running order: '+str(destination)
   elif operation=='add':
    item=self.find(args['track_id'])
    if not playable_path(item):raise ValueError('Track unavailable. Reconnect the drive and refresh suggestions.')
    stage=args.get('stage') or self.sets.next_stage(key) or item['current_stage']
    self.sets.add(key,item['id'],stage)
   elif operation=='edit':
    if args.get('remove') or args.get('move') is not None:checkpoint(self.sets.get(key))
    self.sets.edit_entry(key,args['index'],args.get('stage'),args.get('rating'),args.get('move'),args.get('remove',False))
   elif operation=='rate_all':
    plan=self.sets.get(key)
    for entry in plan['entries'][1:]:entry['rating']='good'
    self.sets.save()
   elif operation=='learn':
    self.sets.learn(key,self.rows)
    if args.get('train_categories'):
     plan=self.sets.get(key);previous=dict(self.labels);undo={}
     for entry in plan['entries']:
      if not entry.get('track_id') or not entry.get('stage'):continue
      item=self.find(entry['track_id']);undo[item['id']]=self.labels.get(item['id'])
      self.labels[item['id']]={'stage':entry['stage'],'features':features(item),'path':item['path'],'core':item['suggested_stage'],
       'score_version':item.get('score_version','legacy'),'reference_id':item.get('reference_id'),'source':'confirmed_set_placement'}
     try:atomic_json(self.data/'labels.json',self.labels)
     except Exception:self.labels=previous;raise
     self.undo=undo;self.reload()
    self.status='Reviewed set transitions saved for future suggestions.'
   elif operation=='unlearn':self.sets.unlearn(key);self.status='Set transition learning removed.'
   elif operation=='import':
    path=self.choose_file('Choose an ordered M3U/M3U8 or CSV set tracklist')
    if path is None:return {'sets':self.sets.summary()}
    entries,unmatched=import_tracklist(path,live_rows);plan=self.sets.create(path.stem,'range');key=plan['id'];plan['entries']=entries
    plan['import_unmatched']=unmatched;self.sets.save();self.status=f'Imported set: {len(entries)-len(unmatched)} matched, {len(unmatched)} unmatched. Review before learning.'
   elif operation not in {'list','get'}:raise ValueError('Unknown set action')
   if key:
    plan=self.sets.get(key);scoped=scope_rows(live_eligible,plan.get('source_folders',[]))
    source_lookup={r['id']:r for r in scope_rows(live_rows,plan.get('source_folders',[]))}
    detail_rows=[source_lookup.get(r['id'],r) for r in live_rows]
    return {'sets':self.sets.summary(),'plan':plan,'analysis':analyze_set(plan,detail_rows),'source_count':len(scoped),'phase_cards':None if args.get('details_only') else planning_cards(self.sets,key,scoped),'exported':exported,'added':added,'can_export_crate':sys.platform!='win32',
      'suggestions':suggestions(self.sets,key,scoped,args.get('source_id')),
      'replacements':replacements(self.sets,key,scoped,args['replace_index']) if args.get('replace_index') is not None and 0<=int(args['replace_index'])<len(plan['entries']) else None,
      'learned':self.sets.data['learned'].get(key)}
   return {'sets':self.sets.summary()}
 def choose_folder(self,prompt):
  if sys.platform=='win32':
   from platform_support import choose_path
   return choose_path(prompt,True)
  if sys.platform!='darwin':raise ValueError('Native folder selection is available on the Mac installation')
  result=subprocess.run(['/usr/bin/osascript','-e',f'POSIX path of (choose folder with prompt {json.dumps(prompt)})'],capture_output=True,text=True)
  if result.returncode:return None
  return Path(result.stdout.strip())
 def scan(self,root=None):
  if self.proc is not None:raise ValueError('A scan is already running')
  if self.worker and self.worker.is_alive():raise ValueError('Wait for the current library operation to finish')
  root=Path(root) if root else self.choose_folder('Choose a music folder to scan')
  if root is None:return
  if not root.is_dir():raise ValueError('Folder unavailable. Reconnect the drive.')
  log=(self.data/'scan_progress.log').open('w')
  env=dict(os.environ,OMP_NUM_THREADS='1',OPENBLAS_NUM_THREADS='1',MKL_NUM_THREADS='1',NUMBA_NUM_THREADS='1')
  from platform_support import scan_command
  command=scan_command(BASE,[str(root),'--merge','--output',str(self.data/'dpm_results.json'),'--db',str(self.data/'cache.sqlite3'),'--min-duration',str(self.minimum),'--max-duration',str(self.maximum)])
  process=subprocess.Popen(command,stdout=log,stderr=subprocess.STDOUT,env=env,**({'creationflags':subprocess.CREATE_NO_WINDOW} if sys.platform=='win32' else {}))
  self.proc=process;self.status='Scanning '+str(root)
  def monitor():
   try:
    while process.poll() is None:
     try:
      with (self.data/'scan_progress.log').open('rb') as f:
       f.seek(max(0,(self.data/'scan_progress.log').stat().st_size-2048));lines=f.read().decode(errors='replace').splitlines()
      if lines:self.status=lines[-1][:220]
     except OSError:pass
     time.sleep(.5)
    with self.lock:
     self.reload();self.status='Scan completed.' if process.returncode==0 else 'Scan stopped or failed. Completed analyses remain cached.'
   finally:log.close();self.proc=None
  threading.Thread(target=monitor,daemon=True).start()
 def refresh_tags(self):
  if self.proc is not None:raise ValueError('Wait for the scan to finish')
  if self.worker and self.worker.is_alive():raise ValueError('A library update is already running')
  def work():
   from inventory import read_key_bpm_tags,normalize_key
   try:
    with self.lock:source_tracks=list(self.tracks)
    changed=0;updated=[]
    for index,track in enumerate(source_tracks):
     item=dict(track);path=next((p for p in [track['path'],*track.get('duplicate_paths',[])] if Path(p).is_file()),None)
     if path:
      tags=read_key_bpm_tags(Path(path));bpm=valid_bpm(tags.get('bpm'))
      item.update(resolve_tempo(item.get('measured_bpm',item.get('bpm')),bpm,item.get('tempo_window_estimates')))
      key=normalize_key(tags.get('key',''))
      if key:item.update(camelot=key,key_source='file_tag')
      if item!=track:changed+=1
     updated.append(item);self.status=f'Reading existing tags… {index+1}/{len(source_tracks)}'
    with self.lock:
     atomic_json(self.data/'dpm_results.json',updated);self.reload();self.status=f'Refreshed tags for {changed} tracks. Saved BPM corrections retained.'
   except Exception as exc:self.status='Tag refresh failed: '+str(exc)
  self.worker=threading.Thread(target=work,daemon=True);self.worker.start()
 def export(self):
  if self.worker and self.worker.is_alive():raise ValueError('Wait for the tag update before exporting')
  from datetime import datetime
  from crate_export import preview
  parent=self.choose_folder('Choose where to save the crate preview')
  if parent is None:return
  destination=parent/('5D-DPM-crates-'+datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
  with self.lock:
   manifest=preview(self.eligible(),self.labels,destination,duration_range=(self.minimum,self.maximum))
   self.last_export=str(destination);self.status=f'Exported {len(manifest["crates"])} crate previews. Serato unchanged.'
 def import_crates(self):
  from inventory import connect,import_crates
  if self.proc is not None:raise ValueError('Wait for the scan to finish')
  conn=connect(self.data/'inventory.sqlite3')
  try:
   import_crates(conn);count=conn.execute('SELECT COUNT(*) FROM crate_tracks').fetchone()[0]
   self.status=f'Indexed {count} Serato crate memberships, read-only.'
  finally:conn.close()

class Server(ThreadingHTTPServer):
 daemon_threads=True
 def __init__(self,address,state):
  self.state=state;self.native_window=None;self.token=secrets.token_urlsafe(32);super().__init__(address,Handler)

class Handler(BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def respond(self,value,status=200):
  payload=json.dumps(clean_json(value),allow_nan=False).encode();self.send_response(status)
  self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
 def authenticated(self):return secrets.compare_digest(self.headers.get('X-DPM-Token',''),self.server.token)
 def valid_host(self):return self.headers.get('Host','') in {f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}'}
 def do_GET(self):
  if not self.valid_host():return self.respond({'error':'Invalid host'},403)
  url=urlparse(self.path)
  if url.path.startswith('/api/'):
   if not self.authenticated():return self.respond({'error':'Open 5D DPM.exe to reconnect'},403)
   try:
    if url.path=='/api/state':return self.respond(self.server.state.snapshot(parse_qs(url.query).get('revision',[None])[0]))
    if url.path=='/api/playback':return self.respond(self.server.state.player.snapshot())
    if url.path=='/api/harmonics':
     from harmonics import keys,variations,matrix
     source=parse_qs(url.query).get('source',['8A'])[0]
     return self.respond({'keys':keys(),'source':source,'variations':variations(source),'matrix':matrix()})
    if url.path=='/api/arc_presets':
     from arc_presets import PRESETS,preset_phases
     return self.respond({key:{'name':v['name'],'use':v['use'],'phases':preset_phases(key)} for key,v in PRESETS.items()})
    if url.path=='/api/manual':return self.respond(json.loads((BASE/'field_manual.json').read_text()))
    return self.respond({'error':'Not found'},404)
   except Exception as exc:return self.respond({'error':str(exc)},400)
  files={'/':'index.html','/style.css':'style.css','/app.js':'app.js','/logo.png':'logo.png','/favicon.svg':'favicon.svg','/PressStart2P-Regular.ttf':'PressStart2P-Regular.ttf'}
  if url.path not in files:return self.respond({'error':'Not found'},404)
  payload=(BASE/'web'/files[url.path]).read_bytes();self.send_response(200)
  self.send_header('Content-Type',{'/':'text/html; charset=utf-8','/style.css':'text/css','/app.js':'application/javascript','/logo.png':'image/png','/favicon.svg':'image/svg+xml','/PressStart2P-Regular.ttf':'font/ttf'}[url.path]);self.send_header('Cache-Control','no-store')
  self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'")
  self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
 def do_POST(self):
  if not self.valid_host() or not self.authenticated():return self.respond({'error':'Session token required'},403)
  origin=self.headers.get('Origin')
  if origin and origin not in {f'http://127.0.0.1:{self.server.server_port}',f'http://localhost:{self.server.server_port}'}:return self.respond({'error':'Origin rejected'},403)
  try:
   length=int(self.headers.get('Content-Length','0'))
   if not 0<length<1048576:raise ValueError('Invalid request size')
   args=json.loads(self.rfile.read(length));state=self.server.state;route=urlparse(self.path).path
   if not isinstance(args,dict):raise ValueError('Expected an object')
   if route=='/api/activate':
    from native_window import activate
    activate(self.server)
   elif route=='/api/labels':state.assign(args.get('ids',[]),args.get('stage'))
   elif route=='/api/undo':state.undo_labels()
   elif route=='/api/tempo':state.set_tempo(args.get('ids',[]),args.get('value'),args.get('factor'),args.get('clear',False))
   elif route=='/api/play':state.play(args.get('id'))
   elif route=='/api/stop':state.stop()
   elif route=='/api/seek':return self.respond(state.seek(args.get('seconds')))
   elif route=='/api/pause':state.player.pause()
   elif route=='/api/resume':state.player.resume()
   elif route=='/api/recheck_bpm':state.recheck_bpm(args.get('ids',[]))
   elif route=='/api/cancel_job':state.job_cancel.set()
   elif route=='/api/sets':return self.respond(state.set_action(args))
   elif route=='/api/profiles':return self.respond(state.profile_action(args))
   elif route=='/api/reload':state.reload();state.status='Recommendations refreshed.'
   elif route=='/api/scan':state.scan(args.get('root') or ('/Volumes/23' if args.get('drive23') and sys.platform=='darwin' else None))
   elif route=='/api/cancel_scan':
    if state.proc is not None:state.proc.terminate();state.status='Stopping scan…'
   elif route=='/api/refresh_tags':state.refresh_tags()
   elif route=='/api/export':state.export()
   elif route=='/api/install_crates':
    if not args.get('confirmed') or not state.last_export:raise ValueError('Export and confirm installation first')
    from crate_export import install_preview
    result=install_preview(state.last_export);state.status=f"Installed {result['installed']} crates. Backup: {result['backup']}"
   elif route=='/api/import_crates':state.import_crates()
   elif route=='/api/settings':
    low,high=float(args['minimum']),float(args['maximum'])
    if not (math.isfinite(low) and math.isfinite(high) and 90<=low<=high):raise ValueError('Minimum 90 seconds; maximum must be at least the minimum')
    tempo_low,tempo_high=float(args.get('tempo_minimum',140)),float(args.get('tempo_maximum',176))
    if not (math.isfinite(tempo_low) and math.isfinite(tempo_high) and 20<=tempo_low<=tempo_high<=400):raise ValueError('Preferred BPM range must be within 20–400')
    average=float(args.get('average_bpm',state.average_bpm))
    if not math.isfinite(average) or not tempo_low<=average<=tempo_high:raise ValueError('Average BPM must lie within the preferred range')
    settings={'average_bpm':average,'minimum':low,'maximum':high,'tempo_minimum':tempo_low,'tempo_maximum':tempo_high,'prefer_range':bool(args.get('prefer_range',True))}
    atomic_json(state.data/'settings.json',settings)
    state.minimum=low;state.maximum=high;state.tempo_minimum=tempo_low;state.tempo_maximum=tempo_high;state.prefer_range=settings['prefer_range'];state.average_bpm=average;state.reload()
   elif route=='/api/batch':
    with state.lock:return self.respond({'ids':[identity(t) for t in batch(state.eligible(),state.labels)]})
   elif route=='/api/studied':
    values=args.get('ids',[])
    if not isinstance(values,list) or any(value not in {'gathering','confidence','peak','chaos','locked','sketch','rebirth','sunrise'} for value in values):raise ValueError('Invalid stage ids')
    atomic_json(state.data/'manual_studied.json',list(set(values)))
   elif route=='/api/study_progress':return self.respond({'ids':read_json(state.data/'manual_studied.json',[])})
   elif route=='/api/transitions':
    from transitions import transition_details
    with state.lock:
     source=state.find(args['id']);rows=[]
     for track in state.eligible():
      if track['id']==source['id'] or track.get('missing'):continue
      details=transition_details(source,track,args.get('delta',0),args.get('weights'),args.get('half_double',False))
      rows.append({'id':track['id'],**details})
     rows.sort(key=lambda row:(100-(row['score'] or 0)+30*(1-row['coverage']),row['id']))
    return self.respond({'rows':rows[:100]})
   elif route=='/api/quit':
    state.stop();state.job_cancel.set()
    if state.proc is not None:state.proc.terminate()
    self.respond({'ok':True})
    def quit_app():
     window=getattr(self.server,'native_window',None)
     if window is not None:window.destroy()
     self.server.shutdown()
    threading.Thread(target=quit_app,daemon=True).start();return
   else:return self.respond({'error':'Not found'},404)
   self.respond({'ok':True})
  except Exception as exc:
   traceback.print_exc();self.respond({'error':str(exc)},400)

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--data',type=Path,default=Path.home()/'.5d_dpm');parser.add_argument('--port',type=int,default=0);parser.add_argument('--no-browser','--headless',dest='headless',action='store_true');args=parser.parse_args()
 args.data.mkdir(parents=True,exist_ok=True);session=args.data/'web_session.json'
 from platform_support import acquire_lock
 with (args.data/'gui.lock').open('a+') as lock:
  try:acquire_lock(lock)
  except BlockingIOError:
   try:
    saved=json.loads(session.read_text())
    from urllib.request import Request,urlopen
    with urlopen(Request(saved['base']+'/api/state',headers={'X-DPM-Token':saved['token']}),timeout=2) as result:result.read()
    if saved.get('mode')!='native':raise RuntimeError('Close the browser-based DPM session first')
    request=Request(saved['base']+'/api/activate',data=b'{}',headers={'X-DPM-Token':saved['token'],'Content-Type':'application/json'})
    with urlopen(request,timeout=3) as result:result.read()
    return
   except Exception:
    if sys.platform=='darwin':subprocess.run(['/usr/bin/osascript','-e','display alert "Close the previous DPM window" message "Quit the previous DPM session, including the browser version using its More menu, then open the desktop app again."'])
    raise SystemExit('An older DPM instance is still running')
  state=State(args.data);server=Server(('127.0.0.1',args.port),state)
  base=f'http://127.0.0.1:{server.server_port}';atomic_json(session,{'base':base,'token':server.token,'pid':os.getpid(),'mode':'headless' if args.headless else 'native'})
  if sys.stdout:print('5D DPM '+VERSION+' ready at '+base,flush=True)
  serving_thread=None
  try:
   if args.headless:server.serve_forever(poll_interval=.3)
   else:
    from native_window import run_native
    serving_thread=threading.Thread(target=server.serve_forever,kwargs={'poll_interval':.3},daemon=True)
    serving_thread.start()
    run_native(server,base+'/#'+server.token)
  finally:
   state.stop();state.job_cancel.set()
   if state.proc is not None:state.proc.terminate()
   if serving_thread is not None:
    server.shutdown();serving_thread.join(timeout=3)
   server.server_close();session.unlink(missing_ok=True)

if __name__=='__main__':main()
