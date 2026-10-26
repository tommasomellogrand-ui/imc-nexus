"""Five evidence-grounded answers per historically assigned GW011 manager."""
import json,hashlib,re
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
from generate import manager_record,portrait,display_name,optional_asset
R=Path(__file__).resolve().parents[1];A=R/'automation'
DISC='Intervista simulata sulla base del match report: non dichiarazioni reali del manager.'
FIXED=['Mister, come giudica il risultato di oggi?','Al di là del risultato, come valuta la prestazione della squadra?']

def decoded(v,kind):
 x=json.loads(v) if isinstance(v,str) else v
 if not isinstance(x,kind):raise ValueError('Match report incompleto')
 return x

def minute(v):
 parts=str(v).split('+')
 if not all(p.isdigit() for p in parts):raise ValueError('Minuto non valido')
 return sum(map(int,parts))

def evidence(m):
 if m.get('result_status')!='COMPLETED':raise ValueError('Risultato non definitivo')
 players=decoded(m.get('players_json'),list);stats=decoded(m.get('team_stats_json'),dict);events=decoded(m.get('events_json'),list)
 for side in ['home','away']:
  if len([p for p in players if p.get('team_side')==side and p.get('starter')])!=11:raise ValueError('Formazione incompleta')
  st=stats.get(side,{})
  for k in ['possession','total_shots','shots_on_target','corners','red_cards']:
   if not isinstance(st.get(k),(int,float)) or st[k]<0:raise ValueError('Statistiche incomplete')
  if str(st.get('sm_team_id'))!=str(m[side+'_sm_club_id']):raise ValueError('Identità club non coerente')
  if st['shots_on_target']>st['total_shots'] or st['possession']>100:raise ValueError('Statistiche incoerenti')
 goals=stats.get('scorers',[])
 for side in ['home','away']:
  if sum(g.get('team_side')==side for g in goals)!=int(m[side+'_score']):raise ValueError('Gol non coerenti col risultato')
 for g in goals:minute(g['minute'])
 goals=sorted(goals,key=lambda g:minute(g['minute']))
 return players,stats,events,goals

def pname(p,events):
 pid=str(p.get('sm_player_id'));candidates=[p['player_name']]
 for e in events:
  for key in ['primary','secondary']:
   if str(e.get(key+'_sm_player_id'))==pid and e.get(key+'_player_name'):candidates.append(e[key+'_player_name'])
 # Full names in the actual report are preferred over squad-table initials.
 return display_name(max(candidates,key=lambda s:(len(s.split()),len(s))))

