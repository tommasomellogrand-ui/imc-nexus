import json,re
from pathlib import Path
from html import escape as e
P=Path(__file__).parent; E=P/'evidence'; O=P/'dist';O.mkdir(exist_ok=True)
def read(n):return json.loads((E/(n+'.json')).read_text())
dialogues={}
results=read('results')['rows'];groups=read('standings')['groups'];nations={str(r['world_id']):r for r in read('nations')['rows']};clubs=read('clubs')['rows']
old=json.loads((P/'cast-source.json').read_text()); reps={str(r['club_id']):r for d in old['divisions'] for f in d['fixtures'] for r in f['reports']}
by_manager={c['manager']['manager_id']:reps[str(c['world_id'])] for c in clubs if c.get('manager') and str(c['world_id']) in reps}
played=[r for r in results if r['match_date']=='2026-10-30']; assert len(played)==32 and len(groups)==16
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
 img=img or {'Paolo Di Canio':'coffee-di-canio.jpg','Beppe Bergomi':'coffee-bergomi.jpg','Esteban Cambiasso':'coffee-cambiasso.jpg'}.get(n)
 image='<img src="'+e(img)+'" alt="'+e(n)+'">' if img else '<span class="initials">'+''.join(x[0] for x in n.split())+'</span>'
 if n in ['Paolo Di Canio','Beppe Bergomi','Esteban Cambiasso']: image='<span class="cast-photo">'+image+'</span>'
 return '<article class="voice"><header>'+image+'<div><strong>'+e(n)+'</strong><small>'+e(role)+'</small></div></header><p>'+e(text)+'</p></article>'
notes=[]
for g in groups:
 rows=g['rows'];first=rows[0];second=rows[1]
 notes.append(f"{name(first['team_id'])} guida con {first['points']} punti; {name(second['team_id'])} segue a {second['points']}. "+('Le prime due sono appaiate: ogni punto può cambiare l’ordine del girone. ' if first['points']==second['points'] else f"Il distacco fra le prime due è di {first['points']-second['points']} punti. ")+ 'Il cammino va letto anche attraverso le gare disputate, riportate nella classifica: nessuna qualificazione viene data per acquisita.')
