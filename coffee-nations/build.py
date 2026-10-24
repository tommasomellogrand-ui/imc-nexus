import json,re
from pathlib import Path
from html import escape as e
P=Path(__file__).parent; E=P/'evidence'; O=P/'dist';O.mkdir(exist_ok=True)
def read(n):return json.loads((E/(n+'.json')).read_text())
results=read('results')['rows'];groups=read('standings')['groups'];nations={str(r['world_id']):r for r in read('nations')['rows']};clubs=read('clubs')['rows']
old=json.loads(Path('coffee-today/edition.json').read_text()); reps={str(r['club_id']):r for d in old['divisions'] for f in d['fixtures'] for r in f['reports']}
by_manager={c['manager']['manager_id']:reps[str(c['world_id'])] for c in clubs if c.get('manager') and str(c['world_id']) in reps}
played=[r for r in results if r['match_date']=='2026-10-23']; assert len(played)==32 and len(groups)==16
# Reconcile every table cell with all completed results, independently of the renderer.
calc={}
for r in results:
 for side,opp in [('home','away'),('away','home')]:
  id=str(r[side+'_sm_club_id']);s=calc.setdefault(id,dict(played=0,won=0,drawn=0,lost=0,gf=0,ga=0,points=0));gf=r[side+'_score'];ga=r[opp+'_score'];s['played']+=1;s['gf']+=gf;s['ga']+=ga;s['won']+=gf>ga;s['drawn']+=gf==ga;s['lost']+=gf<ga;s['points']+=3 if gf>ga else 1 if gf==ga else 0
for g in groups:
 for r in g['rows']:
  assert all(r[k]==v for k,v in calc[r['team_id']].items()),r
translations=dict(zip(['England','France','Germany','Spain','Italy','Brazil','Argentina','Portugal','Netherlands','Switzerland','Belgium','Sweden','Turkey','Romania','Jamaica','Greece','Scotland','Denmark','Saudi Arabia','Ivory Coast','Mexico','Norway','Republic of Macedonia','Poland','Bosnia & Herzegovina','Cyprus','Senegal','Belarus','Austria','Wales','South Africa','Moldova','Japan','Slovakia','Lithuania','Ireland','Latvia','Croatia','United States','China','Iceland','Georgia','Ukraine','Algeria','Korea Republic','Bolivia','Morocco','Russia','Hungary','Iraq','Czech Republic','Northern Ireland','Trinidad & Tobago','Egypt','Malta','Cameroon','Finland','Israel','Slovenia','Chile','Colombia','Uruguay','Australia','Canada','Tunisia'],['Inghilterra','Francia','Germania','Spagna','Italia','Brasile','Argentina','Portogallo','Paesi Bassi','Svizzera','Belgio','Svezia','Turchia','Romania','Giamaica','Grecia','Scozia','Danimarca','Arabia Saudita','Costa d’Avorio','Messico','Norvegia','Macedonia','Polonia','Bosnia-Erzegovina','Cipro','Senegal','Bielorussia','Austria','Galles','Sudafrica','Moldavia','Giappone','Slovacchia','Lituania','Irlanda','Lettonia','Croazia','Stati Uniti','Cina','Islanda','Georgia','Ucraina','Algeria','Corea del Sud','Bolivia','Marocco','Russia','Ungheria','Iraq','Repubblica Ceca','Irlanda del Nord','Trinidad e Tobago','Egitto','Malta','Camerun','Finlandia','Israele','Slovenia','Cile','Colombia','Uruguay','Australia','Canada','Tunisia']))
def name(id):
 n=nations[str(id)]['name'];return translations.get(n,n)
def flag(id):return '<img class="flag" src="'+e(nations[str(id)]['image_url'])+'" alt="">'
def speech(n,role,text,img=None):
 image='<img src="'+e(img)+'" alt="'+e(n)+'">' if img else '<span class="initials">'+''.join(x[0] for x in n.split())+'</span>'
 return '<article class="voice"><header>'+image+'<div><strong>'+e(n)+'</strong><small>'+e(role)+'</small></div></header><p>'+e(text)+'</p></article>'
