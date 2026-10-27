import json,re
from pathlib import Path
from html import escape as e
P=Path(__file__).parent;E=P/'evidence';O=P/'dist'
def load(p):return json.loads(p.read_text())
cast=load(P/'cast-source.json')
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
  if side=='home':b+='<div class="coffee-match-time"><span>VS</span><time>20:00</time></div>'
 return b+'</div>'
content=load(P/'content.json')
fixtures=[r for r in load(E/'cup-schedule.json')['rows'] if r['match_date']=='2026-10-27'];assert len(fixtures)==4
results=load(E/'cup-results.json')['rows'];tables={}
for d in range(1,5):
 for r in load(E/f'{d}-standings.json')['rows']:tables[r['team_id']]=(d,r)
b='<div class="coffee-edition"><header class="coffee-title-box"><p class="eyebrow">27 OTTOBRE 2026 · COPPA NAZIONALE · QUARTI DI FINALE</p><h2>Il caffè della coppa: otto squadre, quattro posti</h2><p>Quattro partite · Ore 20:00 · Una semifinale da conquistare</p></header>'
b+=studio(0,'Buongiorno e benvenuti a Coffee Time! Oggi il campionato lascia spazio ai quarti di coppa nazionale. Con Andrea Stramaccioni e Alessandro Florenzi seguiamo Hertha–Parma, Palermo–Celtic, Kaiserslautern–Roma e Tottenham–Legia. Prima il programma completo, poi entriamo in ogni sfida: posizione in campionato, percorso in coppa e collegamenti con i nostri inviati. Otto squadre, quattro posti in semifinale.')
b+=studio(1,'La classifica ci aiuta a capire il momento delle squadre, ma dobbiamo leggerla nella divisione di appartenenza. Hertha e Parma, per esempio, giocano in campionati diversi; Tottenham e Legia sono invece nella stessa divisione. Il percorso di coppa aggiunge una seconda lettura: c’è chi ha segnato molto e chi ha già passato due turni ai rigori.')
b+=studio(2,'Stasera conta saper voltare pagina: il Palermo arriva dalla prima vittoria, il Celtic da una sconfitta pesante, l’Hertha da un pareggio nel finale. Nessuno può portare in campo soltanto l’umore dell’ultima partita. Agli inviati chiediamo proprio questo: raccontarci come ogni manager affronta una nuova occasione.')
b+='<section class="coffee-schedule"><header class="coffee-section-box"><h2>Il programma di oggi</h2><p>27 ottobre · Quattro quarti di finale · Ore 20:00 da calendario Nexus</p></header><div class="coffee-schedule-grid">'
for f in fixtures:b+='<article class="coffee-schedule-match">'+teams(f)+'</article>'
b+='</div></section><section class="coffee-navigation-box"><h2>Dentro i quarti di finale</h2><p>Il contesto di campionato, il percorso in coppa e le voci dai campi.</p></section><nav class="coffee-divisions" role="tablist" aria-label="Quarti di finale">'
for i,c in enumerate(content):b+=f'<button type="button" role="tab" aria-selected="{str(i==0).lower()}" id="coffee-tab-{i+1}" aria-controls="coffee-div-{i+1}">'+e(c[0])+'</button>'
b+='</nav>'
for i,(f,c) in enumerate(zip(fixtures,content),1):
 b+=f'<section class="coffee-division" id="coffee-div-{i}" role="tabpanel" aria-labelledby="coffee-tab-{i}"'+(' hidden' if i>1 else '')+'><h2>'+e(c[0])+'</h2><section class="coffee-table-box"><h3>Da dove arrivano · Le classifiche</h3><div class="coffee-table-scroll"><table class="coffee-league-table"><caption>Campionato aggiornato dopo la 9ª giornata · 25 ottobre</caption><thead><tr>'+''.join('<th>'+v+'</th>' for v in ['Squadra','Divisione','Pos.','Pt','G','GF','GS'])+'</tr></thead><tbody>'
 for side in ['home','away']:
  tid=str(f[side+'_sm_team_id']);d,r=tables[tid]
  b+='<tr><th><img src="'+e(f[side+'_logo_url'])+'" alt="">'+e(f[side+'_name'])+'</th><td>'+str(d)+'</td>'+''.join('<td>'+str(r[k])+'</td>' for k in ['position','points','played','gf','ga'])+'</tr>'
 b+='</tbody></table></div></section><header class="coffee-section-box"><h3>'+e(c[1])+'</h3></header>'+studio(0,c[2])+studio(1,c[3])+studio(2,c[4])
 b+='<article class="coffee-fixture">'+teams(f)+'<section class="coffee-path"><h3>Il percorso in coppa</h3>'
 for side in ['home','away']:
  tid=f[side+'_sm_team_id'];rs=sorted([r for r in results if tid in [r['home_sm_club_id'],r['away_sm_club_id']] and r['match_date']<'2026-10-27'],key=lambda r:r['match_date'])
  assert rs
  b+='<h4>'+e(f[side+'_name'])+'</h4>'
  for r in rs:
   line=r['match_date'][8:]+' ottobre · '+r['home_name']+' '+str(r['home_score'])+'–'+str(r['away_score'])+' '+r['away_name']
   if r.get('penalty_home_score') is not None:line+=' · rigori '+str(r['penalty_home_score'])+'–'+str(r['penalty_away_score'])
   b+='<p>'+e(line)+'</p>'
 b+='</section>'
 for j,side in enumerate(['home','away']):
  rep=reps[str(f[side+'_sm_team_id'])]['name'];q,a=c[5+2*j:7+2*j]
  b+='<section class="coffee-touchline"><div class="coffee-interview"><p class="coffee-dialogue-label">IL CAFFÈ CON IL MISTER · DIALOGO NARRATIVO</p>'+speech(rep,f[side+'_name']+' · La domanda',q)+speech(f[side+'_imc_manager_name'],f[side+'_name']+' · La risposta',a,'coffee-answer')+'</div></section>'
 b+='</article></section>'
b+=studio(0,'Il programma è completo: quattro sfide, otto manager e una semifinale da conquistare. Le posizioni in campionato raccontano il punto di partenza; stasera sarà la coppa a scrivere il seguito. Ci ritroviamo domattina con Coffee Time, sempre su Nexus!')+'</div>'
s=(P/'baseline.html').read_text();a=s.index('<section id="panel-coffee-time">');z=s.index('<section class="edition-archive">',a);s=s[:a]+'<section id="panel-coffee-time">'+b+'</section>'+s[z:]
s=s.replace('coffee-20261026','coffee-20261027').replace('value="2026-10-26"','value="2026-10-27"').replace('<title>Coffee Time · 26 ottobre','<title>Coffee Time · 27 ottobre')
s=s.replace('<nav aria-label="Archivio Coffee Time">','<nav aria-label="Archivio Coffee Time"><a class="archive-link" href="/nexus/alltoplayfor/coffee-time/2026-10-27/">27 ottobre 2026</a>')
(O/'latest.html').write_text(s);(O/'edition.html').write_text(s.replace('data-edition=""','data-edition="2026-10-27"').replace('rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/"','rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/2026-10-27/"'))
print('PASS 4 fixtures, 8 standings and cup paths, 8 manager interviews')
