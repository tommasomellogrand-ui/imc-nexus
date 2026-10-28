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
  if side=='home':b+='<div class="coffee-match-time"><span>FINALE</span><b class="coffee-result">'+str(f['home_score'])+'–'+str(f['away_score'])+'</b></div>'
 return b+'</div>'
fixtures=sorted([r for r in load(E/'cup-results.json')['rows'] if r['match_date']=='2026-10-27'],key=lambda r:r['sm_fixture_id']);assert len(fixtures)==4
content=load(P/'content.json')
b='<div class="coffee-edition"><header class="coffee-title-box"><p class="eyebrow">28 OTTOBRE 2026 · IL GIORNO DOPO LA COPPA</p><h2>Il caffè delle quattro rimaste</h2><p>Hertha, Celtic, Kaiserslautern e Tottenham in semifinale</p></header>'
b+=studio(0,'Buongiorno e benvenuti a Coffee Time! Ieri aspettavamo quattro risposte, stamattina abbiamo quattro semifinaliste. Con Andrea Stramaccioni e Alessandro Florenzi ripartiamo dal tabellone: la tripletta di Schick, due rimonte spente in un minuto e una qualificazione ai rigori. Poi torniamo dagli otto manager con i loro inviati. In chiusura, un caffè a Bologna con Carlo Colombo e Francesco Cosatti.')
b+=studio(1,'Buongiorno Fede! Due partite hanno un dettaglio in comune: Hertha e Celtic hanno segnato un minuto dopo aver subito il gol che riapriva la gara. Non confondiamo risultati larghi e partite senza momenti delicati. I Match Report ci aiutano a vedere dove si è spezzato l’equilibrio.')
b+=studio(2,'E buongiorno anche a chi oggi ha meno voglia di parlare. Quattro squadre continuano, quattro escono: ascoltiamo entrambe. Il caffè serve anche a guardarsi negli occhi dopo una sconfitta. Gli inviati conoscono ormai i mister e sanno quali domande non si possono rimandare.')
b+='<section class="coffee-schedule"><header class="coffee-section-box"><h2>Prima il tabellone</h2><p>Coppa nazionale · Risultati dei quarti del 27 ottobre</p></header><div class="coffee-schedule-grid">'
for f in fixtures:
 b+='<article class="coffee-schedule-match">'+teams(f)
 if f['penalty_home_score'] is not None:b+='<p>Rigori: '+str(f['penalty_home_score'])+'–'+str(f['penalty_away_score'])+'</p>'
 b+='</article>'
b+='</div><div class="coffee-section-box"><h3>Verso le semifinali</h3><p><strong>Hertha–Celtic · Olympiastadion</strong></p><p>Accoppiamento e sede confermati dalla redazione. Completano le quattro qualificate Kaiserslautern e Tottenham. Il calendario delle semifinali non è ancora presente su Nexus: date, orari e secondo accoppiamento saranno riportati quando disponibili.</p></div></section>'
b+='<nav class="coffee-divisions" role="tablist" aria-label="I quarti di coppa">'+''.join(f'<button type="button" role="tab" id="coffee-tab-{i+1}" aria-controls="coffee-div-{i+1}" aria-selected="{str(i==0).lower()}" tabindex="{0 if i==0 else -1}">'+e(c[0])+'</button>' for i,c in enumerate(content))+'</nav>'
for i,(f,c) in enumerate(zip(fixtures,content),1):
 mr=load(E/(str(f['sm_fixture_id'])+'.json'))['row'];assert mr['home_score']==f['home_score'] and mr['away_score']==f['away_score'] and mr['match_date']=='2026-10-27'
 st=json.loads(mr['team_stats_json']);players=json.loads(mr['players_json']);mvp=next(p for p in players if p.get('man_of_match'));assert len(st['scorers'])==f['home_score']+f['away_score']
 b+=f'<section class="coffee-division" id="coffee-div-{i}" role="tabpanel" aria-labelledby="coffee-tab-{i}"'+(' hidden' if i>1 else '')+'><h2 tabindex="-1">'+e(c[0])+'</h2><header class="coffee-section-box"><h3>'+e(c[1])+'</h3></header>'+studio(0,c[2])+studio(1,c[3])+studio(2,c[4])
 b+='<article class="coffee-fixture">'+teams(f)
 if f['penalty_home_score'] is not None:b+='<p class="coffee-mvp">Ai rigori: '+str(f['penalty_home_score'])+'–'+str(f['penalty_away_score'])+' · passa il Kaiserslautern</p>'
 b+='<div class="coffee-scorers">'
 for side in ['home','away']:
  sc=sorted([g for g in st['scorers'] if g['team_side']==side],key=lambda g:g['minute']);b+='<p><strong>'+e(f[side+'_name'])+':</strong> '+e(' · '.join(str(g['minute'])+'′ '+g['player_name'] for g in sc) or 'Nessun gol')+'</p>'
 b+='</div><p class="coffee-mvp">Migliore in campo: <strong>'+e(mvp['player_name'])+'</strong> · voto '+str(mvp['rating'])+'</p><details class="coffee-stats"><summary>Le statistiche della partita</summary><table><thead><tr><th>Casa</th><th>Statistica</th><th>Trasferta</th></tr></thead><tbody>'
 for key,label in [('possession','Possesso %'),('total_shots','Tiri'),('shots_on_target','Tiri nello specchio'),('corners','Calci d’angolo'),('yellow_cards','Ammonizioni'),('red_cards','Espulsioni')]:b+='<tr><td>'+str(st['home'][key])+'</td><th>'+label+'</th><td>'+str(st['away'][key])+'</td></tr>'
 b+='</tbody></table></details>'
 for j,side in enumerate(['home','away']):
  rep=reps[str(f[side+'_sm_club_id'])]['name'];q,a=c[5+j*2:7+j*2]
  b+='<section class="coffee-touchline"><div class="coffee-interview"><p class="coffee-dialogue-label">IL CAFFÈ CON IL MISTER · DIALOGO NARRATIVO</p>'+speech(rep,f[side+'_name']+' · La domanda',q)+speech(f[side+'_imc_manager_name'],f[side+'_name']+' · La risposta',a,'coffee-answer')+'</div></section>'
 b+='</article></section>'
