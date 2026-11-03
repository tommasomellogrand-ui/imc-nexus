body+='<section class="smfa"><header class="cn-title"><h2>Il giorno dopo europeo</h2><p>Coppe SMFA · Quarti di finale, andata · 2 novembre</p></header>'
comments={369169695:'Aston Villa e Chelsea restano in equilibrio: il ritorno dovrà sciogliere l’1–1 dell’andata.',369169694:'L’Atalanta costruisce un vantaggio di cinque gol sul Liverpool: una posizione forte da difendere nel ritorno, senza considerare chiuso il confronto.',369169693:'Il Torino batte la Juventus 4–1: tre gol di margine e una prova che dà fiducia in vista del ritorno.',369169692:'Il Tottenham supera lo United 4–1 e porta questa fiducia nella semifinale di coppa di stasera. Sono però due competizioni diverse: contro il Kaiserslautern si riparte da zero.',369169703:'Il Palermo passa 2–1 sul campo del 1860 München: un gol separa le due squadre, con un ritorno ancora tutto da giocare.',369169702:'AEK e Brighton chiudono 1–1: nessun margine nel risultato dell’andata, confronto aperto.',369169701:'Il Dresden supera il Nottingham Forest 2–0: due gol di vantaggio e porta inviolata da portare al ritorno.',369169700:'Il Dortmund batte la Real Sociedad 2–1: vantaggio minimo, servirà un’altra prestazione attenta.'}
count=0
for prefix,label in [('smfacup','SMFA Champions Cup'),('smfashield','SMFA Shield')]:
 body+='<h2>'+label+'</h2>'
 for r in read(prefix+'-results')['rows']:
  if r['match_date']!='2026-11-02':continue
  count+=1;mr=read(str(r['sm_fixture_id']))['row'];assert mr and mr['home_score']==r['home_score'] and mr['away_score']==r['away_score']
  st=json.loads(mr['team_stats_json']);players=json.loads(mr['players_json']);mvp=next((p for p in players if p.get('man_of_match')),None)
  body+='<article class="cn-match smfa-match">'+clubscore(r)+'<p>'+e(comments[r['sm_fixture_id']])+'</p><p class="scorers">'+e(' · '.join(str(g['minute'])+'′ '+g['player_name'] for g in st.get('scorers',[])))+'</p>'
  if mvp:body+='<p class="mvp">Migliore in campo: <strong>'+e(mvp['player_name'])+'</strong> · voto '+str(mvp['rating'])+'</p>'
  returns=[s for s in read(prefix+'-schedule')['rows'] if s['match_date']>'2026-11-02' and s['home_sm_team_id']==r['away_sm_club_id'] and s['away_sm_team_id']==r['home_sm_club_id']]
  if returns:
   s=sorted(returns,key=lambda x:x['match_date'])[0];body+='<p>Ritorno: '+e(s['home_name'])+'–'+e(s['away_name'])+' · '+e(s['match_date'])+' · '+e(s['match_time'][:5])+'</p>'
  body+='</article>'
assert count==8
body+='</section>'
