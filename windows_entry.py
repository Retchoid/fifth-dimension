"""Frozen Windows entry point, including scan subprocess and build smoke check."""
import os,sys,traceback
from pathlib import Path

def main():
 if '--scan-worker' in sys.argv:
  sys.argv.remove('--scan-worker')
  # Windowed PyInstaller executables have no stdout. Scan progress goes to disk.
  output=sys.argv[sys.argv.index('--output')+1] if '--output' in sys.argv else 'dpm_results.json'
  log=(Path(output).parent/'scan_progress.log').open('a',encoding='utf-8',buffering=1)
  sys.stdout=sys.stderr=log
  try:
   import dpm
   dpm.main()
  finally:log.close()
  return
 if '--bundle-check' in sys.argv:
  import tempfile
  os.environ.setdefault('NUMBA_CACHE_DIR',str(Path(tempfile.gettempdir())/'5D-DPM-build-cache'))
  import json,numpy,scipy,librosa,soundfile,sounddevice,webview,clr
  from webview.platforms import edgechromium
  from desktop import BASE,VERSION,State
  import tempfile
  with tempfile.TemporaryDirectory() as td:
   state=State(td);assert state.snapshot()['version']==VERSION
   from bpm_recheck import analyze_tempo
   sr=22050;y=numpy.zeros(sr*45,dtype=numpy.float32)
   for t in numpy.arange(0,45,60/174):
    i=int(t*sr);n=min(600,len(y)-i)
    y[i:i+n]+=numpy.sin(numpy.arange(n)*2*numpy.pi*130/sr)*numpy.exp(-numpy.arange(n)/100)
   audio=Path(td)/'174.wav';soundfile.write(audio,y,sr)
   measured=analyze_tempo(audio,174)['measured_bpm']
   assert abs(measured-174)<1,(measured,'Frozen tempo analysis failed')
  assert (BASE/'web/index.html').is_file();assert (BASE/'assets/AppIcon.ico').is_file()
  destination=Path(sys.argv[sys.argv.index('--bundle-check')+1]);destination.write_text(json.dumps({'version':VERSION,'bundle_imports':'passed','synthetic_bpm':measured}));return
 data=Path(os.environ.get('LOCALAPPDATA',str(Path.home()))) / '5D DPM'
 data.mkdir(parents=True,exist_ok=True)
 os.environ['NUMBA_CACHE_DIR']=str(data/'numba-cache')
 log=(data/'launch.log').open('a',encoding='utf-8',buffering=1);sys.stdout=sys.stderr=log
 try:
  import desktop
  if '--data' not in sys.argv:sys.argv+=['--data',str(data)]
  desktop.main()
 except Exception as exc:
  traceback.print_exc()
  import ctypes
  ctypes.windll.user32.MessageBoxW(None,f'{exc}\n\nDetails: {data / "launch.log"}\nIf WebView2 is missing, install Microsoft Edge WebView2 Runtime.','5D DPM could not open',0x10)
  raise SystemExit(1)
 finally:log.close()
if __name__=='__main__':main()
