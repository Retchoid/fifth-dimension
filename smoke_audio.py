import sys,tempfile,time,json,hashlib
from pathlib import Path
import numpy as np,soundfile as sf
from audio_v2 import analyze,REQUIRED,FEATURE_VERSION
with tempfile.TemporaryDirectory() as td:
 p=Path(td)/'synthetic.wav';sr=44100;duration=90
 time_axis=np.arange(sr*duration)/sr
 envelope=np.ones_like(time_axis)*.3;envelope[:sr*8]=np.linspace(.02,.3,sr*8);envelope[-sr*8:]=np.linspace(.3,.02,sr*8)
 pulse=np.exp(-((time_axis%.5)/.025))
 y=envelope*(.25*np.sin(2*np.pi*110*time_axis)+.2*pulse*np.sin(2*np.pi*70*time_axis)+.05*np.sin(2*np.pi*12000*time_axis))
 sf.write(p,y,sr)
 before=hashlib.sha256(p.read_bytes()).hexdigest();started=time.monotonic();result=analyze(p)
 assert REQUIRED<=result['raw_features'].keys()
 assert result['feature_version']==FEATURE_VERSION
 assert result['raw_features']['band_air']>0
 assert before==hashlib.sha256(p.read_bytes()).hexdigest()
 print(json.dumps({'seconds':round(time.monotonic()-started,2),'bpm':result['bpm'],'key':result['camelot'],'features':result['raw_features'],'integrity':'unchanged'},indent=2))
