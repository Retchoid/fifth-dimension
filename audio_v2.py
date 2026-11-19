"""Three-window acoustic measurements and experimental library-relative proxies.

No mood, singer or pairwise-compatibility model is claimed. Extraction and scoring
have separate versions so adding tracks never invalidates cached measurements.
"""
import bisect, hashlib, json, math
from pathlib import Path
from dpm import NAMES, COLORS, clip, camelot_code

FEATURE_VERSION='three-window-44100-v2'
SCORE_VERSION='library-rubric-v2.1'
REQUIRED={'band_sub','band_bass','band_lowmid','band_presence','band_air',
          'loudness_db','centroid_hz','onset_rate','beat_regularity','tempo_bpm',
          'loudness_cv','self_sim','harmonic_voice_band_proxy','spectral_flux',
          'intro_sec','outro_sec','tension_raw','release_raw','crest'}
# dimension -> target, weight. Provisional creative rubric from Grok's plan.
RUBRIC={
 'Gathering':{'Warmth':(7,1),'Mixable Ends':(8,1),'Recovery Potential':(7,1),'Energy':(3,2),'Aggression':(2,2),'Tension':(3,1),'Darkness':(4.5,1),'Vocal Presence':(4,0.5)},
 'Confidence':{'Groove':(8,2),'Warmth':(7,1),'Energy':(6,2),'Darkness':(3.5,1),'Aggression':(4,1),'Mixable Ends':(7,1)},
 'Peak Hype':{'Energy':(9,2),'Aggression':(7,1),'Vocal Presence':(6,0.5),'Tension':(7.5,1),'Recovery Potential':(2.5,1),'Roller Index':(4,1)},
 'Chaos':{'Aggression':(9,2),'Tension':(9,2),'Energy':(8.5,1),'Roller Index':(3,1),'Warmth':(3,1),'Release':(4,1)},
 'Locked In':{'Groove':(9,2),'Roller Index':(9,2),'Mixable Ends':(8,1),'Vocal Presence':(2,0.5),'Aggression':(4,1),'Energy':(7,1)},
 'Sketch Hours':{'Darkness':(9,2),'Roller Index':(8.5,2),'Vocal Presence':(1.5,0.5),'Warmth':(3,1),'Energy':(5,1)},
 'Rebirth':{'Release':(8.5,2),'Warmth':(8,1),'Emotion':(8.5,0.5),'Aggression':(3,1),'Energy':(5.5,1)},
 'Sunrise':{'Release':(8,1),'Recovery Potential':(9,2),'Energy':(2.5,2),'Aggression':(1.5,1),'Darkness':(2.5,1),'Emotion':(8,0.5)}}

def sample_windows(duration):
 """Offsets and bounded lengths. Overlap is allowed for short eligible tracks."""
 return [(0,min(48,duration)),(max(0,(duration-60)/2),min(60,duration)),(max(0,duration-48),min(48,duration))]

def edge_lengths(intro_rms,outro_rms,body_rms,hop_seconds):
 threshold=0.45*body_rms
 first=next((i for i,x in enumerate(intro_rms) if x>=threshold),len(intro_rms))
 last=next((i for i,x in enumerate(reversed(outro_rms)) if x>=threshold),len(outro_rms))
 return first*hop_seconds,last*hop_seconds

