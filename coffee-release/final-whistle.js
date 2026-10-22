/* Final Whistle: read-only, date-scoped editions sourced from Coffee Time and Nexus. */
(function () {
  'use strict';
  const cast = [['Federica Masolin', 'Conduzione'], ['Paolo Condò', 'Il contesto'], ['Billy Costacurta', 'Analisi difensiva'], ['Alex Del Piero', 'Analisi offensiva']];
  const number = value => value !== null && value !== '' && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : null;
  const parse = (value, fallback) => { try { return typeof value === 'string' ? JSON.parse(value) : value || fallback; } catch { return fallback; } };
  function validRow(row, fixture, date) {
    return row && row.game_world_id === 'GW001' && String(row.sm_fixture_id) === String(fixture.id) && row.match_date === date &&
      String(row.home_sm_club_id) === String(fixture.home_table.id) && String(row.away_sm_club_id) === String(fixture.away_table.id);
  }
  function buildMatch(fixture, date, results, report) {
    const result = (results?.results || []).find(r => validRow(r, fixture, date) && r.result_status === 'COMPLETED');
    const mr = report?.ok && validRow(report.row, fixture, date) ? report.row : null;
    const complete = r => r && number(r.home_score) !== null && number(r.away_score) !== null && number(r.home_score) >= 0 && number(r.away_score) >= 0;
    const row = complete(mr) ? mr : complete(result) ? result : null;
    const rawStats = mr && row === mr ? parse(mr.team_stats_json, {}) : {};
    const stats = rawStats && typeof rawStats === 'object' && !Array.isArray(rawStats) ? rawStats : {};
    const players = mr && row === mr ? parse(mr.players_json, []) : [];
    return { fixture, row, report: !!(mr && row === mr), stats, players: Array.isArray(players) ? players : [],
      goals: Array.isArray(stats.scorers) ? stats.scorers : [],
      conflict: !!(complete(mr) && complete(result) && (Number(mr.home_score) !== Number(result.home_score) || Number(mr.away_score) !== Number(result.away_score))) };
  }
  function commentary(m) {
    const f = m.fixture, r = m.row;
    if (!r) return [];
    const h = Number(r.home_score), a = Number(r.away_score), score = `${h}–${a}`;
    const result = h === a ? `${f.home} e ${f.away} chiudono sul ${score}: un punto per parte.` : `${h > a ? f.home : f.away} conquista i tre punti: ${f.home}–${f.away} finisce ${score}.`;
    const lines = [{ name: cast[0][0], role: cast[0][1], text: `${result} Andiamo dagli inviati delle due squadre.` }];
    for (const rep of f.reporters || []) {
      const side = rep.side, gf = side === 'home' ? h : a, ga = side === 'home' ? a : h;
      const team = f[side], manager = f[side + '_manager'];
      if (!team) continue;
      const scorers = m.goals.filter(g => g.team_side === side).map(g => `${g.player_name}${g.own_goal ? ' (autorete)' : ''}${g.minute != null ? ' al '+g.minute+'′' : ''}`);
      lines.push({name: rep.name, role: `${rep.club} · ${rep.label || 'Inviato'}`, text:
        `${team}${manager ? ', guidata da '+manager+',' : ''} ${gf > ga ? 'vince' : gf < ga ? 'perde' : 'pareggia'}: ${gf} gol fatti e ${ga} subiti. ` +
        (scorers.length ? `Il tabellino riporta: ${scorers.join(', ')}.` : m.report ? 'Entriamo nei dati del Match Report per approfondire la prestazione.' : 'Attendiamo il Match Report per ricostruire marcatori e andamento della gara.')});
    }
    const beforeH = number(f.home_table.points), beforeA = number(f.away_table.points);
    lines.push({name: cast[1][0], role: cast[1][1], text: beforeH !== null && beforeA !== null ?
      `Coffee Time presentava ${f.home} a ${beforeH} punti e ${f.away} a ${beforeA}. Il risultato di questa partita porta rispettivamente a ${beforeH + (h > a ? 3 : h === a ? 1 : 0)} e ${beforeA + (a > h ? 3 : h === a ? 1 : 0)} punti, partendo da quella fotografia. Per assegnare le posizioni occorre considerare tutti gli incontri e gli eventuali recuperi.` : result});
    if (!m.report) return lines;
    const hs = m.stats.home || {}, as = m.stats.away || {};
    const hot = number(hs.shots_on_target), aot = number(as.shots_on_target);
    let defence = h === 0 && a === 0 ? 'Entrambe le squadre chiudono senza subire gol.' : h === 0 ? `${f.away} mantiene la porta inviolata.` : a === 0 ? `${f.home} mantiene la porta inviolata.` : `Nessuna porta inviolata: ${f.home} incassa ${a} gol, ${f.away} ne incassa ${h}.`;
    if (hot !== null && aot !== null) defence += ` Le conclusioni nello specchio sono ${hot} per ${f.home} e ${aot} per ${f.away}: questo è il dato da affiancare al risultato per valutare il lavoro difensivo.`;
    lines.push({name: cast[2][0], role: cast[2][1], text: defence});
    const mvp = m.players.find(p => Number(p.man_of_match) === 1);
    const scorers = m.players.filter(p => number(p.goals) > 0).map(p => `${p.player_name} (${p.goals} gol)`);
    let attack = scorers.length ? `I realizzatori nel report sono ${scorers.join(', ')}.` : `Il risultato offensivo è di ${h} gol per ${f.home} e ${a} per ${f.away}.`;
    if (mvp) attack += ` Il migliore in campo indicato è ${mvp.player_name}${number(mvp.rating) !== null ? ', voto '+mvp.rating : ''}.`;
    if (number(hs.total_shots) !== null && number(as.total_shots) !== null) attack += ` I tiri complessivi sono ${hs.total_shots} a ${as.total_shots}; il volume delle conclusioni, da solo, non descrive la qualità delle occasioni.`;
    lines.push({name: cast[3][0], role: cast[3][1], text: attack});
    return lines;
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { buildMatch, commentary, validRow }; return; }
  const panel = document.getElementById('panel-final-whistle'), dateInput = document.getElementById('date');
  if (!panel || !dateInput) return;
  const root = document.createElement('section'); root.className = 'fw-edition'; panel.append(root);
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text != null) n.textContent = text; if (cls) n.className = cls; return n; };
  let generation = 0, controller, selected = 0, state = null, portraits = {}, busy = false, lastSignature = '';
  const oldEmpty = panel.querySelector('.programme-empty');
  function visibility() {
    const archived = dateInput.value === '2026-10-20'; root.hidden = archived;
    if (oldEmpty) oldEmpty.hidden = true;
  }
  function photo(src, name, cls) { const img = el('img', null, cls); img.src = src; img.alt = name; img.loading = 'lazy'; img.addEventListener('error', () => { img.hidden = true; }); return img; }
  function speech(name, role, text) {
    const box = el('article', null, 'fw-speech'), head = el('header', null, 'fw-person');
    const p = state?.coffee.reporter_portraits?.[name]?.image || portraits[name]?.url;
    if (p) head.append(photo(p, name));
    head.append(el('strong', name), el('small', role)); box.append(head, el('p', text)); return box;
  }
  function choose(index) {
    selected = index;
    root.querySelectorAll('[role=tab]').forEach((b,i) => { b.setAttribute('aria-selected', String(i === index)); b.tabIndex = i === index ? 0 : -1; });
    root.querySelectorAll('[role=tabpanel]').forEach((p,i) => p.hidden = i !== index);
  }
  function render() {
    root.replaceChildren(); if (!state) return;
    const {coffee, matches, errors, checked} = state, completed = matches.filter(m => m.row).length, reports = matches.filter(m => m.report).length;
    const title = el('header', null, 'fw-title'); title.append(el('p', `${coffee.date} · GW001 · CAMPIONATO · GIORNATA ${coffee.day}`, 'eyebrow'), el('h2', 'Final Whistle'), el('p', `${completed}/${matches.length} risultati · ${reports}/${matches.length} Match Report`)); root.append(title);
    const update = el('div', null, 'fw-update'), message = el('p', `Dati verificati alle ${checked}. Aggiornamento automatico ogni 2 minuti mentre questa sezione è aperta.`), refresh = el('button', 'Aggiorna adesso'); refresh.type = 'button'; refresh.addEventListener('click', () => load(false)); update.append(message, refresh); root.append(update);
    if (errors) root.append(el('p', 'Alcune fonti non sono raggiungibili. I dati non verificabili sono segnalati nei singoli incontri; riproveremo al prossimo aggiornamento.', 'fw-warning'));
    if(coffee.mode!=='schedule-preview') {
    root.append(speech(...cast[0], completed ? `Buonasera, ritroviamo le ${matches.length} partite presentate da Coffee Time. Sono disponibili ${completed} risultati e ${reports} Match Report. Entriamo nelle divisioni per leggere i dati e collegarci con gli stessi inviati.` : `Benvenuti a Final Whistle. Lo studio è pronto per le ${matches.length} partite presentate da Coffee Time. I risultati non sono ancora disponibili: questa edizione si aggiornerà quando saranno caricati su Nexus.`));
    if (completed) {
      const played=matches.filter(m=>m.row), goals=played.reduce((n,m)=>n+Number(m.row.home_score)+Number(m.row.away_score),0), clean=played.reduce((n,m)=>n+Number(Number(m.row.home_score)===0)+Number(Number(m.row.away_score)===0),0);
      const mvps=matches.flatMap(m=>m.players.filter(p=>Number(p.man_of_match)===1)).map(p=>p.player_name);
      root.append(speech(...cast[1], `Nei ${completed} risultati disponibili contiamo ${goals} gol. ${completed===matches.length ? 'Il quadro dei risultati è completo.' : 'Il quadro resta parziale: attendiamo gli altri incontri.'} Negli approfondimenti riprenderemo i punti di partenza raccontati da Coffee Time.`), speech(...cast[2], `Le porte inviolate nei risultati disponibili sono ${clean}. Nei singoli Match Report confronteremo questo dato con tiri e conclusioni nello specchio concessi.`), speech(...cast[3], mvps.length ? `Tra i migliori in campo già indicati nei report troviamo ${mvps.join(', ')}. Vediamo nelle singole partite come si accompagnano a gol e produzione offensiva.` : 'Aspettiamo i riconoscimenti dei migliori in campo nei Match Report. Il risultato è il primo dato: l’analisi degli attaccanti richiede anche il dettaglio delle prestazioni.'));
    }
    if (!completed) {
      root.append(speech(...cast[1], 'Ripartiremo dal quadro presentato questa mattina e dai risultati effettivamente importati: soltanto allora potremo valutare i punti conquistati dalle squadre.'), speech(...cast[2], 'Per l’analisi difensiva aspettiamo i Match Report: gol subiti e conclusioni concesse ci daranno i primi elementi concreti.'), speech(...cast[3], 'Marcatori e migliori in campo entreranno nel racconto appena disponibili. Intanto potete scegliere la divisione e ritrovare gli incontri di Coffee Time.'));
    }
    }
    const nav = el('nav', null, 'fw-tabs'); nav.setAttribute('role','tablist'); nav.setAttribute('aria-label','Divisioni Final Whistle');
    coffee.divisions.forEach((d,i) => { const b = el('button', d.name.replace(/^Div\s*/, 'Divisione ')); b.type = 'button'; b.id = 'fw-tab-'+i; b.setAttribute('role','tab'); b.setAttribute('aria-controls','fw-division-'+i); b.addEventListener('click',()=>choose(i)); nav.append(b); });
    nav.addEventListener('keydown', e => { let n=selected; if(e.key==='ArrowRight') n=(n+1)%coffee.divisions.length; else if(e.key==='ArrowLeft') n=(n+coffee.divisions.length-1)%coffee.divisions.length; else if(e.key==='Home') n=0; else if(e.key==='End') n=coffee.divisions.length-1; else return; e.preventDefault(); choose(n); nav.children[n].focus(); }); root.append(nav);
    for (const [i,d] of coffee.divisions.entries()) {
      const section=el('section',null,'fw-division'); section.id='fw-division-'+i; section.setAttribute('role','tabpanel'); section.setAttribute('aria-labelledby','fw-tab-'+i); section.append(el('h2',d.name));
      for (const f of d.fixtures) {
        const m=matches.find(m=>String(m.fixture.id)===String(f.id)), card=el('article',null,'fw-match'); card.id='fw-match-'+f.id; card.dataset.fixture=f.id;
        const teams=el('div',null,'fw-scoreboard');
        for(const side of ['home','away']) { const t=el('div',null,'fw-team'); t.append(photo(f[side+'_logo'],''),el('strong',f[side]),el('small',f[side+'_manager'])); teams.append(t); if(side==='home') teams.append(el('strong',m.row ? `${m.row.home_score}–${m.row.away_score}` : '–','fw-score')); }
        card.append(teams,el('p', m.error ? 'Verifica incompleta: fonte temporaneamente non disponibile.' : m.report ? 'Risultato e Match Report disponibili' : m.row ? 'Risultato disponibile · Match Report in attesa' : 'In attesa del risultato · Ore '+(f.time||'da confermare'),'fw-status'));
        if(m.conflict) card.append(el('p','Results e Match Report riportano punteggi diversi: viene mostrato il Match Report, fonte prioritaria.','fw-warning'));
        if(m.report) {
          const goals=el('div',null,'fw-goals'); for(const g of m.goals) goals.append(el('p',`${g.minute ?? '–'}′ · ${g.player_name}${g.own_goal ? ' (autorete)' : ''} · ${f[g.team_side] || ''}`));
          if(m.goals.length) card.append(goals);
          const table=el('table'), cap=el('caption','I numeri della partita'); table.append(cap); const body=el('tbody');
          for(const [key,label] of [['possession','Possesso %'],['total_shots','Tiri'],['shots_on_target','Nello specchio'],['corners','Corner'],['red_cards','Espulsioni']]) {const tr=el('tr'),th=el('th',label);th.scope='row';tr.append(el('td',m.stats.home?.[key]??'–'),th,el('td',m.stats.away?.[key]??'–'));body.append(tr);} table.append(body); card.append(table);
          const mvp=m.players.find(p=>Number(p.man_of_match)===1); if(mvp) {const award=el('aside',null,'fw-mvp'); if(/^\d+$/.test(String(mvp.sm_player_id))) award.append(photo('https://cdn.soccerwiki.org/images/player/'+mvp.sm_player_id+'.png',mvp.player_name)); award.append(el('small','MIGLIORE IN CAMPO'),el('strong',mvp.player_name),el('span','Voto '+(mvp.rating??'non disponibile'))); card.append(award);}
        }
        for(const line of (coffee.mode==='schedule-preview'?[]:commentary(m))) card.append(speech(line.name,line.role,line.text));
        if(coffee.mode!=='schedule-preview'&&!m.row) card.append(el('p',(f.reporters||[]).map(r=>`${r.name} · ${r.club} · ${r.label}`).join(' | '),'fw-correspondents'));
        const links=el('div',null,'fw-links'); const sources=[['Coffee Time',`?section=coffee-time&date=${coffee.date}`],['Results',`/nexus/teams/matches.php?world=GW001&sm_club=${f.home_table.id}`]]; if(m.report) sources.push(['Match Report',`/nexus/competitions/match-report.php?world=GW001&fixture=${f.id}`]); for(const [label,href] of sources){const a=el('a',label);a.href=href;links.append(a);}card.append(links);section.append(card);
      }
      root.append(section);
    }
    choose(Math.min(selected,coffee.divisions.length-1));
  }
  async function json(url, signal) {
    const response=await fetch(url+(url.includes('?')?'&':'?')+'_fw='+Date.now(),{cache:'no-store',signal});
    if(response.status===404) return null;
    if(!response.ok) throw Error('Fonte non disponibile'); const data=await response.json(); if(data?.ok===false) throw Error('Fonte non disponibile'); return data;
  }
  async function pool(items, fn) {const out=new Array(items.length);let cursor=0;await Promise.all(Array.from({length:Math.min(4,items.length)},async()=>{while(cursor<items.length){const i=cursor++;out[i]=await fn(items[i]);}}));return out;}
  async function load(reset=true) {
    visibility(); if(root.hidden || panel.hidden || (!reset && busy)) return;
    const date=dateInput.value; if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    controller?.abort(); controller=new AbortController();const signal=controller.signal,token=++generation;busy=true;
    if(reset){state=null;lastSignature='';selected=0;root.replaceChildren(el('p','Caricamento della giornata di Final Whistle…'));}
    const timeout=setTimeout(()=>controller && token===generation && controller.abort(),60000);
    try {
      const coffee=await json(`${date}-coffee.json`,signal);
      if(!coffee){root.replaceChildren(el('p','Nessuna edizione di Coffee Time disponibile per questa data. Final Whistle seguirà le partite quando sarà pubblicata.'));return;}
      if(coffee.date!==date || coffee.world!=='GW001' || !Array.isArray(coffee.divisions) || !coffee.divisions.length) throw Error('Edizione Coffee Time non valida');
      const seen=new Set();for(const d of coffee.divisions)for(const f of d.fixtures){if(!/^\d+$/.test(String(f.id))||!f.home_table?.id||!f.away_table?.id||seen.has(String(f.id)))throw Error('Partite non valide');seen.add(String(f.id));}
      const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
      if(coffee.mode==='schedule-preview' && date>today){
        state={coffee,matches:coffee.divisions.flatMap(d=>d.fixtures).map(f=>buildMatch(f,date,null,null)),errors:false,checked:new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit'}).format(new Date())};
        render();return;
      }
      portraits=await json('portraits.json',signal)||{};
      const matches=await pool(coffee.divisions.flatMap(d=>d.fixtures),async f=>{
        const r=await Promise.allSettled([json(`/nexus/teams/matches.php?world=GW001&sm_club=${f.home_table.id}`,signal),json(`/nexus/competitions/match-report.php?world=GW001&fixture=${f.id}`,signal)]);
        const m=buildMatch(f,date,r[0].status==='fulfilled'?r[0].value:null,r[1].status==='fulfilled'?r[1].value:null);m.error=r.some(x=>x.status==='rejected');return m;
      });
      if(token!==generation || date!==dateInput.value) return;
      if(signal.aborted) throw Error('Verifica scaduta');
      state={coffee,matches,errors:matches.some(m=>m.error),checked:new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit'}).format(new Date())};
      const signature=JSON.stringify([coffee,matches]);
      if(signature!==lastSignature){lastSignature=signature;render();}
      else {const p=root.querySelector('.fw-update p');if(p)p.textContent=`Dati verificati alle ${state.checked}. Aggiornamento automatico ogni 2 minuti mentre questa sezione è aperta.`;}
    } catch(error) {
      if(token!==generation) return;
      if(state){const message=root.querySelector('.fw-update p');if(message)message.textContent='Aggiornamento non riuscito: restano visibili i dati dell’ultima verifica. Riproveremo automaticamente.';}
      else root.replaceChildren(el('p','Impossibile verificare i dati Nexus. Riproveremo automaticamente; puoi anche ricaricare la pagina.','fw-warning'));
    } finally {clearTimeout(timeout);if(token===generation)busy=false;}
  }
  document.addEventListener('programme-date-change',()=>{controller?.abort();++generation;busy=false;visibility();load(true);});
  document.addEventListener('postmatch-ready',visibility);
  new MutationObserver(()=>{if(!panel.hidden)load(true);}).observe(panel,{attributes:true,attributeFilter:['hidden']});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)load(false);});
  setInterval(()=>{if(!document.hidden)load(false);},120000);
  const url=new URL(location.href);
  if(url.searchParams.get('section')==='final-whistle' && !url.searchParams.has('date')) {dateInput.value=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());dateInput.dispatchEvent(new Event('change'));}
  else load(true);
})();
