import json,re
from pathlib import Path
from html import escape as esc
P=Path(__file__).parent;O=P/'dist';E=P/'evidence'
def load(p):return json.loads(p.read_text())
cast=load(P/'cast-source.json');editorial=load(P/'editorial.json');stories=load(P/'matches.json')
reps={str(r['club_id']):r for d in cast['divisions'] for f in d['fixtures'] for r in f['reports']}
portraits={p['name']:p['image'] for p in cast['portraits']};portraits.update({n:v['image'] for n,v in cast['reporter_portraits'].items()})
def speech(name,role,text,extra=''):
 img=portraits.get(name);pic=f'<img src="{esc(img)}" alt="{esc(name)}" loading="lazy">' if img else '<span class="coffee-initials">'+esc(''.join(w[0] for w in name.split())[:3])+'</span>'
 return f'<article class="coffee-speech {extra}"><header class="coffee-speaker">{pic}<div><strong>{esc(name)}</strong><small>{esc(role)}</small></div></header><p>{esc(text)}</p></article>'
def studio(i,text):return speech(cast['cast'][i][0],cast['cast'][i][1],text)
def teams(f):
 b='<div class="coffee-match-teams">'
 for side in ['home','away']:
  b+=f'<div class="coffee-match-team"><img src="{esc(f[side+"_logo_url"])}" alt="" loading="lazy"><strong>{esc(f[side+"_name"])}</strong><small>{esc(f[side+"_imc_manager_name"] or "")}</small></div>'
  if side=='home':b+='<div class="coffee-match-time"><span>VS</span><time>20:00</time></div>'
 return b+'</div>'
divisions=[]
for d in range(1,5):
 table=load(E/f'{d}-standings.json')['rows'];results=load(E/f'{d}-results.json')['rows'];fixtures=[f for f in load(E/f'{d}-schedule.json')['rows'] if f['match_date']=='2026-10-25'];assert len(fixtures)==5 and len(table)==10
 calc={}
 for f in results:
  assert f['match_date']<'2026-10-25'
  for s,t in [('home','away'),('away','home')]:
   v=calc.setdefault(str(f[s+'_sm_club_id']),dict(played=0,points=0,gf=0,ga=0,won=0,drawn=0,lost=0));a=f[s+'_score'];b=f[t+'_score'];v['played']+=1;v['gf']+=a;v['ga']+=b;v['won']+=a>b;v['drawn']+=a==b;v['lost']+=a<b;v['points']+=3 if a>b else 1 if a==b else 0
 for r in table:assert all(r[k]==v for k,v in calc[r['team_id']].items()),r
 assert {str(f[s+'_sm_team_id']) for f in fixtures for s in ['home','away']}=={r['team_id'] for r in table}
 divisions.append((table,results,fixtures))
