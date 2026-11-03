import json,re
from pathlib import Path
from html import escape as e
P=Path(__file__).parent;E=P/'evidence';O=P/'dist';DATE='2026-11-03';YDAY='2026-11-02'
def load(n):return json.loads((E/(n+'.json')).read_text())
cast=json.loads((P/'cast-source.json').read_text());dialogues=json.loads((P/'dialogues.json').read_text());translations=json.loads((P/'translations.json').read_text());translations['ENGLAND']='Inghilterra'
reps={str(r['club_id']):r for d in cast['divisions'] for f in d['fixtures'] for r in f['reports']}
portraits={p['name']:p['image'] for p in cast['portraits']};portraits.update({n:v['image'] for n,v in cast['reporter_portraits'].items()});portraits.update({'Paolo Di Canio':'coffee-di-canio.jpg','Beppe Bergomi':'coffee-bergomi.jpg','Esteban Cambiasso':'coffee-cambiasso.jpg'})
clubs={str(c['world_id']):c for c in load('clubs')['rows']};nations={str(c['world_id']):c for c in load('nations')['rows']}
by_manager={c['manager']['manager_id']:reps[str(c['world_id'])] for c in clubs.values() if c.get('manager') and str(c['world_id']) in reps};by_manager['MNG052']=reps['94078865']
tables={r['team_id']:(d,r) for d in range(1,5) for r in load(str(d)+'-standings')['rows']}
semis=sorted([r for r in load('cup-schedule')['rows'] if r['match_date']==DATE],key=lambda r:r['sm_fixture_id']);assert len(semis)==2
cup_results=load('cup-results')['rows'];groups=load('nations-standings')['groups'];nr=load('nations-results')['rows'];played=sorted([r for r in nr if r['match_date']==YDAY],key=lambda r:r['sm_fixture_id']);assert len(played)==32 and len(groups)==16
# Independently reconcile the published national standings with all results.
calc={}
for f in nr:
 for s,o in [('home','away'),('away','home')]:
  v=calc.setdefault(str(f[s+'_sm_club_id']),dict(played=0,won=0,drawn=0,lost=0,gf=0,ga=0,points=0));gf=f[s+'_score'];ga=f[o+'_score'];v['played']+=1;v['won']+=gf>ga;v['drawn']+=gf==ga;v['lost']+=gf<ga;v['gf']+=gf;v['ga']+=ga;v['points']+=3 if gf>ga else 1 if gf==ga else 0
for g in groups:
 for r in g['rows']:assert all(r[k]==v for k,v in calc[str(r['team_id'])].items()),r
nt={str(r['team_id']):r for g in groups for r in g['rows']}
smfa={k:sorted([r for r in load(k+'-results')['rows'] if r['match_date']==YDAY],key=lambda r:r['sm_fixture_id']) for k in ['smfacup','smfashield']};assert all(len(v)==4 for v in smfa.values())
def nname(n):return translations.get(n,n)
def speech(n,role,text,extra=''):
 image=portraits.get(n);pic='<img src="'+e(image)+'" alt="'+e(n)+'" loading="lazy">' if image else '<span class="coffee-initials">'+e(''.join(w[0] for w in n.split())[:2])+'</span>'
 return '<article class="coffee-speech '+extra+'"><header class="coffee-speaker">'+pic+'<div><strong>'+e(n)+'</strong><small>'+e(role)+'</small></div></header><p>'+e(text)+'</p></article>'
def title(t,sub='',eyebrow=''):
 return '<header class="coffee-section-box"><p class="eyebrow">'+e(eyebrow)+'</p><h3>'+e(t)+'</h3><p>'+e(sub)+'</p></header>'
