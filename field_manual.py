"""Offline stage reference adapted from the supplied Grok field manual."""
import json
from pathlib import Path
import tkinter as tk
from tkinter import ttk,messagebox
from dpm import COLORS,atomic_json

BASE=Path(__file__).resolve().parent

def open_manual(parent,data_dir):
 data=json.loads((BASE/'field_manual.json').read_text())
 progress=Path(data_dir)/'manual_studied.json'
 try:studied=set(json.loads(progress.read_text())) if progress.exists() else set()
 except (ValueError,TypeError):studied=set()
 valid={s['id'] for s in data['stages']};studied.intersection_update(valid)
 window=tk.Toplevel(parent);window.title('5D DPM — Field manual');window.geometry('1080x760');window.configure(bg='#101015')
 notebook=ttk.Notebook(window);notebook.pack(fill='both',expand=True,padx=12,pady=12)
 stage_tab=tk.Frame(notebook,bg='#101015');wheel_tab=tk.Frame(notebook,bg='#101015')
 notebook.add(stage_tab,text='Eight stages');notebook.add(wheel_tab,text='Corrected Camelot wheel')
 top=tk.Frame(stage_tab,bg='#101015');top.pack(fill='x')
 tk.Label(top,text='FIELD MANUAL • creative programming guidance',bg='#101015',fg='#00e8ee',font=('Courier',17,'bold')).pack(anchor='w')
 tk.Label(top,text='Illustrative times and bar maps; adapt to the crowd. Reading this guide does not train the classifier.',bg='#101015',fg='white').pack(anchor='w',pady=6)
 lens=ttk.Combobox(top,state='readonly',values=['All dimensions']+[d['name'] for d in data['dimensions']],width=30);lens.current(0);lens.pack(anchor='w',pady=6)
 content=tk.Frame(stage_tab,bg='#101015');content.pack(fill='both',expand=True)
 rail=tk.Frame(content,bg='#101015');rail.pack(side='left',fill='y',padx=(0,12))
 right=tk.Frame(content,bg='#101015');right.pack(side='left',fill='both',expand=True)
 scroll=ttk.Scrollbar(right);scroll.pack(side='right',fill='y')
 text=tk.Text(right,bg='#171723',fg='#eeeeee',wrap='word',font=('Arial',12),padx=16,pady=14,yscrollcommand=scroll.set,relief='flat');text.pack(fill='both',expand=True);scroll.config(command=text.yview)
 text.tag_configure('title',foreground='#00e8ee',font=('Courier',23,'bold'));text.tag_configure('heading',foreground='#ffaf55',font=('Arial',13,'bold'))
 footer=tk.Frame(stage_tab,bg='#101015');footer.pack(fill='x',pady=8)
 selected=[0];buttons=[];progress_label=tk.Label(footer,bg='#101015',fg='#ffaf55');progress_label.pack(side='right')
 def draw(index):
  selected[0]=index;stage=data['stages'][index];text.config(state='normal');text.delete('1.0','end')
  text.insert('end',stage['name']+'\n','title');text.insert('end',stage['window']+'\n\n')
  for paragraph in stage['paragraphs']:text.insert('end',paragraph+'\n\n')
  for heading,body in [('The floor',stage['floor']+' '+stage['crowd']),('Frequency',stage['frequency']),
    ('Arrangement blueprint','\n'.join(row['label']+': '+row['detail']+' bars' for row in stage['arrangement'])),
    ('Play toward','\n'.join('• '+line for line in stage['play'])),('Leave in the crate','\n'.join('• '+line for line in stage['avoid'])),
    ('Dimensions','High: '+', '.join(stage['high'])+'\nLow: '+', '.join(stage['low'])),('Mix note',stage['mix'])]:
   text.insert('end',heading+'\n','heading');text.insert('end',body+'\n\n')
  text.insert('end','Dimension descriptions are musical intentions. Current automated values are experimental proxies; voice-band energy is not vocal detection. Emotion and recovery need listener/set context.\n')
  text.config(state='disabled');text.yview_moveto(0);update_rail()
 def update_rail(event=None):
  dimension=next((d for d in data['dimensions'] if d['name']==lens.get()),None)
  for i,(button,stage) in enumerate(zip(buttons,data['stages'])):
   active=dimension is None or stage['id'] in dimension['stages']
   button.config(text=('✓ ' if stage['id'] in studied else '')+stage['n']+'  '+stage['name'],fg=COLORS[stage['name']] if active else '#777780',relief='sunken' if i==selected[0] else 'raised')
  progress_label.config(text=f'{len(studied)}/8 studied')
 def toggle():
  stage=data['stages'][selected[0]]['id'];previous=set(studied)
  if stage in studied:studied.remove(stage)
  else:studied.add(stage)
  try:atomic_json(progress,sorted(studied))
  except OSError as exc:studied.clear();studied.update(previous);messagebox.showerror('Study progress',str(exc),parent=window)
  update_rail()
 for i,stage in enumerate(data['stages']):
  button=tk.Button(rail,bg='#20202b',fg=COLORS[stage['name']],width=23,anchor='w',font=('Courier',12,'bold'),pady=12,command=lambda i=i:draw(i));button.pack(fill='x',pady=3);buttons.append(button)
 tk.Button(footer,text='Toggle studied',command=toggle).pack(side='left')
 tk.Button(footer,text='Previous',command=lambda:draw((selected[0]-1)%8)).pack(side='left',padx=6)
 tk.Button(footer,text='Next stage',command=lambda:draw((selected[0]+1)%8)).pack(side='left')
 lens.bind('<<ComboboxSelected>>',update_rail)
 wheel=ttk.Treeview(wheel_tab,columns=('number','minor','major'),show='headings',height=12)
 for key,label in [('number','Number'),('minor','A — Minor'),('major','B — Major')]:wheel.heading(key,text=label)
 for row in data['wheel']:wheel.insert('','end',values=(row['n'],row['minor'],row['major']))
 wheel.pack(fill='x',padx=20,pady=20)
 tk.Label(wheel_tab,text='Same code; same number with the other letter; or adjacent numbers with the same letter.\nThese are harmonic starting points, not guarantees of a good blend or an energy rise.\nExample: 8A → 8B → 9B → 10B = A minor → C major → G major → D major.\nUse your ears, phrasing and tempo. The full 24-key mapping is shown above.',justify='left',bg='#101015',fg='white',font=('Arial',13)).pack(anchor='w',padx=20,pady=15)
 draw(0)
 return window
