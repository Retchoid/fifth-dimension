"""All 24 Camelot keys and all 576 directed pair combinations."""
from transitions import parse_camelot,camelot_distance,harmonic_score
MINOR=['G♯ / A♭','D♯ / E♭','A♯ / B♭','F','C','G','D','A','E','B','F♯ / G♭','C♯ / D♭']
MAJOR=['B / C♭','F♯ / G♭','D♭ / C♯','A♭ / G♯','E♭ / D♯','B♭ / A♯','F','C','G','D','A','E / F♭']
def keys():
 return [{'code':f'{i+1}{mode}','name':names[i]+(' minor' if mode=='A' else ' major'),'number':i+1,'mode':mode} for i in range(12) for mode,names in [('A',MINOR),('B',MAJOR)]]
def variations(source):
 number,mode=parse_camelot(source);source=f'{number}{mode}';result=[]
 for key in keys():
  n,m=parse_camelot(key['code']);signed=(n-number)%12
  direction=0 if signed==0 else signed if signed<=6 else signed-12
  relation='Same key' if source==key['code'] else 'Relative major/minor' if n==number else 'Adjacent, same mode' if abs(direction)==1 and m==mode else 'Wheel move, same mode' if m==mode else 'Wheel move + mode change'
  if m==mode and signed in {2,7}:relation+=(' · directed +2: whole-tone lift (riskier)' if signed==2 else ' · directed +7: semitone lift (riskier)')
  result.append({**key,'hops':camelot_distance(source,key['code']),'number_steps':direction,'relation':relation,'heuristic':harmonic_score(source,key['code'])})
 return sorted(result,key=lambda row:(row['hops'],row['code']))
def matrix():return [{'from':source['code'],'targets':[{'to':target['code'],'hops':camelot_distance(source['code'],target['code']),'heuristic':harmonic_score(source['code'],target['code'])} for target in keys()]} for source in keys()]