def fname(f,s):return nname(f[s+'_name'])
def teams(f,preview=False):
 b='<div class="coffee-match-teams">'
 for s in ['home','away']:
  b+='<div class="coffee-match-team"><img src="'+e(f[s+'_logo_url'])+'" alt="" loading="lazy"><strong>'+e(fname(f,s))+'</strong><small>'+e(f.get(s+'_imc_manager_name') or '')+'</small></div>'
  if s=='home':b+='<div class="coffee-match-time">'+('<span>STASERA</span><time>'+e(f['match_time'][:5])+'</time>' if preview else '<span>FINALE</span><b class="coffee-result">'+str(f['home_score'])+'–'+str(f['away_score'])+'</b>')+'</div>'
 return b+'</div>'
def interview(f,s,national=False):
 manager=f.get(s+'_imc_manager_name');rep=by_manager.get(f.get(s+'_imc_manager_id')) if national else reps.get(str(f.get(s+'_sm_team_id',f.get(s+'_sm_club_id'))))
 if not manager or not rep:return ''
 key=str(f['sm_fixture_id'])+'-'+s;assert key in dialogues,key
 q,a=dialogues[key];a=a.replace('Riccardo, ci serviva una vittoria','Gianluca, ci serviva una vittoria')
 return '<div class="coffee-interview"><p class="coffee-dialogue-label">IL CAFFÈ CON IL MISTER · DIALOGO NARRATIVO</p>'+speech(rep['name'],fname(f,s)+' · La domanda',q)+speech(manager,('CT ' if national else '')+fname(f,s)+' · La risposta',a,'coffee-answer')+'</div>'
def standings(rows,national=False):
 b='<section class="coffee-table-box"><h3>La classifica aggiornata</h3><div class="coffee-table-scroll"><table class="coffee-league-table"><caption>Risultati al 2 novembre 2026 · G = gare disputate</caption><thead><tr>'+''.join('<th scope="col">'+x+'</th>' for x in ['Pos.','Nazionale' if national else 'Squadra','Pt','G','V','N','P','GF','GS','DR'])+'</tr></thead><tbody>'
 for r in rows:
  img=nations[str(r['team_id'])]['image_url'] if national else r.get('logo_url','');name=nname(r['team_name']) if national else r['team_name']
  b+='<tr><td>'+str(r['position'])+'</td><th scope="row"><img src="'+e(img)+'" alt="" loading="lazy">'+e(name)+'</th>'+''.join('<td>'+str(r[k])+'</td>' for k in ['points','played','won','drawn','lost','gf','ga','gd'])+'</tr>'
 return b+'</tbody></table></div></section>'