notes=[
'La Francia vince anche in Giamaica e resta a punteggio pieno: 12 punti e sette di vantaggio sulla Turchia. Lo 0–0 tra Turchia e Romania lascia aperta la corsa alle sue spalle.',
'La Spagna risponde con cinque gol al Cile e conserva un punto sulla Scozia, vittoriosa in Arabia Saudita. Danimarca e Cile sono appaiati a cinque punti.',
'L’Inghilterra di Mello segna sei gol e chiude l’andata con quattro vittorie su quattro. L’Albania espugna il campo del Messico e lo raggiunge a sei punti: la capolista è già sei lunghezze più avanti.',
'Il 3–3 tra Germania e Norvegia mantiene due punti tra le prime due. Il Ghana vince e sale a sette: tre nazionali raccolte in tre punti, con la Germania ancora imbattuta.',
'Il Portogallo supera la Polonia e arriva a 12 punti. La Bosnia-Erzegovina batte Cipro e raggiunge Israele a sei: il distacco dalla capolista resta ampio.',
'È il girone più affollato in vetta: Camerun, Brasile e Senegal hanno nove punti. Il Camerun batte il Senegal; il Brasile risponde con un 5–0. La differenza reti ordina una corsa ancora apertissima.',
'L’Argentina batte il Galles e resta a punteggio pieno. L’Austria supera il Sudafrica e raggiunge proprio il Galles a sette punti, cinque dietro la capolista.',
'I Paesi Bassi riposano e restano primi a 12 punti. Il Venezuela pareggia in Moldavia e sale a sette; il Mali supera il Giappone, ancora senza punti.',
'L’Italia riposa e conserva la testa a nove punti. La Slovacchia batte la Colombia e si avvicina a quota sette; il Montenegro pareggia in Lituania e sale a sei.',
'La Nigeria vince in casa del Belgio e riduce a un punto il distacco dalla vetta. La Lettonia espugna il campo dell’Irlanda e conquista i suoi primi tre punti.',
'La Croazia trova i primi tre punti con un 3–0 in Australia. Gli Stati Uniti pareggiano con la Cina e salgono a otto, due dietro il Paraguay che osservava il riposo.',
'L’Ucraina vince in Georgia e resta prima a dieci punti. L’Uruguay supera l’Islanda e rimane a una sola lunghezza: entrambe vincono senza subire reti.',
'La Svizzera riposa e resta a quota 12. L’Algeria pareggia con la Corea del Sud e sale a sette; l’Iran batte la Bolivia e conquista i primi tre punti.',
'Il Marocco batte l’Iraq 4–0 e resta a punteggio pieno. La Russia supera l’Ungheria e tiene il passo a nove punti: tre lunghezze separano le prime due.',
'La Serbia supera la Repubblica Ceca e arriva a 12 punti. Il Canada, a riposo, resta a nove; l’Irlanda del Nord batte Trinidad e Tobago e si sblocca.',
'L’Egitto batte l’Ecuador e completa un’andata perfetta, con 12 punti. La Svezia supera Malta e raggiunge l’Ecuador a sette: alle spalle della capolista si procede in coppia.'
]
body='<div class="cn"><header class="cn-title"><p>24 OTTOBRE 2026 · ORE 09:00 · GW001</p><h2>Il mondo nel caffè</h2><p>Day After · Qualificazioni mondiali</p><div class="numbers"><b>32 partite</b><b>16 gironi</b><b>80 nazionali</b></div></header>'
body+=speech('Federica Zille','Conduzione','Buongiorno e benvenuti a Coffee Time! Oggi il caffè ha il sapore delle nazionali: ripercorriamo le 32 partite del 23 ottobre e le classifiche dei sedici gironi. Con me Paolo Di Canio, Beppe Bergomi ed Esteban Cambiasso. L’Inghilterra ne fa sei, la Germania si ferma sul 3–3 e nel girone del Brasile sono in tre a nove punti. Partiamo!','assets/coffee-zille.webp')
body+='<div class="studio">'+speech('Paolo Di Canio','Prestazioni e protagonisti','Sei gol e dodici punti: l’Inghilterra manda un segnale forte. Ma quei due gol subiti meritano attenzione anche dentro una vittoria larga. La Nigeria, invece, firma il risultato che riapre il girone del Belgio: adesso li separa un solo punto.')+speech('Beppe Bergomi','Difese ed equilibrio','La Germania segna tre volte ma ne concede altrettante: il pareggio lascia vicina la Norvegia e permette al Ghana di avvicinarsi. L’Italia riposava: resta prima, ma la Slovacchia ora è a due punti. Bisogna leggere anche quello che fanno le rivali.')+speech('Esteban Cambiasso','Lettura tattica e gironi','Il Brasile vince 5–0, ma in classifica non scappa: Camerun e Senegal hanno gli stessi nove punti. L’Argentina, invece, batte il Galles e mantiene cinque punti sulle inseguitrici. Due vittorie, due situazioni molto diverse da gestire.')+'</div>'
body+='<nav class="cn-tabs" aria-label="Gironi delle nazionali">'+''.join(f'<button type="button" data-group="{i}" aria-pressed="{str(i==0).lower()}">{e(g["group_name"])}</button>' for i,g in enumerate(groups))+'</nav>'
report_count=0
for i,g in enumerate(groups):
 rows=g['rows']; matches=[r for r in played if r['competition_group_name']==g['group_name']];assert len(matches)==2
 body+=f'<section class="cn-group" id="cn-group-{i}"'+(' hidden' if i else '')+'><h2>'+e(g['group_name'])+'</h2><p class="table-note">Classifica aggiornata al 23 ottobre · 5ª giornata · 4 gare per nazionale</p><div class="table-wrap"><table><thead><tr><th>Pos.</th><th>Nazionale</th><th>Pt</th><th>G</th><th>V</th><th>N</th><th>P</th><th>GF</th><th>GS</th><th>DR</th></tr></thead><tbody>'
 for r in rows:
  body+='<tr><td>'+str(r['position'])+'</td><th scope="row">'+flag(r['team_id'])+e(name(r['team_id']))+'</th>'+''.join('<td>'+str(r[k])+'</td>' for k in ['points','played','won','drawn','lost','gf','ga','gd'])+'</tr>'
 body+='</tbody></table></div><article class="group-post"><span>IL POST DEL GIRONE</span><h3>'+e(g['group_name'])+' · Risultati e classifica</h3><p>'+e(notes[i])+'</p><ul>'
 for r in matches: body+='<li>'+e(name(r['home_sm_club_id']))+' '+str(r['home_score'])+'–'+str(r['away_score'])+' '+e(name(r['away_sm_club_id']))+'</li>'
 active={str(r[s+'_sm_club_id']) for r in matches for s in ['home','away']};rest=[r for r in rows if r['team_id'] not in active];body+='</ul><p>Turno di riposo: '+e(name(rest[0]['team_id']))+'.</p></article><h3>Il giorno dopo, dai campi</h3>'
 for r in matches:
  mr=read(str(r['sm_fixture_id'])).get('row');assert mr and mr['match_date']=='2026-10-23' and mr['home_score']==r['home_score'] and mr['away_score']==r['away_score'];report_count+=1
  st=json.loads(mr['team_stats_json']);players=json.loads(mr['players_json']);mvp=next((p for p in players if p.get('man_of_match')),None)
  h=name(r['home_sm_club_id']);a=name(r['away_sm_club_id']);body+='<article class="cn-match"><div class="scoreboard">'
  for side in ['home','away']:
   id=r[side+'_sm_club_id'];manager=r.get(side+'_imc_manager_name') or '';body+='<div>'+flag(id)+'<strong>'+e(name(id))+'</strong><small>'+e(manager)+'</small></div>'
   if side=='home':body+='<b class="score">'+str(r['home_score'])+'–'+str(r['away_score'])+'</b>'
  body+='</div><p class="scorers">'+e(' · '.join(str(x['minute'])+'′ '+x['player_name']+(' (aut.)' if x.get('own_goal') else '') for x in st.get('scorers',[])))+'</p>'
  for side,other in [('home','away'),('away','home')]:
   id=str(r[side+'_sm_club_id']);gf=r[side+'_score'];ga=r[other+'_score'];table=next(x for x in rows if x['team_id']==id);rep=by_manager.get(r.get(side+'_imc_manager_id'));s=st.get(side,{})
   text=name(id)+(' conquista tre punti' if gf>ga else 'aggiunge un punto' if gf==ga else 'chiude senza punti')+' e si ritrova a '+str(table['points'])+' nel girone. '
   text+=f"Il bilancio della partita è di {gf} gol fatti e {ga} subiti. "
   if 'total_shots' in s and 'shots_on_target' in s:text+=f"Produce {s['total_shots']} tiri, {s['shots_on_target']} nello specchio. "
   scorers=[p for p in players if p.get('team_side')==side and p.get('goals',0)>0]
   if scorers:text+='A segno '+', '.join(p['player_name']+' ('+str(p['goals'])+')' for p in scorers)+'.'
   if rep:
    photo=old['reporter_portraits'].get(rep['name'],{}).get('image');body+=speech(rep['name'],name(id)+' · CT '+r[side+'_imc_manager_name'],text,photo)
   else:body+='<div class="team-summary"><h4>'+e(name(id))+'</h4><p>'+e(text)+'</p></div>'
  if mvp:body+='<p class="mvp">Migliore in campo: <strong>'+e(mvp['player_name'])+'</strong> · voto '+e(str(mvp.get('rating','—')))+'</p>'
  body+='<details><summary>I numeri della partita</summary><table class="stats"><tbody>'
  for key,label in [('possession','Possesso %'),('total_shots','Tiri'),('shots_on_target','Tiri nello specchio'),('corners','Calci d’angolo'),('yellow_cards','Ammonizioni'),('red_cards','Espulsioni')]:body+='<tr><td>'+str(st.get('home',{}).get(key,'—'))+'</td><th>'+label+'</th><td>'+str(st.get('away',{}).get(key,'—'))+'</td></tr>'
  body+='</tbody></table></details></article>'
 body+='</section>'