body='<div class="cn"><header class="cn-title"><p>31 OTTOBRE 2026 · ORE 09:00 · GW001</p><h2>Il mondo nel caffè — Il giorno dopo</h2><p>Day After · Qualificazioni mondiali</p><div class="numbers"><b>32 partite</b><b>16 gironi</b><b>80 nazionali</b></div></header>'
body+=speech('Federica Zille','Conduzione','Buongiorno! Il mondo torna nel nostro caffè: 32 partite del 30 ottobre, sedici gironi e una domanda: chi ha avvicinato il Mondiale e chi deve rincorrere? Con Di Canio, Bergomi e Cambiasso partiamo dalle classifiche e raggiungiamo gli inviati dei nostri manager. Canada e Svizzera vincono 5–1, la Svezia passa in Egitto: ascoltiamo anche chi stamattina ha meno voglia di parlare.','assets/coffee-zille.webp')
body+='<div class="studio">'+speech('Paolo Di Canio','Prestazioni e protagonisti','Cinque gol di Canada e Svizzera sono un segnale, ma voglio vedere come quei risultati pesano nei rispettivi gironi. Il giorno dopo serve anche a evitare che una vittoria larga diventi un’autorizzazione a rallentare. Agli inviati chiedo domande concrete: da quale certezza ripartono i mister?')+speech('Beppe Bergomi','Difese ed equilibrio','Il 3–2 fra Russia e Marocco racconta una partita con cinque gol: per chi ha perso serve capire come ritrovare tenuta, per chi ha vinto come consolidare il risultato. Guardiamo i numeri disponibili senza attribuire ai punteggi episodi che non raccontano.')+speech('Esteban Cambiasso','Lettura tattica e gironi','La Svezia vince 3–1 in Egitto e mette un risultato importante sul tavolo. Ma il valore dei punti dipende anche da ciò che fanno le altre nazionali. Per questo apriamo ogni girone dalla classifica: entusiasmo e prudenza devono avere una ragione precisa.')+'</div>'
body+='<nav class="cn-tabs" aria-label="Gironi delle nazionali">'+''.join(f'<button type="button" data-group="{i}" aria-pressed="{str(i==0).lower()}">{e(g["group_name"])}</button>' for i,g in enumerate(groups))+'</nav>'
report_count=0
for i,g in enumerate(groups):
 rows=g['rows']; matches=[r for r in played if r['competition_group_name']==g['group_name']];assert len(matches)==2
 body+=f'<section class="cn-group" id="cn-group-{i}"'+(' hidden' if i else '')+'><h2>'+e(g['group_name'])+'</h2><p class="table-note">Classifica aggiornata al 30 ottobre · Gare disputate indicate nella colonna G</p><div class="table-wrap"><table><thead><tr><th>Pos.</th><th>Nazionale</th><th>Pt</th><th>G</th><th>V</th><th>N</th><th>P</th><th>GF</th><th>GS</th><th>DR</th></tr></thead><tbody>'
 for r in rows:
  body+='<tr><td>'+str(r['position'])+'</td><th scope="row">'+flag(r['team_id'])+e(name(r['team_id']))+'</th>'+''.join('<td>'+str(r[k])+'</td>' for k in ['points','played','won','drawn','lost','gf','ga','gd'])+'</tr>'
 body+='</tbody></table></div><article class="group-post"><span>IL POST DEL GIRONE</span><h3>'+e(g['group_name'])+' · Risultati e classifica</h3><p>'+e(notes[i])+'</p><ul>'
 for r in matches: body+='<li>'+e(name(r['home_sm_club_id']))+' '+str(r['home_score'])+'–'+str(r['away_score'])+' '+e(name(r['away_sm_club_id']))+'</li>'
 active={str(r[s+'_sm_club_id']) for r in matches for s in ['home','away']};rest=[r for r in rows if r['team_id'] not in active];body+='</ul><p>Turno di riposo: '+e(name(rest[0]['team_id']))+'.</p></article><h3>Il giorno dopo, dai campi</h3>'
 for r in matches:
  mr=read(str(r['sm_fixture_id'])).get('row');assert mr and mr['match_date']=='2026-10-30' and mr['home_score']==r['home_score'] and mr['away_score']==r['away_score'];report_count+=1
  st=json.loads(mr['team_stats_json']);players=json.loads(mr['players_json']);mvp=next((p for p in players if p.get('man_of_match')),None)
  h=name(r['home_sm_club_id']);a=name(r['away_sm_club_id']);body+='<article class="cn-match"><p class="match-kicker">DAL CAMPO · IL GIORNO DOPO</p><div class="scoreboard">'
  for side in ['home','away']:
   id=r[side+'_sm_club_id'];manager=r.get(side+'_imc_manager_name') or '';body+='<div>'+flag(id)+'<strong>'+e(name(id))+'</strong><small>'+e(manager)+'</small></div>'
   if side=='home':body+='<b class="score">'+str(r['home_score'])+'–'+str(r['away_score'])+'</b>'
  body+='</div><p class="scorers">'+e(' · '.join(str(x['minute'])+'′ '+x['player_name']+(' (aut.)' if x.get('own_goal') else '') for x in st.get('scorers',[])))+'</p>'
  for side,other in [('home','away'),('away','home')]:
   id=str(r[side+'_sm_club_id']);gf=r[side+'_score'];ga=r[other+'_score'];table=next(x for x in rows if x['team_id']==id);rep=by_manager.get(r.get(side+'_imc_manager_id'));s=st.get(side,{})
   rival=name(r[other+'_sm_club_id']); own=st.get(side,{}); opp=st.get(other,{})
   if gf>ga:
    text=f"{name(id)} supera {rival} {gf}–{ga}. "
    text+=('Una vittoria larga, da accompagnare però alla stessa attenzione nelle prossime uscite. ' if gf-ga>=3 else 'Tre punti preziosi in una partita che non lascia spazio per considerare scontato il risultato. ' if gf-ga==1 else 'Due gol di margine e una vittoria che dà peso al cammino nel girone. ')
   elif gf==ga:
    text=f"{name(id)} divide i punti con {rival}: {gf}–{ga}. "
    text+=('Il tabellino resta vuoto: una porta inviolata da conservare, ma anche il gol da ritrovare per cambiare passo. ' if gf==0 else 'Segnare tre volte non basta per vincere: il risultato mette al centro del confronto l’equilibrio tra ciò che si costruisce e ciò che si concede. ' if gf>=3 else 'Un punto che va letto insieme alla corsa delle rivali, senza confondere il pareggio con una giornata priva di conseguenze. ')
   else:
    text=f"{name(id)} cede {gf}–{ga} a {rival}. "
    text+=('Il margine è minimo, ma la classifica non fa sconti: resta una partita dalla quale cercare una risposta, senza fermarsi al dispiacere. ' if ga-gf==1 else 'Il punteggio impone una riflessione: servono risposte davanti e maggiore tenuta quando la partita si complica. ')
   if 'total_shots' in own and 'shots_on_target' in own:
    text+=f"Le conclusioni sono {own['total_shots']}, di cui {own['shots_on_target']} nello specchio"
    if 'shots_on_target' in opp: text+=f", contro le {opp['shots_on_target']} nello specchio dell’avversaria"
    text+='. '
   scorers=[p for p in players if p.get('team_side')==side and p.get('goals',0)>0]
   if scorers:text+='Il contributo al gol arriva da '+', '.join(p['player_name']+(' (doppietta)' if p['goals']==2 else ' (tripletta)' if p['goals']==3 else ' ('+str(p['goals'])+' gol)' if p['goals']>3 else '') for p in scorers)+'. '
   text+=f"La classifica ora dice {table['points']} punti."
   if rep:
    photo=old['reporter_portraits'].get(rep['name'],{}).get('image')
    first=(r.get(side+'_imc_manager_name') or 'Mister').split()[0]
    if gf>ga:
     question=f"{first}, oggi il caffè lo offri tu? Il {gf}–{ga} vi porta a {table['points']} punti: quale certezza vuoi conservare?"
     answer=f"Il risultato ci dà fiducia, ma voglio conservarne soprattutto la disponibilità a lavorare insieme. Abbiamo trovato {gf} gol: adesso serve continuità, senza pensare che la prossima partita riparta da questo vantaggio. Guardiamo la classifica con soddisfazione e con responsabilità."
    elif gf==ga:
     question=f"{first}, davanti a questo {gf}–{ga} ti chiedo una risposta sincera: qual è il passo in più che vuoi vedere?"
     answer='Voglio più continuità nelle scelte. '+('Non subire è una base, ma dobbiamo trovare più soluzioni per fare gol. ' if gf==0 else 'Siamo riusciti a segnare, ma non a fare la differenza nel risultato. ')+f"Siamo a {table['points']} punti: dobbiamo trasformare il lavoro in qualcosa di più, senza farci prendere dalla fretta."
    else:
     question=f"{first}, oggi niente domande di comodo: dopo il {gf}–{ga}, da dove ricominci con i ragazzi?"
     answer='Dalla responsabilità di guardare quello che non ha funzionato senza cercare scuse. '+('Il margine minimo lascia rimpianto, ma non ci restituisce punti. ' if ga-gf==1 else 'Il divario ci chiede una risposta collettiva, non un colpevole. ')+f"La classifica dice {table['points']} punti: voglio più aiuto reciproco e più lucidità nei momenti difficili."
    events=sorted(st.get('scorers',[]),key=lambda g:int(g['minute']))
    own_events=[g for g in events if g['team_side']==side]
    if own_events:
     event=own_events[-1];question+=f" E quanto pesa il gol di {event['player_name']} al {event['minute']}′ nella lettura della serata?"
     answer+=f" Il gol di {event['player_name']} è una delle cose da cui partire, insieme al lavoro di chi gli sta intorno."
    elif gf==0:
     question+=f" Avete chiuso con {own.get('shots_on_target',0)} tiri nello specchio: come si migliora l’efficacia?"
     answer+=' Dobbiamo accompagnare meglio chi riceve vicino all’area: non possiamo lasciare tutta la soluzione a un solo giocatore.'
    dialogues[id]=[question,answer]
    context=f"{name(id)} è {table['position']}ª nel girone con {table['points']} punti: {table['won']} {'vittoria' if table['won']==1 else 'vittorie'}, {table['drawn']} {'pareggio' if table['drawn']==1 else 'pareggi'} e {table['lost']} {'sconfitta' if table['lost']==1 else 'sconfitte'}."
    body+='<section class="touchline"><p class="segment-label">IL CAFFÈ CON IL MISTER</p>'+speech(rep['name'],name(id)+' · Il punto dal campo',text+' '+context,photo)
    body+='<div class="interview"><span class="interview-label">UNA DOMANDA, UNA RISPOSTA · DIALOGO NARRATIVO</span>'+speech(rep['name'],'La domanda',question,photo)+speech(r[side+'_imc_manager_name'],'CT '+name(id)+' · La risposta',answer)+'</div></section>'
   else:body+='<div class="team-summary"><h4>'+e(name(id))+'</h4><p>'+e(text)+'</p></div>'
  if mvp:body+='<p class="mvp">Migliore in campo: <strong>'+e(mvp['player_name'])+'</strong> · voto '+e(str(mvp.get('rating','—')))+'</p>'
  body+='<details><summary>I numeri della partita</summary><table class="stats"><tbody>'
  for key,label in [('possession','Possesso %'),('total_shots','Tiri'),('shots_on_target','Tiri nello specchio'),('corners','Calci d’angolo'),('yellow_cards','Ammonizioni'),('red_cards','Espulsioni')]:body+='<tr><td>'+str(st.get('home',{}).get(key,'—'))+'</td><th>'+label+'</th><td>'+str(st.get('away',{}).get(key,'—'))+'</td></tr>'
  body+='</tbody></table></details></article>'
 body+='</section>'
