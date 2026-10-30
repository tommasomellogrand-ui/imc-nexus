import json,re
from pathlib import Path
from html import escape as e
P=Path(__file__).parent;E=P/'evidence';O=P/'dist'
def load(p):return json.loads(p.read_text())
cast=load(P/'cast-source.json');editorial=load(P/'editorial.json');stories=load(P/'stories.json')
reps={str(r['club_id']):r for d in cast['divisions'] for f in d['fixtures'] for r in f['reports']}
portraits={p['name']:p['image'] for p in cast['portraits']};portraits.update({n:v['image'] for n,v in cast['reporter_portraits'].items()})
def speech(n,role,text,extra=''):
 img=portraits.get(n);pic='<img src="'+e(img)+'" alt="'+e(n)+'" loading="lazy">' if img else '<span class="coffee-initials">'+e(''.join(w[0] for w in n.split())[:3])+'</span>'
 return '<article class="coffee-speech '+extra+'"><header class="coffee-speaker">'+pic+'<div><strong>'+e(n)+'</strong><small>'+e(role)+'</small></div></header><p>'+e(text)+'</p></article>'
def studio(i,text):return speech(cast['cast'][i][0],cast['cast'][i][1],text)
def teams(f):
 b='<div class="coffee-match-teams">'
 for side in ['home','away']:
  b+='<div class="coffee-match-team"><img src="'+e(f[side+'_logo_url'])+'" alt="" loading="lazy"><strong>'+e(f[side+'_name'])+'</strong><small>'+e(f[side+'_imc_manager_name'] or '')+'</small></div>'
  if side=='home':b+='<div class="coffee-match-time"><span>FINALE</span><b class="coffee-result">'+str(f['home_score'])+'–'+str(f['away_score'])+'</b></div>'
 return b+'</div>'
divisions=[];goals=0;count=0
for d in range(1,5):
 rows=load(E/f'{d}-standings.json')['rows'];results=load(E/f'{d}-results.json')['rows'];matches=sorted([r for r in results if r['match_date']=='2026-10-29'],key=lambda r:r['sm_fixture_id']);assert len(matches)==5 and len(rows)==10
 calc={}
 for f in results:
  assert f['match_date']<='2026-10-29'
  for s,t in [('home','away'),('away','home')]:
   v=calc.setdefault(str(f[s+'_sm_club_id']),dict(played=0,points=0,gf=0,ga=0,won=0,drawn=0,lost=0));a=f[s+'_score'];b=f[t+'_score'];v['played']+=1;v['gf']+=a;v['ga']+=b;v['won']+=a>b;v['drawn']+=a==b;v['lost']+=a<b;v['points']+=3 if a>b else 1 if a==b else 0
 for r in rows:assert all(r[k]==v for k,v in calc[r['team_id']].items()),r
 for f in matches:
  for side in ['home','away']:
   if str(f[side+'_sm_club_id'])=='94078865':f[side+'_imc_manager_name']='Carlo Colombo'
  mr=load(E/f'mr-{f["sm_fixture_id"]}.json')['row'];assert mr and mr['match_date']=='2026-10-29' and mr['home_score']==f['home_score'] and mr['away_score']==f['away_score']
  st=json.loads(mr['team_stats_json']);sc=st['scorers'];assert len(sc)==f['home_score']+f['away_score']
  for s in ['home','away']:assert sum(1 for g in sc if g['team_side']==s)==f[s+'_score']
  assert any(p.get('man_of_match') for p in json.loads(mr['players_json']))
  goals+=f['home_score']+f['away_score'];count+=1
 divisions.append((rows,matches))
