"""Separate division results and standings news, using Results and dated assignments."""
import json
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
from generate import manager_record
R=Path(__file__).resolve().parents[1];A=R/'automation'

def unique(rows):
 found={}
 for row in rows:
  key=str(row['sm_fixture_id']);sig=tuple(str(row.get(k)) for k in ['match_date','competition_key','imc_season','home_sm_club_id','away_sm_club_id','home_score','away_score'])
  if key in found and found[key][0]!=sig:raise ValueError('Conflicting result '+key)
  found[key]=(sig,row)
 return [r for _,r in found.values()]

def table(rows,teams):
 stats={cid:{**t,'played':0,'won':0,'drawn':0,'lost':0,'gf':0,'ga':0,'points':0} for cid,t in teams.items()}
 for m in unique(rows):
  for side,opp in [('home','away'),('away','home')]:
   cid=str(m[side+'_sm_club_id']);r=stats[cid];gf=int(m[side+'_score']);ga=int(m[opp+'_score']);r['played']+=1;r['gf']+=gf;r['ga']+=ga;r['won']+=int(gf>ga);r['drawn']+=int(gf==ga);r['lost']+=int(gf<ga);r['points']+=3 if gf>ga else 1 if gf==ga else 0
 ranked=sorted(stats.values(),key=lambda r:(-r['points'],-(r['gf']-r['ga']),-r['gf'],r['name']))
 for i,r in enumerate(ranked,1):r['position']=i;r['gd']=r['gf']-r['ga']
 return ranked

def main(snap):
 clubs={str(c['club_id']):c for c in snap['clubs']};badges={c['id']:c for c in json.loads((A/'clubs.json').read_text())};pending=[];changed=[]
 rows=unique([r for r in snap.get('league_results',[]) if r.get('result_status')=='COMPLETED' and r.get('home_score') is not None and r.get('away_score') is not None])
 groups={}
 for m in rows:
  day=str(m['match_date'])[:10]
  if day<'2026-10-25':continue
  groups.setdefault((str(m['imc_season']),m['competition_key'],day),[]).append(m)
 for (season,key,day),games in sorted(groups.items()):
  try:
   ids={str(m[s+'_sm_club_id']) for m in games for s in ['home','away']}
   if len(games)!=5 or len(ids)!=10:raise ValueError('Giornata incompleta: attesi cinque risultati e dieci club')
   division=str(games[0]['sm_division']);dates=sorted({str(d['match_date'])[:10] for d in snap['matchdays'] if str(d['imc_season'])==season and d['competition_key']==key})
   if day not in dates:raise ValueError('Giornata non verificata')
   round_no=dates.index(day)+1
   teams={}
   for cid in ids:
    boss=manager_record(snap,cid,day)
    teams[cid]={'id':cid,'name':clubs[cid]['name'],'logo':badges[cid]['logo'],'manager':boss['full_name'],'manager_id':boss['manager_id']}
   fixtures=[{'fixture_id':str(m['sm_fixture_id']),'home':teams[str(m['home_sm_club_id'])],'away':teams[str(m['away_sm_club_id'])],'home_score':int(m['home_score']),'away_score':int(m['away_score'])} for m in sorted(games,key=lambda r:int(r['sm_fixture_id']))]
   prior=[m for m in rows if str(m['imc_season'])==season and m['competition_key']==key and str(m['match_date'])[:10]<=day]
   standings=table(prior,teams)
   for kind in ['results','standings']:
    nid=f'gw011-flash-s{season}-d{division}-{day}-{kind}'
    # The 25 October edition has the publication time explicitly requested by Tom.
    stamp=datetime.fromisoformat(day+'T22:00:00').replace(tzinfo=ZoneInfo('Europe/Rome')).isoformat()
    if day!='2026-10-25':stamp=datetime.now(ZoneInfo('Europe/Rome')).isoformat(timespec='seconds')
    title=f'Divisione {division} · '+(f'Risultati della {round_no}ª giornata' if kind=='results' else f'Classifica dopo la {round_no}ª giornata')
    payload={'world':'GW011','kind':kind,'season':season,'division':division,'round':round_no,'date':day,**({'fixtures':fixtures} if kind=='results' else {'standings':standings})}
    item={'id':nid,'published_at':stamp,'title':title,'text':('Tutti i risultati della giornata.' if kind=='results' else 'Classifica aggiornata ai risultati della giornata. Ordine: punti, differenza reti, gol fatti.'),'category':'flash','club_ids':sorted(ids),'division_news':payload}
    p=R/'items'/(nid+'.json')
    if p.exists():
     previous=json.loads(p.read_text());item['published_at']=stamp if day=='2026-10-25' else previous['published_at']
     if previous==item:continue
    p.write_text(json.dumps(item,ensure_ascii=False,indent=2)+'\n');changed.append(nid)
  except (ValueError,KeyError) as e:pending.append({'competition':key,'date':day,'reason':str(e)})
 print('DIVISION_NEWS',json.dumps({'updated':changed,'pending':pending},ensure_ascii=False));return changed,pending
