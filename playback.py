"""Seekable native Mac playback, without changing audio or playback rate."""
import math,threading,sys

class NativePlayer:
 def __init__(self,factory=None):
  self.factory=factory;self.player=None;self.track_id=None;self.paused=False;self.lock=threading.RLock()
 def load(self,track_id,path):
  with self.lock:
   self.stop()
   if self.factory:player=self.factory(path)
   elif sys.platform=='win32':
    from windows_audio import StreamPlayer
    player=StreamPlayer(path)
   else:
    from AVFoundation import AVAudioPlayer
    from Foundation import NSURL
    result=AVAudioPlayer.alloc().initWithContentsOfURL_error_(NSURL.fileURLWithPath_(str(path)),None)
    player,error=result if isinstance(result,tuple) else (result,None)
    if player is None:raise ValueError('Audio could not be opened: '+str(error or 'unsupported format'))
   if not player.prepareToPlay():raise ValueError('Audio could not be prepared for playback')
   self.player=player;self.track_id=track_id;self.paused=True
   self.resume()
 def pause(self):
  with self.lock:
   if self.player:self.player.pause();self.paused=True
 def resume(self):
  with self.lock:
   if self.player:
    if self.player.currentTime()>=self.player.duration()-.02:self.player.setCurrentTime_(0)
    if not self.player.play():raise ValueError('Audio device could not start playback')
    self.paused=False
 def seek(self,seconds):
  seconds=float(seconds)
  if not math.isfinite(seconds):raise ValueError('Seek position must be finite')
  with self.lock:
   if self.player is None:raise ValueError('Load a track before seeking')
   self.player.setCurrentTime_(max(0,min(seconds,float(self.player.duration()))))
   return self.snapshot()
 def stop(self):
  with self.lock:
   if self.player:
    self.player.stop()
    if hasattr(self.player,'close'):self.player.close()
   self.player=None;self.track_id=None;self.paused=False
 def snapshot(self):
  with self.lock:
   if self.player is None:return {'id':None,'state':'stopped','position':0,'duration':0,'seekable':False}
   playing=bool(self.player.isPlaying())
   return {'id':self.track_id,'state':'playing' if playing else 'paused' if self.paused else 'ended',
     'position':float(self.player.currentTime()),'duration':float(self.player.duration()),'seekable':True}
