"""Non-destructive, isolated DJ workspaces with optional analysis-only reuse."""
import json,re,uuid,shutil,sqlite3
from contextlib import closing
from pathlib import Path
from dpm import atomic_json

class ProfileStore:
 def __init__(self,root):
  self.root=Path(root);self.root.mkdir(parents=True,exist_ok=True);self.file=self.root/'profiles.json'
  if self.file.exists():self.data=json.loads(self.file.read_text(encoding='utf-8'))
  else:
   self.data={'version':1,'active':'default','profiles':[{'id':'default','name':'Original DJ'}]};self.save()
  if self.data.get('version')!=1 or not isinstance(self.data.get('profiles'),list):raise ValueError('Unsupported DJ profile catalog')
  for record in self.data['profiles']:
   if not re.fullmatch(r'default|[a-f0-9]{32}',record.get('id','')):raise ValueError('Invalid DJ profile identity')
  self.get(self.data['active'])
 def save(self):atomic_json(self.file,self.data)
 def get(self,key):
  item=next((p for p in self.data['profiles'] if p['id']==key),None)
  if item is None:raise ValueError('DJ profile not found')
  return item
 def path(self,key):
  self.get(key);return self.root if key=='default' else self.root/'profiles'/key
 def current(self):return dict(self.get(self.data['active']))
 def summary(self):return [dict(p,active=p['id']==self.data['active']) for p in self.data['profiles']]
 def activate(self,key):
  self.get(key);previous=self.data['active'];self.data['active']=key
  try:self.save()
  except Exception:self.data['active']=previous;raise
 def create(self,name,reuse_from=None):
  if not isinstance(name,str) or not name.strip():raise ValueError('Enter a name for the DJ profile')
  if len(self.data['profiles'])>=50:raise ValueError('Use at most 50 DJ profiles')
  key=uuid.uuid4().hex;directory=self.root/'profiles'/key;directory.mkdir(parents=True)
  try:
   if reuse_from is not None:
    source=self.path(reuse_from);records=source/'dpm_results.json'
    if records.exists():
     rows=json.loads(records.read_text(encoding='utf-8'))
     if not isinstance(rows,list):raise ValueError('Invalid analyzed library')
     clean=[{k:v for k,v in row.items() if k not in {'manual_stage','learned_stage','current_stage'}} for row in rows]
     atomic_json(directory/'dpm_results.json',clean)
    for name_db in ['cache.sqlite3','inventory.sqlite3']:
     path=source/name_db
     if path.is_file():
      with closing(sqlite3.connect(path.resolve().as_uri()+'?mode=ro',uri=True)) as src,closing(sqlite3.connect(directory/name_db)) as dst:src.backup(dst)
   record={'id':key,'name':name.strip()[:80]};self.data['profiles'].append(record)
   try:self.save()
   except Exception:self.data['profiles'].pop();raise
  except Exception:shutil.rmtree(directory);raise
  return record