def interview(m,side):
 players,stats,events,goals=evidence(m);opp='away' if side=='home' else 'home';s=stats[side];o=stats[opp];gf=int(m[side+'_score']);ga=int(m[opp+'_score']);diff=gf-ga
 own=[p for p in players if p.get('team_side')==side and (p.get('starter') or p.get('sub_on_minute') is not None)]
 score=f'{gf}-{ga}'
 if diff>=3:a=f'È una vittoria netta, {score}, e il merito è aver dato continuità al risultato. Un margine così ampio premia quello che abbiamo prodotto, senza cancellare gli aspetti da rivedere.'
 elif diff>0:a=f'Vincere {score} conta molto. Con un margine così ridotto ogni episodio pesa: mi tengo il risultato, ma non considero automaticamente perfetta la partita.'
 elif diff<0:a=f'Perdere {score} lascia amarezza. '+('Il divario è ampio e va affrontato con lucidità, senza cercare un singolo colpevole.' if diff<=-3 else 'La partita si è decisa su un margine che ci obbliga a guardare con attenzione sia ciò che abbiamo creato sia ciò che abbiamo concesso.')
 else:a=f'Il {score} '+('ci lascia un punto. ' if m.get('sm_action')=='league' else 'è il risultato della gara. ')+(f'Con {gf+ga} gol complessivi ci sono cose buone davanti e altre da correggere nella protezione della porta.' if gf>=3 else 'Non mi basta chiamarlo un risultato giusto o ingiusto: va letto insieme alle occasioni e ai momenti della gara.')
 if m.get('penalty_home_score') is not None and m.get('penalty_away_score') is not None:
  a+=f' Ai rigori abbiamo chiuso {m["penalty_"+side+"_score"]}-{m["penalty_"+opp+"_score"]}: anche questo esito va distinto dall’analisi della prestazione.'
 qa=[{'question':FIXED[0],'answer':a}]
 a=f'Abbiamo chiuso con il {s["possession"]}% di possesso e {s["total_shots"]} tiri, contro {o["total_shots"]} degli avversari. '
 if s['possession']>=55 and diff<=0:a+='Abbiamo avuto più pallone, ma quel dato da solo non basta: dobbiamo trasformare la nostra presenza nella partita in un vantaggio concreto.'
 elif s['total_shots']<o['total_shots'] and diff>=0:a+='Il risultato è positivo rispetto al numero di conclusioni affrontate. Voglio però distinguere la capacità di portare a casa il risultato dalla necessità di concedere meno.'
 elif diff>0:a+='Il risultato dà valore alla prestazione. Guardo soprattutto al rapporto tra quello che produciamo e quello che lasciamo agli avversari, senza fermarmi al solo possesso.'
 else:a+='Sono numeri da leggere insieme: avere il pallone e arrivare al tiro non significa sempre creare una conclusione davvero efficace.'
 qa.append({'question':FIXED[1],'answer':a})
 subject=None
 reds=[p for p in players if p.get('red_card') and p.get('red_card_minute') is not None]
 if reds:
  p=sorted(reds,key=lambda p:minute(p['red_card_minute']))[0];name=pname(p,events);at=p['red_card_minute'];ours=p['team_side']==side
  subject={'id':str(p['sm_player_id']),'name':name}
  q=f'Il rosso a {name} al minuto {at} quanto pesa nella lettura della gara?'
  a=(f'Dal minuto {at} abbiamo dovuto affrontare un’espulsione. '+('La vittoria resta un risultato importante anche per questo, ma il cartellino è un episodio da analizzare separatamente.' if diff>0 else 'È un passaggio importante del report, ma non deve diventare una spiegazione unica di tutto il risultato.')) if ours else f'L’espulsione avversaria al minuto {at} è un dato importante. '+('Non siamo riusciti a tradurla nel risultato che cercavamo: il vantaggio numerico non sostituisce la qualità delle conclusioni.' if diff<=0 else 'La vittoria va comunque letta su tutta la partita, distinguendo ciò che è accaduto prima e dopo il cartellino.')
 elif goals:
  g=goals[-1];name=display_name(g['player_name']);at=g['minute'];ours=g['team_side']==side;late=minute(at)>=80
  subject={'id':str(g['sm_player_id']),'name':name}
  q=f'La rete di {name} al minuto {at} ha fissato il risultato. '+('Come legge quel finale?' if late else 'Quanto ha inciso questo episodio?')
  if late and ours:a=f'Quel gol al minuto {at} ha avuto un peso concreto: '+('ci ha dato la vittoria.' if diff>0 else 'ci ha permesso di pareggiare.' if diff==0 else 'ha ridotto lo svantaggio, senza però cambiare l’esito della gara.')+' È il momento da cui partire per raccontare il finale, senza dimenticare quanto era successo prima.'
  elif late:a=f'La rete al minuto {at} '+('ci ha tolto la vittoria.' if diff==0 else 'ha deciso la sconfitta.' if diff<0 and ga-gf==1 else 'ha cambiato il punteggio nel finale.')+' È un episodio da rivedere con attenzione: la valutazione deve riguardare l’intera azione, non soltanto chi si trova vicino al pallone.'
  else:a=f'Dopo il gol al minuto {at} il punteggio non è più cambiato. '+('Quella rete è rimasta determinante per il nostro risultato.' if ours else 'Non siamo riusciti a modificare ulteriormente il risultato.')+' Anche i minuti successivi fanno parte della valutazione della partita.'
 else:q='Lo 0-0 mette in primo piano le due difese: che lettura ne dà?';a='La porta inviolata è un dato positivo, ma anche noi non abbiamo segnato. Devo tenere insieme questi due aspetti: protezione della nostra porta ed efficacia davanti.'
 qa.append({'question':q,'answer':a,**({'player':subject} if subject else {})})
 star=max(own,key=lambda p:(bool(p.get('man_of_match')),int(p.get('goals') or 0),float(p.get('rating') or 0),int(p.get('assists') or 0)))
 name=pname(star,events);rating=star.get('rating');ng=int(star.get('goals') or 0);assists=int(star.get('assists') or 0)
 if star.get('man_of_match'):
  q=f'{name} è il migliore in campo del report: cosa sottolinea della sua prova?';a=f'Il riconoscimento e il voto {rating} danno rilievo alla sua prestazione. '+(f'Ha contribuito con {ng} gol. ' if ng else '')+'È un contributo che va riconosciuto, tenendolo dentro il lavoro complessivo della squadra.'
 elif ng:
  q=f'{name} ha segnato '+('una doppietta' if ng==2 else 'tre gol' if ng==3 else f'{ng} gol' if ng>1 else 'un gol')+': quanto conta il suo contributo?';a=('Il suo gol è un fatto concreto della nostra partita. ' if ng==1 else 'Le sue reti sono un fatto concreto della nostra partita. ')+(f'Il report gli assegna anche {assists} assist. ' if assists else '')+('Un contributo importante al risultato positivo.' if diff>=0 else 'Non è bastato a evitare la sconfitta, ma resta un contributo importante a ciò che abbiamo prodotto.')
 else:
  q=f'{name} ha ricevuto voto {rating} nel report: come inserisce la sua prova nel giudizio collettivo?';a=f'Il voto {rating} è un elemento della lettura, non una spiegazione completa della partita. '+('Mi interessa valorizzare il suo contributo senza attribuire a un solo giocatore tutto il merito.' if diff>=0 else 'Non voglio usare i voti per distribuire colpe individuali: dobbiamo capire come migliorare la risposta della squadra.')
 qa.append({'question':q,'answer':a,'player':{'id':str(star['sm_player_id']),'name':name}})
 target=s['shots_on_target'];shots=s['total_shots'];other=o['shots_on_target']
 q=f'{target} tiri nello specchio su {shots}, contro {other} degli avversari: cosa le dice questo dato?'
 if gf==0:a=f'Non abbiamo segnato pur arrivando nello specchio {target} volte. È il limite più concreto della nostra fase offensiva oggi: il volume va accompagnato da conclusioni più difficili da neutralizzare.'
 elif target<=3 and gf>=2:a=f'Abbiamo segnato {gf} gol con {target} conclusioni nello specchio: oggi siamo stati efficaci. È un merito, ma per dare continuità ai risultati serve anche aumentare la produzione offensiva.'
 elif target>=6 and gf<=1:a=f'Con {target} conclusioni nello specchio e {gf} gol, il tema è convertire meglio quello che produciamo. Il dato non racconta da solo la difficoltà di ogni tiro, ma indica bene dove concentrare la nostra analisi.'
 elif other>target:a=f'Gli avversari hanno centrato la porta {other} volte contro le nostre {target}. '+('Il risultato premia la nostra concretezza, ma concedere meno conclusioni pulite rimane importante.' if diff>=0 else 'Dobbiamo migliorare sia l’efficacia delle nostre conclusioni sia la protezione della porta.')
 else:a=f'Abbiamo trovato lo specchio {target} volte e segnato {gf} gol. '+('È una base positiva da cui partire, mantenendo attenzione anche alle conclusioni concesse.' if diff>0 else 'La differenza tra arrivare al tiro e trasformarlo in gol è una parte centrale della valutazione di oggi.')
 qa.append({'question':q,'answer':a})
 assert len(qa)==5 and len({x['question'] for x in qa})==5
 return qa

