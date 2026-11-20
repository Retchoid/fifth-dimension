"""Export one exact running order; never regroup or reorder by category."""
import csv,json,re,sys
from pathlib import Path
from dpm import atomic_json
from learning import identity
from set_tools import playable_path
from crate_export import crate_bytes,volume_path,PREFIX

def export_set(plan,rows,destination,format='both'):
 if format not in {'both','playlist','crate'}:raise ValueError('Choose playlist, crate, or both')
 if format=='crate' and sys.platform=='win32':raise ValueError('Use the M3U8 playlist for Serato on Windows; native crate export is experimental on Mac only')
 lookup={identity(t):t for t in rows};ordered=[];unavailable=[]
 for i,entry in enumerate(plan['entries']):
  item=lookup.get(entry.get('track_id'));path=playable_path(item) if item else None
  if path is None:unavailable.append(str(i+1));continue
  if any(c in path for c in ('\r','\n','\0')):raise ValueError('A track path contains a line break or NUL; rename it before exporting')
  ordered.append((i,entry,dict(item,path=path)))
 if unavailable:raise ValueError('Cannot export: reconnect, swap or remove unavailable track positions '+', '.join(unavailable))
 if not ordered:raise ValueError('Build or add tracks before exporting')
 title=re.sub(r'[<>:"/\\|?*\x00-\x1f]','_',plan['title']).strip(' .')[:80] or 'DPM Set'
 destination=Path(destination);destination.mkdir(parents=True,exist_ok=False);files=[]
 if format in {'both','playlist'} or sys.platform=='win32':
  file=destination/(title+'.m3u8');lines=['#EXTM3U']
  for _,_,t in ordered:
   name=Path(t['path']).name;duration=int(t.get('duration_seconds') or -1)
   lines.extend([f'#EXTINF:{duration},{name}',t['path']])
  file.write_text('\n'.join(lines)+'\n',encoding='utf-8');files.append(file.name)
 crates=[]
 if format in {'both','crate'} and sys.platform!='win32':
  by_volume={}
  for _,_,t in ordered:
   volume,relative=volume_path(t['path']);by_volume.setdefault(str(volume),[]).append(relative)
  for i,(volume,paths) in enumerate(by_volume.items()):
   folder=destination/('internal' if volume=='/' else f'volume-{i+1}-{Path(volume).name}');folder.mkdir()
   file=folder/(PREFIX+'Set '+title+'.crate');file.write_bytes(crate_bytes(paths));relative=str(file.relative_to(destination));files.append(relative)
   crates.append({'relative_file':relative,'volume':volume,'tracks':len(paths)})
 file=destination/(title+'-running-order.csv');score_names=sorted({s for _,_,t in ordered for s in t.get('scores',{})})
 with file.open('w',encoding='utf-8-sig',newline='') as f:
  writer=csv.DictWriter(f,fieldnames=['position','path','name','set_stage','category','bpm','camelot',*score_names]);writer.writeheader()
  for i,e,t in ordered:writer.writerow({'position':i+1,'path':t['path'],'name':Path(t['path']).name,'set_stage':e.get('stage') or t['current_stage'],
   'category':t['current_stage'],'bpm':t.get('bpm'),'camelot':t.get('camelot'),**{s:t.get('scores',{}).get(s) for s in score_names}})
 files.append(file.name)
 instructions='The playlist and CSV preserve your exact running order. Music files are not copied or changed.\nM3U/M3U8 import depends on your Serato version.\n'
 if crates:instructions+='Native .crate files use a community-derived format and need validation in your Serato version. Each drive has a separate crate; within-drive order is retained. The M3U8/CSV contains the complete cross-drive sequence. Export does not install or overwrite Serato crates.\n'
 (destination/'READ ME.txt').write_text(instructions,encoding='utf-8');files.append('READ ME.txt')
 manifest={'format':'5D-DPM-set-export-v1','set_id':plan['id'],'title':plan['title'],'tracks':len(ordered),'files':files,'crates':crates,
  'ordered_track_ids':[identity(t) for _,_,t in ordered],'notes':['No regrouping or reranking on export.','Crate display order can depend on Serato sorting.']}
 atomic_json(destination/'manifest.json',manifest)
 return {'destination':str(destination),'files':files,'tracks':len(ordered),'crates':len(crates),'playlist':any(f.endswith('.m3u8') for f in files)}
