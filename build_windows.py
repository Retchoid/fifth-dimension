"""Run on Windows x64 with Python 3.11. Produces a portable onedir EXE bundle."""
import sys,subprocess,shutil,json,tempfile
from pathlib import Path

def main():
 if sys.platform!='win32':raise SystemExit('Build on Windows; PyInstaller does not cross-compile Windows executables.')
 if sys.version_info[:2]!=(3,11):raise SystemExit('Use Python 3.11 x64 for this build')
 import struct
 if struct.calcsize('P')!=8:raise SystemExit('Use 64-bit Python')
 root=Path(__file__).resolve().parent
 command=[sys.executable,'-m','PyInstaller','--noconfirm','--clean','--onedir','--windowed','--name','5D DPM',
  '--icon',str(root/'assets/AppIcon.ico'),'--add-data',f'{root / "web"};web','--add-data',f'{root / "assets"};assets',
  '--add-data',f'{root / "field_manual.json"};.', '--exclude-module','PyQt5','--exclude-module','PyQt6','--exclude-module','PySide2','--exclude-module','PySide6']
 for package in ['librosa','numba','llvmlite','scipy','sklearn','soundfile','sounddevice','webview','pythonnet','clr_loader']:
  command+=['--collect-all',package]
 for name in ['dpm','inventory','audio_v2','bpm_recheck','desktop','native_window','playback','windows_audio','platform_support','arc_presets','set_tools','set_export','learning','transitions','tempo','crate_export','field_manual','clr','_sounddevice_data','tkinter','tkinter.filedialog','webview.platforms.edgechromium']:
  command+=['--hidden-import',name]
 command+=[str(root/'windows_entry.py')]
 subprocess.run(command,cwd=root,check=True)
 exe=root/'dist/5D DPM/5D DPM.exe'
 with tempfile.TemporaryDirectory() as td:
  report=Path(td)/'bundle-check.json'
  subprocess.run([str(exe),'--bundle-check',str(report)],check=True,timeout=360)
  if json.loads(report.read_text()).get('bundle_imports')!='passed':raise RuntimeError('Frozen bundle import check failed')
 shutil.copy2(root/'TESTER-README.txt',exe.parent/'READ ME FIRST.txt')
 shutil.copy2(root/'requirements-windows.txt',exe.parent/'BUILD-DEPENDENCIES.txt')
 # Package installed dependency license metadata alongside the beta.
 import importlib.metadata as metadata
 licenses=exe.parent/'LICENSES';licenses.mkdir(exist_ok=True)
 for dist in metadata.distributions():
  if dist.metadata.get('Name') in {'pip','setuptools'}:continue
  for file in dist.files or []:
   if any(term in str(file).lower() for term in ('license','copying','notice')) and '.dist-info' in str(file):
    src=Path(dist.locate_file(file))
    if src.is_file():
     target=licenses/dist.metadata['Name']/Path(file).name;target.parent.mkdir(exist_ok=True);shutil.copy2(src,target)
 archive=shutil.make_archive(str(root/'5D-DPM-Windows-v0.13-beta'),'zip',root/'dist','5D DPM');print(archive)
if __name__=='__main__':main()
