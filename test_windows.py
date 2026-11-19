import unittest,io,sys,tempfile,json
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock,patch
import numpy as np
from windows_audio import StreamPlayer
import platform_support,native_window

class FakeFile:
 samplerate=100;channels=2
 def __init__(self,_):self.position=0;self.closed=False
 def __len__(self):return 1000
 def tell(self):return self.position
 def seek(self,n):self.position=n
 def read(self,frames,**kwargs):
  n=min(frames,1000-self.position);self.position+=n;return np.ones((n,2),dtype='float32')*.25
 def close(self):self.closed=True
class FakeStream:
 def __init__(self,**kwargs):self.active=False;self.callback=kwargs['callback'];self.closed=False
 def start(self):self.active=True
 def abort(self):self.active=False
 def close(self):self.closed=True

class WindowsTests(unittest.TestCase):
 def test_stream_reads_actual_seek_position_and_silences_pause_and_eof(self):
  p=StreamPlayer('fake',FakeFile,FakeStream);out=np.empty((100,2),dtype='float32');p.play();p._callback(out,100,None,None)
  self.assertEqual(1,p.currentTime());self.assertTrue((out==.25).all());p.pause();p._callback(out,100,None,None);self.assertFalse(out.any());self.assertEqual(1,p.currentTime())
  p.setCurrentTime_(9.5);p.play();p._callback(out,100,None,None);self.assertTrue((out[:50]==.25).all());self.assertFalse(out[50:].any());self.assertFalse(p.isPlaying());self.assertEqual(10,p.currentTime())
  p.setCurrentTime_(-3);self.assertEqual(0,p.currentTime());stream=p.stream;p.close();self.assertTrue(stream.closed);self.assertTrue(p.file.closed)
 def test_freeze_scan_dispatches_worker_instead_of_reopening_gui(self):
  with patch.object(sys,'frozen',True,create=True):self.assertEqual([sys.executable,'--scan-worker','C:/Music'],platform_support.scan_command('.', ['C:/Music']))
  with patch.object(sys,'frozen',False,create=True):self.assertEqual('dpm.py',Path(platform_support.scan_command('.',[])[2]).name)
 def test_windows_lock_is_one_byte_and_reports_busy(self):
  lock=Mock();lock.read.return_value='';msvcrt=SimpleNamespace(LK_NBLCK=2,locking=Mock())
  with patch.object(sys,'platform','win32'),patch.dict(sys.modules,{'msvcrt':msvcrt}):
   platform_support.acquire_lock(lock);msvcrt.locking.assert_called_once_with(lock.fileno(),2,1);lock.write.assert_called_once_with('0')
   msvcrt.locking.side_effect=OSError('busy')
   with self.assertRaises(BlockingIOError):platform_support.acquire_lock(lock)
 def test_windows_uses_native_edge_window_not_external_browser(self):
  window=Mock();webview=SimpleNamespace(settings={},create_window=Mock(return_value=window),start=Mock());server=SimpleNamespace(native_window=None)
  with patch.object(sys,'platform','win32'),patch.dict(sys.modules,{'webview':webview}):native_window.run_native(server,'http://127.0.0.1:1234/#token')
  self.assertEqual('edgechromium',webview.start.call_args.kwargs['gui']);self.assertTrue(webview.start.call_args.kwargs['icon'].endswith('AppIcon.ico'));self.assertFalse(webview.settings['OPEN_EXTERNAL_LINKS_IN_BROWSER'])
 def test_cancelled_file_picker_returns_none_and_destroys_root(self):
  root=Mock();dialog=SimpleNamespace(askdirectory=Mock(return_value=''),askopenfilename=Mock(return_value='C:/Music/set.m3u'));tk=SimpleNamespace(Tk=Mock(return_value=root),filedialog=dialog)
  with patch.dict(sys.modules,{'tkinter':tk,'tkinter.filedialog':dialog}):
   self.assertIsNone(platform_support.choose_path('Music',True));self.assertEqual(Path('C:/Music/set.m3u'),platform_support.choose_path('Set'))
  self.assertEqual(2,root.destroy.call_count)
 def test_windows_player_adapter_is_selected_and_seekable(self):
  import playback
  with patch.object(sys,'platform','win32'),patch('windows_audio.StreamPlayer',side_effect=lambda path:StreamPlayer(path,FakeFile,FakeStream)):
   player=playback.NativePlayer();player.load('track','test.wav');player.seek(4.25);self.assertEqual(4.25,player.snapshot()['position']);player.pause();self.assertEqual('paused',player.snapshot()['state']);player.stop();self.assertFalse(player.snapshot()['seekable'])
