import json,hashlib
from pathlib import Path
from stories import STORIES
P=Path(__file__).parent
keys=['game_world_id','sm_fixture_id','match_date','home_sm_club_id','away_sm_club_id','home_score','away_score','penalty_home_score','penalty_away_score','team_stats_json','players_json','events_json','tactics_json']
for fid,story in STORIES.items():
 row=json.loads((P/'evidence'/f'{fid}.json').read_text())['row']
 evidence=json.dumps([row.get(k) for k in keys],ensure_ascii=False,separators=(',',':'))
 story['signature']=hashlib.sha256(evidence.encode()).hexdigest()
 assert len(story['blocks'])>=25
 for side in ['home','away']:
  assert sum(b['speaker']==side+'_question' for b in story['blocks'])==4
  assert sum(b['speaker']==side+'_manager' for b in story['blocks'])==4
s=(P/'base.js').read_text()
a=s.index('  function commentary(m) {');b=s.index("  if (typeof module",a)
s=s[:a]+'  const EDITORIAL='+json.dumps(STORIES,ensure_ascii=False,separators=(',',':'))+';\n'+(P/'engine.js').read_text()+'\n'+s[b:]
s=s.replace('module.exports = { buildMatch, commentary, validRow }','module.exports = { buildMatch, commentary, validRow, attachEditorial, approvedStory, automaticStory }')
s=s.replace("m.error=r.some(x=>x.status==='rejected');return m;","m.error=r.some(x=>x.status==='rejected');await attachEditorial(m);return m;")
# Replace repetitive global studio summaries with one programme introduction.
a=s.index("    if(coffee.mode!=='schedule-preview') {");b=s.index("    const nav =",a)
s=s[:a]+'''    root.append(speech(...cast[0], reports ? `Benvenuti a Final Whistle. Ritroviamo le ${matches.length} partite di Coffee Time: ${reports} Match Report sono disponibili. Per ogni gara, gli inviati entrano negli episodi con i due allenatori; poi torniamo in studio per il confronto tecnico.` : `Benvenuti a Final Whistle. Le ${matches.length} partite e gli inviati di Coffee Time sono pronti: aspettiamo i Match Report per aprire gli approfondimenti e le interviste ai due allenatori.`));
'''+s[b:]
s=s.replace("        card.append(teams,el('p',", "        const editorial=approvedStory(m);\n        if(editorial)card.append(el('h3',editorial.title,'fw-story-title'));\n        card.append(teams,el('p',")
s=s.replace("        if(m.conflict)","        const penalties=editorial?.penalties || (number(m.row?.penalty_home_score)!==null && number(m.row?.penalty_away_score)!==null ? [m.row.penalty_home_score,m.row.penalty_away_score] : null);\n        if(penalties)card.append(el('p',`Rigori: ${penalties[0]}–${penalties[1]}`,'fw-penalties'));\n        if(m.conflict)")
s=s.replace("        if(m.report) {\n          const goals", "        if(m.report) {\n          const details=el('details',null,'fw-report-details');details.append(el('summary','Tabellino, statistiche e migliore in campo'));card.append(details);\n          const goals")
s=s.replace('for(const g of m.goals)', 'for(const g of [...m.goals].sort((a,b)=>Number(a.minute)-Number(b.minute)))')
s=s.replace('if(m.goals.length) card.append(goals);','if(m.goals.length) details.append(goals);').replace('card.append(table);','details.append(table);').replace('card.append(award);','details.append(award);')
s=s.replace("for(const line of (m.report?commentary(m):[])) card.append(speech(line.name,line.role,line.text));", "for(const line of commentary(m)) {const block=speech(line.name,line.role,line.text);block.classList.add('fw-'+line.kind);card.append(block);}")
(P/'final-whistle.js').write_text(s)
html=(P/'base.html').read_text().replace('final-whistle.js?v=20261027-linked','final-whistle.js?v=20261027-editorial')
html=html.replace('</head>','''<style>.fw-story-title{text-align:center;font-size:clamp(1.3rem,4vw,1.9rem);margin:1rem 0 1.5rem}.fw-question{border-left:3px solid #d7b46a!important}.fw-answer{background:rgba(215,180,106,.07)!important}.fw-answer .fw-person strong{color:#e9cb89}.fw-report-details{margin:1rem 0 1.5rem}.fw-report-details summary{cursor:pointer;text-align:center;padding:.8rem;font-weight:700}.fw-penalties{text-align:center;font-weight:700;color:#e9cb89}.fw-speech p{line-height:1.75}</style></head>''')
(P/'index.html').write_text(html)
print('Compiled 4 editorial matches, 8 interviews, 32 questions and answers')