body+=speech('Federica Zille','Ci ritroviamo domattina','Il nostro giro del mondo finisce qui: tutti i risultati, le classifiche e le voci dei campi restano a disposizione. Chi ha vinto deve dare continuità, chi ha perso ha già una risposta da preparare. Ci ritroviamo domattina, sempre con Coffee Time su Nexus!','assets/coffee-zille.webp')+'</div>'
assert report_count==32
source=(P/'baseline.html').read_text();a=source.index('<section id="panel-coffee-time">');z=source.index('<section class="edition-archive">',a);source=source[:a]+'<section id="panel-coffee-time">'+body+'</section>'+source[z:]
source=source.replace('coffee-20261030.css?v=1','coffee-nations-20261031.css?v=1').replace('coffee-20261030.js?v=1','coffee-nations-20261031.js?v=1').replace('value="2026-10-30"','value="2026-10-31"').replace('Coffee Time · 30 ottobre','Coffee Time · 31 ottobre')
source=source.replace('<nav aria-label="Archivio Coffee Time">','<nav aria-label="Archivio Coffee Time"><a class="archive-link" href="/nexus/alltoplayfor/coffee-time/2026-10-31/">31 ottobre 2026</a>')
(O/'latest.html').write_text(source);(O/'edition.html').write_text(source.replace('data-edition=""','data-edition="2026-10-31"').replace('rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/"','rel="canonical" href="https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-time/2026-10-31/"'))
(P/'dialogues.json').write_text(json.dumps(dialogues,ensure_ascii=False,indent=2))
print('PASS 32 reports, 80 table rows reconciled, 16 groups, interviews',len(dialogues))
