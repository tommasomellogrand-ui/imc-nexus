  function reportEvidence(row) {
    return JSON.stringify(['game_world_id','sm_fixture_id','match_date','home_sm_club_id','away_sm_club_id','home_score','away_score','penalty_home_score','penalty_away_score','team_stats_json','players_json','events_json','tactics_json'].map(k=>row[k]??null));
  }
  async function attachEditorial(m) {
    if(!m.report)return m;
    const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(reportEvidence(m.row)));
    m.reportSignature=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
    return m;
  }
  function approvedStory(m) {
    const s=EDITORIAL[String(m.fixture.id)];
    return m.report && s?.signature===m.reportSignature ? s : null;
  }
  function voiced(m,b) {
    const f=m.fixture, studio={studio:0,context:1,defence:2,attack:3};
    if(b.speaker in studio){const person=cast[studio[b.speaker]];return {name:person[0],role:person[1],text:b.text,kind:b.speaker};}
    const side=b.speaker.startsWith('home_')?'home':'away';
    if(b.speaker.endsWith('_manager'))return {name:f[side+'_manager']||'Allenatore '+f[side],role:f[side]+' · La risposta',text:b.text,kind:'answer'};
    const rep=(f.reporters||[]).find(r=>r.side===side);
    return {name:rep?.name||'Inviato '+f[side],role:f[side]+(b.speaker.endsWith('_question')?' · La domanda':' · Bordo campo'),text:b.text,kind:b.speaker.endsWith('_question')?'question':'reporter'};
  }
  // Same editorial structure for new reports: both touchlines, both managers,
  // then distinct studio analysis. Only normalized scorers count as goals;
  // the raw event_type can incorrectly label saves, offsides or shootouts.
  function automaticStory(m) {
    const f=m.fixture,r=m.row,h=Number(r.home_score),a=Number(r.away_score);
    const goals=[...m.goals].sort((x,y)=>Number(x.minute)-Number(y.minute));
    const tactics=parse(r.tactics_json,[]), events=parse(r.events_json,[]);
    const first=goals[0],last=goals.at(-1),mvp=m.players.find(p=>Number(p.man_of_match)===1);
    const ph=number(r.penalty_home_score),pa=number(r.penalty_away_score);
    const penaltyText=ph!==null&&pa!==null?` Ai rigori ${ph}–${pa}.`:'';
    const opening=first?`La prima svolta è il gol di ${first.player_name} al ${first.minute}′.`:'Nessun gol separa le due squadre: la lettura della partita passa dalle occasioni e dalla tenuta difensiva.';
    const blocks=[{speaker:'studio',text:`${f.home}–${f.away} finisce ${h}–${a}.${penaltyText} ${opening} Andiamo dai due inviati per capire le scelte degli allenatori e i passaggi che hanno pesato sul risultato.`}];
    for(const side of ['home','away']) {
      const other=side==='home'?'away':'home',gf=side==='home'?h:a,ga=side==='home'?a:h;
      const own=goals.filter(g=>g.team_side===side),conceded=goals.filter(g=>g.team_side===other),s=m.stats[side]||{},against=m.stats[other]||{};
      const t=Array.isArray(tactics)?tactics.find(t=>t.team_side===side&&Number(t.snapshot_minute)===0):null;
      const landmark=conceded[0]||own[0];
      let reading=gf>ga?'Il risultato premia la squadra, ma va letto distinguendo ciò che ha costruito da ciò che ha concesso.':gf<ga?'La sconfitta va analizzata nelle due aree: nelle occasioni non sfruttate e nelle azioni che hanno portato ai gol avversari.':'Il risultato lascia entrambe le squadre a interrogarsi sulle occasioni che avrebbero potuto fare la differenza.';
      if(number(s.total_shots)!==null&&number(s.shots_on_target)!==null)reading+=` ${f[side]} ha concluso ${s.total_shots} volte, ${s.shots_on_target} nello specchio: il rapporto fra questi due numeri aiuta a leggere la precisione, senza attribuire automaticamente lo stesso valore a ogni tiro.`;
      if(t?.formation)reading+=` La scelta iniziale era il ${t.formation}.`;
      blocks.push({speaker:side+'_reporter',text:reading});
      const q=landmark?`Mister, torniamo al ${landmark.minute}′, al gol di ${landmark.player_name}. ${conceded.length?'Come giudichi la gestione della partita dopo quella rete subita?':'Quanto ha cambiato la partita quella rete e che cosa serviva fare subito dopo?'}`:'Mister, non avete subito gol ma non siete riusciti a segnare. Da quale delle due fasi parti per valutare questa partita?';
      const answer=conceded.length?(gf>ga?'Mi piace che la squadra abbia trovato il modo di chiudere avanti, ma quel gol ci ricorda che dobbiamo migliorare. Non voglio che la vittoria cancelli le situazioni che abbiamo concesso.':gf<ga?'Dobbiamo rivedere come abbiamo difeso quell’azione e come abbiamo reagito. Il risultato ci chiede un’analisi sincera: non possiamo limitarci a sperare che l’occasione successiva cambi tutto.':'Una rete subita va analizzata anche quando poi il risultato resta in equilibrio. Voglio capire cosa potevamo fare meglio nell’azione e come rendere più efficace la nostra risposta.'):(gf>0?'Il gol ci ha dato qualcosa da difendere, ma non volevo che diventasse un motivo per smettere di giocare. La gestione passa anche dalla capacità di continuare a proporci.':'La solidità è una base da conservare. Davanti, però, dobbiamo trovare più qualità nelle scelte: il fatto di non aver subito non risolve ciò che ci è mancato per segnare.');
      blocks.push({speaker:side+'_question',text:q},{speaker:side+'_manager',text:answer});
      const q2=t?.formation?`Avevi scelto il ${t.formation}${t.mentality?', con mentalità '+t.mentality.toLowerCase():''}. Alla luce di ciò che avete prodotto, quanto sei soddisfatto dell’equilibrio fra attacco e difesa?`:'Quanto sei soddisfatto dell’equilibrio fra le occasioni costruite e quelle concesse?';
      const a2=gf>ga?'La scelta va giudicata attraverso il lavoro della squadra. Abbiamo trovato soluzioni utili per vincere, ma dobbiamo rivedere anche i momenti in cui non siamo riusciti a controllare il gioco. Voglio continuità, non soltanto un risultato favorevole.':'Il modulo da solo non dà una risposta. Dobbiamo guardare le distanze, il sostegno a chi ha il pallone e la protezione quando lo perdiamo. Se il risultato non è quello che cercavamo, anche le mie scelte vanno analizzate insieme alla prestazione.';
      blocks.push({speaker:side+'_question',text:q2},{speaker:side+'_manager',text:a2});
      const scorer=own[0];
      const q3=scorer?`${scorer.player_name} ha trovato la rete. Che cosa vuoi conservare del contributo dei giocatori arrivati alla conclusione?`:number(s.shots_on_target)!==null?`Avete chiuso con ${s.shots_on_target} conclusioni nello specchio. Dove cerchi il miglioramento per rendere più efficace l’ultima parte dell’azione?`:'Che cosa chiedi alla squadra di migliorare nella scelta dell’ultima giocata?';
      const a3=scorer?'Voglio che quel contributo abbia continuità. Il gol è importante, ma dobbiamo lavorare anche per creare altre situazioni favorevoli e coinvolgere più giocatori. Non possiamo chiedere a una sola conclusione di spiegare tutta la nostra prestazione.':'Nelle scelte e nel sostegno a chi deve concludere. Non basta arrivare vicino alla porta: dobbiamo capire quando tirare, quando cercare un compagno e come occupare meglio gli spazi. È un lavoro di squadra, non una responsabilità da lasciare soltanto agli attaccanti.';
      blocks.push({speaker:side+'_question',text:q3},{speaker:side+'_manager',text:a3});
    }
    blocks.push({speaker:'studio',text:'Torniamo in studio. Abbiamo ascoltato entrambi gli allenatori: leggiamo ora gli episodi e le prestazioni senza fermarci al punteggio.'});
    blocks.push({speaker:'context',text:first&&last&&first!==last?`Il percorso del risultato comincia con ${first.player_name} al ${first.minute}′ e arriva all’ultima rete di ${last.player_name} al ${last.minute}′. È questa successione che va tenuta insieme al punteggio finale: una partita cambia anche nel tempo che le squadre hanno a disposizione per reagire.${penaltyText}`:`${opening} Il risultato va letto dentro questa partita, senza trasformarlo da solo in un giudizio definitivo sul percorso delle due squadre.${penaltyText}`});
    const hs=m.stats.home||{},as=m.stats.away||{};
    blocks.push({speaker:'defence',text:`${a===0?f.home+' mantiene la porta inviolata.':f.home+' subisce '+a+' gol.'} ${h===0?f.away+' chiude senza concedere reti.':f.away+' incassa '+h+' gol.'} ${number(hs.shots_on_target)!==null&&number(as.shots_on_target)!==null?`Le conclusioni nello specchio sono ${hs.shots_on_target} a ${as.shots_on_target}: aiutano a misurare quanto sono stati impegnati i portieri, ma per giudicare ogni situazione va considerata anche l’azione che l’ha prodotta.`:'L’analisi difensiva deve cominciare dalle azioni concesse e dal lavoro necessario per impedire all’avversario di tornare a concludere.'}`});
    blocks.push({speaker:'attack',text:mvp?`${mvp.player_name} è il migliore in campo indicato dal report${number(mvp.rating)!==null?', con voto '+mvp.rating:''}. ${Number(mvp.goals)>0?'Il suo contributo comprende '+mvp.goals+' gol.':'È un riconoscimento che ci invita a guardare anche oltre il numero dei gol.'} ${Number(mvp.assists)>0?'Ci sono anche '+mvp.assists+' assist: il pallone che mette un compagno in condizione di segnare è parte della stessa azione decisiva.':'Per valutare l’attacco bisogna tenere insieme chi conclude e il lavoro di chi rende possibile la conclusione.'}`:'La valutazione offensiva deve distinguere il volume dei tentativi dalla loro efficacia. I gol raccontano le azioni riuscite; quelle non concluse bene indicano dove cercare maggiore precisione e migliori scelte.'});
    blocks.push({speaker:'studio',text:`Si chiude così ${f.home}–${f.away}: ${h}–${a}.${penaltyText} Le voci dai due campi ci hanno aiutato a entrare nella partita, dalle scelte iniziali agli episodi che hanno deciso il risultato.`});
    return blocks;
  }
  function commentary(m) {
    if(!m.report)return [];
    return (approvedStory(m)?.blocks || automaticStory(m)).map(b=>voiced(m,b));
  }