matchcount=0;goalcount=0
smfa_headlines={369169692:'Quattro gol allo United, poi subito la semifinale',369169693:'Il Torino prende tre gol di vantaggio',369169694:'Kane ne fa tre: Atalanta, un’andata da ricordare',369169695:'Buendía risponde a Gittens: confronto in equilibrio',369169700:'Dortmund avanti, il gol di Soler tiene aperta la sfida',369169701:'Neto due volte: il Dresden riparte',369169702:'Gusto e Wieffer: tutto ancora aperto',369169703:'Il Palermo ribalta l’avvio del 1860 München'}
def match(f,national=False):
 global matchcount,goalcount
 fid=f['sm_fixture_id'];mr=load('mr-'+str(fid))['row'];assert mr and mr['match_date']==YDAY and mr['home_score']==f['home_score'] and mr['away_score']==f['away_score']
 st=json.loads(mr['team_stats_json']);players=json.loads(mr['players_json']);sc=st.get('scorers',[]);assert len(sc)==f['home_score']+f['away_score'],fid
 for s in ['home','away']:assert len([g for g in sc if g['team_side']==s])==f[s+'_score']
 matchcount+=1;goalcount+=len(sc);mvp=next((x for x in players if x.get('man_of_match')),None)
 b=f'<article class="coffee-result-card" id="match-{fid}" data-fixture="{fid}"><p class="eyebrow">2 NOVEMBRE · '+('QUALIFICAZIONI MONDIALI' if national else 'QUARTI DI FINALE · ANDATA')+'</p>'+teams(f)
 if not national:b+='<h3>'+e(smfa_headlines[fid])+'</h3>'
 b+='<div class="coffee-scorers">'
 for s in ['home','away']:
  events=sorted([x for x in sc if x['team_side']==s],key=lambda x:int(x['minute']))
  b+='<p><strong>'+e(fname(f,s))+':</strong> '+e(' · '.join(str(x['minute'])+'′ '+x['player_name']+(' (aut.)' if x.get('own_goal') else '') for x in events) or 'Nessun gol')+'</p>'
 b+='</div>'
 for s,o in [('home','away'),('away','home')]:
  tid=str(f[s+'_sm_club_id']);gf=f[s+'_score'];ga=f[o+'_score'];name=fname(f,s);opp=fname(f,o);stats=st[s];events=sorted([x for x in sc if x['team_side']==s],key=lambda x:int(x['minute']))
  txt=(f'{name} supera {opp} {gf}–{ga}. ' if gf>ga else f'{name} pareggia {gf}–{ga} con {opp}. ' if gf==ga else f'{name} perde {gf}–{ga} contro {opp}. ')
  if events:
   first,last=events[0],events[-1]
   txt+=f"La prima rete arriva con {first['player_name']} al {first['minute']}′. "
   if len(events)>1:txt+=f"L’ultimo gol è di {last['player_name']} al {last['minute']}′. "
  else:txt+='Nessun gol: il passo da cercare è una maggiore efficacia negli ultimi metri. '
  txt+=f"Le conclusioni sono {stats.get('total_shots','—')}, con {stats.get('shots_on_target','—')} tiri nello specchio. "
  if national:
   row=nt[tid];txt+=f"Ora {row['points']} punti in {row['played']} gare, {row['position']}ª posizione nel girone."
  else:txt+=('Il successo dà un vantaggio da difendere al ritorno.' if gf>ga else 'Il confronto resta in parità dopo l’andata.' if gf==ga else 'Il ritorno sarà l’occasione per provare a ribaltare lo svantaggio.')
  rep=by_manager.get(f.get(s+'_imc_manager_id')) if national else reps.get(tid)
  b+='<section class="coffee-touchline">'+(speech(rep['name'],name+' · Il giorno dopo',txt) if rep else '<div class="coffee-team-summary"><h4>'+e(name)+'</h4><p>'+e(txt)+'</p></div>')+interview(f,s,national)+'</section>'
 if mvp:b+='<p class="coffee-mvp">Migliore in campo: <strong>'+e(mvp['player_name'])+'</strong> · voto '+e(str(mvp.get('rating','—')))+'</p>'
 b+='<details class="coffee-stats"><summary>I numeri della partita</summary><table><caption>'+e(fname(f,'home'))+' · '+e(fname(f,'away'))+'</caption><thead><tr><th>Casa</th><th>Statistica</th><th>Trasferta</th></tr></thead><tbody>'
 for key,label in [('possession','Possesso %'),('total_shots','Tiri'),('shots_on_target','Tiri nello specchio'),('corners','Calci d’angolo'),('yellow_cards','Ammonizioni'),('red_cards','Espulsioni')]:b+='<tr><td>'+str(st['home'].get(key,'—'))+'</td><th>'+label+'</th><td>'+str(st['away'].get(key,'—'))+'</td></tr>'
 return b+'</tbody></table></details></article>'
