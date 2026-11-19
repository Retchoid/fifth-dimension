import argparse, json, csv
from pathlib import Path
import os, sqlite3, hashlib, math
NAMES=['Darkness','Warmth','Groove','Aggression','Emotion','Vocal Presence','Energy','Tension','Release','Roller Index','Recovery Potential','Transition Compatibility']
# Proposed prototype targets; not trained or validated.
STAGES={'Gathering':[5,7,5,2,6,4,3,3,4,4,8,6],'Confidence':[4,7,8,4,5,5,6,5,5,7,6,8],'Peak Hype':[5,4,8,8,7,6,10,8,9,6,2,6],'Chaos':[8,3,6,10,4,3,9,10,7,5,2,4],'Locked In':[6,5,10,5,4,2,7,5,4,10,5,9],'Sketch Hours':[10,3,8,5,3,1,5,6,3,9,5,7],'Rebirth':[3,9,6,3,10,6,6,5,9,4,8,6],'Sunrise':[2,8,4,1,9,5,2,2,8,3,10,5]}
COLORS=dict(zip(STAGES,['#963bce','#278de0','#ec287b','#ef5631','#24ac77','#229b9d','#e89035','#d6b52a']))
MIN_DURATION = 90.0
CACHE_NAMESPACE = 'three-window-44100-v2-tempo-v3:'  # Existing librosa feature schema; bump when extraction changes.

def clip(x):
 return round(float(min(10, max(0, x))),2) if math.isfinite(x) else None

def camelot_code(pitch_class, mode):
 numbers = {
  'major': [8,3,10,5,12,7,2,9,4,11,6,1],
  'minor': [5,12,7,2,9,4,11,6,1,8,3,10],
 }
 return f'{numbers[mode][pitch_class]}{"B" if mode == "major" else "A"}'

def duration_seconds(path):
 from mutagen import File
 metadata = File(path)
 if metadata is None or not hasattr(metadata.info, 'length'):
  raise ValueError('Unknown duration: unsupported or unreadable metadata')
 duration = float(metadata.info.length)
 if not math.isfinite(duration) or duration < 0:
  raise ValueError('Unknown duration')
 return duration

def file_digest(path):
 digest = hashlib.sha256()
 with path.open('rb') as audio_file:
  for block in iter(lambda: audio_file.read(1048576), b''):
   digest.update(block)
 return digest.hexdigest()

def analyze(path):
 from audio_v2 import analyze as analyze_v2
 return analyze_v2(path)