def main(snapshot=None,media=True):
 snap=snapshot or json.loads((A/'runtime/snapshot.json').read_text());clubs={str(c['club_id']):c for c in snap['clubs']};badges={c['id']:c for c in json.loads((A/'clubs.json').read_text())};now=datetime.now(ZoneInfo('Europe/Rome')).isoformat(timespec='seconds');pending=[];published=[];seen={}
 for m in snap.get('matches',[]):
  fid=str(m['sm_fixture_id'])
  # Ignore import timestamps; compare only actual result/report content.
  sig=json.dumps({k:m.get(k) for k in ['home_score','away_score','home_sm_club_id','away_sm_club_id','match_date','players_json','events_json','team_stats_json']},sort_keys=True)
  if fid in seen and seen[fid][0]!=sig:seen[fid]=(None,m)
  elif fid not in seen:seen[fid]=(sig,m)
 for fid,(sig,m) in seen.items():
  if sig is None:pending.append({'fixture':fid,'reason':'Versioni del report in conflitto'});continue
  day=str(m['match_date'])[:10]
  if day<'2026-10-25' or day>now[:10]:continue
  try:evidence(m)
  except (ValueError,TypeError,KeyError) as e:pending.append({'fixture':fid,'reason':str(e)});continue
  for side in ['home','away']:
   cid=str(m[side+'_sm_club_id'])
   if cid not in clubs:continue
   try:
    manager=manager_record(snap,cid,day);mid=manager['manager_id'];name=manager['full_name'];qa=interview(m,side)
    if not re.fullmatch('MNG[0-9]+',mid):raise ValueError('Identità manager non verificata')
    nid=f'gw011-postmatch-{fid}-{mid.lower()}-{cid}';club=clubs[cid]['name'];opp='away' if side=='home' else 'home';opponent=clubs.get(str(m[opp+'_sm_club_id']),{}).get('name',m[opp+'_name'])
    home=clubs.get(str(m['home_sm_club_id']),{}).get('name',m['home_name']);away=clubs.get(str(m['away_sm_club_id']),{}).get('name',m['away_name']);result=f'{home} {m["home_score"]}–{m["away_score"]} {away}'
    item={'id':nid,'published_at':now,'title':f'{name} · Il post partita di {club}','text':DISC+'\n\n'+result+' · '+datetime.fromisoformat(day).strftime('%d/%m/%Y'),'category':'post-match','club_ids':[cid],'teams':[{'name':club,**({'logo':badges[cid]['logo']} if badges.get(cid,{}).get('logo') else {})}],'post_match':{'world':'GW011','fixture_id':fid,'manager_id':mid,'manager':name,'club_id':cid,'club':club,'opponent':opponent,'match_date':day,'result':result,'source_hash':hashlib.sha256((sig+mid+cid+name).encode()).hexdigest()},'interview':qa}
    pm=item['post_match']
    pm.update({'home':home,'away':away,'home_score':str(m['home_score']),'away_score':str(m['away_score'])})
    for venue in ['home','away']:
     logo=badges.get(str(m[venue+'_sm_club_id']),{}).get('logo')
     if logo:pm[venue+'_logo']=logo
    if m.get('sm_action')=='league':
     pm['division']=str(m['sm_division'])
     dates=sorted({str(x['match_date'])[:10] for x in snap.get('matchdays',[]) if str(x['imc_season'])==str(m['imc_season']) and x['competition_key']==m['competition_key']})
     explicit=str(m.get('competition_round') or '')
     if explicit.isdigit():pm['round']=explicit
     elif day in dates:pm['round']=str(dates.index(day)+1)
     pm['competition_label']='DIVISIONE '+pm['division']+(' · GIORNATA '+pm['round'] if pm.get('round') else '')
    else:pm['competition_label']=str(m.get('competition_group_name') or m.get('sm_action') or 'Partita').upper()
    for turn in qa:
     player=turn.get('player')
     if not player or not media:continue
     data=snap.get('players',{}).get(player['id'],{})
     url=data.get('image_url') or ('https://cdn.soccerwiki.org/images/player/'+data['image_file'] if data.get('image_file') else None)
     image=optional_asset(url,'postmatch-player-'+player['id'])
     if image:player['image']={'file':image,'alt':player['name']}
     else:pending.append({'fixture':fid,'player':player['id'],'reason':'Foto verificata non disponibile; nuovo tentativo al controllo successivo'})
    if media:
     photo=portrait('managers',name,mid)
     if photo:item['image']=photo
    p=R/'items'/(nid+'.json')
    if p.exists():
     old=json.loads(p.read_text());item['published_at']=old['published_at']
     if 'image' not in item and old.get('image'):item['image']=old['image']
     if old==item:continue
    p.write_text(json.dumps(item,ensure_ascii=False,indent=2)+'\n');published.append({'id':nid,'manager':name,'club':club,'date':day})
   except (ValueError,KeyError,TypeError) as e:pending.append({'fixture':fid,'club':cid,'reason':str(e)})
 report={'fixtures':len(seen),'updated':published,'pending':pending};(A/'runtime').mkdir(exist_ok=True);(A/'runtime/postmatch-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('POSTMATCH',json.dumps(report,ensure_ascii=False));return report
if __name__=='__main__':main()
