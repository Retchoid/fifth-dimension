"""Bounded-memory seekable Windows playback through libsndfile/PortAudio.

No resampling or playback-rate changes. MP3/WAV/AIFF/FLAC/OGG depend on the
bundled libsndfile codecs; AAC/M4A are not guaranteed in this beta.
"""
import threading,math
class StreamPlayer:
 def __init__(self,path,file_factory=None,stream_factory=None):
  if file_factory is None:
   from soundfile import SoundFile
   file_factory=SoundFile
  if stream_factory is None:
   from sounddevice import OutputStream
   stream_factory=OutputStream
  self.lock=threading.RLock();self.file=file_factory(str(path));self.stream=None;self.playing=False;self.failed=None
  try:
   if self.file.channels not in (1,2):raise ValueError('Playback supports mono/stereo tracks')
   self.stream=stream_factory(samplerate=self.file.samplerate,channels=self.file.channels,dtype='float32',callback=self._callback)
  except Exception:self.file.close();raise
 def _callback(self,out,frames,time_info,status):
  # The callback must always fill the requested output buffer.
  out.fill(0)
  with self.lock:
   if not self.playing:return
   try:
    data=self.file.read(frames,dtype='float32',always_2d=True);out[:len(data)]=data
    if len(data)<frames:self.playing=False
   except Exception as exc:self.failed=str(exc);self.playing=False
 def prepareToPlay(self):return True
 def play(self):
  if self.failed:raise ValueError('Audio stream failed: '+self.failed)
  if not self.stream.active:self.stream.start()
  with self.lock:self.playing=True
  return True
 def pause(self):
  with self.lock:self.playing=False
 def stop(self):
  with self.lock:self.playing=False
 def close(self):
  # Never hold the callback lock while waiting for PortAudio to stop.
  self.pause()
  if self.stream:self.stream.abort();self.stream.close();self.stream=None
  self.file.close()
 def currentTime(self):
  with self.lock:return self.file.tell()/self.file.samplerate
 def duration(self):return len(self.file)/self.file.samplerate
 def setCurrentTime_(self,seconds):
  if not math.isfinite(seconds):raise ValueError('Finite seek position required')
  with self.lock:self.file.seek(max(0,min(len(self.file),round(seconds*self.file.samplerate))))
 def isPlaying(self):
  if self.failed:raise ValueError('Audio stream failed: '+self.failed)
  return self.playing