b='<div class="coffee-edition"><header class="coffee-title-box"><p class="eyebrow">3 NOVEMBRE 2026 · COPPA NAZIONALE, NAZIONALI E SMFA</p><h2>Il caffè delle finaliste</h2><p>Stasera due posti in finale · Il giorno dopo di nazionali e coppe SMFA</p></header>'
b+=speech('Federica Zille','Conduzione','Buongiorno! Stasera Hertha–Celtic e Tottenham–Kaiserslautern assegnano i due posti nella finale di coppa nazionale. Partiamo da Berlino e Londra con Andrea Stramaccioni e Alessandro Florenzi, poi apriamo il nostro giro del mondo con Di Canio, Bergomi e Cambiasso. Ci aspettano trentadue risultati delle nazionali e otto partite dei quarti SMFA: la mattina è ricca, il caffè è pronto.')
b+='<nav class="coffee-main-tabs" role="tablist" aria-label="Contenuti dell’edizione">'+''.join(f'<button type="button" role="tab" id="main-tab-{i}" aria-controls="main-panel-{i}" aria-selected="{str(i==0).lower()}" tabindex="{0 if i==0 else -1}">{label}</button>' for i,label in enumerate(['Stasera · Coppa','Nazionali','Coppe SMFA']))+'</nav>'
b+='<section id="main-panel-0" class="coffee-main-panel coffee-division" role="tabpanel" aria-labelledby="main-tab-0"><h2>Le semifinali di stasera</h2>'+speech('Andrea Stramaccioni','Analisi tattica','Hertha e Celtic arrivano da due quarti vinti con margine: 4–1 al Parma e 3–1 al Palermo. Il Tottenham ha eliminato la Legia 3–0; il Kaiserslautern ha avuto bisogno dei rigori contro la Roma. Sono percorsi diversi, ma stasera nessuno porta in campo un vantaggio acquisito. Conta anche saper affrontare una partita che può cambiare direzione.')+speech('Alessandro Florenzi','Il punto di vista del calciatore','La finale si vede, ma è proprio il momento in cui bisogna restare dentro la singola partita. Il Tottenham arriva anche dal 4–1 allo United: fiducia preziosa, purché non diventi fretta. A Berlino l’atmosfera può dare una spinta all’Hertha, ma il Celtic ha già dimostrato nei quarti di saper vincere fuori casa.')
manifest={'date':DATE,'world':'GW001','season':2,'mode':'automatic','label':'3 NOVEMBRE · SEMIFINALI DI COPPA NAZIONALE','title':'Il caffè delle finaliste','reporter_portraits':cast['reporter_portraits'],'divisions':[{'name':'Semifinali di coppa nazionale','fixtures':[]}]}
for f in semis:
 fid=f['sm_fixture_id'];b+=f'<article class="coffee-fixture" id="match-{fid}" data-fixture="{fid}"><p class="eyebrow">3 NOVEMBRE · SEMIFINALE · ORE {f["match_time"][:5]}</p>'+teams(f,True)
 b+='<section class="coffee-table-box"><h3>Il punto di partenza in campionato</h3><div class="coffee-table-scroll"><table class="coffee-league-table"><caption>Classifiche di divisione dopo l’11ª giornata · Le squadre militano in divisioni diverse</caption><thead><tr><th>Squadra</th><th>Divisione</th><th>Pos.</th><th>Pt</th><th>G</th><th>GF</th><th>GS</th></tr></thead><tbody>'
 for s in ['home','away']:
  tid=str(f[s+'_sm_team_id']);d,r=tables[tid];b+='<tr><th>'+e(fname(f,s))+'</th><td>'+str(d)+'</td>'+''.join('<td>'+str(r[k])+'</td>' for k in ['position','points','played','gf','ga'])+'</tr>'
 b+='</tbody></table></div></section><section class="coffee-path"><h3>Il percorso verso la semifinale</h3>'
 for s in ['home','away']:
  tid=f[s+'_sm_team_id'];rs=sorted([r for r in cup_results if tid in [r['home_sm_club_id'],r['away_sm_club_id']] and r['match_date']<DATE],key=lambda r:r['match_date']);assert rs
  b+='<h4>'+e(fname(f,s))+'</h4>'
  for r in rs:
   line=r['match_date'][8:]+'/'+r['match_date'][5:7]+' · '+r['home_name']+' '+str(r['home_score'])+'–'+str(r['away_score'])+' '+r['away_name']
   if r.get('penalty_home_score') is not None:line+=' · rigori '+str(r['penalty_home_score'])+'–'+str(r['penalty_away_score'])
   b+='<p>'+e(line)+'</p>'
 b+='</section>'+interview(f,'home')+interview(f,'away')+'</article>'
 mf={'id':str(fid),'match_date':DATE,'date':DATE,'competition_key':f['competition_key'],'sm_action':'leaguecup','time':f['match_time'][:5],'reporters':[]}
 for s in ['home','away']:
  tid=f[s+'_sm_team_id'];rep=reps[str(tid)];mf.update({s:f[s+'_name'],s+'_table':{'id':tid},s+'_logo':f[s+'_logo_url'],s+'_manager':f[s+'_imc_manager_name']});mf['reporters'].append({'name':rep['name'],'side':s,'club':f[s+'_name'],'club_id':tid,'label':'Inviato'})
 manifest['divisions'][0]['fixtures'].append(mf)