body+=speech('Federica Zille','Ci ritroviamo domattina','Il giro delle nazionali si chiude qui. Il prossimo appuntamento delle qualificazioni, secondo il calendario Nexus, è il 30 ottobre. Risultati e classifiche di tutti i gironi restano qui, pronti da consultare. Coffee Time torna ogni mattina su Nexus!','assets/coffee-zille.webp')+'</div>'
assert report_count==32
source=Path('/tmp/coffee-live.html').read_text();source=source.replace('23 ottobre 2026</p>','24 ottobre 2026</p>').replace('value="2026-10-23"','value="2026-10-24"').replace('href="/nexus/alltoplayfor/coffee-time/2026-10-23/">Apri','href="/nexus/alltoplayfor/coffee-time/2026-10-24/">Apri')
source=re.sub(r'<section id="panel-coffee-time">.*?</section>','<section id="panel-coffee-time">'+body+'</section>',source)
source=re.sub(r'<script defer src="coffee-day-after[^>]+></script>','<script defer src="coffee-nations-20261024.js"></script>',source)
source=source.replace('</head>','<link rel="stylesheet" href="coffee-nations-20261024.css"></head>')
source=source.replace('<nav aria-label="Archivio Coffee Time">','<nav aria-label="Archivio Coffee Time"><a class="archive-link" href="/nexus/alltoplayfor/coffee-time/2026-10-24/">24 ottobre 2026</a>')
(O/'latest.html').write_text(source)
archive=source.replace('data-edition=""','data-edition="2026-10-24"').replace('Ultima edizione · 24 ottobre','Edizione del 24 ottobre').replace('href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/"','href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/2026-10-24/"').replace('href="/nexus/alltoplayfor/coffee-time/2026-10-24/">Apri la pagina di questa edizione','href="/nexus/alltoplayfor/coffee-time/">Torna all’ultima edizione')
(O/'edition.html').write_text(archive)
print('Verified 32 matches, 80 standings, 16 group posts; '+str(len(by_manager))+' manager/reporter mappings')
