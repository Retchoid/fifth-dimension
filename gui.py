import json, sys, subprocess
from pathlib import Path
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from dpm import atomic_json
from learning import identity, features, recommend, batch, profile, current_stage, rebind_labels
from dpm import COLORS
BASE=Path(__file__).resolve().parent
DATA=Path.home()/'.5d_dpm'
RESULT=DATA/'dpm_results.json'; LABEL=DATA/'labels.json'; LOG=DATA/'scan_progress.log'
class App:
 def __init__(self,root):
  DATA.mkdir(exist_ok=True)
  self.root=root; root.title('5D DPM v0.8.1 — Selectah Intelligence'); root.geometry('1150x780'); root.configure(bg='#101015')
  self.labels=json.loads(LABEL.read_text()) if LABEL.exists() else {}; self.tracks=[]; self.queue=[]; self.proc=None; self.audio=None; self.drag=None
  bar=tk.Frame(root,bg='#101015'); bar.pack(fill='x',padx=15,pady=10)
  actions=[('Scan folder…',self.scan),('Scan drive 23',self.scan_drive),('Import Serato crates',self.crates),('Refresh recommendations',self.load),('20-track training',self.training),('Library',self.library),('DJ profile',self.style),('Play selected',self.play),('Stop audio',self.stop),('Field manual',self.manual),('Export crate preview',self.export_preview),('Track details',self.track_details),('Plan next track',self.transition_planner)]
  for index,(title,fn) in enumerate(actions):
   tk.Button(bar,text=title,command=fn,bg='#20202b',fg='#00e8ee',highlightbackground='#20202b').grid(row=index//7,column=index%7,padx=3,pady=3,sticky='ew')
  self.minimum=tk.StringVar(value='90'); self.maximum=tk.StringVar(value='900')
  limits=tk.Frame(root,bg='#101015'); limits.pack(fill='x',padx=15)
  tk.Label(limits,text='Track duration (seconds):',bg='#101015',fg='white').pack(side='left')
  for value in (self.minimum,self.maximum): ttk.Entry(limits,textvariable=value,width=7).pack(side='left',padx=5)
  tk.Button(limits,text='Apply duration filter',command=self.library).pack(side='left')
  self.status=tk.StringVar(); tk.Label(root,textvariable=self.status,bg='#101015',fg='#d9b5ff').pack(fill='x')
  self.body=tk.Frame(root,bg='#101015'); self.body.pack(fill='both',expand=True,padx=15,pady=10)
  self.load(); root.protocol('WM_DELETE_WINDOW',self.close)
  root.after(200,lambda:(root.deiconify(),root.lift(),root.focus_force()))
 def clear(self):
  for w in self.body.winfo_children(): w.destroy()
 def load(self):
  if RESULT.exists(): self.tracks=json.loads(RESULT.read_text())
  if LABEL.exists(): self.labels=json.loads(LABEL.read_text())
  self.labels=rebind_labels(self.tracks,self.labels)
  self.library()
 def transition_planner(self):
  from transitions import transition_details
  source=self.selected()
  if source is None:
   messagebox.showinfo('Plan next track','Select the current track in the library first.');return
  eligible=self.eligible()
  if eligible is None:return
  candidates=[t for t in eligible if identity(t)!=identity(source) and not t.get('missing')]
  window=tk.Toplevel(self.root);window.title('5D — Plan next track');window.geometry('1100x680');window.configure(bg='#101015')
  tk.Label(window,text='FROM: '+Path(source['path']).name,bg='#101015',fg='#00e8ee',font=('Arial',15,'bold')).pack(anchor='w',padx=12,pady=10)
  controls=tk.Frame(window,bg='#101015');controls.pack(fill='x',padx=12)
  delta=tk.StringVar(value='0');half=tk.BooleanVar(value=False)
  tk.Label(controls,text='Target energy change (0–10 scale):',bg='#101015',fg='white').pack(side='left')
  ttk.Spinbox(controls,from_=-10,to=10,increment=.5,textvariable=delta,width=5).pack(side='left',padx=5)
  tk.Checkbutton(controls,text='Allow half/double tempo interpretation',variable=half,bg='#101015',fg='white',selectcolor='#20202b').pack(side='left',padx=8)
  weight_bar=tk.Frame(window,bg='#101015');weight_bar.pack(fill='x',padx=12,pady=8)
  weights={name:tk.StringVar(value=str(value)) for name,value in [('harmonic',.4),('energy',.35),('bpm',.25)]}
  for name,value in weights.items():
   tk.Label(weight_bar,text=name.title()+' weight:',bg='#101015',fg='white').pack(side='left')
   ttk.Entry(weight_bar,textvariable=value,width=6).pack(side='left',padx=5)
  table=ttk.Treeview(window,columns=('track','category','key','bpm','energy','rank','coverage'),show='headings');table.pack(fill='both',expand=True,padx=12,pady=8)
  for column,width in [('track',300),('category',140),('key',60),('bpm',70),('energy',70),('rank',110),('coverage',110)]:
   table.heading(column,text={'rank':'Heuristic /100','coverage':'Input coverage'}.get(column,column.title()));table.column(column,width=width)
  detail=tk.StringVar(value='Scores are provisional rankings, not compatibility probabilities. Half/double interpretation does not change playback speed.')
  tk.Label(window,textvariable=detail,wraplength=1060,justify='left',bg='#101015',fg='#ffaf55').pack(fill='x',padx=12,pady=8)
  ranked=[]
  def refresh():
   try:
    target=float(delta.get());custom={name:float(value.get()) for name,value in weights.items()}
    computed=[(t,transition_details(source,t,target,custom,half.get())) for t in candidates]
    computed.sort(key=lambda row:(100-(row[1]['score'] or 0)+30*(1-row[1]['coverage']),row[0]['path']))
   except ValueError as exc:messagebox.showerror('Transition options',str(exc),parent=window);return
   ranked[:]=computed;table.delete(*table.get_children())
   for i,(t,result) in enumerate(ranked):table.insert('','end',iid=str(i),values=(Path(t['path']).name,current_stage(t,self.labels),t.get('camelot','—'),t.get('bpm','—'),t.get('scores',{}).get('Energy','—'),result['score'] if result['score'] is not None else 'unavailable',f"{result['coverage']*100:.0f}%"))
  def show(event=None):
   selection=table.selection()
   if not selection:return
   t,result=ranked[int(selection[0])];parts=result['components']
   detail.set(' • '.join(f"{name}: {value:.1f}" if value is not None else name+': unavailable' for name,value in parts.items())+f" • Interpreted next tempo: {result['interpreted_to_bpm']} • Half/double used: {result['half_double_used']}\nHeuristic ranking only; actual phrasing, vocals and crowd context still need listening.")
  def play_candidate():
   selection=table.selection()
   if selection:self.play_track(ranked[int(selection[0])][0])
  table.bind('<<TreeviewSelect>>',show)
  actions=tk.Frame(window,bg='#101015');actions.pack(fill='x',padx=12,pady=8)
  tk.Button(actions,text='Update ranking',command=refresh).pack(side='left')
  tk.Button(actions,text='Play candidate',command=play_candidate).pack(side='left',padx=8)
  tk.Button(actions,text='Stop audio',command=self.stop).pack(side='left')
  refresh()
 def track_details(self):
  item=self.selected()
  if item is None:return
  window=tk.Toplevel(self.root);window.title(Path(item['path']).name);window.geometry('720x700')
  text=tk.Text(window,wrap='word',bg='#101015',fg='white',padx=15,pady=15);text.pack(fill='both',expand=True)
  text.insert('end',f"Current category: {current_stage(item,self.labels)}\nOriginal prediction: {item['suggested_stage']}\nScore method: {item.get('score_version','legacy')}\nReference library: {item.get('reference_size','—')} tracks\n\n")
  for name,value in item.get('scores',{}).items():text.insert('end',f"{name}: {value if value is not None else 'unavailable'}\n")
  text.insert('end','\nAll non-null DPM values are experimental musical proxies, not calibrated measurements of emotion, vocals or crowd response. Mixable Ends describes the sampled intro/outro; pairwise Transition Compatibility remains unavailable.\n\n')
  for note in item.get('analysis_notes',[]):text.insert('end',note+'\n')
  text.insert('end','\nMeasured features:\n'+json.dumps(item.get('raw_features',{}),indent=2));text.config(state='disabled')
 def manual(self):
  from field_manual import open_manual
  open_manual(self.root,DATA)
 def export_preview(self):
  from crate_export import preview, install_preview
  from datetime import datetime
  eligible=self.eligible()
  if eligible is None:return
  parent=filedialog.askdirectory(title='Choose where to save the crate preview')
  if not parent:return
  destination=Path(parent)/('5D-DPM-crates-'+datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
  try:
   manifest=preview(eligible,self.labels,destination,duration_range=self.duration_limits())
   messagebox.showinfo('Crate preview exported',f"Saved {len(manifest['crates'])} volume-specific crate files plus M3U8 playlists and CRATE_INDEX.txt.\n{destination}\nUnavailable tracks skipped: {len(manifest['skipped_unavailable'])}\nSerato has not been changed.")
   if manifest['crates'] and messagebox.askyesno('Install preview into Serato?', 'Install these DPM-5D crates into existing Serato folders now? Close Serato first. Existing crates with those exact names will be backed up; other crates and music files are preserved. This format is experimental—keep the preview for review.'):
    result=install_preview(destination)
    messagebox.showinfo('Crates installed',f"Installed {result['installed']} crates. Backup: {result['backup']}")
  except Exception as exc:messagebox.showerror('Crate export',str(exc))
 def crates(self):
  from inventory import connect, import_crates
  conn=connect(DATA/'inventory.sqlite3')
  try:
   import_crates(conn)
   count=conn.execute('SELECT COUNT(*) FROM crate_tracks').fetchone()[0]
   messagebox.showinfo('Read-only Serato import',f'{count} crate memberships indexed. Serato files were not changed.')
  except Exception as exc: messagebox.showerror('Serato import',str(exc))
  finally: conn.close()
 def scan(self):
  folder=filedialog.askdirectory(title='Choose a music folder')
  if folder: self.start_scan(Path(folder))
 def scan_drive(self):
  self.start_scan(Path('/Volumes/23'))
 def start_scan(self,folder):
  if self.proc and self.proc.poll() is None: return
  if not folder.is_dir():
   messagebox.showwarning('Folder unavailable',f'Cannot access {folder}.')
   return
  limits=self.duration_limits()
  if limits is None: return
  import os
  scan_env=dict(os.environ,OMP_NUM_THREADS='1',OPENBLAS_NUM_THREADS='1',MKL_NUM_THREADS='1',NUMBA_NUM_THREADS='1')
  self.log=LOG.open('w'); self.proc=subprocess.Popen([sys.executable,'-u',str(BASE/'dpm.py'),'--min-duration',str(limits[0]),'--max-duration',str(limits[1]),'--merge','--output',str(RESULT),'--db',str(DATA/'cache.sqlite3'),str(folder)],stdout=self.log,stderr=subprocess.STDOUT,env=scan_env); self.poll()
 def poll(self):
  if self.proc.poll() is None:
   with LOG.open('rb') as f:
    f.seek(max(0,LOG.stat().st_size-2048)); tail=f.read().decode(errors='replace').splitlines()
   self.status.set(tail[-1][:160] if tail else 'Starting scan…'); self.root.after(1000,self.poll)
  else:
   self.log.close(); code=self.proc.returncode; self.proc=None; self.load(); self.status.set(f'Scan finished (exit {code}). Log: {LOG}')
 def duration_limits(self):
  import math
  try:
   low,high=float(self.minimum.get()),float(self.maximum.get())
   if not (math.isfinite(low) and math.isfinite(high) and 90 <= low <= high): raise ValueError()
   return low,high
  except ValueError:
   messagebox.showerror('Duration range','Enter a minimum of at least 90 seconds and a maximum at least as large.'); return None
 def eligible(self):
  limits=self.duration_limits()
  if limits is None: return None
  return [t for t in self.tracks if isinstance(t.get('duration_seconds'),(int,float)) and limits[0] <= t['duration_seconds'] <= limits[1]]
 def library(self):
  eligible=self.eligible()
  if eligible is None: return
  self.clear(); self.visible=eligible; self.status.set(f'{len(self.tracks)} analyzed tracks • {len(self.labels)} reviewed')
  controls=tk.Frame(self.body,bg='#101015'); controls.pack(fill='x',pady=6)
  tk.Label(controls,text='Manual category:',bg='#101015',fg='white').pack(side='left')
  self.category=ttk.Combobox(controls,values=list(COLORS),state='readonly',width=20); self.category.pack(side='left',padx=6); self.category.current(0)
  tk.Button(controls,text='Apply to selected',command=self.assign_library).pack(side='left')
  tk.Button(controls,text='Undo correction',command=self.undo_library).pack(side='left',padx=6)
  tk.Label(controls,text='Shift / Command-click to select multiple tracks',bg='#101015',fg='white').pack(side='left')
  counts={stage:0 for stage in COLORS}
  for item in self.visible:
   stage=current_stage(item,self.labels)
   if stage in counts: counts[stage]+=1
  tk.Label(self.body,text=' • '.join(f'{stage}: {count}' for stage,count in counts.items()),bg='#101015',fg='#d9b5ff',wraplength=1080).pack(fill='x')
  changed=sum(current_stage(t,self.labels)!=t['suggested_stage'] for t in self.visible)
  self.status.set(f'{changed} categories changed from original • {len(self.visible)} eligible tracks / {len(self.tracks)} stored • {len(self.labels)} reviewed • duration {self.minimum.get()}–{self.maximum.get()} seconds')
  table=tk.Frame(self.body,bg='#101015');table.pack(fill='both',expand=True)
  self.tree=ttk.Treeview(table,columns=('track','bpm','key','current','core','personal','manual'),show='headings'); self.tree.pack(side='left',fill='both',expand=True)
  self.tree.bind('<Double-1>',lambda event:self.track_details())
  scroll=ttk.Scrollbar(table,orient='vertical',command=self.tree.yview);scroll.pack(side='right',fill='y');self.tree.configure(yscrollcommand=scroll.set)
  for stage,color in COLORS.items():self.tree.tag_configure(stage,foreground=color)
  for k,w in [('track',280),('bpm',60),('key',55),('current',140),('core',125),('personal',125),('manual',125)]: self.tree.heading(k,text={'current':'Current category','core':'Original prediction','personal':'Learned suggestion','manual':'Your label'}.get(k,k.title())); self.tree.column(k,width=w)
  for i,t in enumerate(self.visible):
   label=self.labels.get(identity(t),{}).get('stage',''); rank=recommend(t,self.labels)[0]; self.tree.insert('', 'end',iid=str(i),tags=(current_stage(t,self.labels),),values=(Path(t['path']).name,t['bpm'],t['camelot'],current_stage(t,self.labels),t['suggested_stage'],rank,label))
 def assign_library(self):
  selected=[self.visible[int(i)] for i in self.tree.selection()]
  if not selected: return
  stage=self.category.get()
  if stage not in COLORS: return
  previous=dict(self.labels)
  self.library_undo={identity(t):self.labels.get(identity(t)) for t in selected}
  for t in selected:
   self.labels[identity(t)]={'stage':stage,'features':features(t),'path':t['path'],'core':t['suggested_stage'],'score_version':t.get('score_version','legacy'),'reference_id':t.get('reference_id')}
  try: self.save()
  except OSError as exc:
   self.labels=previous
   messagebox.showerror('Save correction',str(exc)); return
  self.library()
 def undo_library(self):
  if not getattr(self,'library_undo',None): return
  previous=dict(self.labels)
  for key,old in self.library_undo.items():
   if old is None: self.labels.pop(key,None)
   else: self.labels[key]=old
  try: self.save()
  except OSError as exc:
   self.labels=previous
   messagebox.showerror('Undo correction',str(exc)); return
  self.library_undo=None; self.library()
 def training(self):
  eligible=self.eligible()
  if eligible is None: return
  self.queue=batch(eligible,self.labels); self.board()
 def board(self):
  self.clear(); self.status.set(f'Training: {len(self.queue)} remaining • {len(self.labels)} total reviewed. Drag a track onto a category or select and click a category.')
  self.visible=self.queue; self.tree=tk.Listbox(self.body,bg='#20202b',fg='white',selectbackground='#7135a0',font=('Arial',13),width=55); self.tree.pack(side='left',fill='both',expand=True,padx=(0,12))
  for t in self.queue: self.tree.insert('end',f'{Path(t["path"]).name} | {t["bpm"]} BPM | {t["camelot"]}')
  self.tree.bind('<ButtonPress-1>',self.start_drag); self.tree.bind('<ButtonRelease-1>',self.drop); self.tree.bind('<<ListboxSelect>>',self.detail)
  right=tk.Frame(self.body,bg='#101015'); right.pack(side='right',fill='both',expand=True); self.targets={}
  for s,c in COLORS.items():
   b=tk.Button(right,text=s,bg=c,fg='#111111',font=('Arial',15,'bold'),height=2,command=lambda s=s:self.assign_selected(s),highlightbackground=c); b.pack(fill='x',pady=3); self.targets[b]=s
  self.info=tk.Label(right,text='Select a track to see its DPM scores',wraplength=400,justify='left',bg='#101015',fg='white'); self.info.pack(fill='x',pady=8)
  tk.Button(right,text='Undo last review',command=self.undo).pack()
 def selected(self):
  try:
   sel=self.tree.curselection() if isinstance(self.tree,tk.Listbox) else self.tree.selection(); return self.visible[int(sel[0])] if sel else None
  except (AttributeError,IndexError): return None
 def detail(self,event=None):
  t=self.selected()
  if t: self.info.configure(text=f'Core: {t["suggested_stage"]} | Personalized: {recommend(t,self.labels)[0]}\n'+ '  '.join(f'{k}: {v if v is not None else "—"}' for k,v in t['scores'].items()))
 def start_drag(self,e): self.drag=self.tree.nearest(e.y) if self.queue else None
 def drop(self,e):
  w=self.root.winfo_containing(e.x_root,e.y_root)
  if self.drag is not None and w in self.targets and self.drag<len(self.queue): self.assign(self.queue[self.drag],self.targets[w])
  self.drag=None
 def assign_selected(self,s):
  t=self.selected()
  if t: self.assign(t,s)
 def save(self):
  atomic_json(LABEL, self.labels)
 def assign(self,t,s):
  self.last=(t,self.labels.get(identity(t))); self.labels[identity(t)]={'stage':s,'features':features(t),'path':t['path'],'core':t['suggested_stage'],'score_version':t.get('score_version','legacy'),'reference_id':t.get('reference_id')}; self.save(); self.queue.remove(t)
  if self.queue or not hasattr(self,'root'): self.board()
  else:
   self.library()
   messagebox.showinfo('Training saved','Recommendations and category totals have been refreshed using your saved labels.')
 def undo(self):
  if not hasattr(self,'last'): return
  t,old=self.last
  if old is None: self.labels.pop(identity(t),None)
  else: self.labels[identity(t)]=old
  self.queue.insert(0,t); self.save(); del self.last; self.board()
 def play(self):
  t=self.selected()
  if t:self.play_track(t)
 def play_track(self,t):
  self.stop()
  copies=[t['path'],*t.get('duplicate_paths',[])]
  path=next((path for path in copies if Path(path).is_file()),None)
  if path is None:
   messagebox.showwarning('Playback','The track is unavailable. Reconnect its drive or scan its new folder.')
   return
  try:
   self.audio_error=DATA/'playback_error.log'
   with self.audio_error.open('w') as error:
    self.audio=subprocess.Popen(['/usr/bin/afplay',path],stderr=error)
   self.status.set('Playing: '+Path(path).name)
   self.root.after(300,lambda process=self.audio:self.check_playback(process))
  except OSError as e: messagebox.showerror('Playback',str(e))
 def check_playback(self,process):
  if self.audio is not process: return
  code=process.poll()
  if code is None:
   self.root.after(300,lambda:self.check_playback(process)); return
  self.audio=None
  if code:
   detail=self.audio_error.read_text(errors='replace').strip()
   messagebox.showerror('Playback failed',detail or f'Audio player exited with code {code}.')
  else: self.status.set('Playback finished')
 def stop(self):
  if self.audio and self.audio.poll() is None: self.audio.terminate()
  self.audio=None
 def style(self):
  self.clear(); self.tree=None; counts=profile(self.labels); total=sum(counts.values()); tk.Label(self.body,text=f'DJ STYLE • {total} reviewed tracks',font=('Arial',24),bg='#101015',fg='#d9b5ff').pack(pady=12)
  for s,c in COLORS.items():
   row=tk.Frame(self.body,bg='#101015'); row.pack(fill='x',pady=5); tk.Label(row,text=f'{s}: {counts[s]}',width=20,anchor='w',bg='#101015',fg=c).pack(side='left'); canvas=tk.Canvas(row,height=18,width=500,bg='#252531',highlightthickness=0); canvas.pack(side='left'); canvas.create_rectangle(0,0,500*counts[s]/max(1,total),18,fill=c,outline='')
  tk.Label(self.body,text='These are reviewed-track placements, not a measure of your actual set habits. Training batches are category-balanced.\nA reliable style profile requires representative selections or actual set history.',bg='#101015',fg='white',wraplength=850).pack(pady=20)
 def close(self):
  if self.proc and self.proc.poll() is None:
   if not messagebox.askyesno('Scan running','Stop scan and exit? Cached completed analyses will remain.'):return
   self.proc.terminate()
  self.stop(); self.root.destroy()
if __name__=='__main__':
 try:
  from desktop import main
  main()
 except Exception as exc:
  import traceback
  traceback.print_exc()
  if sys.platform=='darwin':
   text='DPM could not start: '+str(exc)+'\nSee ~/Library/Logs/5D DPM/launch.log for details.'
   subprocess.run(['/usr/bin/osascript','-e','display alert "5D DPM could not open" message '+json.dumps(text)])
  sys.exit(1)