b='<div class="coffee-edition"><header class="coffee-title-box"><p class="eyebrow">25 OTTOBRE 2026 · CAMPIONATO · GIORNATA 9</p><h2>Il caffè della domenica: si torna nei club</h2></header>'
b+=studio(0,'Buongiorno e benvenuti a Coffee Time! Dopo il giro delle nazionali, oggi torniamo nei club: venti partite, quattro divisioni e una serata che chiude il girone d’andata. Con me Andrea Stramaccioni e Alessandro Florenzi. Partiamo dalle classifiche: ci diranno dove sono le sfide che pesano di più. Qui trovate l’agenda completa, poi entriamo nelle divisioni con i nostri inviati e con i manager, ormai compagni abituali del caffè del mattino.')
b+=studio(1,'Ciao Fede! La prima cosa da mettere sul tavolo sono i distacchi. Il Monaco 1860 ha due punti sul Torino, il Celtic uno sul Bologna, il Marsiglia sei sul Dortmund e l’Hertha due sulla Lazio. Sono quattro corse diverse: chi guida non ha sempre bisogno della stessa partita. Le copertine nascono da qui, dal peso dei confronti diretti e dalle possibilità concrete di sorpasso.')
b+=studio(2,'Buongiorno a tutti! Quando incontri una squadra vicina in classifica sai già che la partita conta anche per domattina: puoi ritrovartela davanti, accanto o più lontana. Ma non bisogna giocare tutti i novanta minuti pensando alla tabella. La curiosità di oggi è vedere chi riesce a trasformare quella pressione in attenzione. E agli inviati chiediamo di portarci dentro questi incroci, con il tono di chi i mister li conosce ormai bene.')
b+='<section class="coffee-schedule"><header class="coffee-section-box"><p class="eyebrow">L’AGENDA DEL TURNO</p><h2>Il programma di oggi</h2><p>20 partite · 4 divisioni · Ore 20:00, come da calendario Nexus</p></header><div class="coffee-schedule-grid">'
for d,(_,_,fixtures) in enumerate(divisions,1):
 b+=f'<section class="coffee-schedule-group"><h3>Divisione {d}</h3><ul>'+''.join('<li class="coffee-schedule-match">'+teams(f)+'</li>' for f in fixtures)+'</ul></section>'
