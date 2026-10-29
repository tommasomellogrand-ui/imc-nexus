import json,re
from pathlib import Path
from html import escape as esc
P=Path(__file__).parent;O=P/'dist';E=P/'evidence'
def load(p):return json.loads(p.read_text())
cast=load(P/'cast-source.json');editorial=load(P/'editorial.json');stories=load(P/'matches.json');dialogues=load(P/'dialogues.json')
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
 table=load(E/f'{d}-standings.json')['rows'];results=load(E/f'{d}-results.json')['rows'];fixtures=[f for f in load(E/f'{d}-schedule.json')['rows'] if f['match_date']=='2026-10-29'];assert len(fixtures)==5 and len(table)==10
 calc={}
 for f in results:
  assert f['match_date']<'2026-10-29'
  for s,t in [('home','away'),('away','home')]:
   v=calc.setdefault(str(f[s+'_sm_club_id']),dict(played=0,points=0,gf=0,ga=0,won=0,drawn=0,lost=0));a=f[s+'_score'];b=f[t+'_score'];v['played']+=1;v['gf']+=a;v['ga']+=b;v['won']+=a>b;v['drawn']+=a==b;v['lost']+=a<b;v['points']+=3 if a>b else 1 if a==b else 0
 for r in table:assert all(r[k]==v for k,v in calc[r['team_id']].items()),r
 assert {str(f[s+'_sm_team_id']) for f in fixtures for s in ['home','away']}=={r['team_id'] for r in table}
 
 for f in fixtures:
  for side in ['home','away']:
   if str(f[side+'_sm_team_id'])=='94078865':f[side+'_imc_manager_name']='Carlo Colombo'
 divisions.append((table,results,fixtures))
b='<div class="coffee-edition"><header class="coffee-title-box"><p class="eyebrow">29 OTTOBRE 2026 · CAMPIONATO · GIORNATA 10</p><h2>Il caffè del sorpasso</h2></header>'
b+=studio(0,'Buongiorno da Coffee Time! Oggi il caffè profuma di sorpasso: Celtic e Bologna si incontrano a 21 punti, Marsiglia e Dortmund si giocano una fetta della corsa in Divisione 3. Con Andrea Stramaccioni e Alessandro Florenzi partiamo dalle classifiche, poi raggiungiamo tutti e quaranta i manager. La coppa ha lasciato Hertha, Celtic, Kaiserslautern e Tottenham in semifinale: oggi, però, ogni punto torna a pesare in campionato.')
b+=studio(1,'Buongiorno Fede. Inizia il ritorno e gli incroci diretti danno un significato preciso ai distacchi. A Glasgow chi vince sale a 24 e lascia la rivale a 21. A Marsiglia il Dortmund può avvicinarsi a un punto oppure scivolare a sette. Non basta guardare chi è primo: conta chi può muovere la classifica senza aspettare un favore dagli altri.')
b+=studio(2,'Ciao a tutti! Mi incuriosiscono anche le squadre che arrivano dalla coppa: festeggiare una semifinale è bello, ritrovare subito attenzione in campionato è un altro lavoro. E per chi è uscito, come Palermo, Parma e Roma, questa sera è già un’occasione di risposta. Gli inviati ormai conoscono i mister: oggi chiediamo qualcosa in più del solito «pensiamo a noi».')
b+='<section class="coffee-schedule"><header class="coffee-section-box"><p class="eyebrow">L’AGENDA DEL TURNO</p><h2>Il programma di oggi</h2><p>20 partite · 4 divisioni · Ore 20:00, come da calendario Nexus</p></header><div class="coffee-schedule-grid">'
for d,(_,_,fixtures) in enumerate(divisions,1):
 b+=f'<section class="coffee-schedule-group"><h3>Divisione {d}</h3><ul>'+''.join('<li class="coffee-schedule-match">'+teams(f)+'</li>' for f in fixtures)+'</ul></section>'