assert count==20 and len(stories)==20
b='<div class="coffee-edition"><header class="coffee-title-box"><p class="eyebrow">30 OTTOBRE 2026 · DAY AFTER · GIORNATA 10</p><h2>Il caffè delle coppie</h2><p>20 partite · '+str(goals)+' gol · Tre coppie in vetta, una corsa ancora aperta</p></header>'
b+=studio(0,'Buongiorno e benvenuti a Coffee Time! Ieri parlavamo di sorpassi, stamattina ci ritroviamo con tre coppie in vetta: Monaco e Torino, Bologna e Celtic, Lazio e Hertha. Con Andrea Stramaccioni e Alessandro Florenzi riprendiamo le domande lasciate ai mister. Tutti i risultati sono qui; dentro ogni divisione apriamo dalla classifica e torniamo sui venti campi, anche dove il caffè oggi è più amaro.')
b+=studio(1,'Buongiorno Fede! Il pareggio di Glasgow lascia Bologna e Celtic insieme, ma permette al Valencia di avvicinarsi a un punto e al Kaiserslautern a due. In Divisione 3, invece, il 2–2 conserva i quattro punti fra Marsiglia e Dortmund. Stesso segno in schedina, conseguenze diverse: per leggere la giornata dobbiamo tenere insieme campo e classifica.')
b+=studio(2,'Ciao a tutti! Mi interessa tornare da chi ieri aveva promesso una risposta: il Parma dopo la coppa, il Legia dopo il Tottenham, la Roma dopo i rigori. Hanno vinto tutti e tre. Ma ci sono anche sconfitte che chiedono una conversazione franca. Gli inviati conoscono i mister: il caffè lo offriamo, le domande scomode restano.')
b+='<section class="coffee-schedule"><header class="coffee-section-box"><p class="eyebrow">IL TABELLONE DI IERI</p><h2>Tutti i risultati del 29 ottobre</h2><p>10ª giornata · 20 partite disputate</p></header><div class="coffee-schedule-grid">'
for d,(_,matches) in enumerate(divisions,1):b+=f'<section class="coffee-schedule-group"><h3>Divisione {d}</h3><ul>'+''.join('<li class="coffee-schedule-match">'+teams(f)+'</li>' for f in matches)+'</ul></section>'
b+='</div></section><section class="coffee-navigation-box"><h2>Dentro le divisioni</h2><p class="coffee-tab-hint">Classifica aggiornata, il punto dallo studio e il giorno dopo dai campi.</p></section><nav class="coffee-divisions" role="tablist" aria-label="Divisioni">'+''.join(f'<button type="button" role="tab" id="coffee-tab-{d}" aria-controls="coffee-div-{d}" aria-selected="{str(d==1).lower()}" tabindex="{0 if d==1 else -1}">Divisione {d}</button>' for d in range(1,5))+'</nav>'
for d,(rows,matches) in enumerate(divisions,1):
 lookup={r['team_id']:r for r in rows};logos={str(f[s+'_sm_club_id']):f[s+'_logo_url'] for f in matches for s in ['home','away']};ed=editorial[str(d)]
 b+=f'<section class="coffee-division" id="coffee-div-{d}" role="tabpanel" aria-labelledby="coffee-tab-{d}"'+(' hidden' if d!=1 else '')+f'><h2 tabindex="-1">Divisione {d}</h2><section class="coffee-table-box"><h3>La classifica aggiornata</h3><div class="coffee-table-scroll"><table class="coffee-league-table"><caption>Dopo la 10ª giornata · risultati al 29 ottobre 2026</caption><thead><tr>'+''.join('<th scope="col">'+x+'</th>' for x in ['Pos.','Squadra','Pt','G','V','N','P','GF','GS','DR'])+'</tr></thead><tbody>'
 for r in rows:b+='<tr><td>'+str(r['position'])+'</td><th scope="row"><img src="'+e(logos[r['team_id']])+'" alt="" loading="lazy">'+e(r['team_name'])+'</th>'+''.join('<td>'+str(r[k])+'</td>' for k in ['points','played','won','drawn','lost','gf','ga','gd'])+'</tr>'
 b+='</tbody></table></div></section><header class="coffee-section-box"><p class="eyebrow">IL PUNTO SULLA DIVISIONE</p><h3>'+e(ed[0])+'</h3></header>'+studio(0,ed[1])+studio(1,ed[2])+studio(2,ed[3])+'<h3 class="coffee-fields-title">Il giorno dopo, dai campi</h3>'
 for f in matches:
  fid=f['sm_fixture_id'];story=stories[str(fid)];mr=load(E/f'mr-{fid}.json')['row'];stats=json.loads(mr['team_stats_json']);players=json.loads(mr['players_json']);mvp=next(p for p in players if p.get('man_of_match'))
  b+=f'<article class="coffee-fixture" id="match-{fid}" data-fixture="{fid}"><p class="eyebrow">29 OTTOBRE · RISULTATO FINALE</p>'+teams(f)+'<h3>'+e(story[0])+'</h3><div class="coffee-scorers">'
  for s in ['home','away']:
   sc=sorted([g for g in stats['scorers'] if g['team_side']==s],key=lambda g:int(g['minute']))
   b+='<p><strong>'+e(f[s+'_name'])+':</strong> '+e(' · '.join(str(g['minute'])+'′ '+g['player_name']+(' (aut.)' if g.get('own_goal') else '') for g in sc) or 'Nessun gol')+'</p>'
  b+='</div><p class="coffee-mvp">Migliore in campo: <strong>'+e(mvp['player_name'])+'</strong> · voto '+e(str(mvp['rating']))+'</p>'
  for i,s in enumerate(['home','away']):
   tid=str(f[s+'_sm_club_id']);r=lookup[tid];rep=reps[tid]['name'];manager=f[s+'_imc_manager_name'];club=f[s+'_name'];q,a=story[3+2*i:5+2*i]
   assert q and a and manager
   summary=story[1+i]+f' La classifica aggiornata: {r["position"]}ª posizione, {r["points"]} punti.'
   b+='<section class="coffee-touchline">'+speech(rep,club+' · Il giorno dopo',summary)+'<div class="coffee-interview"><p class="coffee-dialogue-label">IL CAFFÈ CON IL MISTER · DIALOGO NARRATIVO</p>'+speech(rep,'La domanda',q)+speech(manager,club+' · La risposta',a,'coffee-answer')+'</div></section>'
  b+='<details class="coffee-stats"><summary>Le statistiche della partita</summary><table><caption>'+e(f['home_name'])+' · '+e(f['away_name'])+'</caption><thead><tr><th scope="col">Casa</th><th scope="col">Statistica</th><th scope="col">Trasferta</th></tr></thead><tbody>'
  for key,label in [('possession','Possesso %'),('total_shots','Tiri'),('shots_on_target','Tiri nello specchio'),('corners','Calci d’angolo'),('yellow_cards','Ammonizioni'),('red_cards','Espulsioni')]:b+='<tr><td>'+str(stats['home'][key])+'</td><th scope="row">'+label+'</th><td>'+str(stats['away'][key])+'</td></tr>'
  b+='</tbody></table></details></article>'
 b+='</section>'