b+='</div></section><section class="coffee-navigation-box"><h2>Dentro le divisioni</h2><p class="coffee-tab-hint">Prima la classifica, poi le sfide e i collegamenti dai campi.</p></section><nav class="coffee-divisions" role="tablist" aria-label="Divisioni">'+''.join(f'<button type="button" role="tab" id="coffee-tab-{d}" aria-controls="coffee-div-{d}" aria-selected="{str(d==1).lower()}" tabindex="{0 if d==1 else -1}">Divisione {d}</button>' for d in range(1,5))+'</nav>'
for d,(table,results,fixtures) in enumerate(divisions,1):
 ed=editorial[str(d)];lookup={r['team_id']:r for r in table};logos={str(f[s+'_sm_team_id']):f[s+'_logo_url'] for f in fixtures for s in ['home','away']};feat=next(f for f in fixtures if f['sm_fixture_id']==ed['feature'])
 b+=f'<section class="coffee-division" id="coffee-div-{d}" role="tabpanel" aria-labelledby="coffee-tab-{d}"'+(' hidden' if d!=1 else '')+f'><h2 tabindex="-1">Divisione {d}</h2><section class="coffee-table-box"><h3>La classifica aggiornata</h3><div class="coffee-table-scroll"><table class="coffee-league-table"><caption>Prima della 9ª giornata · risultati di campionato al 22 ottobre 2026</caption><thead><tr>'+''.join('<th scope="col">'+x+'</th>' for x in ['Pos.','Squadra','Pt','G','V','N','P','GF','GS','DR'])+'</tr></thead><tbody>'
 for r in table:b+='<tr><td>'+str(r['position'])+'</td><th scope="row"><img src="'+esc(logos[r['team_id']])+'" alt="" loading="lazy">'+esc(r['team_name'])+'</th>'+''.join('<td>'+str(r[k])+'</td>' for k in ['points','played','won','drawn','lost','gf','ga','gd'])+'</tr>'
 b+='</tbody></table></div></section><header class="coffee-section-box"><p class="eyebrow">IL PUNTO SULLA DIVISIONE</p><h3>Leggere i distacchi, capire le sfide</h3></header>'+studio(0,ed['point'])+studio(1,ed['strama'])+studio(2,ed['flo'])
 b+='<aside class="coffee-feature"><p class="eyebrow">LA SFIDA IN EVIDENZA · SCELTA DALLA CLASSIFICA</p>'+teams(feat)+'<h3>'+esc(stories[str(ed['feature'])][0])+'</h3><p>'+esc(stories[str(ed['feature'])][1])+'</p><a href="#match-'+str(ed['feature'])+'">Vai al collegamento dal campo</a></aside><h3 class="coffee-fields-title">Tutte le partite · Dentro i campi</h3>'
 for f in fixtures:
  fid=f['sm_fixture_id'];title,text=stories[str(fid)];b+=f'<article class="coffee-fixture" id="match-{fid}" data-fixture="{fid}">'+teams(f)+'<h3>'+esc(title)+'</h3><p class="coffee-standing">'+esc(' / '.join(f[s+'_name']+': '+str(lookup[str(f[s+'_sm_team_id'])]['position'])+'ª · '+str(lookup[str(f[s+'_sm_team_id'])]['points'])+' punti' for s in ['home','away']))+'</p><p>'+esc(text)+'</p><aside class="coffee-path"><h4>Da dove ripartono in campionato</h4>'
  for s in ['home','away']:
   tid=str(f[s+'_sm_team_id']);last=max((r for r in results if tid in [str(r['home_sm_club_id']),str(r['away_sm_club_id'])]),key=lambda r:r['match_date']);b+='<p>'+esc(last['match_date'][8:]+' ottobre · '+last['home_name']+' '+str(last['home_score'])+'–'+str(last['away_score'])+' '+last['away_name'])+'</p>'
  b+='</aside>'
  for s,t in [('home','away'),('away','home')]:
   tid=str(f[s+'_sm_team_id']);r=lookup[tid];opp=lookup[str(f[t+'_sm_team_id'])];rep=reps[tid]['name'];manager=f[s+'_imc_manager_name'];club=f[s+'_name'];gap=r['points']-opp['points'];first=manager.split()[0]
   if gap==0:q=f'{first}, oggi il caffè lo prendiamo alla pari: {r["points"]} punti ciascuno. Te lo chiedo senza giri di parole: come si guadagnano quei tre punti di distanza?';a='Giocando la nostra partita, senza farci prendere dall’idea di dover dimostrare tutto subito. La classifica ci mette sullo stesso piano: sul campo dobbiamo scegliere bene quando accelerare. Se perdiamo ordine per cercare il vantaggio, facciamo un favore a loro.'
   elif -3<=gap<0:q=f'{first}, stavolta sul tavolino c’è anche la classifica: siete a {r["points"]}, loro a {opp["points"]}. '+('La vittoria vale l’aggancio' if gap==-3 else 'La vittoria vale il sorpasso')+'. È una di quelle sere che aspetti?';a='È una di quelle sere da preparare bene, più che da aspettare. Sappiamo cosa possiamo guadagnare, ma non possiamo pensare al traguardo prima di fare la partita. Voglio una squadra presente nei duelli e capace di aiutarsi: il resto lo conteremo alla fine.'
   elif 0<gap<=3:q=f'{first}, ci conosciamo: so che non vuoi sentir parlare di calcoli. Però {gap} '+('punto' if gap==1 else 'punti')+' tra voi e loro si sentono. Come eviti una partita giocata soltanto per proteggere il margine?';a='Ricordando che quel margine non entra in campo al posto nostro. Dobbiamo cercare di vincere, con equilibrio. Lasciare l’iniziativa per paura di perdere sarebbe il modo peggiore di affrontare uno scontro così: voglio scelte convinte, non frettolose.'
   elif r['position']==1:q=f'{first}, ti lascio bere un sorso prima della domanda: da capolista a {r["points"]} punti, come tieni lontano il pensiero delle inseguitrici?';a='Non posso impedire ai ragazzi di conoscere la classifica, e non voglio farlo. Posso chiedere che l’attenzione resti su questa partita. Il nostro vantaggio ha valore soltanto se continuiamo a fare le cose che ci hanno portato qui: gli altri risultati arrivano dopo.'
   elif r['position']>=8:q=f'{first}, oggi niente zucchero nella domanda: {r["points"]} punti e {r["position"]}ª posizione. Qual è la prima cosa che vuoi riconoscere nella tua squadra stasera?';a='La capacità di restare squadra anche quando qualcosa non riesce. La situazione la conosciamo e non serve ripeterla a ogni pallone sbagliato. Ci servono attenzione e coraggio insieme: se manca una delle due cose, la voglia di reagire da sola non basta.'
   elif r['position']<=3:q=f'{first}, il caffè lo beviamo guardando in alto: siete a {r["points"]} punti. Quanto è difficile pensare alla vostra partita senza cercare notizie dagli altri campi?';a='Le notizie le guarderemo quando avremo fatto il nostro. Non possiamo controllare gli altri campi, possiamo controllare il modo in cui affrontiamo questo. Voglio continuità, soprattutto nei momenti in cui la partita non va alla velocità che vorremmo.'
   else:q=f'{first}, ormai la domanda del caffè te l’aspetti: siete a {r["points"]} punti, con {r["gf"]} gol fatti e {r["ga"]} subiti. Dove vuoi vedere il passo avanti oggi?';a='Nella qualità delle scelte. Dobbiamo riconoscere quando c’è spazio per attaccare e quando serve ricominciare, senza vivere ogni passaggio all’indietro come una rinuncia. I numeri ci aiutano a capire il percorso; stasera voglio una squadra che li migliori con il lavoro di tutti.'
   context=f'Ciao Fede, qui seguiamo {club}: {r["position"]}ª posizione, {r["points"]} punti, {r["gf"]} gol fatti e {r["ga"]} subiti. Di fronte c’è {f[t+"_name"]}, a quota {opp["points"]}. '+('L’incrocio permette di guadagnare terreno direttamente su una rivale vicina: è questo il tema che porto al mister.' if abs(gap)<=3 else 'Il divario in classifica è chiaro, ma va tradotto in scelte sul campo. Al mister chiedo come vuole affrontare questa situazione.')
   b+='<section class="coffee-touchline">'+speech(rep,club+' · Collegamento dal campo',context)+'<div class="coffee-interview"><p class="coffee-dialogue-label">IL CAFFÈ CON IL MISTER · DIALOGO NARRATIVO</p>'+speech(rep,'La domanda',q)+speech(manager,club+' · La risposta',a,'coffee-answer')+'</div></section>'
  b+='</article>'
 b+='</section>'