def analyze(path):
 import numpy as np
 import librosa as lr
 from dpm import duration_seconds
 duration=duration_seconds(Path(path)); sr=44100; hop=512
 windows=[lr.load(str(path),sr=sr,mono=True,offset=start,duration=length)[0]
          for start,length in sample_windows(duration)]
 intro,y,outro=windows
 if len(y)<sr*10 or not np.isfinite(y).all() or np.max(np.abs(y))<1e-5:
  raise ValueError('Body audio is too short, silent or non-finite')
 S=np.abs(lr.stft(y,n_fft=2048,hop_length=hop)); P=S*S
 frequencies=lr.fft_frequencies(sr=sr,n_fft=2048); total=float(P.sum())+1e-12
 def band(lo,hi):return float(P[(frequencies>=lo)&(frequencies<hi)].sum()/total)
 rms=lr.feature.rms(y=y,frame_length=2048,hop_length=hop)[0]
 envelope=lr.onset.onset_strength(y=y,sr=sr,hop_length=hop)
 tempo,beats=lr.beat.beat_track(onset_envelope=envelope,sr=sr,hop_length=hop)
 from tempo import refine_tracker_bpm
 tracker_bpm=float(np.atleast_1d(tempo)[0]);bpm=refine_tracker_bpm(tracker_bpm,beats,sr,hop) or tracker_bpm; intervals=np.diff(beats)
 regular=float(np.exp(-4*np.std(intervals)/(np.mean(intervals)+1e-9))) if len(intervals)>3 else 0.0
 lag=int(round(4*60*sr/(bpm*hop))) if bpm>0 else 0
 self_sim=0.0
 if 0<lag<len(envelope)-2 and np.std(envelope[:-lag])>1e-9 and np.std(envelope[lag:])>1e-9:
  self_sim=float(np.corrcoef(envelope[:-lag],envelope[lag:])[0,1])
 mean_rms=float(np.mean(rms)); level=20*np.log10(rms+1e-9)
 # Flux is normalized by frame power, reducing direct mastering-level dependence.
 normalized=S/(np.sqrt((S*S).sum(axis=0,keepdims=True))+1e-9)
 flux=float(np.maximum(0,np.diff(normalized,axis=1)).mean())
 smooth=np.convolve(level,np.ones(min(86,len(level)))/min(86,len(level)),mode='valid')
 slope=float(np.percentile(np.maximum(np.diff(smooth),0),90)) if len(smooth)>1 else 0
 release=float(np.max(np.maximum.accumulate(smooth)-smooth)) if len(smooth) else 0
 # This band ratio includes instruments. It is deliberately named a proxy.
 harmonic=lr.decompose.hpss(S)[0]; power_h=harmonic*harmonic
 voice=float(power_h[(frequencies>=300)&(frequencies<3400)].sum()/total)
 intro_rms=lr.feature.rms(y=intro,frame_length=2048,hop_length=hop)[0]
 outro_rms=lr.feature.rms(y=outro,frame_length=2048,hop_length=hop)[0]
 intro_sec,outro_sec=edge_lengths(intro_rms,outro_rms,mean_rms,hop/sr)
 raw={'band_sub':band(20,60),'band_bass':band(60,120),'band_lowmid':band(120,500),
      'band_presence':band(2000,5000),'band_air':band(10000,18000),
      'loudness_db':float(20*np.log10(mean_rms+1e-9)),
      'centroid_hz':float(lr.feature.spectral_centroid(S=S,sr=sr).mean()),
      'onset_rate':float(len(lr.onset.onset_detect(onset_envelope=envelope,sr=sr,hop_length=hop))/(len(y)/sr)),
      'beat_regularity':regular,'tempo_bpm':bpm,'loudness_cv':float(np.std(rms)/(mean_rms+1e-9)),
      'self_sim':self_sim,'harmonic_voice_band_proxy':voice,'spectral_flux':flux,
      'intro_sec':min(48,float(intro_sec)),'outro_sec':min(48,float(outro_sec)),
      'tension_raw':slope+flux,'release_raw':release,'crest':float(np.max(np.abs(y))/(np.sqrt(np.mean(y*y))+1e-9))}
 try:
  import pyloudnorm as pyln
  lufs=float(pyln.Meter(sr).integrated_loudness(y))
  if math.isfinite(lufs):raw['lufs']=lufs
 except ImportError:pass
 if not all(math.isfinite(v) for v in raw.values()): raise ValueError('Non-finite audio measurements')
 chroma=lr.feature.chroma_stft(S=P,sr=sr).mean(axis=1)
 profiles={'major':[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],
           'minor':[6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17]}
 keys=sorted([(float(np.corrcoef(chroma,np.roll(profile,k))[0,1]) if np.std(chroma)>0 else 0,k,mode)
              for mode,profile in profiles.items() for k in range(12)],reverse=True)
 key=camelot_code(keys[0][1],keys[0][2]); tag_bpm=None;tag_key=None
 from inventory import read_key_bpm_tags, normalize_key
 tags=read_key_bpm_tags(Path(path))
 if tags.get('key'):tag_key=normalize_key(tags['key'])
 try:
  value=float(tags.get('bpm','nan'))
  if math.isfinite(value) and 20<=value<=400:tag_bpm=value
 except (ValueError,TypeError):pass
 # Metadata is authoritative when usable; estimates retain provenance and
 # octave alternatives. Never silently double a track because of its genre.
 from tempo import resolve_tempo
 window_tempos=[]
 for edge in (intro,outro):
  if len(edge)>=sr*10 and np.max(np.abs(edge))>=1e-5:
   edge_onsets=lr.onset.onset_strength(y=edge,sr=sr,hop_length=hop)
   value=lr.feature.tempo(onset_envelope=edge_onsets,sr=sr,hop_length=hop,aggregate=np.median)
   window_tempos.append(float(np.atleast_1d(value)[0]))
 tempo_info=resolve_tempo(bpm,tag_bpm,window_tempos)
 scores=dict.fromkeys(NAMES)
 darkness=clip(8-raw['centroid_hz']/700+2*key.endswith('A'))
 scores.update({'Darkness':darkness,'Warmth':clip(20*raw['band_lowmid']),'Groove':clip(10*regular),
                'Aggression':clip(raw['onset_rate']+raw['centroid_hz']/1300),
                'Energy':clip(40*mean_rms+0.8*raw['onset_rate'])})
 ranked=rank_stages(scores)
 return {'path':str(path),'duration_seconds':round(duration,2),'bpm':tempo_info['bpm'],'camelot':tag_key or key,
         'key_source':'file_tag' if tag_key else 'profile_estimate','estimated_camelot':key,
         'key_margin':round(keys[0][0]-keys[1][0],3),**tempo_info,'tracker_bpm':round(tracker_bpm,3),
         'raw_features':raw,'feature_version':FEATURE_VERSION,'tempo_method_version':'metadata-first-multiwindow-v3','scores':scores,
         'score_version':'fallback-five-proxies-v2','score_kinds':{name:('experimental_proxy' if value is not None else 'unavailable') for name,value in scores.items()},
         'suggested_stage':ranked[0][0],'alternate_stage':ranked[1][0],'stage_distance':ranked[0][1],
         'stage_distances':dict(ranked),'secondary_eligible':False,
         'color':COLORS[ranked[0][0]],'review_required':True,
         'analysis_notes':['Three bounded samples; whole-track structure is not measured.',
          'Harmonic voice-band energy can respond to leads and pads; not a singer detector.',
          'BPM half/double candidates are alternatives, not confirmed tempos.']}

