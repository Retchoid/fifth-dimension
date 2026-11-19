"""Local preview exports. Serato installation is a separate, explicit GUI action."""
import csv,json,math,re,struct,shutil,subprocess,sys
from datetime import datetime
from pathlib import Path
from learning import current_stage,identity
from dpm import STAGES,atomic_json
PREFIX='DPM-5D%%'

def key_penalty(a,b):
 pattern=r'(1[0-2]|[1-9])([AB])'
 a=re.fullmatch(pattern,str(a));b=re.fullmatch(pattern,str(b))
 if not a or not b:return 2.5
 x,y=int(a[1]),int(b[1]);gap=min((x-y)%12,(y-x)%12)
 if gap==0:return 0 if a[2]==b[2] else 1
 if gap==1:return 1 if a[2]==b[2] else 2
 if gap==2 and a[2]==b[2]:return 2
 return 4

def bpm_cost(a,b):
 try:
  a,b=float(a),float(b)
  if not (math.isfinite(a) and math.isfinite(b) and a>0 and b>0):return 1
  return 4*abs(b-a)/a
 except (ValueError,TypeError):return 1

def order_tracks(tracks):
 def energy(t):
  value=t.get('scores',{}).get('Energy')
  return value if isinstance(value,(int,float)) and math.isfinite(value) else 5
 remaining=sorted(tracks,key=lambda t:(energy(t),t['path']))
 if not remaining:return []
 ordered=[remaining.pop(0)]
 while remaining:
  previous=ordered[-1]
  from transitions import transition_details
  def cost(item):
   result=transition_details(previous,item)
   return 100-(result['score'] or 0)+30*(1-result['coverage'])
  chosen=min(range(len(remaining)),key=lambda i:(cost(remaining[i]),remaining[i]['path']))
  ordered.append(remaining.pop(chosen))
 return ordered

def volume_path(path):
 p=Path(path)
 if not p.is_absolute():raise ValueError('Export requires absolute audio paths')
 if len(p.parts)>2 and p.parts[1]=='Volumes':
  volume=Path('/Volumes')/p.parts[2];relative=p.relative_to(volume)
 elif sys.platform=='win32':volume=Path(p.anchor);relative=p.relative_to(volume)
 else:volume=Path('/');relative=p.relative_to('/')
 return volume,relative

def chunk(tag,body):return tag.encode('ascii')+struct.pack('>I',len(body))+body

def crate_bytes(paths):
 return chunk('vrsn','1.0/Serato ScratchLive Crate'.encode('utf-16-be'))+b''.join(
  chunk('otrk',chunk('ptrk',str(p).encode('utf-16-be'))) for p in paths)

