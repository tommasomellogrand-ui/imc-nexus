(function(){
"use strict";

const VERSION="0.1.0-gw001-national-cup-pilot";
const WORLD="GW001";
const COMPETITION_KEY="GW001-LEAGUECUP";
const ROOT_ID="imcMatchReportGW001";
const STYLE_ID="imcMatchReportGW001Css";
const URL="https://toanuzojdkfjgucztpze.supabase.co";
const KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";

let cfg=null;
try{cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){}
const db=window.__IMC_NEXUS_CLIENT__||(window.supabase?window.supabase.createClient(cfg&&cfg.url?cfg.url:URL,cfg&&cfg.key?cfg.key:KEY):null);
if(!db)return;

let indexPromise=null;
let observer=null;
let timer=null;
const reportCache=new Map();

const clean=v=>String(v==null?"":v).replace(/\s+/g," ").trim();
const norm=v=>clean(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const esc=v=>clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

function world(){
  const guard=window.IMC_WORLD_CONTEXT_FIX;
  if(guard&&typeof guard.currentWorld==="function")return String(guard.currentWorld()||"").toUpperCase();
  const text=document.querySelector("#openDrawerWorld strong,.nx-sport-world strong")?.textContent||"";
  return norm(text)==="road to history"?WORLD:"";
}

function isPilotPage(){
  if(world()!==WORLD)return false;
  const root=document.getElementById("imcCompetitionDetail");
  if(!root)return false;
  const title=clean(root.querySelector(".imcc-title strong")?.textContent||root.querySelector(".imcc-hero h1")?.textContent||"");
  return norm(title)==="national cup";
}

function prettyDate(v){
  const p=String(v||"").slice(0,10).split("-");
  if(p.length!==3)return clean(v);
  const months=["GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO","SET","OTT","NOV","DIC"];
  return Number(p[2])+" "+(months[Number(p[1])-1]||p[1])+" "+p[0];
}

function installCss(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");
  s.id=STYLE_ID;
  s.textContent=`
#imcCompetitionDetail .imcc-game.imc-mr-ready{cursor:pointer;position:relative;padding-bottom:11px}
#imcCompetitionDetail .imc-mr-open{display:flex;align-items:center;justify-content:center;gap:5px;width:max-content;margin:8px auto 0;padding:6px 11px;border:1px solid #c9972f;border-radius:999px;background:#fffaf0;color:#9c6b08;font:800 7px/1 Inter,system-ui;text-transform:uppercase;letter-spacing:.06em}
#imcCompetitionDetail .imc-ui-final-card .imc-mr-open{border-color:#d8a533;background:rgba(255,251,240,.95);color:#8c5c00}
#${ROOT_ID}{position:fixed;inset:0;z-index:2147483450;overflow:auto;-webkit-overflow-scrolling:touch;background:#fff;color:#0b1833;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
#${ROOT_ID} *{box-sizing:border-box}
.imcmr-top{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:42px 1fr 42px;align-items:center;gap:8px;padding:10px 12px;background:rgba(255,255,255,.98);border-bottom:1px solid #e4e8ef}
.imcmr-top button{width:40px;height:40px;border:1px solid #dce2ea;border-radius:12px;background:#fff;color:#173766;font:800 20px/1 Inter,system-ui}
.imcmr-title{text-align:center;min-width:0}.imcmr-title small{display:block;color:#60708a;font-size:8px;font-weight:800;letter-spacing:.08em}.imcmr-title strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:850}
.imcmr-main{max-width:760px;margin:auto;padding:12px 12px 40px}
.imcmr-round-pill{display:flex;align-items:center;justify-content:center;gap:5px;width:max-content;margin:0 auto 9px;padding:5px 10px;border:1px solid #d9a22c;border-radius:999px;background:#fffaf0;color:#956400;font-size:8px;font-weight:850;text-transform:uppercase;letter-spacing:.06em}
.imcmr-hero{padding:15px;border-radius:19px;background:linear-gradient(145deg,#0e2c63,#071b41);color:#fff;box-shadow:0 10px 26px rgba(10,35,78,.16)}
.imcmr-scoreline{display:grid;grid-template-columns:minmax(0,1fr) 76px minmax(0,1fr);align-items:center;gap:8px}
.imcmr-side{display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;min-width:0}.imcmr-side img{width:58px;height:58px;object-fit:contain}.imcmr-logo-fallback{display:flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:50%;background:#fff;color:#123469;font-size:16px;font-weight:900}.imcmr-side strong{width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.imcmr-score{font-size:30px;font-weight:900;text-align:center;letter-spacing:-.04em}.imcmr-penalty{text-align:center;margin-top:4px;color:#f2cf78;font-size:8px;font-weight:750}.imcmr-meta{text-align:center;margin-top:11px;color:#d7e0ef;font-size:8px;font-weight:650;line-height:1.55}
.imcmr-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin:12px 0;padding:4px;border:1px solid #e1e6ed;border-radius:14px;background:#f8fafc}.imcmr-tabs button{height:38px;border:0;border-radius:10px;background:transparent;color:#657289;font:800 7px/1 Inter,system-ui;text-transform:uppercase}.imcmr-tabs button.active{background:#102a5d;color:#fff;box-shadow:0 2px 8px rgba(16,42,93,.12)}
.imcmr-panel{display:none}.imcmr-panel.active{display:block}.imcmr-card{margin-top:10px;padding:13px;border:1px solid #dfe5ed;border-radius:16px;background:#fff;box-shadow:0 4px 15px rgba(18,39,73,.035)}.imcmr-card h3{margin:0 0 11px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.07em;color:#58677e}
.imcmr-stat{display:grid;grid-template-columns:42px 1fr 42px;gap:9px;align-items:center;margin:9px 0}.imcmr-stat b{font-size:13px}.imcmr-stat b:last-child{text-align:right}.imcmr-stat-mid{text-align:center}.imcmr-stat-mid span{display:block;margin-bottom:4px;color:#7a8799;font-size:7px;font-weight:750}.imcmr-bar{display:flex;height:3px;border-radius:3px;overflow:hidden;background:#e5eaf1}.imcmr-bar i{display:block;background:#173b75}.imcmr-bar em{display:block;background:#c7cfdb}
.imcmr-highlight{display:flex;align-items:center;gap:10px;border-color:#e0b34f;background:linear-gradient(90deg,#fffaf0,#fff)}.imcmr-highlight .ball{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#f5c642;color:#173766;font-size:16px}.imcmr-highlight strong{display:block;font-size:12px}.imcmr-highlight small{display:block;margin-top:2px;color:#758197;font-size:8px}.imcmr-mvp{display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:9px}.imcmr-mvp .star{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#102a5d;color:#f2c94c;font-size:18px}.imcmr-mvp small{display:block;color:#7b8798;font-size:7px;font-weight:800;text-transform:uppercase}.imcmr-mvp strong{display:block;font-size:13px}.imcmr-rating-big{padding:6px 8px;border:1px solid #d9a22c;border-radius:9px;color:#9a6800;font-size:13px;font-weight:900}
.imcmr-pitch-wrap{padding:10px;border:1px solid #dfe5ed;border-radius:16px;background:#fff}.imcmr-formations{display:flex;justify-content:space-between;gap:10px;margin-bottom:7px;color:#2b405f;font-size:7px;font-weight:850}.imcmr-pitch{position:relative;height:330px;border:2px solid rgba(255,255,255,.75);border-radius:15px;overflow:hidden;background:linear-gradient(90deg,#77a958,#6f9e53 50%,#77a958 50%,#6f9e53);box-shadow:inset 0 0 0 1px rgba(14,57,27,.12)}
.imcmr-pitch:before{content:"";position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.78)}.imcmr-pitch:after{content:"";position:absolute;left:50%;top:50%;width:68px;height:68px;border:1px solid rgba(255,255,255,.78);border-radius:50%;transform:translate(-50%,-50%)}
.imcmr-player-dot{position:absolute;left:var(--x);top:var(--y);transform:translate(-50%,-50%);width:54px;text-align:center}.imcmr-player-dot b{position:relative;display:flex;align-items:center;justify-content:center;width:25px;height:25px;margin:auto;border-radius:50%;border:2px solid rgba(255,255,255,.9);background:#f2c94c;color:#102a5d;font-size:8px;font-weight:900;box-shadow:0 2px 5px rgba(0,0,0,.18)}.imcmr-player-dot.away b{background:#9c2430;color:#fff}.imcmr-player-dot small{display:block;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff;font-size:6.5px;font-weight:800;text-shadow:0 1px 2px rgba(0,0,0,.55)}.imcmr-player-dot .cap{position:absolute;right:-4px;top:-4px;display:flex;align-items:center;justify-content:center;width:11px;height:11px;border-radius:50%;background:#173b75;color:#fff;font-size:5px;border:1px solid #fff}
.imcmr-team-lists{display:grid;grid-template-columns:1fr 1fr;gap:7px}.imcmr-team-card{min-width:0;padding:10px;border:1px solid #e1e6ed;border-radius:14px;background:#fff}.imcmr-team-head{display:flex;justify-content:space-between;gap:6px;margin-bottom:7px;font-size:8px;font-weight:900}.imcmr-team-head span:last-child{color:#71914b}.imcmr-player-row{display:grid;grid-template-columns:19px minmax(0,1fr) auto;gap:5px;align-items:center;min-height:22px;border-top:1px solid #f0f2f5;font-size:7px}.imcmr-player-row:first-of-type{border-top:0}.imcmr-player-row .name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:750}.imcmr-rating{min-width:25px;padding:3px 4px;border-radius:7px;background:#ecf6e8;color:#46792f;text-align:center;font-size:7px;font-weight:900}.imcmr-rating.mid{background:#fff4dc;color:#a66a00}.imcmr-rating.low{background:#fde9e9;color:#a33838}.imcmr-icons{grid-column:2/4;color:#6f7d91;font-size:6px;line-height:1.4;padding-bottom:3px}.imcmr-sub-card{margin-top:8px;padding:10px;border:1px solid #e1e6ed;border-radius:14px;background:#fff}.imcmr-sub-card h4{margin:0 0 7px;text-align:center;color:#6f7d91;font-size:7px;font-weight:900;text-transform:uppercase}.imcmr-sub-row{display:grid;grid-template-columns:34px 1fr;gap:7px;padding:5px 0;border-top:1px solid #f0f2f5;font-size:7px}.imcmr-sub-row:first-of-type{border-top:0}.imcmr-sub-row b{color:#173b75}.imcmr-in{color:#2b8a3e}.imcmr-out{color:#c33c3c}
.imcmr-events{padding-left:0;list-style:none}.imcmr-event{display:grid;grid-template-columns:37px 20px 1fr;gap:6px;align-items:start;padding:9px 0;border-top:1px solid #eef1f5}.imcmr-event:first-child{border-top:0}.imcmr-event time{font-size:9px;font-weight:900;color:#173766}.imcmr-event .ico{font-size:12px;text-align:center}.imcmr-event strong{display:block;font-size:9px}.imcmr-event small{display:block;margin-top:2px;color:#778399;font-size:7px;line-height:1.35}
.imcmr-loading{padding:45px 12px;text-align:center;color:#6f7d91;font-size:10px;font-weight:800}
@media(max-width:390px){.imcmr-main{padding-left:9px;padding-right:9px}.imcmr-pitch{height:305px}.imcmr-player-dot{width:48px}.imcmr-scoreline{grid-template-columns:minmax(0,1fr) 65px minmax(0,1fr)}.imcmr-side img,.imcmr-logo-fallback{width:50px;height:50px}.imcmr-team-card{padding:8px}}
`;
  document.head.appendChild(s);
}

async function loadIndex(){
  if(indexPromise)return indexPromise;
  indexPromise=(async()=>{
    const r=await db.from("gw001_results")
      .select("sm_fixture_id,source_page_date,home_name,away_name,home_score,away_score,sm_round_label,competition_key,season_number")
      .eq("competition_key",COMPETITION_KEY)
      .eq("season_number",1);
    if(r.error)throw r.error;
    const results=r.data||[];
    const ids=results.map(x=>x.sm_fixture_id).filter(v=>v!=null);
    let reports=[];
    if(ids.length){
      const q=await db.from("gw001_match_reports").select("report_id,sm_fixture_id,parser_status").in("sm_fixture_id",ids);
      if(q.error)throw q.error;
      reports=q.data||[];
    }
    const available=new Set(reports.filter(x=>x.parser_status==="complete").map(x=>String(x.sm_fixture_id)));
    return {results,available};
  })().catch(error=>{indexPromise=null;throw error;});
  return indexPromise;
}

function teamName(node){
  return clean(node?.querySelector(".imc-ui-team-name")?.textContent||node?.textContent||"");
}

function resultKey(round,home,away,score){return [norm(round),norm(home),norm(away),clean(score).replace(/\s+/g,"")].join("|");}

async function decorateResults(){
  if(!isPilotPage())return;
  installCss();
  try{
    const {results,available}=await loadIndex();
    const map=new Map();
    results.forEach(r=>map.set(resultKey(r.sm_round_label,r.home_name,r.away_name,(r.home_score==null||r.away_score==null)?"-":r.home_score+"-"+r.away_score),r));
    document.querySelectorAll("#imcCompetitionDetail .imcc-round-card.is-results").forEach(roundCard=>{
      const round=clean(roundCard.querySelector(".imcc-round-title strong")?.textContent||"");
      roundCard.querySelectorAll(".imcc-game").forEach(game=>{
        if(game.dataset.imcMrBound==="1")return;
        const teams=game.querySelectorAll(".imcc-team");
        const home=teamName(teams[0]);
        const away=teamName(teams[1]);
        const score=clean(game.querySelector(".imcc-score")?.textContent||"").replace(/\s+/g,"");
        const row=map.get(resultKey(round,home,away,score));
        if(!row||!available.has(String(row.sm_fixture_id)))return;
        game.dataset.imcMrBound="1";
        game.dataset.imcMrFixture=String(row.sm_fixture_id);
        game.classList.add("imc-mr-ready");
        const button=document.createElement("button");
        button.type="button";
        button.className="imc-mr-open";
        button.innerHTML="Match Report <span>›</span>";
        game.appendChild(button);
      });
    });
  }catch(error){console.error("IMC GW001 Match Report index",error);}
}

async function loadReport(fixtureId){
  const key=String(fixtureId);
  if(reportCache.has(key))return reportCache.get(key);
  const p=(async()=>{
    const r=await db.from("gw001_match_reports")
      .select("report_id,sm_fixture_id,source_competition_name,stadium_name,attendance,parser_status,source_payload")
      .eq("sm_fixture_id",Number(fixtureId))
      .maybeSingle();
    if(r.error)throw r.error;
    if(!r.data)throw new Error("Match Report non trovato");
    return r.data;
  })();
  reportCache.set(key,p);
  try{return await p;}catch(e){reportCache.delete(key);throw e;}
}

function initials(name){return clean(name).split(" ").filter(Boolean).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()||"?";}
function logoMarkup(name,url){return url?`<img src="${esc(url)}" alt="">`:`<span class="imcmr-logo-fallback">${esc(initials(name))}</span>`;}
function surname(name){const p=clean(name).split(" ").filter(Boolean);return p.length>1?p.slice(1).join(" "):p[0]||"-";}
function ratingClass(v){const n=Number(v);return !Number.isFinite(n)?"":n>=7?"":n>=6?" mid":" low";}
function fmtRating(v){const n=Number(v);return Number.isFinite(n)?n.toFixed(1):"-";}
function playerEventText(p){
  const bits=[];
  if(Number(p.goals||0)>0)bits.push("⚽ "+p.goals);
  if(Number(p.assists||0)>0)bits.push("A "+p.assists);
  if(Number(p.yellowCards||0)>0)bits.push("🟨 "+p.yellowCards);
  if(Number(p.redCards||0)>0)bits.push("🟥 "+p.redCards);
  if(p.isCaptain)bits.push("C");
  if(p.isManOfMatch)bits.push("★ MVP");
  const off=subOffMinute(p);if(off!=null)bits.push("↓ "+off+"'");
  const on=subOnMinute(p);if(on!=null)bits.push("↑ "+on+"'");
  return bits.join(" · ");
}

function parseMinuteFromHtml(p,type){
  const raw=String(p?.metadata?.rawHtml||p?.sourceText||"");
  if(type==="on"){
    const m=raw.match(/subon[\s\S]*?\((\d+)\)/i)||(!p.isStarter?raw.match(/\((\d+)\)/):null);
    return m?Number(m[1]):null;
  }
  const m=raw.match(/suboff[\s\S]*?\((\d+)\)/i);
  return m?Number(m[1]):null;
}
function subOnMinute(p){if(p&&p.subOnMinute!=null)return Number(p.subOnMinute);return parseMinuteFromHtml(p,"on");}
function subOffMinute(p){if(p&&p.subOffMinute!=null)return Number(p.subOffMinute);return parseMinuteFromHtml(p,"off");}

const HOME_POS={1:[5,50],2:[17,18],3:[17,39],4:[17,61],5:[17,82],6:[31,36],7:[31,64],8:[41,18],10:[41,50],11:[41,82],9:[47,50]};
function pitchPos(slot,side){const p=HOME_POS[Number(slot)]||[25,50];return side==="away"?[100-p[0],p[1]]:p;}

function pitchPlayer(p){
  const [x,y]=pitchPos(p.lineupSlot,p.side);
  return `<div class="imcmr-player-dot ${p.side==="away"?"away":""}" style="--x:${x}%;--y:${y}%"><b>${esc(p.lineupSlot)}${p.isCaptain?'<span class="cap">C</span>':''}</b><small>${esc(surname(p.playerName))}</small></div>`;
}

function teamAverage(players,side){
  const vals=players.filter(p=>p.side===side&&p.rating!=null).map(p=>Number(p.rating)).filter(Number.isFinite);
  if(!vals.length)return "-";
  return (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2);
}

function playerRows(players,side,startersOnly){
  return players.filter(p=>p.side===side&&(startersOnly?!!p.isStarter:true)).filter(p=>startersOnly||p.rating!=null||subOnMinute(p)!=null).sort((a,b)=>Number(a.lineupSlot||99)-Number(b.lineupSlot||99)).map(p=>`<div class="imcmr-player-row"><span>${esc(p.lineupSlot||"")}</span><span class="name">${esc(p.playerName)}</span><span class="imcmr-rating${ratingClass(p.rating)}">${esc(fmtRating(p.rating))}</span>${playerEventText(p)?`<span class="imcmr-icons">${esc(playerEventText(p))}</span>`:""}</div>`).join("");
}

function benchRows(players,side){
  const rows=players.filter(p=>p.side===side&&!p.isStarter).sort((a,b)=>Number(a.lineupSlot||99)-Number(b.lineupSlot||99));
  if(!rows.length)return '<div class="imcmr-player-row"><span></span><span class="name">Nessun dato</span><span></span></div>';
  return rows.map(p=>`<div class="imcmr-player-row"><span>${esc(p.lineupSlot||"")}</span><span class="name">${esc(p.playerName)}</span><span class="imcmr-rating${ratingClass(p.rating)}">${esc(fmtRating(p.rating))}</span>${playerEventText(p)?`<span class="imcmr-icons">${esc(playerEventText(p))}</span>`:""}</div>`).join("");
}

function substitutionGroups(players){
  const sides=["home","away"];
  const out=[];
  sides.forEach(side=>{
    const mins=new Set();
    players.filter(p=>p.side===side).forEach(p=>{const a=subOffMinute(p),b=subOnMinute(p);if(a!=null)mins.add(a);if(b!=null)mins.add(b);});
    Array.from(mins).sort((a,b)=>a-b).forEach(min=>{
      const offs=players.filter(p=>p.side===side&&subOffMinute(p)===min).map(p=>p.playerName);
      const ons=players.filter(p=>p.side===side&&subOnMinute(p)===min).map(p=>p.playerName);
      if(offs.length||ons.length)out.push({side,minute:min,offs,ons});
    });
  });
  return out.sort((a,b)=>a.minute-b.minute||a.side.localeCompare(b.side));
}

function substitutionsMarkup(players,homeName,awayName){
  const groups=substitutionGroups(players);
  if(!groups.length)return '<div class="imcmr-sub-row"><b>-</b><span>Nessuna sostituzione registrata</span></div>';
  return groups.map(g=>`<div class="imcmr-sub-row"><b>${esc(g.minute)}'</b><span><strong>${esc(g.side==="home"?homeName:awayName)}</strong>${g.offs.length?`<br><span class="imcmr-out">↓ ${esc(g.offs.join(", "))}</span>`:""}${g.ons.length?`<br><span class="imcmr-in">↑ ${esc(g.ons.join(", "))}</span>`:""}</span></div>`).join("");
}

function meaningfulEvents(payload){
  const events=Array.isArray(payload.events)?payload.events:[];
  const chosen=[];const seen=new Set();
  events.forEach(e=>{
    const source=String(e?.metadata?.source||"");
    if(!["scorer_header","lineup_marker"].includes(source))return;
    if(!["goal","yellow_card","red_card"].includes(e.eventType))return;
    const k=[e.minute,e.eventType,e.primarySmPlayerId||e.primaryPlayerName].join("|");
    if(seen.has(k))return;seen.add(k);chosen.push({minute:Number(e.minute||0),type:e.eventType,name:clean(e.primaryPlayerName||""),side:e.side,raw:clean(e.rawText||"")});
  });
  const players=Array.isArray(payload.players)?payload.players:[];
  substitutionGroups(players).forEach(g=>chosen.push({minute:g.minute,type:"substitution",name:g.ons.join(", "),side:g.side,raw:(g.offs.length?"Escono: "+g.offs.join(", ")+". ":"")+(g.ons.length?"Entrano: "+g.ons.join(", "):"")}));
  return chosen.sort((a,b)=>a.minute-b.minute);
}

function eventIcon(type){return type==="goal"?"⚽":type==="yellow_card"?"🟨":type==="red_card"?"🟥":type==="substitution"?"↕":"•";}
function eventTitle(e){return e.type==="goal"?(e.name||"Gol"):e.type==="yellow_card"?(e.name||"Ammonizione"):e.type==="red_card"?(e.name||"Espulsione"):e.type==="substitution"?"Sostituzioni":"Evento";}

function statsMarkup(stats){
  const h=stats?.home||{},a=stats?.away||{};
  const rows=[["Possesso palla",h.possession,a.possession,"%"],["Tiri totali",h.totalShots,a.totalShots,""],["Tiri in porta",h.shotsOnTarget,a.shotsOnTarget,""],["Corner",h.corners,a.corners,""],["Gialli",h.yellowCards,a.yellowCards,""],["Rossi",h.redCards,a.redCards,""]];
  return rows.map(([label,hv,av,sfx])=>{const hn=Number(hv||0),an=Number(av||0),sum=Math.max(1,hn+an),hp=label==="Possesso palla"?Math.max(0,Math.min(100,hn)):Math.round(hn/sum*100);return `<div class="imcmr-stat"><b>${esc(hv)}${sfx}</b><div class="imcmr-stat-mid"><span>${esc(label)}</span><div class="imcmr-bar"><i style="width:${hp}%"></i><em style="width:${100-hp}%"></em></div></div><b>${esc(av)}${sfx}</b></div>`;}).join("");
}

function findAssist(players,goalSide){
  const assists=players.filter(p=>p.side===goalSide&&Number(p.assists||0)>0);
  return assists.length===1?assists[0].playerName:"";
}

function overviewMarkup(payload){
  const players=Array.isArray(payload.players)?payload.players:[];
  const mvp=players.find(p=>p.isManOfMatch)||null;
  const goal=(Array.isArray(payload.events)?payload.events:[]).find(e=>e.eventType==="goal"&&String(e?.metadata?.source||"")==="scorer_header")||null;
  const assist=goal?findAssist(players,goal.side):"";
  return `<section class="imcmr-card"><h3>Statistiche partita</h3>${statsMarkup(payload.teamStats||{})}</section>${goal?`<section class="imcmr-card imcmr-highlight"><span class="ball">⚽</span><div><strong>${esc(goal.minute)}' ${esc(goal.primaryPlayerName||"Gol")}</strong>${assist?`<small>Assist: ${esc(assist)}</small>`:""}</div></section>`:""}${mvp?`<section class="imcmr-card imcmr-mvp"><span class="star">★</span><div><small>MVP</small><strong>${esc(mvp.playerName)}</strong></div><span class="imcmr-rating-big">${esc(fmtRating(mvp.rating))}</span></section>`:""}`;
}

function lineupsMarkup(payload,homeName,awayName){
  const players=Array.isArray(payload.players)?payload.players:[];
  const starters=players.filter(p=>p.isStarter).sort((a,b)=>Number(a.lineupSlot||99)-Number(b.lineupSlot||99));
  const ht=(Array.isArray(payload.tactics)?payload.tactics:[]).find(t=>t.side==="home"&&Number(t.minute)===0);
  const at=(Array.isArray(payload.tactics)?payload.tactics:[]).find(t=>t.side==="away"&&Number(t.minute)===0);
  return `<section class="imcmr-pitch-wrap"><div class="imcmr-formations"><span>${esc(homeName)} · ${esc(ht?.formation||"")}</span><span>${esc(awayName)} · ${esc(at?.formation||"")}</span></div><div class="imcmr-pitch">${starters.map(pitchPlayer).join("")}</div></section><div class="imcmr-team-lists"><section class="imcmr-team-card"><div class="imcmr-team-head"><span>${esc(homeName)}</span><span>Avg. ${esc(teamAverage(players,"home"))}</span></div>${playerRows(players,"home",true)}</section><section class="imcmr-team-card"><div class="imcmr-team-head"><span>${esc(awayName)}</span><span>Avg. ${esc(teamAverage(players,"away"))}</span></div>${playerRows(players,"away",true)}</section></div><section class="imcmr-sub-card"><h4>Bench</h4><div class="imcmr-team-lists"><div>${benchRows(players,"home")}</div><div>${benchRows(players,"away")}</div></section>`;
}

function ratingsMarkup(payload,homeName,awayName){
  const players=Array.isArray(payload.players)?payload.players:[];
  return `<div class="imcmr-team-lists"><section class="imcmr-team-card"><div class="imcmr-team-head"><span>${esc(homeName)}</span><span>Avg. ${esc(teamAverage(players,"home"))}</span></div>${playerRows(players,"home",false)}</section><section class="imcmr-team-card"><div class="imcmr-team-head"><span>${esc(awayName)}</span><span>Avg. ${esc(teamAverage(players,"away"))}</span></div>${playerRows(players,"away",false)}</section></div><section class="imcmr-sub-card"><h4>Sostituzioni</h4>${substitutionsMarkup(players,homeName,awayName)}</section>`;
}

function eventsMarkup(payload){
  const events=meaningfulEvents(payload);
  if(!events.length)return '<section class="imcmr-card"><h3>Events</h3><div>Nessun evento disponibile.</div></section>';
  return `<section class="imcmr-card"><h3>Events</h3><ul class="imcmr-events">${events.map(e=>`<li class="imcmr-event"><time>${esc(e.minute)}'</time><span class="ico">${eventIcon(e.type)}</span><div><strong>${esc(eventTitle(e))}</strong>${e.raw?`<small>${esc(e.raw)}</small>`:""}</div></li>`).join("")}</ul></section>`;
}

function openShell(){
  installCss();
  let root=document.getElementById(ROOT_ID);
  if(!root){root=document.createElement("section");root.id=ROOT_ID;document.body.appendChild(root);}
  root.innerHTML='<div class="imcmr-loading">Caricamento Match Report…</div>';
  return root;
}

function renderReport(report,logos){
  const root=document.getElementById(ROOT_ID);if(!root)return;
  const p=report.source_payload||{};
  const match=p.match||{};
  const result=p.result||{};
  const homeName=clean(match.homeTeam||result.homeTeam||"Casa");
  const awayName=clean(match.awayTeam||result.awayTeam||"Ospite");
  const hs=result.homeScore!=null?result.homeScore:match.homeScore;
  const as=result.awayScore!=null?result.awayScore:match.awayScore;
  const round=clean(result.sm_round_label||"Match Report");
  const penalty=result.decidedOnPenalties&&result.homePenalties!=null&&result.awayPenalties!=null?`Rigori ${result.homePenalties} - ${result.awayPenalties}`:(result.penaltyText||"");
  root.innerHTML=`<header class="imcmr-top"><button data-imcmr-back>‹</button><div class="imcmr-title"><small>${WORLD}</small><strong>National Cup</strong></div><span></span></header><main class="imcmr-main"><div class="imcmr-round-pill"><span>🏆</span><span>${esc(round)}</span></div><section class="imcmr-hero"><div class="imcmr-scoreline"><div class="imcmr-side">${logoMarkup(homeName,logos.home)}<strong>${esc(homeName)}</strong></div><div><div class="imcmr-score">${esc(hs)} - ${esc(as)}</div>${penalty?`<div class="imcmr-penalty">${esc(penalty)}</div>`:""}</div><div class="imcmr-side">${logoMarkup(awayName,logos.away)}<strong>${esc(awayName)}</strong></div></div><div class="imcmr-meta">${esc(prettyDate(match.matchDate||p.source_page_date||""))}<br>${esc(report.stadium_name||match.stadium||"")}${report.attendance!=null?` · ${Number(report.attendance).toLocaleString("it-IT")} spettatori`:""}</div></section><nav class="imcmr-tabs"><button data-imcmr-tab="overview" class="active">Overview</button><button data-imcmr-tab="lineups">Lineups</button><button data-imcmr-tab="ratings">Ratings</button><button data-imcmr-tab="events">Events</button></nav><section class="imcmr-panel active" data-imcmr-panel="overview">${overviewMarkup(p)}</section><section class="imcmr-panel" data-imcmr-panel="lineups">${lineupsMarkup(p,homeName,awayName)}</section><section class="imcmr-panel" data-imcmr-panel="ratings">${ratingsMarkup(p,homeName,awayName)}</section><section class="imcmr-panel" data-imcmr-panel="events">${eventsMarkup(p)}</section></main>`;
  root.querySelector("[data-imcmr-back]")?.addEventListener("click",()=>root.remove());
  root.querySelectorAll("[data-imcmr-tab]").forEach(btn=>btn.addEventListener("click",()=>{
    const tab=btn.dataset.imcmrTab;
    root.querySelectorAll("[data-imcmr-tab]").forEach(x=>x.classList.toggle("active",x===btn));
    root.querySelectorAll("[data-imcmr-panel]").forEach(x=>x.classList.toggle("active",x.dataset.imcmrPanel===tab));
  }));
}

async function openReport(game){
  const fixtureId=game.dataset.imcMrFixture;if(!fixtureId)return;
  const teams=game.querySelectorAll(".imcc-team");
  const logos={home:teams[0]?.querySelector("img")?.getAttribute("src")||"",away:teams[1]?.querySelector("img")?.getAttribute("src")||""};
  openShell();
  try{const report=await loadReport(fixtureId);renderReport(report,logos);}catch(error){const root=document.getElementById(ROOT_ID);if(root)root.innerHTML=`<header class="imcmr-top"><button data-imcmr-back>‹</button><div class="imcmr-title"><small>${WORLD}</small><strong>National Cup</strong></div><span></span></header><div class="imcmr-loading">${esc(error&&error.message||"Errore Match Report")}</div>`;root?.querySelector("[data-imcmr-back]")?.addEventListener("click",()=>root.remove());console.error("IMC GW001 Match Report",error);}
}

function scheduleDecorate(){clearTimeout(timer);timer=setTimeout(decorateResults,70);}

document.addEventListener("click",event=>{
  const game=event.target&&event.target.closest?event.target.closest("#imcCompetitionDetail .imcc-game[data-imc-mr-fixture]"):null;
  if(game&&isPilotPage()){
    event.preventDefault();event.stopPropagation();openReport(game);return;
  }
  const relevant=event.target&&event.target.closest?event.target.closest('#imcCompetitions [data-key],#imcCompetitionDetail [data-tab],#imcCompetitionDetail [data-back]'):null;
  if(relevant)scheduleDecorate();
},true);

function attach(){
  installCss();
  if(!observer){observer=new MutationObserver(scheduleDecorate);observer.observe(document.documentElement,{childList:true,subtree:true});}
  scheduleDecorate();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach,{once:true});else attach();
window.addEventListener("pageshow",scheduleDecorate);
window.IMC_MATCH_REPORT_GW001={version:VERSION,refresh:decorateResults,clearCache:()=>{indexPromise=null;reportCache.clear();}};
})();