b+='</div></section><section class="coffee-navigation-box"><h2>Dentro le divisioni</h2><p class="coffee-tab-hint">Prima la classifica, poi le sfide e i collegamenti dai campi.</p></section><nav class="coffee-divisions" role="tablist" aria-label="Divisioni">'+''.join(f'<button type="button" role="tab" id="coffee-tab-{d}" aria-controls="coffee-div-{d}" aria-selected="{str(d==1).lower()}" tabindex="{0 if d==1 else -1}">Divisione {d}</button>' for d in range(1,5))+'</nav>'
for d,(table,results,fixtures) in enumerate(divisions,1):
 ed=editorial[str(d)];lookup={r['team_id']:r for r in table};logos={str(f[s+'_sm_team_id']):f[s+'_logo_url'] for f in fixtures for s in ['home','away']};feat=next(f for f in fixtures if f['sm_fixture_id']==ed['feature'])
 b+=f'<section class="coffee-division" id="coffee-div-{d}" role="tabpanel" aria-labelledby="coffee-tab-{d}"'+(' hidden' if d!=1 else '')+f'><h2 tabindex="-1">Divisione {d}</h2><section class="coffee-table-box"><h3>La classifica aggiornata</h3><div class="coffee-table-scroll"><table class="coffee-league-table"><caption>Prima della 10ª giornata · risultati di campionato al 25 ottobre 2026</caption><thead><tr>'+''.join('<th scope="col">'+x+'</th>' for x in ['Pos.','Squadra','Pt','G','V','N','P','GF','GS','DR'])+'</tr></thead><tbody>'
 for r in table:b+='<tr><td>'+str(r['position'])+'</td><th scope="row"><img src="'+esc(logos[r['team_id']])+'" alt="" loading="lazy">'+esc(r['team_name'])+'</th>'+''.join('<td>'+str(r[k])+'</td>' for k in ['points','played','won','drawn','lost','gf','ga','gd'])+'</tr>'
 b+='</tbody></table></div></section><header class="coffee-section-box"><p class="eyebrow">IL PUNTO SULLA DIVISIONE</p><h3>Leggere i distacchi, capire le sfide</h3></header>'+studio(0,ed['point'])+studio(1,ed['strama'])+studio(2,ed['flo'])
 b+='<aside class="coffee-feature"><p class="eyebrow">LA SFIDA IN EVIDENZA · SCELTA DALLA CLASSIFICA</p>'+teams(feat)+'<h3>'+esc(stories[str(ed['feature'])][0])+'</h3><p>'+esc(stories[str(ed['feature'])][1])+'</p><a href="/nexus/alltoplayfor/coffee-time/#match-'+str(ed['feature'])+'">Vai al collegamento dal campo</a></aside><h3 class="coffee-fields-title">Tutte le partite · Dentro i campi</h3>'
 for f in fixtures:
  fid=f['sm_fixture_id'];title,text=stories[str(fid)];b+=f'<article class="coffee-fixture" id="match-{fid}" data-fixture="{fid}">'+teams(f)+'<h3>'+esc(title)+'</h3><p class="coffee-standing">'+esc(' / '.join(f[s+'_name']+': '+str(lookup[str(f[s+'_sm_team_id'])]['position'])+'ª · '+str(lookup[str(f[s+'_sm_team_id'])]['points'])+' punti' for s in ['home','away']))+'</p><p>'+esc(text)+'</p><aside class="coffee-path"><h4>Da dove ripartono in campionato</h4>'
  for s in ['home','away']:
   tid=str(f[s+'_sm_team_id']);last=max((r for r in results if tid in [str(r['home_sm_club_id']),str(r['away_sm_club_id'])]),key=lambda r:r['match_date']);b+='<p>'+esc(last['match_date'][8:]+' ottobre · '+last['home_name']+' '+str(last['home_score'])+'–'+str(last['away_score'])+' '+last['away_name'])+'</p>'
  b+='</aside>'
  for s,t in [('home','away'),('away','home')]:
   tid=str(f[s+'_sm_team_id']);r=lookup[tid];opp=lookup[str(f[t+'_sm_team_id'])];rep=reps[tid]['name'];manager=f[s+'_imc_manager_name'];club=f[s+'_name'];gap=r['points']-opp['points'];first=manager.split()[0]
   q,a=dialogues[tid]
   context=f'Ciao Fede, qui seguiamo {club}: {r["position"]}ª posizione, {r["points"]} punti, {r["gf"]} gol fatti e {r["ga"]} subiti. Di fronte c’è {f[t+"_name"]}, a quota {opp["points"]}. '+('L’incrocio permette di guadagnare terreno direttamente su una rivale vicina: è questo il tema che porto al mister.' if abs(gap)<=3 else 'Il divario in classifica è chiaro, ma va tradotto in scelte sul campo. Al mister chiedo come vuole affrontare questa situazione.')
   b+='<section class="coffee-touchline">'+speech(rep,club+' · Collegamento dal campo',context)+'<div class="coffee-interview"><p class="coffee-dialogue-label">IL CAFFÈ CON IL MISTER · DIALOGO NARRATIVO</p>'+speech(rep,'La domanda',q)+speech(manager,club+' · La risposta',a,'coffee-answer')+'</div></section>'
  b+='</article>'
 b+='</section>'