b+='<p class="coffee-evening">Stasera il seguito su <a href="/nexus/alltoplayfor/final-whistle/?date=2026-11-03">Final Whistle</a>: le risposte delle semifinali.</p></section>'
b+='<section id="main-panel-1" class="coffee-main-panel" role="tabpanel" aria-labelledby="main-tab-1" hidden><h2>Il mondo nel caffè</h2>'+title('Il giorno dopo delle nazionali','32 partite · 16 gironi · Classifiche e voci dai campi','QUALIFICAZIONI MONDIALI')
b+=speech('Paolo Di Canio','Prestazioni e protagonisti','Inghilterra, Portogallo e Paesi Bassi sono a diciotto punti in sei partite. Kane ne segna due, Leão tre, Malen due: ci sono protagonisti chiari, ma la continuità riguarda tutta la squadra. Oggi agli inviati chiedo di andare oltre il complimento: come si conserva questa fame anche quando la classifica sorride?')
b+=speech('Beppe Bergomi','Difese ed equilibrio','Il Brasile pareggia 2–2 con il Senegal, l’Argentina 3–3 in Guinea. Sono risultati diversi dalle vittorie larghe di Germania e Uruguay, e raccontano un altro lato del turno: segnare non basta sempre. La Serbia recupera sul Canada al 78’ e incassa il gol decisivo al 79’: certi momenti meritano una domanda precisa.')
b+=speech('Esteban Cambiasso','La lettura dei gironi','L’Italia sale a quindici punti battendo la Slovacchia; la Croazia vince negli Stati Uniti e il Marocco supera l’Ungheria nel finale. Leggiamo prima le classifiche e la colonna delle gare giocate: ci sono squadre con cinque partite e altre con sei. Il distacco da solo non basta per raccontare dove si trova una nazionale.')
b+='<nav class="coffee-group-tabs" role="tablist" aria-label="Gironi delle nazionali">'+''.join(f'<button type="button" role="tab" id="group-tab-{i}" aria-controls="group-panel-{i}" aria-selected="{str(i==0).lower()}" tabindex="{0 if i==0 else -1}">{e(g["group_name"])}</button>' for i,g in enumerate(groups))+'</nav>'
for i,g in enumerate(groups):
 rows=g['rows'];matches=[r for r in played if r['competition_group_name']==g['group_name']];assert len(matches)==2
 b+=f'<section class="coffee-group-panel" id="group-panel-{i}" role="tabpanel" aria-labelledby="group-tab-{i}"'+(' hidden' if i else '')+'><h2>'+e(g['group_name'])+'</h2>'+standings(rows,True)
 first,second=rows[:2];txt=f"{nname(first['team_name'])} guida a {first['points']} punti in {first['played']} gare; {nname(second['team_name'])} segue a {second['points']} in {second['played']}. "
 if first['points']==second['points']:txt+='Le prime due sono appaiate nei punti. '
 active={str(f[s+'_sm_club_id']) for f in matches for s in ['home','away']};rest=[r for r in rows if str(r['team_id']) not in active];assert len(rest)==1
 txt+='Turno di riposo per '+nname(rest[0]['team_name'])+'.'
 b+=title('Il post del girone',txt,'RISULTATI E CLASSIFICA')+'<ul class="coffee-result-list">'+''.join('<li>'+e(fname(f,'home'))+' <strong>'+str(f['home_score'])+'–'+str(f['away_score'])+'</strong> '+e(fname(f,'away'))+'</li>' for f in matches)+'</ul>'
 for f in matches:b+=match(f,True)
 b+='</section>'
