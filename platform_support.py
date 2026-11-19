"""Platform-specific locks, native file dialogs and frozen scan dispatch."""
import os,sys
from pathlib import Path

def acquire_lock(file):
 if sys.platform=='win32':
  import msvcrt
  file.seek(0)
  if not file.read(1):file.write('0');file.flush()
  file.seek(0)
  try:msvcrt.locking(file.fileno(),msvcrt.LK_NBLCK,1)
  except OSError as exc:raise BlockingIOError('DPM is already running') from exc
 else:
  import fcntl
  fcntl.flock(file,fcntl.LOCK_EX|fcntl.LOCK_NB)

def choose_path(prompt,folder=False):
 import tkinter as tk
 from tkinter import filedialog
 root=tk.Tk();root.withdraw();root.attributes('-topmost',True)
 try:
  value=filedialog.askdirectory(parent=root,title=prompt,mustexist=True) if folder else filedialog.askopenfilename(parent=root,title=prompt,filetypes=[('Ordered tracklists','*.m3u *.m3u8 *.csv'),('All files','*.*')])
  return Path(value) if value else None
 finally:root.destroy()

def scan_command(base,arguments):
 return [sys.executable,'--scan-worker',*arguments] if getattr(sys,'frozen',False) else [sys.executable,'-u',str(Path(base)/'dpm.py'),*arguments]