b+=studio(0,'Tre appuntamenti da segnare: Celtic–Bologna per il primato, Marsiglia–Dortmund per la distanza fra prima e seconda, Lazio–Schalke per la risposta della capolista alla pressione dell’Hertha. La domanda del giorno è questa: chi avrà cambiato davvero la propria prospettiva domattina? Tutte le venti partite sono qui. Stasera Federica Masolin vi aspetta a Final Whistle, con gli stessi campi e gli stessi inviati. Buon calcio, ci ritroviamo domattina su Nexus!')+'</div>'
source=(P/'baseline.html').read_text()
start=source.index('<section id="panel-coffee-time">');end=source.index('<section class="edition-archive">',start)
source=source[:start]+'<section id="panel-coffee-time">'+b+'</section>'+source[end:]
source=source.replace('coffee-20261028.css','coffee-20261029.css').replace('coffee-20261028.js','coffee-20261029.js').replace('value="2026-10-28"','value="2026-10-29"').replace('Coffee Time · 28 ottobre 2026','Coffee Time · 29 ottobre 2026')
source=source.replace('<nav aria-label="Archivio Coffee Time">','<nav aria-label="Archivio Coffee Time"><a class="archive-link" href="/nexus/alltoplayfor/coffee-time/2026-10-29/">29 ottobre 2026</a>')
manifest={'world':'GW001','season':2,'date':'2026-10-29','day':10,'title':'Il caffè del sorpasso','mode':'automatic','label':'29 OTTOBRE 2026 · CAMPIONATO · GIORNATA 10','reporter_portraits':{n:{'image':u} for n,u in portraits.items()},'divisions':[]}
for d,(table,results,fixtures) in enumerate(divisions,1):
 group={'name':f'Divisione {d}','fixtures':[]}
 for f in fixtures:
  v={'id':f['sm_fixture_id'],'match_date':f['match_date'],'date':f['match_date'],'competition_key':f['competition_key'],'sm_action':'league','time':f['match_time'][:5],'reporters':[]}
  for side in ['home','away']:
   tid=str(f[side+'_sm_team_id']);v[side]=f[side+'_name'];v[side+'_table']={'id':int(tid)};v[side+'_logo']=f[side+'_logo_url'];v[side+'_manager']=f[side+'_imc_manager_name']
   v['reporters'].append({'name':reps[tid]['name'],'side':side,'club':v[side],'club_id':int(tid),'label':'Inviato'})
  group['fixtures'].append(v)
 manifest['divisions'].append(group)
raw=json.dumps(manifest,ensure_ascii=False).replace('<','\u003c')
source=source.replace('</body>','<script type="application/json" id="coffee-fixtures">'+raw+'</script></body>')
(O/'latest.html').write_text(source);(O/'edition.html').write_text(source.replace('data-edition=""','data-edition="2026-10-29"').replace('rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/"','rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/2026-10-29/"'))
# Existing legacy endpoint reads this path first; publish the same manifest, never a separate editorial edition.
(O/'2026-10-29-coffee.json').write_text(json.dumps(manifest,ensure_ascii=False))
print('PASS 40 standings reconciled, 20 matches, 40 interviews; same Final Whistle manifest')
