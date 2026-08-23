(function(){
  "use strict";

  const VERSION="1.0.0";
  const WORLD_ID="GW001";
  const PILOT_DATE="2026-08-20";
  const SUPABASE_URL="https://toanuzojdkfjgucztpze.supabase.co";
  const SUPABASE_KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
  const STYLE_ID="imcMatchReportStyle";
  const OVERLAY_ID="imcMatchReportOverlay";
  const matchMap=new Map();
  let mappingLoaded=false;
  let mappingLoading=null;

  window.IMC_MATCH_REPORT_STATUS={version:VERSION,pilotDate:PILOT_DATE,mapped:0,opened:0,error:null};

  function esc(value){
    return String(value==null?"":value).replace(/[&<>"']/g,function(ch){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch];
    });
  }

  function cfg(){
    let stored=null;
    try{stored=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){ }
    return {url:stored&&stored.url?stored.url:SUPABASE_URL,key:stored&&stored.key?stored.key:SUPABASE_KEY};
  }

  function accessToken(){
    const directKey="sb-toanuzojdkfjgucztpze-auth-token";
    const keys=[directKey];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k&&/^sb-.*-auth-token$/.test(k)&&!keys.includes(k))keys.push(k);
    }
    for(const k of keys){
      try{
        const raw=localStorage.getItem(k);
        if(!raw)continue;
        const parsed=JSON.parse(raw);
        if(parsed&&parsed.access_token)return parsed.access_token;
        if(parsed&&parsed.currentSession&&parsed.currentSession.access_token)return parsed.currentSession.access_token;
      }catch(_){ }
    }
    return "";
  }

  async function rest(path,options){
    const c=cfg();
    const token=accessToken();
    const headers=Object.assign({apikey:c.key,Accept:"application/json"},options&&options.headers||{});
    headers.Authorization="Bearer "+(token||c.key);
    const response=await fetch(c.url+path,Object.assign({},options||{},{headers:headers}));
    if(!response.ok){
      let message="HTTP "+response.status;
      try{const body=await response.json();message=body.message||body.error_description||body.error||message;}catch(_){ }
      throw new Error(message);
    }
    return response.json();
  }

  function isoDate(value){
    const text=String(value||"").trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(text))return text;
    const m=text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    return m?m[3]+"-"+String(m[2]).padStart(2,"0")+"-"+String(m[1]).padStart(2,"0"):"";
  }

  function mapKey(date,homeId,awayId){return [date,homeId,awayId].join("|");}

  async function loadMatchMap(){
    if(mappingLoaded)return matchMap;
    if(mappingLoading)return mappingLoading;
    mappingLoading=(async function(){
      const q="/rest/v1/gw_match_scorer_headers_public?select=match_id,match_date,home_team_id,away_team_id&game_world_id=eq."+WORLD_ID+"&match_date=eq."+PILOT_DATE+"&limit=1000";
      const rows=await rest(q,{method:"GET"});
      (rows||[]).forEach(function(r){
        if(r&&r.match_id!=null)matchMap.set(mapKey(r.match_date,r.home_team_id,r.away_team_id),Number(r.match_id));
      });
      mappingLoaded=true;
      window.IMC_MATCH_REPORT_STATUS.mapped=matchMap.size;
      return matchMap;
    })().catch(function(error){
      window.IMC_MATCH_REPORT_STATUS.error=String(error&&error.message||error);
      console.error("IMC Match Report mapping",error);
      mappingLoading=null;
      return matchMap;
    });
    return mappingLoading;
  }

  function rowIdentity(row){
    const card=row&&row.closest(".nx-league-matchday-card");
    const time=card&&card.querySelector(".nx-unified-matchday-head time,.nx-league-matchday-head time");
    const home=row&&row.querySelector('.nx-league-result-team.home [data-match-entity-id]');
    const away=row&&row.querySelector('.nx-league-result-team.away [data-match-entity-id]');
    if(!time||!home||!away)return null;
    return {
      date:isoDate(time.textContent),
      homeId:home.getAttribute("data-match-entity-id")||"",
      awayId:away.getAttribute("data-match-entity-id")||"",
      homeLogo:(row.querySelector(".nx-league-result-team.home img")||{}).src||"",
      awayLogo:(row.querySelector(".nx-league-result-team.away img")||{}).src||""
    };
  }

  function decorateRows(){
    document.querySelectorAll(".nx-league-result-row").forEach(function(row){
      if(row.getAttribute("data-imc-match-report-ready")==="1")return;
      const id=rowIdentity(row);
      if(!id||id.date!==PILOT_DATE)return;
      const matchId=matchMap.get(mapKey(id.date,id.homeId,id.awayId));
      if(!matchId)return;
      row.setAttribute("data-imc-match-report-ready","1");
      row.setAttribute("data-imc-match-id",String(matchId));
      row.setAttribute("tabindex","0");
      row.setAttribute("role","button");
      row.setAttribute("aria-label","Apri Match Report");
      const score=row.querySelector(".nx-league-score-pill");
      if(score&&!score.querySelector(".nx-match-report-pill")){
        const badge=document.createElement("span");
        badge.className="nx-match-report-pill";
        badge.textContent="MATCH REPORT";
        score.appendChild(badge);
      }
    });
  }

  function addCss(){
    if(document.getElementById(STYLE_ID))return;
    const link=document.createElement("link");
    link.id=STYLE_ID;
    link.rel="stylesheet";
    link.href="css/imc-match-report.css?v="+VERSION;
    document.head.appendChild(link);
  }

  function formatDate(value){
    if(!value)return "";
    const d=new Date(String(value)+"T12:00:00");
    if(Number.isNaN(d.getTime()))return String(value);
    return new Intl.DateTimeFormat("it-IT",{weekday:"short",day:"2-digit",month:"short",year:"numeric"}).format(d).toUpperCase();
  }

  function num(value,fallback){const n=Number(value);return Number.isFinite(n)?n:(fallback||0);}
  function teamName(team){return String(team&&team.display_name||team&&team.team_name||"");}
  function initials(name){return String(name||"").split(/\s+/).filter(Boolean).slice(-2).map(function(x){return x[0]||"";}).join("").toUpperCase();}
  function shortName(name){const p=String(name||"").trim().split(/\s+/);return p[p.length-1]||name||"";}
  function sideArray(rows,side){return (rows||[]).filter(function(x){return x.side===side;});}

  function parseScorers(raw){
    const text=String(raw||"").replace(/\s+/g," ").trim();
    if(!text)return [];
    const re=/([^\d,]+?)\s+(\d{1,3}(?:\s+\((?:rig|autorete)\))?(?:\s*,\s*\d{1,3}(?:\s+\((?:rig|autorete)\))?)*)/giu;
    const out=[];let m;
    while((m=re.exec(text))){
      const name=String(m[1]||"").trim();
      String(m[2]||"").split(",").forEach(function(piece){
        const t=String(piece).trim().match(/^(\d{1,3})(?:\s+\((rig|autorete)\))?$/i);
        if(t)out.push({name:name,minute:Number(t[1]),kind:String(t[2]||"").toLowerCase()});
      });
    }
    return out.sort(function(a,b){return a.minute-b.minute;});
  }

  function scorersMarkup(raw,cls){
    const rows=parseScorers(raw);
    if(!rows.length)return `<div class="${cls}">—</div>`;
    return `<div class="${cls}">${rows.map(function(r){return `<b>${esc(r.name)}</b> ${esc(r.minute)}'${r.kind?` <em>(${r.kind==="rig"?"P":"AG"})</em>`:""}`;}).join("<br>")}</div>`;
  }

  function buildStory(data){
    const m=data.match||{},r=data.report||{};
    const home=teamName(m.home_team),away=teamName(m.away_team);
    const hs=num(m.home_score),as=num(m.away_score);
    const winner=hs===as?"":(hs>as?home:away);
    const loser=hs===as?"":(hs>as?away:home);
    const mvp=(data.players||[]).find(function(p){return p.man_of_match;});
    const homeStats=sideArray(data.stats,"home")[0]||{},awayStats=sideArray(data.stats,"away")[0]||{};
    const firstGoal=parseScorers(data.scorers&&data.scorers.home).concat(parseScorers(data.scorers&&data.scorers.away)).sort(function(a,b){return a.minute-b.minute;})[0];
    const pieces=[];
    if(winner){
      pieces.push(`${winner} supera ${loser} ${hs}-${as} e porta a casa la partita.`);
    }else{
      pieces.push(`${home} e ${away} chiudono in parità sul ${hs}-${as}.`);
    }
    if(firstGoal)pieces.push(`La gara si sblocca al ${firstGoal.minute}' con ${firstGoal.name}.`);
    const hp=num(homeStats.possession_pct),ap=num(awayStats.possession_pct);
    if(hp||ap){
      const possTeam=hp===ap?"":(hp>ap?home:away),poss=Math.max(hp,ap);
      if(possTeam)pieces.push(`${possTeam} chiude con il ${poss}% di possesso palla.`);
    }
    const hShots=num(homeStats.total_shots),aShots=num(awayStats.total_shots);
    if(hShots||aShots)pieces.push(`Il conto dei tiri è ${hShots}-${aShots}, con ${num(homeStats.shots_on_target)}-${num(awayStats.shots_on_target)} conclusioni nello specchio.`);
    if(mvp)pieces.push(`${mvp.player_name} è il migliore in campo con voto ${num(mvp.rating).toFixed(1)}.`);
    if(r.stadium_name)pieces.push(`Il match si è giocato al ${r.stadium_name}${r.attendance?`, davanti a ${Number(r.attendance).toLocaleString("it-IT")} spettatori`:""}.`);
    return pieces.join(" ");
  }

  function statRow(label,h,a){
    h=num(h);a=num(a);const total=Math.max(1,h+a);const pct=Math.round((h/total)*100);
    return `<div class="nx-mr-stat-row"><strong>${esc(h)}</strong><div class="nx-mr-stat-mid"><span>${esc(label)}</span><div class="nx-mr-stat-bar"><i style="width:${pct}%"></i></div></div><strong>${esc(a)}</strong></div>`;
  }

  function mvpMarkup(data){
    const mvp=(data.players||[]).find(function(p){return p.man_of_match;})||(data.players||[]).slice().sort(function(a,b){return num(b.rating)-num(a.rating);})[0];
    if(!mvp)return `<div class="nx-mr-card"><h3>PLAYER OF THE MATCH</h3><div>—</div></div>`;
    const team=mvp.side==="home"?teamName(data.match.home_team):teamName(data.match.away_team);
    const img=mvp.image_url?`<img src="${esc(mvp.image_url)}" alt="${esc(mvp.player_name)}">`:`<div class="is-avatar">${esc(initials(mvp.player_name))}</div>`;
    return `<div class="nx-mr-card nx-mr-mvp"><h3>PLAYER OF THE MATCH</h3><div class="nx-mr-mvp-media">${img}<div class="nx-mr-mvp-rating">${esc(num(mvp.rating).toFixed(1))}</div></div><div class="nx-mr-mvp-name">${esc(mvp.player_name)}</div><div class="nx-mr-mvp-team">${esc(team)}</div><div class="nx-mr-mvp-kpis"><div><b>${esc(num(mvp.goals))}</b><span>GOAL</span></div><div><b>${esc(num(mvp.assists))}</b><span>ASSIST</span></div><div><b>${esc(mvp.exited_minute||90)}'</b><span>MINUTES</span></div></div></div>`;
  }

  function timelineData(data){
    const events=[];
    parseScorers(data.scorers&&data.scorers.home).forEach(function(g){events.push({minute:g.minute,side:"home",type:"goal",title:g.name,detail:g.kind==="rig"?"Rigore":g.kind==="autorete"?"Autogol":"Gol"});});
    parseScorers(data.scorers&&data.scorers.away).forEach(function(g){events.push({minute:g.minute,side:"away",type:"goal",title:g.name,detail:g.kind==="rig"?"Rigore":g.kind==="autorete"?"Autogol":"Gol"});});
    (data.events||[]).forEach(function(e){
      const type=String(e.event_type||"").toLowerCase();
      if(type==="yellow_card")events.push({minute:num(e.minute),side:e.side,title:e.primary_player_name||"Cartellino",detail:"🟨 Ammonizione"});
      else if(type==="red_card")events.push({minute:num(e.minute),side:e.side,title:e.primary_player_name||"Espulsione",detail:"🟥 Espulsione"});
      else if(type==="substitution")events.push({minute:num(e.minute),side:e.side,title:e.primary_player_name||"Sostituzione",detail:e.secondary_player_name?`⇄ ${e.secondary_player_name}`:"Sostituzione"});
    });
    return events.sort(function(a,b){return a.minute-b.minute;});
  }

  function timelineMarkup(data){
    const rows=timelineData(data);
    if(!rows.length)return `<div class="nx-mr-card">Nessun evento principale disponibile.</div>`;
    return `<div class="nx-mr-card nx-mr-timeline">${rows.map(function(e){const side=e.side==="away"?"away":"home";return `<div class="nx-mr-event"><div class="nx-mr-event-dot"></div><div class="nx-mr-event-copy ${side}"><time>${esc(e.minute)}'</time><b>${esc(e.title)}</b><small>${esc(e.detail)}</small></div></div>`;}).join("")}</div>`;
  }

  const FORMATION_ROWS={
    "4-4-2 A":[[2,4,5,3],[7,6,8,11],[9,10]],
    "4-3-3 A":[[2,4,5,3],[6,8,10],[7,9,11]],
    "4-2-3-1 A":[[2,4,5,3],[6,8],[7,10,11],[9]],
    "4-2-3-1 B":[[2,4,5,3],[6,8],[7,10,11],[9]],
    "3-5-2":[[4,5,3],[2,6,8,10,11],[9,7]],
    "4-3-1-2":[[2,4,5,3],[6,8,11],[10],[9,7]],
    "4-2-4":[[2,4,5,3],[6,8],[7,9,10,11]],
    "4-2-2-2":[[2,4,5,3],[6,8],[7,11],[9,10]],
    "4-1-3-2":[[2,4,5,3],[6],[7,8,11],[9,10]],
    "4-5-1 A":[[2,4,5,3],[7,6,10,8,11],[9]],
    "4-5-1 B":[[2,4,5,3],[6,8],[7,10,11],[9]],
    "4-4-2 C":[[2,4,5,3],[6,8],[7,11],[9,10]],
    "4-4-2 B":[[2,4,5,3],[6],[7,10,11],[9,8]],
    "4-3-3 B":[[2,4,5,3],[6],[8,10],[7,9,11]],
    "3-1-3-3":[[4,5,3],[6],[2,8,11],[7,9,10]],
    "4-3-2-1":[[2,4,5,3],[6,8,11],[7,10],[9]],
    "4-4-1-1":[[2,4,5,3],[7,6,8,11],[10],[9]],
    "5-3-2 A":[[2,4,5,10,3],[6,8,11],[9,7]],
    "5-3-2 B":[[2,4,5,10,3],[6],[8,11],[9,7]],
    "5-3-2 C":[[2,4,5,10,3],[6,8,11],[9,7]],
    "3-4-3":[[4,5,3],[2,6,8,11],[7,9,10]],
    "3-4-1-2":[[4,5,3],[2,6,8,11],[10],[9,7]],
    "3-4-2-1":[[4,5,3],[2,6,8,11],[7,10],[9]],
    "3-2-2-2-1":[[4,5,3],[6,8],[2,11],[7,10],[9]],
    "5-4-1 A":[[2,4,5,10,3],[7,6,8,11],[9]],
    "5-4-1 B":[[2,4,5,10,3],[6,8],[7,11],[9]],
    "5-2-3":[[2,4,5,10,3],[6,8],[7,9,11]],
    "3-3-4":[[4,5,3],[6,8,11],[7,9,10,2]]
  };

  function formationRows(formation){
    const name=String(formation||"").trim();
    if(FORMATION_ROWS[name])return FORMATION_ROWS[name];
    const nums=(name.match(/\d+/g)||[]).map(Number);
    const slots=[2,3,4,5,6,7,8,10,11,9];
    const rows=[];let idx=0;
    nums.forEach(function(count,ri){
      if(ri===nums.length-1&&count===1){rows.push([9]);return;}
      rows.push(slots.slice(idx,idx+count));idx+=count;
    });
    return rows;
  }

  function ratingFlag(p){
    let out="";
    if(num(p.goals))out+="⚽";
    if(num(p.assists))out+=" A";
    if(num(p.yellow_cards))out+=" 🟨";
    if(num(p.red_cards))out+=" 🟥";
    if(p.man_of_match)out+=" ⭐";
    return out.trim();
  }

  function playerNode(p,x,y){
    const img=p.image_url?`<img src="${esc(p.image_url)}" alt="">`:`<span>${esc(initials(p.player_name))}</span>`;
    return `<div class="nx-mr-player" style="left:${x}%;top:${y}%"><div class="nx-mr-player-media">${img}</div><div class="nx-mr-player-name"><span>${esc(p.lineup_slot)}</span> ${esc(shortName(p.player_name))} <b>${p.rating!=null?esc(num(p.rating).toFixed(1)):""}</b></div><div class="nx-mr-player-flags">${esc(ratingFlag(p))}</div></div>`;
  }

  function pitchMarkup(data,side){
    const tactic=sideArray(data.tactics,side)[0]||{};
    const starters=sideArray(data.players,side).filter(function(p){return p.lineup_role==="starter";});
    const bySlot=new Map(starters.map(function(p){return [Number(p.lineup_slot),p];}));
    const rows=formationRows(tactic.formation);
    let nodes="";
    const gk=bySlot.get(1);if(gk)nodes+=playerNode(gk,50,91);
    const rowCount=rows.length;
    rows.forEach(function(slots,rowIndex){
      const y=78-(rowIndex*(62/Math.max(1,rowCount-1)));
      const count=slots.length;
      slots.forEach(function(slot,i){
        const p=bySlot.get(Number(slot));if(!p)return;
        const x=count===1?50:(14+i*(72/(count-1)));
        nodes+=playerNode(p,x,y);
      });
    });
    const name=side==="home"?teamName(data.match.home_team):teamName(data.match.away_team);
    return `<div class="nx-mr-field-card"><div class="nx-mr-field-head"><strong>${esc(name)}</strong><span>${esc(tactic.formation||"—")}</span></div><div class="nx-mr-pitch"><div class="nx-mr-center-circle"></div>${nodes}</div></div>`;
  }

  function subsMarkup(data,side){
    const name=side==="home"?teamName(data.match.home_team):teamName(data.match.away_team);
    const subs=sideArray(data.players,side).filter(function(p){return p.lineup_role==="substitute";});
    return `<div class="nx-mr-sub-card"><h3>${esc(name)} · SUBSTITUTES</h3>${subs.map(function(p){return `<div class="nx-mr-sub-row"><b>${esc(p.lineup_slot)}</b><span>${esc(p.player_name)}</span><span>${p.rating!=null?esc(num(p.rating).toFixed(1)):"—"}</span></div>`;}).join("")}</div>`;
  }

  function boolText(v){return v===true?"Sì":v===false?"No":"—";}
  function tacticMarkup(data,side){
    const t=sideArray(data.tactics,side)[0]||{};
    const name=side==="home"?teamName(data.match.home_team):teamName(data.match.away_team);
    const rows=[
      ["Mentalità",t.mentality],["Larghezza",t.width],["Fluidità",t.fluidity],["Creatività",t.creativity],["Ritmo",t.tempo],["Contropiede",boolText(t.counter_attack)],
      ["Passaggi",t.passing_style],["Stile d'attacco",t.attacking_style],["Pressing",t.pressing],["Contrasti",t.tackling_style],["Linea difensiva",t.defensive_line],["Marcatura stretta",boolText(t.tight_marking)],
      ["Regista",t.playmaker_name],["Uomo chiave",t.target_man_name],["Capitano",t.captain_name],["Rigorista",t.penalty_taker_name]
    ];
    return `<div class="nx-mr-tactic-card"><h3>${esc(name)} <span>${esc(t.formation||"—")}</span></h3>${rows.filter(function(r){return r[1]!=null&&r[1]!=="";}).map(function(r){return `<div class="nx-mr-tactic-row"><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`;}).join("")}</div>`;
  }

  function commentaryMarkup(data){
    const rows=data.commentary||[];
    if(!rows.length)return `<div class="nx-mr-card">Commentary non disponibile.</div>`;
    return `<div class="nx-mr-commentary">${rows.map(function(c){const minute=c.minute==null?"":String(c.minute)+(c.stoppage_minute?"+"+c.stoppage_minute:"")+"'";return `<div class="nx-mr-comment"><time>${esc(minute)}</time><p>${esc(c.raw_text||"")}</p></div>`;}).join("")}</div>`;
  }

  function teamLogo(src,name){return src?`<div class="nx-mr-team-logo"><img src="${esc(src)}" alt="${esc(name)}"></div>`:`<div class="nx-mr-team-logo is-empty">${esc(initials(name))}</div>`;}

  function render(data,ctx){
    const m=data.match||{},r=data.report||{};const home=teamName(m.home_team),away=teamName(m.away_team);
    const hs=num(m.home_score),as=num(m.away_score),homeStats=sideArray(data.stats,"home")[0]||{},awayStats=sideArray(data.stats,"away")[0]||{};
    const status=m.decided_on_penalties?"PEN":"FT";
    const pens=m.decided_on_penalties?`<div class="nx-mr-pens">${esc(m.home_penalties)} - ${esc(m.away_penalties)} ai rigori</div>`:"";
    const attendance=r.attendance?Number(r.attendance).toLocaleString("it-IT"):"—";
    return `<div class="nx-mr-shell"><div class="nx-mr-topbar"><button class="nx-mr-icon-btn" data-mr-close aria-label="Chiudi">‹</button><h1>MATCH REPORT</h1><span></span></div><main class="nx-mr-wrap">
      <section class="nx-mr-hero"><div class="nx-mr-kicker">${esc(m.competition_name||"")} · ${esc(m.round_name||"")}</div><div class="nx-mr-date">${esc(formatDate(m.match_date))}${m.match_time?" · "+esc(String(m.match_time).slice(0,5)):""}</div><div class="nx-mr-score-grid"><div class="nx-mr-team">${teamLogo(ctx.homeLogo,home)}<strong>${esc(home)}</strong><small>${esc(r.home_manager_name||"")}</small></div><div class="nx-mr-score"><strong>${esc(hs)} - ${esc(as)}</strong><span>${status}</span>${pens}</div><div class="nx-mr-team">${teamLogo(ctx.awayLogo,away)}<strong>${esc(away)}</strong><small>${esc(r.away_manager_name||"")}</small></div></div><div class="nx-mr-scorers">${scorersMarkup(data.scorers&&data.scorers.home,"home")}<i></i>${scorersMarkup(data.scorers&&data.scorers.away,"away")}</div><div class="nx-mr-venue"><span>🏟 ${esc(r.stadium_name||"—")}</span><span>👥 ${esc(attendance)} spettatori</span></div></section>
      <nav class="nx-mr-tabs"><button class="is-active" data-mr-tab="overview">OVERVIEW</button><button data-mr-tab="lineups">LINEUPS</button><button data-mr-tab="tactics">TACTICS</button><button data-mr-tab="commentary">COMMENTARY</button></nav>
      <section class="nx-mr-section" data-mr-section="overview"><div class="nx-mr-overview-grid"><div class="nx-mr-card nx-mr-story"><h3>MATCH STORY</h3><p>${esc(buildStory(data))}</p></div>${mvpMarkup(data)}<div class="nx-mr-card"><h3>MATCH STATS</h3>${statRow("POSSESSION",homeStats.possession_pct,awayStats.possession_pct)}${statRow("TOTAL SHOTS",homeStats.total_shots,awayStats.total_shots)}${statRow("SHOTS ON TARGET",homeStats.shots_on_target,awayStats.shots_on_target)}${statRow("CORNERS",homeStats.corners,awayStats.corners)}${statRow("YELLOW CARDS",homeStats.yellow_cards,awayStats.yellow_cards)}${statRow("RED CARDS",homeStats.red_cards,awayStats.red_cards)}</div></div><div style="height:12px"></div><h2 class="nx-mr-title">MATCH TIMELINE</h2>${timelineMarkup(data)}</section>
      <section class="nx-mr-section" data-mr-section="lineups"><h2 class="nx-mr-title">LINEUPS</h2><div class="nx-mr-fields">${pitchMarkup(data,"home")}${pitchMarkup(data,"away")}</div><div class="nx-mr-subs">${subsMarkup(data,"home")}${subsMarkup(data,"away")}</div></section>
      <section class="nx-mr-section" data-mr-section="tactics"><h2 class="nx-mr-title">TACTICS · 0'</h2><div class="nx-mr-tactics-grid">${tacticMarkup(data,"home")}${tacticMarkup(data,"away")}</div></section>
      <section class="nx-mr-section" data-mr-section="commentary"><h2 class="nx-mr-title">COMMENTARY</h2>${commentaryMarkup(data)}</section>
      <section class="nx-mr-section"><h2 class="nx-mr-title">MATCH INFO</h2><div class="nx-mr-info-grid"><div><span>Competition</span><b>${esc(m.competition_name||"—")}</b></div><div><span>Round</span><b>${esc(m.round_name||"—")}</b></div><div><span>Date</span><b>${esc(formatDate(m.match_date))}</b></div><div><span>Stadium</span><b>${esc(r.stadium_name||"—")}</b></div><div><span>Attendance</span><b>${esc(attendance)}</b></div><div><span>Managers</span><b>${esc((r.home_manager_name||"—")+" · "+(r.away_manager_name||"—"))}</b></div></div></section>
    </main></div>`;
  }

  function close(){
    const overlay=document.getElementById(OVERLAY_ID);if(overlay)overlay.remove();document.body.classList.remove("nx-mr-lock");
  }

  function bindOverlay(overlay){
    const closeBtn=overlay.querySelector("[data-mr-close]");if(closeBtn)closeBtn.addEventListener("click",close);
    overlay.querySelectorAll("[data-mr-tab]").forEach(function(btn){btn.addEventListener("click",function(){overlay.querySelectorAll("[data-mr-tab]").forEach(function(b){b.classList.toggle("is-active",b===btn);});const target=overlay.querySelector('[data-mr-section="'+btn.getAttribute("data-mr-tab")+'"]');if(target)target.scrollIntoView({behavior:"smooth",block:"start"});});});
  }

  async function fetchReport(matchId){
    const token=accessToken();
    if(!token)throw new Error("Sessione Nexus non disponibile. Effettua nuovamente l’accesso.");
    return rest("/rest/v1/rpc/get_gw001_match_report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({p_match_id:Number(matchId)})});
  }

  async function open(matchId,ctx){
    addCss();close();document.body.classList.add("nx-mr-lock");
    const overlay=document.createElement("div");overlay.id=OVERLAY_ID;overlay.innerHTML=`<div class="nx-mr-shell"><div class="nx-mr-topbar"><button class="nx-mr-icon-btn" data-mr-close>‹</button><h1>MATCH REPORT</h1><span></span></div><div class="nx-mr-loading">Caricamento Match Report…</div></div>`;document.body.appendChild(overlay);bindOverlay(overlay);
    try{
      const data=await fetchReport(matchId);
      if(!data||!data.match)throw new Error("Match Report non disponibile per questa partita.");
      overlay.innerHTML=render(data,ctx||{});bindOverlay(overlay);overlay.scrollTop=0;window.IMC_MATCH_REPORT_STATUS.opened+=1;
    }catch(error){
      overlay.innerHTML=`<div class="nx-mr-shell"><div class="nx-mr-topbar"><button class="nx-mr-icon-btn" data-mr-close>‹</button><h1>MATCH REPORT</h1><span></span></div><div class="nx-mr-error">${esc(error&&error.message||"Errore caricamento Match Report.")}</div></div>`;bindOverlay(overlay);window.IMC_MATCH_REPORT_STATUS.error=String(error&&error.message||error);
    }
  }

  function rowContext(row){const id=rowIdentity(row)||{};return {homeLogo:id.homeLogo||"",awayLogo:id.awayLogo||""};}

  document.addEventListener("click",function(event){
    const row=event.target.closest('.nx-league-result-row[data-imc-match-report-ready="1"]');if(!row)return;
    if(event.target.closest('[data-match-entity-id],[data-match-manager-id]'))return;
    const id=Number(row.getAttribute("data-imc-match-id"));if(!id)return;event.preventDefault();open(id,rowContext(row));
  });
  document.addEventListener("keydown",function(event){const row=event.target.closest&&event.target.closest('.nx-league-result-row[data-imc-match-report-ready="1"]');if(!row||!(event.key==="Enter"||event.key===" "))return;event.preventDefault();const id=Number(row.getAttribute("data-imc-match-id"));if(id)open(id,rowContext(row));});

  let timer=null;
  const observer=new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(decorateRows,80);});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  addCss();loadMatchMap().then(decorateRows);[250,750,1500,3000].forEach(function(ms){setTimeout(function(){loadMatchMap().then(decorateRows);},ms);});

  window.IMC_MATCH_REPORT={version:VERSION,open:function(matchId){return open(matchId,{});},refresh:function(){return loadMatchMap().then(decorateRows);},close:close};
})();