b+='</section><section id="main-panel-2" class="coffee-main-panel" role="tabpanel" aria-labelledby="main-tab-2" hidden><h2>Il giorno dopo delle coppe SMFA</h2>'+speech('Federica Zille','Il giro dei campi','Atalanta, Torino e Tottenham prendono margini importanti nei quarti d’andata della SMFA Champions. Nella Shield vincono Dortmund e Dresden, il Palermo passa sul campo del 1860 München e l’AEK pareggia con il Brighton. Qui la lettura parte dai risultati dell’andata: nessuna semifinale è ancora assegnata.')
for k,label in [('smfacup','SMFA Champions'),('smfashield','SMFA Shield')]:
 b+=title(label,'Quarti di finale · Andata del 2 novembre','IL QUADRO DEL TURNO')+'<ul class="coffee-result-list">'+''.join('<li>'+e(fname(f,'home'))+' <strong>'+str(f['home_score'])+'–'+str(f['away_score'])+'</strong> '+e(fname(f,'away'))+'</li>' for f in smfa[k])+'</ul>'
 for f in smfa[k]:b+=match(f)
b+='</section>'+speech('Federica Zille','Ci vediamo stasera','Abbiamo ascoltato le risposte di ieri e le attese di oggi. Stasera Hertha–Celtic e Tottenham–Kaiserslautern ci diranno chi giocherà la finale di coppa nazionale. Il racconto continua su Final Whistle; domattina ci ritroviamo qui, con il nostro Coffee Time su Nexus.')+'</div>'
assert matchcount==40
source=(P/'baseline.html').read_text();source=re.sub(r'<script type="application/json" id="coffee-fixtures">.*?</script>','',source,flags=re.S);a=source.index('<section id="panel-coffee-time">');z=source.index('<section class="edition-archive">',a);source=source[:a]+'<section id="panel-coffee-time">'+b+'</section><script type="application/json" id="coffee-fixtures">'+json.dumps(manifest,ensure_ascii=False).replace('</','<\/')+'</script>'+source[z:]
source=source.replace('coffee-20261102.css?v=1','coffee-20261103.css?v=1').replace('coffee-20261102.js?v=1','coffee-20261103.js?v=1').replace('value="2026-11-02"','value="2026-11-03"').replace('<title>Coffee Time · 2 novembre 2026','<title>Coffee Time · 3 novembre 2026')
source=source.replace('<nav aria-label="Archivio Coffee Time">','<nav aria-label="Archivio Coffee Time"><a class="archive-link" href="/nexus/alltoplayfor/coffee-time/2026-11-03/">3 novembre 2026</a>')
assert 'coffee-20261102.css' not in source and 'coffee-20261102.js' not in source
(O/'latest.html').write_text(source);(O/'edition.html').write_text(source.replace('data-edition=""','data-edition="2026-11-03"').replace('rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/"','rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/2026-11-03/"'))
assert source.count('class="coffee-interview"')==len(dialogues)==35
print(f'PASS: 2 verified semifinals, 40 match reports, {goalcount} goals, 80 national table rows reconciled, 35 narrative interviews; Final Whistle manifest includes only tonight’s two matches.')
