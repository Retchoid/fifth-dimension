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
  import json,numpy,scipy,librosa,soundfile,sounddevice,webview,clr
  from webview.platforms import edgechromium
  from desktop import BASE,VERSION,State
  import tempfile
  with tempfile.TemporaryDirectory() as td:
   state=State(td);assert state.snapshot()['version']==VERSION
  assert (BASE/'web/index.html').is_file();assert (BASE/'assets/AppIcon.ico').is_file()
  destination=Path(sys.argv[sys.argv.index('--bundle-check')+1]);destination.write_text(json.dumps({'version':VERSION,'bundle_imports':'passed'}));return
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