b+='<section class="coffee-section-box"><h2>Un caffè a Bologna</h2><p>Colombo e Cosatti · Il filo della storia continua</p></section>'+studio(0,'Prima di salutarci, torniamo a Bologna. Carlo Colombo ha ringraziato Fabio Ferrini e raccontato di aver trovato i ragazzi alla grande. Domani il calendario propone Celtic–Bologna: due squadre a 21 punti in Divisione 2, con il Bologna davanti per differenza reti. Il Celtic ci arriva con una semifinale di coppa appena conquistata.')
b+='<section class="coffee-interview"><p class="coffee-dialogue-label">IL CAFFÈ CON IL MISTER · DIALOGO NARRATIVO</p>'+speech('Francesco Cosatti','Bologna · La domanda','Carlo, ieri mi hai promesso il caffè. Oggi te lo porto io, ma con gli appunti sul Celtic: hanno appena vinto a Palermo. È già finito il tempo dei saluti?')+speech('Carlo Colombo','Bologna · La risposta','Francesco, i saluti fanno piacere, ma il campo arriva in fretta. Il Celtic ha dato una risposta forte e lo rispettiamo. Noi partiamo dal lavoro lasciato da Ferrini e da un gruppo che mi ha accolto benissimo. Adesso voglio conoscere sempre meglio i ragazzi e prepararci con serenità: la classifica ci chiede attenzione, non fretta.','coffee-answer')+'</section>'
b+=studio(0,'Quattro rimaste in coppa, otto storie da ascoltare e un nuovo capitolo a Bologna. Risultati e numeri restano qui, dentro ogni partita. Ci ritroviamo domattina con Coffee Time, sempre su Nexus!')+'</div>'
s=(P/'baseline.html').read_text();a=s.index('<section id="panel-coffee-time">');z=s.index('<section class="edition-archive">',a);s=s[:a]+'<section id="panel-coffee-time">'+b+'</section>'+s[z:]
s=s.replace('coffee-20261027','coffee-20261028').replace('value="2026-10-27"','value="2026-10-28"').replace('<title>Coffee Time · 27 ottobre','<title>Coffee Time · 28 ottobre')
s=s.replace('<nav aria-label="Archivio Coffee Time">','<nav aria-label="Archivio Coffee Time"><a class="archive-link" href="/nexus/alltoplayfor/coffee-time/2026-10-28/">28 ottobre 2026</a>')
(O/'latest.html').write_text(s);(O/'edition.html').write_text(s.replace('data-edition=""','data-edition="2026-10-28"').replace('rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/"','rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/2026-10-28/"'))
print('PASS four match reports, scorers, MVP and eight cup interviews plus Bologna')