def main():
 p=argparse.ArgumentParser(); p.add_argument('folders',nargs='*'); p.add_argument('--output',default='dpm_results.json'); p.add_argument('--min-duration',type=float,default=MIN_DURATION); p.add_argument('--max-duration',type=float,default=900); p.add_argument('--db',default='dpm_cache.sqlite3'); p.add_argument('--merge',action='store_true'); a=p.parse_args()
 if not a.folders: p.error('Choose at least one explicit scan folder.')
 if not math.isfinite(a.min_duration) or a.min_duration < MIN_DURATION: p.error('Minimum duration must be at least 90 seconds.')
 if not math.isfinite(a.max_duration) or a.max_duration < a.min_duration: p.error('Maximum duration must be at least the minimum duration.')
 roots=[Path(x).expanduser().resolve() for x in a.folders]
 if Path('/') in roots: p.error('Choose a music folder instead of the system root.')
 if not any(root.is_dir() for root in roots): p.error('Missing or inaccessible scan roots: ' + ', '.join(map(str, roots)))
 excluded={'Library','Applications','System','node_modules','Caches','Trash','__pycache__','Backups.backupdb'}
 extensions={'.mp3','.wav','.flac','.aiff','.aif','.m4a','.aac','.ogg','.opus','.caf'}
 db=sqlite3.connect(a.db); db.execute('CREATE TABLE IF NOT EXISTS cache (digest TEXT PRIMARY KEY, payload TEXT NOT NULL)'); results=[]; seen=set(); hashes={}; short=0; long=0; errors=[]
 def walk_error(exc): errors.append(str(exc))
 from inventory import connect, scan
 inventory=connect(Path(a.db).with_name('inventory.sqlite3'))
 def read_duration(path):
  try: return duration_seconds(path),'mutagen'
  except Exception: return None,None
 scan(inventory, roots, a.min_duration, a.max_duration, duration_reader=read_duration)
 inventory.execute('CREATE TABLE IF NOT EXISTS digest_cache(path TEXT PRIMARY KEY,size INTEGER,mtime_ns INTEGER,ctime_ns INTEGER,digest TEXT)')
 out=Path(a.output)
 previous=json.loads(out.read_text()) if a.merge and out.exists() else []
 for root in roots:
  if not root.is_dir(): walk_error(f'Missing or inaccessible root: {root}'); continue
  for directory, folders, files in os.walk(root,followlinks=False,onerror=walk_error):
   folders[:]=[x for x in folders if not x.startswith('.') and x not in excluded and not x.endswith(('.app','.photoslibrary','.logicx','.band'))]
   for name in files:
    path=Path(directory)/name
    if name.startswith('.') or path.suffix.lower() not in extensions or path.is_symlink(): continue
    try:
     if not path.is_file(): continue
     identity=path.resolve()
     if identity in seen: continue
     seen.add(identity)
     metadata=inventory.execute('SELECT duration FROM tracks WHERE path=?',(str(path),)).fetchone()
     if metadata is None or metadata[0] is None: raise ValueError('Unknown duration; retained in inventory for review')
     duration=metadata[0]
     if duration<a.min_duration: short+=1; continue
     if duration>a.max_duration: long+=1; continue
     stat=path.stat()
     cached_digest=inventory.execute('SELECT digest FROM digest_cache WHERE path=? AND size=? AND mtime_ns=? AND ctime_ns=?',(str(path),stat.st_size,stat.st_mtime_ns,stat.st_ctime_ns)).fetchone()
     digest=cached_digest[0] if cached_digest else file_digest(path)
     after=path.stat()
     if (stat.st_size,stat.st_mtime_ns,stat.st_ctime_ns)!=(after.st_size,after.st_mtime_ns,after.st_ctime_ns): raise ValueError('File changed during hashing; retry scan')
     inventory.execute('INSERT OR REPLACE INTO digest_cache VALUES(?,?,?,?,?)',(str(path),stat.st_size,stat.st_mtime_ns,stat.st_ctime_ns,digest)); inventory.commit()
     cachekey=CACHE_NAMESPACE+digest
     if digest in hashes:
      hashes[digest]['duplicate_paths'].append(str(path)); continue
     cached=db.execute('SELECT payload FROM cache WHERE digest=?',(cachekey,)).fetchone()
     r=json.loads(cached[0]) if cached else analyze(path)
     if not cached:
      db.execute('INSERT OR REPLACE INTO cache VALUES (?,?)',(cachekey,json.dumps(r,allow_nan=False))); db.commit()
     r.update(digest=digest,path=str(path),duration_seconds=round(duration,2),duplicate_paths=[]); hashes[digest]=r; results.append(r); print(('Cached: ' if cached else 'Analyzed: ')+name,flush=True)
    except Exception as e: errors.append(f'{path}: {e}'); print(errors[-1],flush=True)
 scan_duplicates=sum(len(r['duplicate_paths']) for r in results)
 if previous:
  refreshed={Path(path) for r in results for path in [r['path'], *r['duplicate_paths']]}
  for old in previous:
   old_duration=old.get('duration_seconds')
   if old_duration is not None and not a.min_duration <= old_duration <= a.max_duration: continue
   paths=[path for path in [old['path'], *old.get('duplicate_paths', [])]
          if Path(path).resolve() not in refreshed]
   if not paths: continue
   match=hashes.get(old.get('digest'))
   if match is None:
    old.update(path=paths[0], duplicate_paths=paths[1:])
    results.append(old)
    if old.get('digest'): hashes[old['digest']]=old
   else:
    match['duplicate_paths'].extend(paths)
 # Mirror inventory status without deleting old analysis or disconnected paths.
 for item in results:
  states=[inventory.execute('SELECT missing FROM tracks WHERE path=?',(str(Path(path).resolve()),)).fetchone()
          for path in [item['path'],*item.get('duplicate_paths',[])]]
  known=[state[0] for state in states if state is not None]
  item['missing']=bool(known) and len(known)==len(states) and all(known)
 from audio_v2 import apply_library_scores,FEATURE_VERSION
 scoring=apply_library_scores(results,min_duration=a.min_duration,max_duration=a.max_duration)
 import time
 for item in results:
  if item.get('feature_version')!=FEATURE_VERSION:continue
  for path in [item['path'],*item.get('duplicate_paths',[])]:
   row=inventory.execute('SELECT id FROM tracks WHERE path=?',(str(Path(path).resolve()),)).fetchone()
   if row is None:continue
   inventory.executemany('INSERT OR REPLACE INTO features VALUES(?,?,?,?,?,?)',
    [(row[0],name,value,'proxy' if name=='harmonic_voice_band_proxy' else 'measured',FEATURE_VERSION,2)
      for name,value in item['raw_features'].items()])
   inventory.execute('INSERT OR REPLACE INTO predictions VALUES(?,?,?,?,?)',(row[0],item.get('score_version','fallback'),item.get('reference_id','none'),
    json.dumps({key:item.get(key) for key in ('scores','score_kinds','suggested_stage','alternate_stage','secondary_eligible','stage_distances','reference_size')},allow_nan=False),time.time()))
 inventory.commit()
 print(f"Library-relative scoring: {scoring['scored']} tracks; {scoring['reference_tracks']} eligible measurements",flush=True)
 fields=['path','duration_seconds','bpm','camelot','suggested_stage','alternate_stage','color','review_required','duplicate_paths',*NAMES]
 with out.with_suffix('.csv').open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore'); w.writeheader(); w.writerows({**r,**r.get('scores',{})} for r in results)
 atomic_json(out, results); out.with_suffix('.scan.log').write_text(f'Unique tracks: {len(results)}\nShort files skipped: {short}\nLong files skipped: {long}\nDuplicates: {scan_duplicates}\n'+ '\n'.join(errors)); db.close(); inventory.close(); print(f'Finished: {len(results)} unique tracks; {short} short files skipped; {len(errors)} warnings/errors.')
def atomic_json(path, payload):
 from tempfile import NamedTemporaryFile
 with NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent, delete=False) as handle:
  temporary = Path(handle.name)
  try:
   json.dump(payload, handle, indent=2, allow_nan=False)
   handle.flush()
   os.fsync(handle.fileno())
   temporary.replace(path)
  finally:
   temporary.unlink(missing_ok=True)

if __name__=='__main__': main()
