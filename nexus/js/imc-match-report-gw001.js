(function(){
"use strict";

if(window.__IMC_MATCH_REPORT_GW001_V2__)return;
window.__IMC_MATCH_REPORT_GW001_V2__=true;

const VERSION="0.2.0-overview-ratings";
const WORLD="GW001";
const ROOT_ID="imcMatchReportGW001";
const STYLE_ID="imcMatchReportGW001CssV2";
const URL="https://toanuzojdkfjgucztpze.supabase.co";
const KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
let cfg=null;
try{cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){}
const db=window.__IMC_NEXUS_CLIENT__||(window.supabase?window.supabase.createClient(cfg&&cfg.url?cfg.url:URL,cfg&&cfg.key?cfg.key:KEY):null);
if(!db)return;

const reportCache=new Map();
const imageCache=new Map();

const clean=v=>String(v==null?"":v).replace(/\s+/g," ").trim();
const esc=v=>clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const img=v=>{v=clean(v);return v.startsWith("//")?"https:"+v:v;};
const initials=name=>clean(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()||"?";

function installCss(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");
  s.id=STYLE_ID;
  s.textContent=`
#${ROOT_ID}{position:fixed;inset:0;z-index:2147483450;overflow:auto;-webkit-overflow-scrolling:touch;background:#fff;color:#0b1833;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
#${ROOT_ID} *{box-sizing:border-box}
.imcmr-top{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:42px 1fr 42px;align-items:center;gap:8px;padding:10px 12px;background:rgba(255,255,255,.98);border-bottom:1px solid #e4e8ef}
.imcmr-top button{width:40px;height:40px;border:1px solid #dce2ea;border-radius:12px;background:#fff;color:#173766;font:800 20px/1 Inter,system-ui}
.imcmr-title{text-align:center;min-width:0}.imcmr-title small{display:block;color:#60708a;font-size:8px;font-weight:800;letter-spacing:.08em}.imcmr-title strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:900}
.imcmr-main{max-width:820px;margin:auto;padding:12px 12px 40px}
.imcmr-round-pill{display:flex;align-items:center;justify-content:center;gap:5px;width:max-content;margin:0 auto 9px;padding:5px 10px;border:1px solid #d9a22c;border-radius:999px;background:#fffaf0;color:#956400;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}
.imcmr-hero{padding:15px;border-radius:19px;background:linear-gradient(145deg,#17366f,#071b41);color:#fff;box-shadow:0 10px 26px rgba(10,35,78,.16)}
.imcmr-scoreline{display:grid;grid-template-columns:minmax(0,1fr) 76px minmax(0,1fr);align-items:center;gap:8px}.imcmr-side{display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;min-width:0}.imcmr-side img{width:58px;height:58px;object-fit:contain}.imcmr-logo-fallback{display:flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:50%;background:#fff;color:#123469;font-size:16px;font-weight:950}.imcmr-side strong{width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.imcmr-score{font-size:30px;font-weight:950;text-align:center;letter-spacing:-.04em}.imcmr-penalty{text-align:center;margin-top:4px;color:#f2cf78;font-size:8px;font-weight:800}.imcmr-meta{text-align:center;margin-top:11px;color:#d7e0ef;font-size:8px;font-weight:700;line-height:1.55}
.imcmr-scorers{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.2)}.imcmr-scorer-side{display:grid;gap:4px;min-width:0}.imcmr-scorer-side.away{text-align:right}.imcmr-scorer{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff;font-size:8px;font-weight:850}.imcmr-scorer span{opacity:.82}.imcmr-scorer-empty{color:#aebbd0;font-size:8px;font-weight:800}
.imcmr-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;margin:12px 0;padding:4px;border:1px solid #e1e6ed;border-radius:14px;background:#f8fafc}.imcmr-tabs button{height:40px;border:0;border-radius:10px;background:transparent;color:#657289;font:900 8px/1 Inter,system-ui;text-transform:uppercase}.imcmr-tabs button.active{background:#173766;color:#fff;box-shadow:0 2px 8px rgba(16,42,93,.12)}
.imcmr-panel{display:none}.imcmr-panel.active{display:block}.imcmr-card{margin-top:10px;padding:13px;border:1px solid #dfe5ed;border-radius:16px;background:#fff;box-shadow:0 4px 15px rgba(18,39,73,.035)}.imcmr-card h3{margin:0 0 11px;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.07em;color:#58677e}
.imcmr-stat{display:grid;grid-template-columns:42px 1fr 42px;gap:9px;align-items:center;margin:9px 0}.imcmr-stat b{font-size:13px}.imcmr-stat b:last-child{text-align:right}.imcmr-stat-mid{text-align:center}.imcmr-stat-mid span{display:block;margin-bottom:4px;color:#7a8799;font-size:7px;font-weight:800}.imcmr-bar{display:flex;height:3px;border-radius:3px;overflow:hidden;background:#e5eaf1}.imcmr-bar i{display:block;background:#173b75}.imcmr-bar em{display:block;background:#c7cfdb}
.imcmr-mvp{display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:9px}.imcmr-mvp .star{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#173766;color:#f2c94c;font-size:18px}.imcmr-mvp small{display:block;color:#7b8798;font-size:7px;font-weight:850;text-transform:uppercase}.imcmr-mvp strong{display:block;font-size:13px}.imcmr-rating-big{padding:6px 8px;border:1px solid #d9a22c;border-radius:9px;color:#9a6800;font-size:13px;font-weight:950}
.imcmr-ratings-duo{display:grid;grid-template-columns:1fr 1fr;gap:8px}.imcmr-rteam{min-width:0;overflow:hidden;border:1px solid #dfe5ed;border-radius:17px;background:#fff;box-shadow:0 5px 18px rgba(18,39,73,.04)}.imcmr-rteam-head{display:flex;align-items:center;gap:8px;min-height:54px;padding:8px 9px;border-bottom:1px solid #e9edf3}.imcmr-rteam-head img{width:34px;height:34px;object-fit:contain}.imcmr-rteam-logo-fallback{display:flex;align-items:center;justify-content:center;width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:#173766;color:#fff;font-size:9px;font-weight:950}.imcmr-rteam-head strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#173766;font-size:10px;font-weight:950;text-transform:uppercase}
.imcmr-rcols,.imcmr-rrow{display:grid;grid-template-columns:21px minmax(0,1fr) 29px 34px 47px;gap:3px;align-items:center}.imcmr-rcols{padding:7px 6px;color:#7b8798;font-size:5.2px;font-weight:900;text-transform:uppercase;border-bottom:1px solid #eef1f5}.imcmr-rcols span:nth-child(n+3){text-align:center}.imcmr-rrow{min-height:45px;padding:5px 6px;border-top:1px solid #eef1f5}.imcmr-rrow:first-child{border-top:0}.imcmr-rnum{display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:#173766;color:#fff;font-size:6.5px;font-weight:950}.imcmr-rplayer{display:flex;align-items:center;gap:4px;min-width:0}.imcmr-ravatar{display:flex;align-items:flex-end;justify-content:center;flex:0 0 25px;width:25px;height:29px;border-radius:14px 14px 9px 9px;background:#edf2f8;overflow:hidden;border:1px solid #dce4ef}.imcmr-ravatar img{width:100%;height:100%;object-fit:contain;object-position:center bottom}.imcmr-ravatar b{font-size:6px;color:#173766}.imcmr-rname{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#0b1833;font-size:6.4px;font-weight:900}.imcmr-rmin{text-align:center;color:#314765;font-size:6.5px;font-weight:900}.imcmr-rpill{display:inline-flex;align-items:center;justify-content:center;min-width:29px;height:22px;padding:0 4px;border-radius:7px;background:#173766;color:#fff;font-size:6.8px;font-weight:950;margin:auto}.imcmr-rpill.mid{background:#d4a12a}.imcmr-rpill.low{background:#b13a3a}.imcmr-rpill.empty{background:#edf1f6;color:#8190a3}.imcmr-revents{display:flex;align-items:center;justify-content:flex-end;gap:3px;min-width:0;white-space:nowrap;color:#596b84;font-size:5.7px;font-weight:900}.imcmr-revents .goal{font-size:8px}.imcmr-revents .assist{display:flex;align-items:center;justify-content:center;width:12px;height:12px;border-radius:50%;background:#173766;color:#fff;font-size:5px}.imcmr-revents .yc{width:6px;height:9px;border-radius:1px;background:#f4c631}.imcmr-revents .rc{width:6px;height:9px;border-radius:1px;background:#c83d3d}.imcmr-revents .in{color:#238b45}.imcmr-revents .out{color:#c83d3d}.imcmr-revents .cap{display:flex;align-items:center;justify-content:center;width:12px;height:12px;border-radius:50%;background:#e8edf4;color:#173766;font-size:5px}.imcmr-revents .mvp{color:#c69217;font-size:8px}.imcmr-rsubhead{height:26px;display:flex;align-items:center;padding:0 7px;border-top:1px solid #dfe5ed;background:#f7f9fc;color:#173766;font-size:6px;font-weight:950;text-transform:uppercase;letter-spacing:.05em}.imcmr-rempty{padding:15px 8px;color:#7b8798;font-size:6.5px;text-align:center}
.imcmr-loading{padding:45px 12px;text-align:center;color:#6f7d91;font-size:10px;font-weight:800}
@media(max-width:390px){.imcmr-main{padding-left:9px;padding-right:9px}.imcmr-scoreline{grid-template-columns:minmax(0,1fr) 65px minmax(0,1fr)}.imcmr-side img,.imcmr-logo-fallback{width:50px;height:50px}.imcmr-ratings-duo{gap:5px}.imcmr-rteam-head{padding:7px 6px;gap:5px}.imcmr-rteam-head img,.imcmr-rteam-logo-fallback{width:29px;height:29px;flex-basis:29px}.imcmr-rteam-head strong{font-size:8px}.imcmr-rcols,.imcmr-rrow{grid-template-columns:18px minmax(0,1fr) 25px 30px 41px;gap:2px}.imcmr-rcols{padding-left:4px;padding-right:4px;font-size:4.7px}.imcmr-rrow{padding-left:4px;padding-right:4px;min-height:42px}.imcmr-rnum{width:18px;height:18px;font-size:5.8px}.imcmr-ravatar{width:22px;height:26px;flex-basis:22px}.imcmr-rname{font-size:5.7px}.imcmr-rmin{font-size:5.8px}.imcmr-rpill{min-width:26px;height:20px;font-size:6px}.imcmr-revents{gap:2px;font-size:5px}}
`;
  document.head.appendChild(s);
}

function prettyDate(v){
  const p=String(v||"").slice(0,10).split("-");
  if(p.length!==3)return clean(v);
  const months=["GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO","SET","OTT","NOV","DIC"];
  return Number(p[2])+" "+(months[Number(p[1])-1]||p[1])+" "+p[0];
}
function logoMarkup(name,url){return url?`<img src="${esc(img(url))}" alt="">`:`<span class="imcmr-logo-fallback">${esc(initials(name))}</span>`;}
function teamHeaderLogo(name,url){return url?`<img src="${esc(img(url))}" alt="">`:`<span class="imcmr-rteam-logo-fallback">${esc(initials(name))}</span>`;}

async function loadReport(fixtureId){
  const key=String(fixtureId);
  if(reportCache.has(key))return reportCache.get(key);
  const p=(async()=>{
    const r=await db.from("gw001_match_reports").select("report_id,sm_fixture_id,source_competition_name,stadium_name,attendance,home_manager_name,away_manager_name,parser_status,source_payload").eq("sm_fixture_id",Number(fixtureId)).maybeSingle();
    if(r.error)throw r.error;
    if(!r.data)throw new Error("Match Report non trovato");
    return r.data;
  })();
  reportCache.set(key,p);
  try{return await p;}catch(e){reportCache.delete(key);throw e;}
}

async function loadImages(players){
  const ids=[...new Set((players||[]).map(p=>p.smPlayerId).filter(v=>v!=null).map(String))];
  const missing=ids.filter(id=>!imageCache.has(id));
  for(let i=0;i<missing.length;i+=100){
    const r=await db.from("player_codex_global").select("player_id,image_url").in("player_id",missing.slice(i,i+100));
    if(r.error)throw r.error;
    (r.data||[]).forEach(x=>imageCache.set(String(x.player_id),img(x.image_url)));
  }
}

function scorers(payload){
  const players=Array.isArray(payload.players)?payload.players:[];
  const names=new Map(players.map(p=>[String(p.smPlayerId||""),clean(p.playerName)]));
  return (Array.isArray(payload.events)?payload.events:[])
    .filter(e=>e&&e.eventType==="goal"&&String(e?.metadata?.source||"")==="scorer_header")
    .map(e=>({side:e.side,minute:Number(e.minute||0),name:names.get(String(e.primarySmPlayerId||""))||clean(e.primaryPlayerName||"Gol")}))
    .sort((a,b)=>a.minute-b.minute);
}
function scorerSideMarkup(rows,side){
  const list=rows.filter(x=>x.side===side);
  if(!list.length)return '<div class="imcmr-scorer-empty">-</div>';
  return list.map(x=>`<div class="imcmr-scorer"><span>⚽ ${esc(x.minute)}'</span> ${esc(x.name)}</div>`).join("");
}

function statsMarkup(stats){
  const h=stats?.home||{},a=stats?.away||{};
  const rows=[["Possesso palla",h.possession,a.possession,"%"],["Tiri totali",h.totalShots,a.totalShots,""],["Tiri in porta",h.shotsOnTarget,a.shotsOnTarget,""],["Corner",h.corners,a.corners,""],["Gialli",h.yellowCards,a.yellowCards,""],["Rossi",h.redCards,a.redCards,""]];
  return rows.map(([label,hv,av,sfx])=>{const hn=Number(hv||0),an=Number(av||0),sum=Math.max(1,hn+an),hp=label==="Possesso palla"?Math.max(0,Math.min(100,hn)):Math.round(hn/sum*100);return `<div class="imcmr-stat"><b>${esc(hv)}${sfx}</b><div class="imcmr-stat-mid"><span>${esc(label)}</span><div class="imcmr-bar"><i style="width:${hp}%"></i><em style="width:${100-hp}%"></em></div></div><b>${esc(av)}${sfx}</b></div>`;}).join("");
}
function ratingText(v){const n=Number(v);return Number.isFinite(n)&&n>0?n.toFixed(1):"-";}
function overviewMarkup(payload){
  const players=Array.isArray(payload.players)?payload.players:[];
  const mvp=players.find(p=>p.isManOfMatch)||null;
  return `<section class="imcmr-card"><h3>Statistiche partita</h3>${statsMarkup(payload.teamStats||{})}</section>${mvp?`<section class="imcmr-card imcmr-mvp"><span class="star">★</span><div><small>MVP</small><strong>${esc(mvp.playerName)}</strong></div><span class="imcmr-rating-big">${esc(ratingText(mvp.rating))}</span></section>`:""}`;
}

function validMinute(value){const n=Number(value);return Number.isFinite(n)&&n>0&&n<=120?n:null;}
function parseMinute(p,type){
  const raw=String(p?.metadata?.rawHtml||"");
  const marker=type==="on"?"subon":"suboff";
  const m=raw.match(new RegExp(marker+"[\\s\\S]*?\\((\\d+)\\)","i"));
  return m?validMinute(m[1]):null;
}
function subOn(p){const direct=validMinute(p&&p.subOnMinute);return direct!=null?direct:parseMinute(p,"on");}
function subOff(p){const direct=validMinute(p&&p.subOffMinute);return direct!=null?direct:parseMinute(p,"off");}
function minutesPlayed(p){
  const on=subOn(p),off=subOff(p);
  if(p.isStarter)return off!=null?Math.max(0,Math.min(90,off)):90;
  if(on!=null){const end=off!=null&&off>on?Math.min(90,off):90;return Math.max(0,end-on);}
  return null;
}
function ratingClass(v){const n=Number(v);return !Number.isFinite(n)||n<=0?"empty":n>=7?"":n>=6?"mid":"low";}
function eventMarkup(p){
  const bits=[];
  const goals=Number(p.goals||0),assists=Number(p.assists||0),yc=Number(p.yellowCards||0),rc=Number(p.redCards||0),on=subOn(p),off=subOff(p);
  if(goals>0)bits.push(`<span class="goal">⚽${goals>1?"×"+goals:""}</span>`);
  if(assists>0)bits.push(`<span class="assist">A${assists>1?assists:""}</span>`);
  if(yc>0)bits.push('<span class="yc"></span>');
  if(rc>0)bits.push('<span class="rc"></span>');
  if(!p.isStarter&&on!=null)bits.push(`<span class="in">↑${esc(on)}'</span>`);
  if(p.isStarter&&off!=null)bits.push(`<span class="out">↓${esc(off)}'</span>`);
  if(p.isCaptain)bits.push('<span class="cap">C</span>');
  if(p.isManOfMatch)bits.push('<span class="mvp">★</span>');
  return bits.join("");
}
function playerRow(p){
  const url=imageCache.get(String(p.smPlayerId||""))||"";
  const min=minutesPlayed(p),minText=min==null?"":min+"'";
  return `<div class="imcmr-rrow"><span class="imcmr-rnum">${esc(p.lineupSlot||"")}</span><span class="imcmr-rplayer"><span class="imcmr-ravatar">${url?`<img src="${esc(url)}" alt="" loading="lazy">`:`<b>${esc(initials(p.playerName))}</b>`}</span><span class="imcmr-rname">${esc(p.playerName||"-")}</span></span><span class="imcmr-rmin">${esc(minText)}</span><span class="imcmr-rpill ${ratingClass(p.rating)}">${esc(ratingText(p.rating))}</span><span class="imcmr-revents">${eventMarkup(p)}</span></div>`;
}
function playerRows(players,side){
  const all=players.filter(p=>p.side===side).sort((a,b)=>Number(a.lineupSlot||99)-Number(b.lineupSlot||99));
  const starters=all.filter(p=>p.isStarter),subs=all.filter(p=>!p.isStarter);
  return `${starters.map(playerRow).join("")}<div class="imcmr-rsubhead">Sostituti</div>${subs.length?subs.map(playerRow).join(""):'<div class="imcmr-rempty">Nessun sostituto disponibile</div>'}`;
}
function ratingsTeam(payload,side,name,logo){
  const players=Array.isArray(payload.players)?payload.players:[];
  return `<section class="imcmr-rteam"><header class="imcmr-rteam-head">${teamHeaderLogo(name,logo)}<strong>${esc(name)}</strong></header><div class="imcmr-rcols"><span>#</span><span>Giocatore</span><span>Min</span><span>Voto</span><span>Eventi</span></div>${playerRows(players,side)}</section>`;
}
function ratingsMarkup(payload,homeName,awayName,logos){return `<div class="imcmr-ratings-duo">${ratingsTeam(payload,"home",homeName,logos.home)}${ratingsTeam(payload,"away",awayName,logos.away)}</div>`;}

function openShell(){
  installCss();
  let root=document.getElementById(ROOT_ID);
  if(!root){root=document.createElement("section");root.id=ROOT_ID;document.body.appendChild(root);}
  root.innerHTML='<div class="imcmr-loading">Caricamento Match Report…</div>';
  return root;
}
function closeReport(){document.getElementById(ROOT_ID)?.remove();}

async function renderReport(report,logos,title){
  const root=document.getElementById(ROOT_ID);if(!root)return;
  const p=report.source_payload||{},match=p.match||{},result=p.result||{};
  const homeName=clean(match.homeTeam||result.homeTeam||"Casa"),awayName=clean(match.awayTeam||result.awayTeam||"Ospite");
  const hs=result.homeScore!=null?result.homeScore:match.homeScore,as=result.awayScore!=null?result.awayScore:match.awayScore;
  const round=clean(result.sm_round_label||"Match Report");
  const penalty=result.decidedOnPenalties&&result.homePenalties!=null&&result.awayPenalties!=null?`Rigori ${result.homePenalties} - ${result.awayPenalties}`:(result.penaltyText||"");
  const scoreEvents=scorers(p);
  await loadImages(Array.isArray(p.players)?p.players:[]);
  root.innerHTML=`<header class="imcmr-top"><button data-imcmr-back>‹</button><div class="imcmr-title"><small>${WORLD}</small><strong>${esc(title||report.source_competition_name||"Match Report")}</strong></div><span></span></header><main class="imcmr-main"><div class="imcmr-round-pill"><span>🏆</span><span>${esc(round)}</span></div><section class="imcmr-hero"><div class="imcmr-scoreline"><div class="imcmr-side">${logoMarkup(homeName,logos.home)}<strong>${esc(homeName)}</strong></div><div><div class="imcmr-score">${esc(hs)} - ${esc(as)}</div>${penalty?`<div class="imcmr-penalty">${esc(penalty)}</div>`:""}</div><div class="imcmr-side">${logoMarkup(awayName,logos.away)}<strong>${esc(awayName)}</strong></div></div><div class="imcmr-meta">${esc(prettyDate(match.matchDate||""))}<br>${esc(report.stadium_name||match.stadium||"")}${report.attendance!=null?` · ${Number(report.attendance).toLocaleString("it-IT")} spettatori`:""}</div><div class="imcmr-scorers"><div class="imcmr-scorer-side">${scorerSideMarkup(scoreEvents,"home")}</div><div class="imcmr-scorer-side away">${scorerSideMarkup(scoreEvents,"away")}</div></div></section><nav class="imcmr-tabs"><button data-imcmr-tab="overview" class="active">Overview</button><button data-imcmr-tab="ratings">Ratings</button></nav><section class="imcmr-panel active" data-imcmr-panel="overview">${overviewMarkup(p)}</section><section class="imcmr-panel" data-imcmr-panel="ratings">${ratingsMarkup(p,homeName,awayName,logos)}</section></main>`;
  root.querySelector("[data-imcmr-back]")?.addEventListener("click",closeReport);
  root.querySelectorAll("[data-imcmr-tab]").forEach(btn=>btn.addEventListener("click",()=>{
    const tab=btn.dataset.imcmrTab;
    root.querySelectorAll("[data-imcmr-tab]").forEach(x=>x.classList.toggle("active",x===btn));
    root.querySelectorAll("[data-imcmr-panel]").forEach(x=>x.classList.toggle("active",x.dataset.imcmrPanel===tab));
  }));
}

async function openFixture(fixtureId,logos,title){
  if(fixtureId==null)return;
  openShell();
  try{
    const report=await loadReport(fixtureId);
    if(report.parser_status!=="complete")throw new Error("Match Report non completo");
    await renderReport(report,logos||{home:"",away:""},title);
  }catch(error){
    const root=document.getElementById(ROOT_ID);
    if(root)root.innerHTML=`<header class="imcmr-top"><button data-imcmr-back>‹</button><div class="imcmr-title"><small>${WORLD}</small><strong>${esc(title||"Match Report")}</strong></div><span></span></header><div class="imcmr-loading">${esc(error&&error.message||"Errore Match Report")}</div>`;
    root?.querySelector("[data-imcmr-back]")?.addEventListener("click",closeReport);
    console.error("IMC GW001 Match Report",error);
  }
}

installCss();
window.IMC_MATCH_REPORT_GW001={version:VERSION,openFixture:openFixture,refresh:function(){},clearCache:function(){reportCache.clear();imageCache.clear();}};
})();