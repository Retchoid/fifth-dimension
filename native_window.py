"""Native Mac app window. Deliberately never falls back to a browser tab."""
import sys

def run_native(server,url):
 if sys.platform not in {'darwin','win32'}:raise RuntimeError('This desktop build requires Windows or macOS')
 try:import webview
 except ImportError as exc:raise RuntimeError('Native window dependencies are missing. Install the packaged release for your operating system.') from exc
 webview.settings['OPEN_EXTERNAL_LINKS_IN_BROWSER']=False
 webview.settings['ALLOW_DOWNLOADS']=False
 webview.settings['ALLOW_FILE_URLS']=False
 window=webview.create_window('5D DPM — Selectah Intelligence',url,width=1320,height=900,
   min_size=(960,650),background_color='#09070F',confirm_close=False,text_select=True)
 server.native_window=window
 try:
  # Cocoa's application loop must own the main thread.
  if sys.platform=='win32':
   from pathlib import Path
   webview.start(gui='edgechromium',icon=str(Path(__file__).resolve().parent/'assets/AppIcon.ico'),debug=False,private_mode=True)
  else:webview.start(func=apply_icon,gui='cocoa',debug=False,private_mode=True)
 finally:server.native_window=None

def activate(server):
 window=getattr(server,'native_window',None)
 if window is None:raise ValueError('The native window is not ready')
 window.show();window.restore()


def apply_icon():
 """Set the live Python/Cocoa application's Dock icon as well as the bundle icon."""
 from pathlib import Path
 from AppKit import NSApplication,NSImage
 from PyObjCTools.AppHelper import callAfter
 # The installed release and downloaded source bundle use different resource roots.
 base=Path(__file__).resolve().parent
 candidates=[base/'launcher.app/Contents/Resources/AppIcon.png',base/'5D DPM.app/Contents/Resources/AppIcon.png',Path.home()/'Applications/5D DPM.app/Contents/Resources/AppIcon.png']
 path=next((p for p in candidates if p.is_file()),None)
 if path:
  def set_icon():
   icon=NSImage.alloc().initWithContentsOfFile_(str(path))
   if icon:NSApplication.sharedApplication().setApplicationIconImage_(icon)
  callAfter(set_icon)