b+=studio(0,'Il caffè delle coppie si chiude con tre primati condivisi e una Divisione 2 raccolta in appena due punti fra prima e quarta. Ma non dimentichiamo il derby della Samp, le risposte di Parma, Roma e Legia e i punti che hanno mosso la coda. Domattina ripartiremo da qui: dalle storie, dalle classifiche e dalle voci dei nostri campi. Sempre su Nexus!')+'</div>'
s=(P/'baseline.html').read_text();s=re.sub(r'<script type="application/json" id="coffee-fixtures">.*?</script>','',s,flags=re.S);a=s.index('<section id="panel-coffee-time">');z=s.index('<section class="edition-archive">',a);s=s[:a]+'<section id="panel-coffee-time">'+b+'</section>'+s[z:]
s=s.replace('coffee-20261029.css?v=1','coffee-20261030.css?v=1').replace('coffee-20261029.js?v=2','coffee-20261030.js?v=1').replace('coffee-20261029.js?v=1','coffee-20261030.js?v=1').replace('value="2026-10-29"','value="2026-10-30"')
s=s.replace('<title>Coffee Time · 29 ottobre 2026','<title>Coffee Time · 30 ottobre 2026')
s=s.replace('<nav aria-label="Archivio Coffee Time">','<nav aria-label="Archivio Coffee Time"><a class="archive-link" href="/nexus/alltoplayfor/coffee-time/2026-10-30/">30 ottobre 2026</a>')
(O/'latest.html').write_text(s);(O/'edition.html').write_text(s.replace('data-edition=""','data-edition="2026-10-30"').replace('rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/"','rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/2026-10-30/"'))
print(f'PASS: 40 standings reconciled; {count} match reports verified; {goals} scorers verified; 40 narrative interviews.')
