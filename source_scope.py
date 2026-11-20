"""Set-specific source folders. No scanning or filesystem writes here."""
from pathlib import Path

def validate_sources(values):
 if values is None:return []
 if not isinstance(values,list) or len(values)>20:raise ValueError('Choose at most 20 source folders')
 result=[]
 for value in values:
  if not isinstance(value,str) or not value.strip() or '\0' in value:raise ValueError('Invalid source folder')
  path=Path(value).expanduser()
  if not path.is_absolute():raise ValueError('Source folders must be absolute paths')
  canonical=str(path.resolve())
  if canonical not in result:result.append(canonical)
 return result

def scope_rows(rows,folders):
 roots=[Path(p).resolve() for p in validate_sources(folders)]
 if not roots:return list(rows)
 result=[]
 for item in rows:
  for text in [item.get('path'),*item.get('duplicate_paths',[])]:
   if not text:continue
   try:
    path=Path(text).resolve()
    if any(path.is_relative_to(root) for root in roots) and path.is_file():
     result.append(dict(item,source_path=str(path),available=True,missing=False));break
   except OSError:continue
 return result
