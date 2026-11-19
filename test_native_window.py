import sys,unittest
from types import SimpleNamespace
from unittest.mock import Mock,patch
import native_window

class NativeWindowTests(unittest.TestCase):
 def test_uses_cocoa_window_without_browser_fallback(self):
  window=Mock();webview=SimpleNamespace(settings={},create_window=Mock(return_value=window),start=Mock())
  server=SimpleNamespace(native_window=None)
  def running(**kwargs):self.assertIs(server.native_window,window)
  webview.start.side_effect=running
  with patch.object(native_window.sys,'platform','darwin'),patch.dict(sys.modules,{'webview':webview}):
   native_window.run_native(server,'http://127.0.0.1:1234/#session')
  self.assertEqual('cocoa',webview.start.call_args.kwargs['gui'])
  self.assertEqual((960,650),webview.create_window.call_args.kwargs['min_size'])
  self.assertFalse(webview.settings['OPEN_EXTERNAL_LINKS_IN_BROWSER'])
  self.assertIsNone(server.native_window)
 def test_native_failure_is_reported_not_opened_in_browser(self):
  webview=SimpleNamespace(settings={},create_window=Mock(return_value=Mock()),start=Mock(side_effect=RuntimeError('Cocoa startup failed')))
  server=SimpleNamespace(native_window=None)
  with patch.object(native_window.sys,'platform','darwin'),patch.dict(sys.modules,{'webview':webview}),self.assertRaisesRegex(RuntimeError,'Cocoa startup failed'):
   native_window.run_native(server,'http://127.0.0.1:1234/#session')
  self.assertIsNone(server.native_window)
 def test_reopen_activates_existing_app_window(self):
  window=Mock();native_window.activate(SimpleNamespace(native_window=window))
  window.show.assert_called_once();window.restore.assert_called_once()
  with self.assertRaises(ValueError):native_window.activate(SimpleNamespace(native_window=None))

if __name__=='__main__':unittest.main()

class NativeLifecycleTests(unittest.TestCase):
 def test_closing_native_loop_cleans_up_local_service_and_session(self):
  import tempfile,json,fcntl
  from pathlib import Path
  from urllib.request import Request,urlopen
  from urllib.parse import urlsplit
  import desktop
  with tempfile.TemporaryDirectory() as td:
   root=Path(td)
   def native_loop(server,url):
    token=urlsplit(url).fragment;base=url.split('/#')[0]
    with urlopen(Request(base+'/api/state',headers={'X-DPM-Token':token}),timeout=2) as response:
     self.assertEqual(desktop.VERSION,json.loads(response.read())['version'])
    self.assertEqual('native',json.loads((root/'web_session.json').read_text())['mode'])
   with patch('sys.argv',['desktop.py','--data',td]),patch('native_window.run_native',side_effect=native_loop):desktop.main()
   self.assertFalse((root/'web_session.json').exists())
   with (root/'gui.lock').open('a') as lock:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)

@unittest.skip('Mac bundle icon resources are excluded from the Windows build kit')
class IconTests(unittest.TestCase):
 def test_sets_live_application_icon_on_appkit_queue(self):
  image=Mock();app=Mock();nsimage=Mock();nsimage.alloc.return_value.initWithContentsOfFile_.return_value=image
  application=Mock();application.sharedApplication.return_value=app
  call_after=Mock(side_effect=lambda fn:fn())
  with patch.dict(sys.modules,{'AppKit':SimpleNamespace(NSApplication=application,NSImage=nsimage),'PyObjCTools.AppHelper':SimpleNamespace(callAfter=call_after)}):native_window.apply_icon()
  call_after.assert_called_once();app.setApplicationIconImage_.assert_called_once_with(image)