b+=studio(0,'Il nostro giro si chiude qui: le classifiche hanno indicato le domande, stasera saranno le partite a dare le risposte. Trovate qui tutti i venti incontri e gli approfondimenti delle quattro divisioni. Ci ritroviamo domattina con Coffee Time, come ogni mattina su Nexus. Buona domenica e buon calcio!')+'</div>'
source=(P/'baseline.html').read_text().replace('value="2026-10-24"','value="2026-10-25"');start=source.index('<section id="panel-coffee-time">');end=source.index('<section class="edition-archive">',start);source=source[:start]+'<section id="panel-coffee-time">'+b+'</section>'+source[end:]
source=re.sub(r'<link rel="stylesheet" href="coffee-nations[^>]+>','<link rel="stylesheet" href="coffee-20261025.css?v=1">',source);source=re.sub(r'<script defer src="coffee-nations[^>]+></script>','<script defer src="coffee-20261025.js?v=1"></script>',source)
source=source.replace('<nav aria-label="Archivio Coffee Time">','<nav aria-label="Archivio Coffee Time"><a class="archive-link" href="/nexus/alltoplayfor/coffee-time/2026-10-25/">25 ottobre 2026</a>');source=source.replace('<title>Coffee Time | ALL TO PLAY FOR</title>','<title>Coffee Time · 25 ottobre 2026 | ALL TO PLAY FOR</title>')
(O/'latest.html').write_text(source);(O/'edition.html').write_text(source.replace('data-edition=""','data-edition="2026-10-25"').replace('rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/"','rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/2026-10-25/"'))
print('PASS 40 standings reconciled against 160 results; 20 fixtures, 40 reporters and dialogues, four editorial highlights')