def percentile(values,value):
 ordered=sorted(values)
 return min(1,max(0,(bisect.bisect_left(ordered,value)+bisect.bisect_right(ordered,value)-1)/(2*(len(ordered)-1)))) if len(ordered)>1 else 0.5

def rank_stages(scores):
 distances={}
 for stage,rubric in RUBRIC.items():
  pairs=[((scores[name]-target)**2,weight) for name,(target,weight) in rubric.items()
         if isinstance(scores.get(name),(int,float)) and math.isfinite(scores[name])]
  distances[stage]=sum(term*weight for term,weight in pairs)/sum(weight for _,weight in pairs) if pairs else 100
 return sorted(distances.items(),key=lambda item:item[1])

def apply_library_scores(tracks,min_tracks=20,min_duration=90,max_duration=900,reference_tracks=None):
 eligible=[t for t in tracks if t.get('feature_version')==FEATURE_VERSION and REQUIRED<=t.get('raw_features',{}).keys()
           and min_duration<=t.get('duration_seconds',0)<=max_duration and not t.get('missing')
           and all(isinstance(t['raw_features'][k],(int,float)) and math.isfinite(t['raw_features'][k]) for k in REQUIRED)]
 reference=eligible if reference_tracks is None else [t for t in reference_tracks if t.get('feature_version')==FEATURE_VERSION and REQUIRED<=t.get('raw_features',{}).keys()
    and min_duration<=t.get('duration_seconds',0)<=max_duration and not t.get('missing')
    and all(isinstance(t['raw_features'][k],(int,float)) and math.isfinite(t['raw_features'][k]) for k in REQUIRED)]
 if len(reference)<min_tracks:return {'scored':0,'reference_tracks':len(reference),'reason':'Need 20 fully analyzed eligible reference tracks'}
 columns={k:[t['raw_features'][k] for t in reference] for k in REQUIRED}
 use_lufs=all(isinstance(t['raw_features'].get('lufs'),(int,float)) and math.isfinite(t['raw_features']['lufs']) for t in reference+eligible)
 loudness_key='lufs' if use_lufs else 'loudness_db'
 loudness_values=[t['raw_features'][loudness_key] for t in reference]
 tagged=[t for t in reference if t.get('key_source')=='file_tag' and str(t.get('camelot','')).endswith(('A','B'))]
 use_minor=len(tagged)/len(reference)>=0.8
 reference_id=hashlib.sha256(json.dumps(sorted((t.get('digest',t['path']),{'raw':t['raw_features'],'key':t.get('camelot'),'key_source':t.get('key_source')}) for t in reference),sort_keys=True).encode()).hexdigest()
 for t in eligible:
  q={k:percentile(columns[k],t['raw_features'][k]) for k in REQUIRED};mean=lambda *v:sum(v)/len(v)
  loudness=percentile(loudness_values,t['raw_features'][loudness_key])
  scores={'Darkness':mean(1-q['centroid_hz'],1-q['band_air'],1-q['band_presence']),
   'Warmth':q['band_lowmid'],'Groove':q['beat_regularity'],
   'Aggression':mean(q['onset_rate'],q['spectral_flux'],1-q['crest'],q['band_presence']),
   'Emotion':mean(q['crest'],q['release_raw'],q['band_lowmid']),
   'Vocal Presence':q['harmonic_voice_band_proxy'],
   'Energy':mean(loudness,q['band_bass'],q['onset_rate']),
   'Tension':q['tension_raw'],'Release':q['release_raw'],
   'Roller Index':mean(1-q['loudness_cv'],q['self_sim'],1-q['harmonic_voice_band_proxy'],1-q['spectral_flux']),
   'Recovery Potential':mean(q['release_raw'],1-loudness,q['band_air'],1-q['onset_rate']),
   'Mixable Ends':mean(q['intro_sec'],q['outro_sec'],q['beat_regularity']),
   'Intro Length':q['intro_sec'],'Outro Length':q['outro_sec']}
  if use_minor:
   minor=(1.0 if t['camelot'].endswith('A') else 0.0) if t.get('key_source')=='file_tag' and str(t.get('camelot','')).endswith(('A','B')) else 0.5
   scores['Darkness']=(scores['Darkness']*3+minor)/4
  scores={k:round(10*v,2) for k,v in scores.items()};scores['Transition Compatibility']=None
  ranked=rank_stages(scores);best,second=ranked[:2]
  overlap=(second[1]-best[1])/max(best[1],1e-9)<=0.15
  t.update(scores=scores,loudness_basis=loudness_key,key_tag_coverage=len(tagged)/len(reference),score_version=SCORE_VERSION,reference_id=reference_id,reference_size=len(reference),
           score_kinds={name:('unavailable' if value is None else 'experimental_proxy_percentile') for name,value in scores.items()},
           suggested_stage=best[0],alternate_stage=second[0],stage_distance=round(best[1],4),
           stage_distances=dict(ranked),secondary_eligible=overlap,color=COLORS[best[0]])
 return {'scored':len(eligible),'reference_tracks':len(reference),'reference_id':reference_id}