def preview(tracks,labels,destination,duration_range=(90,900)):
 destination=Path(destination);destination.mkdir(parents=True,exist_ok=False)
 groups={stage:[] for stage in STAGES};groups.update({name:[] for name in ['Openers','Rollers','Vocal-like proxy','Closers']})
 skipped=[]
 for t in tracks:
  if not duration_range[0]<=t.get('duration_seconds',0)<=duration_range[1]:continue
  path=next((p for p in [t['path'],*t.get('duplicate_paths',[])] if Path(p).is_file()),None)
  if path is None or '\n' in path or '\r' in path:skipped.append(t['path']);continue
  item=dict(t,path=path);primary=current_stage(t,labels);groups[primary].append(item)
  if identity(t) not in labels and primary==t.get('suggested_stage') and t.get('secondary_eligible'):
   alternate=t.get('alternate_stage')
   if alternate in STAGES and alternate!=primary:groups[alternate].append(item)
  scores=t.get('scores',{});get=lambda k:scores.get(k) if isinstance(scores.get(k),(int,float)) else -1
  if get('Intro Length')>=7 and 0<=get('Energy')<=4.5:groups['Openers'].append(item)
  if get('Roller Index')>=7.5:groups['Rollers'].append(item)
  if get('Vocal Presence')>=7:groups['Vocal-like proxy'].append(item)
  if primary in {'Rebirth','Sunrise'} or (get('Recovery Potential')>=7 and 0<=get('Energy')<=3.5):groups['Closers'].append(item)
 manifest={'created':datetime.now().isoformat(),'format':'5D-DPM-preview-v1','crates':[],'skipped_unavailable':skipped,
  'notes':['Ordering starts at lowest energy, then greedily blends harmonic, energy-maintenance and BPM heuristics with missing-input penalties. It is not a validated set or guaranteed energy ramp.',
           'Vocal-like proxy also responds to melodic instruments. Offline crate format needs target-Serato validation.']}
 index=[];rows=[]
 for name,items in groups.items():
  if not items:continue
  ordered=order_tracks(items);title=f'{list(STAGES).index(name)+1} {name}' if name in STAGES else name
  playlist=destination/(title+'.m3u8');playlist.write_text('#EXTM3U\n'+'\n'.join(t['path'] for t in ordered)+'\n',encoding='utf-8')
  by_volume={}
  for t in ordered:
   volume,relative=volume_path(t['path']);by_volume.setdefault(str(volume),[]).append(relative)
   rows.append({'crate':title,'path':t['path'],'bpm':t.get('bpm'),'camelot':t.get('camelot'),
                'category':current_stage(t,labels),'score_version':t.get('score_version','legacy')})
  for volume,paths in by_volume.items():
   if sys.platform=='win32':continue # Windows beta exports M3U/CSV; no unverified Serato crate writes.
   folder='internal' if volume=='/' else 'volume-'+Path(volume).name
   target=destination/folder;target.mkdir(exist_ok=True)
   file=target/(PREFIX+title+'.crate');file.write_bytes(crate_bytes(paths))
   manifest['crates'].append({'relative_file':str(file.relative_to(destination)),'volume':volume,'tracks':len(paths)})
  index.append(title+'\n'+'\n'.join(f"  {t.get('camelot','?')} | {t.get('bpm','?')} BPM | {t['path']}" for t in ordered))
 (destination/'CRATE_INDEX.txt').write_text('\n\n'.join(index)+'\n',encoding='utf-8')
 with (destination/'assignments.csv').open('w',newline='',encoding='utf-8') as f:
  writer=csv.DictWriter(f,fieldnames=['crate','path','bpm','camelot','category','score_version']);writer.writeheader();writer.writerows(rows)
 atomic_json(destination/'manifest.json',manifest)
 return manifest

def install_preview(destination,home=None):
 """Only call after the user explicitly confirms in the app. Backup and rollback."""
 if sys.platform!='darwin':raise RuntimeError('Serato installation requires macOS')
 processes=subprocess.run(['/bin/ps','-axo','comm='],capture_output=True,text=True,check=True).stdout
 if any('serato' in Path(line.strip()).name.lower() for line in processes.splitlines()):raise RuntimeError('Close Serato before installing crates')
 destination=Path(destination).resolve();manifest=json.loads((destination/'manifest.json').read_text())
 if manifest.get('format')!='5D-DPM-preview-v1':raise ValueError('Invalid preview manifest')
 home=Path.home() if home is None else Path(home);plan=[]
 for row in manifest['crates']:
  source=(destination/row['relative_file']).resolve()
  if not source.is_relative_to(destination) or not source.name.startswith(PREFIX) or source.suffix!='.crate':raise ValueError('Invalid crate source')
  volume=Path(row['volume'])
  if volume!=Path('/') and (volume.parent!=Path('/Volumes') or not volume.is_dir()):raise ValueError('Reconnect the export drive')
  target=(home/'Music' if volume==Path('/') else volume)/'_Serato_'/'Subcrates'
  if not target.is_dir():raise ValueError(f'Existing Serato Subcrates folder required: {target}')
  plan.append((source,target/source.name))
 if not plan:return {'installed':0,'backup':None}
 backup=destination/('backup-'+datetime.now().strftime('%Y%m%d-%H%M%S-%f'));backup.mkdir()
 old=[]
 for i,(source,target) in enumerate(plan):
  copy=backup/f'{i}.crate'
  if target.exists():shutil.copy2(target,copy)
  old.append((target,copy if copy.exists() else None))
 atomic_json(backup/'restore.json',[{'target':str(target),'backup':str(copy) if copy else None} for target,copy in old])
 try:
  for source,target in plan:
   temp=target.with_suffix('.crate.5d-tmp')
   try:temp.write_bytes(source.read_bytes());temp.replace(target)
   finally:temp.unlink(missing_ok=True)
 except Exception:
  for target,copy in old:
   if copy:shutil.copy2(copy,target)
   else:target.unlink(missing_ok=True)
  raise
 return {'installed':len(plan),'backup':str(backup)}
