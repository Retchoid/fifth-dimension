"""Forced audio decoding for BPM rechecks; independent of feature caches."""
from pathlib import Path
from statistics import median
import math,time
from tempo import resolve_tempo,valid_bpm,refine_tracker_bpm

def analyze_tempo(path,average=160,minimum=140,maximum=176,prefer=True):
 import numpy as np
 import librosa as lr
 from inventory import duration_of,read_key_bpm_tags
 duration,_=duration_of(Path(path))
 if duration is None or duration<10:raise ValueError('Readable audio duration of at least 10 seconds required')
 start=valid_bpm(average)
 if start is None:raise ValueError('Average BPM must be 20–400')
 sr=22050;hop=256;length=min(30,duration)
 offsets=sorted(set(max(0,min(duration-length,duration*f-length/2)) for f in (.2,.5,.8)))
 estimates=[];diagnostics=[]
 for offset in offsets:
  y,_=lr.load(str(path),sr=sr,mono=True,offset=offset,duration=length)
  if len(y)<sr*5 or not np.isfinite(y).all() or np.max(np.abs(y))<1e-5:continue
  envelope=lr.onset.onset_strength(y=y,sr=sr,hop_length=hop)
  if not np.isfinite(envelope).all() or np.max(envelope)<1e-8:continue
  tempo,beats=lr.beat.beat_track(onset_envelope=envelope,sr=sr,hop_length=hop,start_bpm=start)
  raw=valid_bpm(float(np.atleast_1d(tempo)[0]));refined=refine_tracker_bpm(raw,beats,sr,hop)
  if refined is None:continue
  candidates=[refined*f for f in (.5,1,2) if 20<=refined*f<=400]
  in_range=[v for v in candidates if minimum<=v<=maximum]
  chosen=min(in_range,key=lambda v:abs(math.log(v/start))) if prefer and in_range else refined
  estimates.append(chosen);diagnostics.append({'offset':round(offset,2),'tracker_bpm':raw,'refined_bpm':refined,'candidate_bpm':chosen})
 if not estimates:raise ValueError('No usable rhythmic samples; enter BPM by ear')
 center=median(estimates);stable=[v for v in estimates if abs(v-center)/center<=.05]
 measured=round(median(stable or estimates),3)
 tag=valid_bpm(read_key_bpm_tags(Path(path)).get('bpm'))
 result=resolve_tempo(measured,tag,estimates)
 result.update(tempo_rechecked_at=time.time(),tempo_recheck_version='forced-audio-three-window-v1',
  tempo_recheck_samples=diagnostics,tempo_recheck_average=start)
 return result
