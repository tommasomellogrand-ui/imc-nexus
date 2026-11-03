semis=[r for r in read('cup-schedule-new')['rows'] if r['match_date']=='2026-11-03'];assert len(semis)==2
cup_dialogues={
'94079171':('Tommy, dopo il ko con il Campobasso torna la coppa. Ci avevi detto che volevi alzarla: davanti al Celtic e alla bolgia dell’Olympiastadion, quella promessa pesa?','Resta il nostro obiettivo, Giorgia. La sconfitta in campionato brucia, ma stasera voglio trasformare quella rabbia in attenzione. Il Celtic merita rispetto: non possiamo chiedere allo stadio di giocare al posto nostro. Dobbiamo trascinarlo con le nostre scelte, senza farci prendere dalla fretta. Vogliamo la finale, poi penseremo al resto.'),
'94079188':('Simone, a Palermo avete vinto 3–1 e ora vi aspetta l’Olympiastadion. Tommy parla già di alzare la coppa: sei venuto a rovinargli la serata?','Nicola, siamo venuti per provarci fino in fondo! Il 3–1 di Palermo ci ha portati qui, non ci regala niente stasera. L’Hertha ha qualità e avrà lo stadio dalla sua: dobbiamo restare dentro la partita anche quando spingeranno. Rispettiamo l’ambizione di Tommy, ma abbiamo la nostra.'),
'94078847':('Max, prima il 3–0 al Legia nei quarti, poi ieri il 4–1 al Manchester United. Come eviti che tutta questa fiducia diventi la convinzione di avere già la finale in tasca?','Massimo, ricordando che ogni partita riparte da zero. Ieri abbiamo fatto un bel passo in Europa, oggi il Kaiserslautern ci mette davanti un’altra prova. Ha superato la Roma ai rigori e sa restare in partita. Voglio entusiasmo nelle giocate e disciplina quando dobbiamo difendere: nessuno ci consegnerà la finale.'),
'94079172':('Vardan, la Roma l’avete superata 5–4 ai rigori dopo l’1–1. Ora un Tottenham che ieri ha segnato quattro volte allo United: servirà un’altra prova di nervi?','Giorgia, servirà soprattutto una prova di squadra. I rigori ci hanno dato una gioia enorme, ma non possiamo costruire la semifinale sull’idea di arrivare di nuovo lì. Il Tottenham arriva con fiducia: noi dobbiamo essere lucidi, aiutarci e riconoscere i momenti in cui provare a fare male. Siamo qui per giocarcela.')}
def clubscore(r,scheduled=False):
 b='<div class="scoreboard">'
 for side in ['home','away']:
  b+='<div><img class="flag" src="'+e(r[side+'_logo_url'])+'" alt=""><strong>'+e(r[side+'_name'])+'</strong><small>'+e(r.get(side+'_imc_manager_name') or '')+'</small></div>'
  if side=='home':b+='<b class="score">'+('20:00' if scheduled else str(r['home_score'])+'–'+str(r['away_score']))+'</b>'
 return b+'</div>'
body+='<section class="cup-preview"><header class="cn-title"><h2>Stasera si sceglie la finale</h2><p>3 novembre · Semifinali di coppa · Ore 20:00</p></header>'
for r in semis:
 body+='<article class="cn-match semi" data-fixture="'+str(r['sm_fixture_id'])+'">'+clubscore(r,True)
 body+='<p>'+('All’Olympiastadion: Hertha qualificato con il 4–1 al Parma, Celtic con il 3–1 a Palermo.' if r['home_sm_team_id']==94079171 else 'Tottenham qualificato con il 3–0 al Legia; Kaiserslautern avanti dopo l’1–1 con la Roma e il 5–4 ai rigori.')+'</p>'
 for side in ['home','away']:
  tid=str(r[side+'_sm_team_id']);rep=reps[tid];q,a=cup_dialogues[tid];photo=old['reporter_portraits'].get(rep['name'],{}).get('image')
  body+='<div class="interview">'+speech(rep['name'],r[side+'_name']+' · La domanda',q,photo)+speech(r[side+'_imc_manager_name'],'La risposta',a)+'</div>'
 body+='</article>'
body+='</section>'
# Source consumed by the existing Final Whistle automation.
legacy=json.loads(Path('coffee-20261101/dist/2026-11-01-coffee.json').read_text());legacy.update(date='2026-11-03',day=None,title='Il caffè delle finaliste',label='3 NOVEMBRE 2026 · SEMIFINALI DI COPPA',divisions=[])
fixtures=[]
for r in semis:
 f=dict(id=r['sm_fixture_id'],match_date=r['match_date'],date=r['match_date'],competition_key=r['competition_key'],sm_action=r['sm_action'],time='20:00',reporters=[])
 for side in ['home','away']:
  tid=str(r[side+'_sm_team_id']);f[side]=r[side+'_name'];f[side+'_table']={'id':int(tid)};f[side+'_logo']=r[side+'_logo_url'];f[side+'_manager']=r[side+'_imc_manager_name'];f['reporters'].append(dict(name=reps[tid]['name'],side=side,club=r[side+'_name'],club_id=int(tid),label='Inviato'))
 fixtures.append(f)
legacy['divisions']=[dict(name='Semifinali di coppa',fixtures=fixtures)];(O/'2026-11-03-coffee.json').write_text(json.dumps(legacy,ensure_ascii=False,indent=2))
