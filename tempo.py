"""Tempo provenance, metadata priority and explicit octave ambiguity."""
import math

def scalar_tag(value):
 if hasattr(value,'text'):value=value.text
 while isinstance(value,(list,tuple)):
  if not value:return None
  value=value[0]
 if isinstance(value,bytes):
  try:value=value.decode('utf-8')
  except UnicodeDecodeError:return None
 return str(value).strip() if value is not None else None

def valid_bpm(value):
 if isinstance(value,bool):return None
 try:value=float(value)
 except (TypeError,ValueError):return None
 return round(value,3) if math.isfinite(value) and 20<=value<=400 else None

def refine_tracker_bpm(estimate,beat_frames,sample_rate,hop_length):
 """Reduce autocorrelation-bin quantization using stable tracked intervals.

 This refines a chosen metrical level; it cannot resolve half/double ambiguity.
 """
 estimate=valid_bpm(estimate)
 if estimate is None:return None
 frames=[float(value) for value in beat_frames]
 intervals=[b-a for a,b in zip(frames,frames[1:]) if b>a]
 if len(intervals)<8:return estimate
 from statistics import median
 middle=median(intervals);stable=[value for value in intervals if .65*middle<=value<=1.45*middle]
 if len(stable)<8:return estimate
 candidate=valid_bpm(60*sample_rate/(hop_length*(sum(stable)/len(stable))))
 return candidate if candidate is not None and abs(candidate-estimate)/estimate<=.15 else estimate

def resolve_tempo(estimate,tag=None,window_estimates=None):
 estimate=valid_bpm(estimate);tag=valid_bpm(tag)
 windows=[valid_bpm(v) for v in (window_estimates or [])];windows=[v for v in windows if v]
 primary=tag if tag is not None else estimate
 candidates=sorted({round(value,2) for seed in ([primary] if primary else [])+windows for value in (seed/2,seed,seed*2) if 20<=value<=400})
 disagreement=False;octave=False
 if tag and estimate:
  disagreement=abs(estimate-tag)/tag>.03
  octave=disagreement and min(abs(estimate*f-tag)/tag for f in (.5,2))<=.03
 unstable=bool(windows and estimate and any(min(abs(value*f-estimate)/estimate for f in (.5,1,2))>.05 for value in windows))
 note=('Metadata BPM used; detector differs by half/double tempo.' if octave else
       'Metadata BPM used; detector disagrees. Check by ear.' if disagreement else
       'Metadata BPM used.' if tag else
       'Estimated tempo varies between sampled sections. Check by ear.' if unstable else
       'Estimated BPM; half/double alternatives need listening.' if estimate else 'No usable tempo measurement.')
 return {'bpm':primary,'bpm_source':'file_tag' if tag else 'estimated' if estimate else 'unavailable',
         'tag_bpm':tag,'measured_bpm':estimate,'tempo_candidates':candidates,'tempo_window_estimates':windows,
         'tempo_review_required':not bool(tag) or disagreement or unstable,
         'tempo_status':'tag_octave_difference' if octave else 'tag_detector_conflict' if disagreement else 'tag' if tag else 'unstable_estimate' if unstable else 'estimate' if estimate else 'unavailable',
         'tempo_note':note}

def apply_override(track,overrides,preferred_range=None):
 from learning import identity
 item=dict(track);item['analysis_bpm']=track.get('bpm')
 bpm=valid_bpm(overrides.get(identity(track),{}).get('bpm'))
 if bpm is not None:item.update(bpm=bpm,bpm_source='manual',tempo_status='manual',tempo_review_required=False,tempo_note='Your saved BPM correction. Original audio/tags unchanged.')
 elif valid_bpm(track.get('tag_bpm')) is not None:item.update(resolve_tempo(track.get('measured_bpm',track.get('bpm')),track['tag_bpm'],track.get('tempo_window_estimates')))
 else:
  item.setdefault('bpm_source','estimated');item.setdefault('tempo_review_required',True)
  item.setdefault('tempo_note','Older estimate; refresh tags or verify by ear.')
 if item.get('bpm_source') not in {'manual','file_tag'} and preferred_range:
  low,high=preferred_range
  seed=valid_bpm(item.get('measured_bpm')) or valid_bpm(item.get('bpm'))
  options=[valid_bpm(seed*factor) for factor in (.5,1,2)] if seed else []
  matching=[value for value in options if value is not None and low<=value<=high]
  if len(matching)==1 and matching[0]!=seed:
   item.update(bpm=matching[0],bpm_source='range_estimate',tempo_status='preferred_range_estimate',tempo_review_required=True,
    tempo_note=f'Half/double candidate chosen for your {low:g}–{high:g} BPM range. Verify by ear; original estimate {seed:g}.')
 if valid_bpm(item.get('bpm')) is None:item.update(bpm=None,bpm_source='unavailable',tempo_review_required=True,tempo_note='No usable BPM. Enter a correction after listening.')
 return item
