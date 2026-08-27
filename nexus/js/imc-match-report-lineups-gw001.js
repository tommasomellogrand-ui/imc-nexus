(function(){
"use strict";

const VERSION="0.4.0-split-modern";
const ROOT_ID="imcMatchReportGW001";
const STYLE_ID="imcMatchReportGW001StartingXiCss";
const URL="https://toanuzojdkfjgucztpze.supabase.co";
const KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
let timer=null;
let reportIndexPromise=null;
const imageCache=new Map();
const featuredCache=new Map();
let cfg=null;
try{cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){}
const db=window.__IMC_NEXUS_CLIENT__||(window.supabase?window.supabase.createClient(cfg&&cfg.url?cfg.url:URL,cfg&&cfg.key?cfg.key:KEY):null);
if(!db)return;

const clean=v=>String(v==null?"":v).replace(/\s+/g," ").trim();
const norm=v=>clean(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const esc=v=>clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const img=v=>{v=clean(v);return v.startsWith("//")?"https:"+v:v;};

function installCss(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent=`
#${ROOT_ID} [data-imcmr-panel="lineups"]{padding-bottom:10px}
#${ROOT_ID} .imcmr-xi-switch{display:grid;grid-template-columns:1fr 1fr;margin:0 0 10px;border:1px solid #dfe5ee;border-radius:13px;overflow:hidden;background:#fff;box-shadow:0 3px 12px rgba(18,39,73,.035)}
#${ROOT_ID} .imcmr-xi-switch button{height:42px;border:0;background:#fff;color:#63718a;font:800 9px/1 Inter,system-ui;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 9px}
#${ROOT_ID} .imcmr-xi-switch button.active{background:#173766;color:#fff}
#${ROOT_ID} .imcmr-xi-card{overflow:hidden;border:1px solid #dfe5ed;border-radius:18px;background:#fff;box-shadow:0 7px 22px rgba(18,39,73,.055)}
#${ROOT_ID} .imcmr-xi-head{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;min-height:86px;padding:13px 15px;border-bottom:1px solid #e4e9f0;background:#fff}
#${ROOT_ID} .imcmr-xi-club{display:grid;grid-template-columns:54px minmax(0,1fr);align-items:center;gap:10px;min-width:0}
#${ROOT_ID} .imcmr-xi-club-logo{display:flex;align-items:center;justify-content:center;width:54px;height:54px;overflow:hidden}
#${ROOT_ID} .imcmr-xi-club-logo img{display:block;max-width:100%;max-height:100%;object-fit:contain}
#${ROOT_ID} .imcmr-xi-club-fallback{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#173766;color:#fff;font-size:15px;font-weight:900}
#${ROOT_ID} .imcmr-xi-club-copy{min-width:0}
#${ROOT_ID} .imcmr-xi-club-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#122744;font-size:16px;font-weight:900;letter-spacing:-.02em;text-transform:uppercase}
#${ROOT_ID} .imcmr-xi-manager{display:block;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#718097;font-size:7px;font-weight:800;text-transform:uppercase;letter-spacing:.035em}
#${ROOT_ID} .imcmr-xi-manager b{color:#223752;font-weight:900}
#${ROOT_ID} .imcmr-xi-comp{text-align:right;color:#6f7e95;font-size:7px;font-weight:800;line-height:1.4;white-space:nowrap}
#${ROOT_ID} .imcmr-xi-comp strong{display:block;color:#223752;font-size:8px;font-weight:900}
#${ROOT_ID} .imcmr-xi-main{display:grid;grid-template-columns:44% 56%;min-height:500px}
#${ROOT_ID} .imcmr-xi-feature{position:relative;overflow:hidden;min-width:0;background:linear-gradient(160deg,#f8f9fb 0%,#f0f3f7 58%,#e7ebf1 100%)}
#${ROOT_ID} .imcmr-xi-feature:before{content:"";position:absolute;inset:0;background:linear-gradient(136deg,rgba(23,55,102,.09),transparent 43%),repeating-linear-gradient(135deg,rgba(23,55,102,.035) 0,rgba(23,55,102,.035) 1px,transparent 1px,transparent 8px)}
#${ROOT_ID} .imcmr-xi-feature:after{content:"";position:absolute;left:0;top:0;bottom:0;width:10px;background:#d7193f;z-index:1}
#${ROOT_ID} .imcmr-xi-feature img{position:absolute;left:50%;bottom:0;z-index:2;width:124%;height:88%;transform:translateX(-50%);object-fit:contain;object-position:center bottom}
#${ROOT_ID} .imcmr-xi-feature-fallback{position:absolute;left:50%;top:50%;z-index:2;display:flex;align-items:center;justify-content:center;width:110px;height:110px;transform:translate(-50%,-50%);border-radius:50%;background:#173766;color:#fff;font-size:28px;font-weight:900}
#${ROOT_ID} .imcmr-xi-feature-number{position:absolute;left:20px;top:18px;z-index:4;color:#d7193f;font-size:44px;font-weight:300;line-height:1}
#${ROOT_ID} .imcmr-xi-feature-label{position:absolute;left:16px;right:12px;bottom:16px;z-index:4;padding:9px 10px 8px;background:rgba(255,255,255,.92);border-left:4px solid #d7193f;box-shadow:0 3px 12px rgba(19,39,73,.08)}
#${ROOT_ID} .imcmr-xi-feature-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#173766;font-size:13px;font-weight:950;line-height:1;text-transform:uppercase}
#${ROOT_ID} .imcmr-xi-feature-team{display:block;margin-top:4px;color:#7a8799;font-size:6px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
#${ROOT_ID} .imcmr-xi-list{padding:18px 15px 15px;background:#fff}
#${ROOT_ID} .imcmr-xi-title{margin:0 0 14px;color:#173766;font-size:28px;font-weight:950;line-height:.95;letter-spacing:-.045em;text-transform:uppercase}
#${ROOT_ID} .imcmr-xi-title span{color:#d7193f}
#${ROOT_ID} .imcmr-xi-row{display:grid;grid-template-columns:28px minmax(0,1fr) 18px;gap:7px;align-items:center;min-height:32px;padding:0 4px;border-top:1px solid #edf0f4}
#${ROOT_ID} .imcmr-xi-row:first-of-type{border-top:0}
#${ROOT_ID} .imcmr-xi-row.featured{margin:1px -4px;padding:0 8px;border-top-color:transparent;border-radius:5px;background:#fdebf0}
#${ROOT_ID} .imcmr-xi-num{color:#d7193f;font-size:12px;font-weight:900;text-align:right}
#${ROOT_ID} .imcmr-xi-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#122744;font-size:10px;font-weight:850;text-transform:uppercase}
#${ROOT_ID} .imcmr-xi-cap{display:flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:4px;background:#d7193f;color:#fff;font-size:7px;font-weight:900}
#${ROOT_ID} .imcmr-xi-subs{padding:13px 14px 15px;border-top:1px solid #e4e9f0;background:#fff}
#${ROOT_ID} .imcmr-xi-subs-head{margin-bottom:9px;color:#d7193f;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.035em}
#${ROOT_ID} .imcmr-xi-subs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 14px}
#${ROOT_ID} .imcmr-xi-sub{display:grid;grid-template-columns:24px minmax(0,1fr);gap:6px;align-items:center;min-height:27px;border-top:1px solid #eef1f5}
#${ROOT_ID} .imcmr-xi-sub:nth-child(-n+2){border-top:0}
#${ROOT_ID} .imcmr-xi-sub b{color:#d7193f;font-size:8px;text-align:right}#${ROOT_ID} .imcmr-xi-sub span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#42516a;font-size:7.5px;font-weight:800;text-transform:uppercase}
#${ROOT_ID} .imcmr-xi-loading{display:flex;align-items:center;justify-content:center;height:240px;color:#6f7d91;font-size:9px;font-weight:800}
@media(max-width:390px){
  #${ROOT_ID} .imcmr-xi-head{grid-template-columns:minmax(0,1fr) auto;min-height:78px;padding:11px 10px}
  #${ROOT_ID} .imcmr-xi-club{grid-template-columns:46px minmax(0,1fr);gap:8px}
  #${ROOT_ID} .imcmr-xi-club-logo{width:46px;height:46px}
  #${ROOT_ID} .imcmr-xi-club-name{font-size:14px}
  #${ROOT_ID} .imcmr-xi-comp{font-size:6px}#${ROOT_ID} .imcmr-xi-comp strong{font-size:7px}
  #${ROOT_ID} .imcmr-xi-main{grid-template-columns:43% 57%;min-height:470px}
  #${ROOT_ID} .imcmr-xi-list{padding:15px 10px 12px}
  #${ROOT_ID} .imcmr-xi-title{font-size:24px;margin-bottom:11px}
  #${ROOT_ID} .imcmr-xi-row{grid-template-columns:23px minmax(0,1fr) 16px;gap:5px;min-height:29px}
  #${ROOT_ID} .imcmr-xi-num{font-size:10px}#${ROOT_ID} .imcmr-xi-name{font-size:8.3px}
  #${ROOT_ID} .imcmr-xi-feature-number{font-size:38px;left:17px;top:15px}
  #${ROOT_ID} .imcmr-xi-feature-label{left:13px;right:9px;bottom:13px;padding:8px 7px 7px}
  #${ROOT_ID} .imcmr-xi-feature-name{font-size:10px}
  #${ROOT_ID} .imcmr-xi-feature-team{font-size:5.5px}
}
`;
  document.head.appendChild(style);
}

async function loadReports(){
  if(reportIndexPromise)return reportIndexPromise;
  reportIndexPromise=(async()=>{
    const r=await db.from("gw001_match_reports").select("sm_fixture_id,source_payload,parser_status").eq("parser_status","complete");
    if(r.error)throw r.error;
    return r.data||[];
  })().catch(error=>{reportIndexPromise=null;throw error;});
  return reportIndexPromise;
}

function currentMatchKey(root){
  const sides=root.querySelectorAll(".imcmr-hero .imcmr-side strong");
  const home=norm(sides[0]?.textContent||"");
  const away=norm(sides[1]?.textContent||"");
  const score=clean(root.querySelector(".imcmr-score")?.textContent||"").replace(/\s+/g,"");
  const round=norm(root.querySelector(".imcmr-round-pill span:last-child")?.textContent||"");
  return {home,away,score,round};
}

function reportMatches(report,key){
  const p=report?.source_payload||{},m=p.match||{},r=p.result||{};
  const score=(r.homeScore!=null&&r.awayScore!=null)?String(r.homeScore)+"-"+String(r.awayScore):String(m.homeScore)+"-"+String(m.awayScore);
  return norm(m.homeTeam||r.homeTeam||"")===key.home&&norm(m.awayTeam||r.awayTeam||"")===key.away&&clean(score)===key.score&&norm(r.sm_round_label||"")===key.round;
}

async function playerImages(players){
  const ids=[...new Set(players.map(p=>Number(p.smPlayerId)).filter(Number.isFinite))];
  const missing=ids.filter(id=>!imageCache.has(id));
  if(missing.length){
    const r=await db.from("player_codex_global").select("player_id,image_url").in("player_id",missing);
    if(r.error)throw r.error;
    (r.data||[]).forEach(row=>imageCache.set(Number(row.player_id),img(row.image_url)));
    missing.forEach(id=>{if(!imageCache.has(id))imageCache.set(id,"");});
  }
}

function initials(name){return clean(name).split(" ").filter(Boolean).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()||"?";}

function teamData(payload,side,root){
  const match=payload.match||{};
  const players=(Array.isArray(payload.players)?payload.players:[]).filter(p=>p.side===side).sort((a,b)=>Number(a.lineupSlot||99)-Number(b.lineupSlot||99));
  const logos=root.querySelectorAll(".imcmr-hero .imcmr-side img");
  const logo=img(logos[side==="home"?0:1]?.getAttribute("src")||"");
  return {
    name:side==="home"?clean(match.homeTeam||"Casa"):clean(match.awayTeam||"Ospite"),
    manager:side==="home"?clean(match.homeManager||""):clean(match.awayManager||""),
    logo,
    competition:clean(match.competition||"National Cup"),
    players
  };
}

function featuredPlayer(report,team,side){
  const starters=team.players.filter(p=>p.isStarter);
  if(!starters.length)return null;
  const key=String(report.sm_fixture_id)+":"+side;
  if(!featuredCache.has(key))featuredCache.set(key,starters[Math.floor(Math.random()*starters.length)]);
  return featuredCache.get(key);
}

function featureMarkup(player,teamName){
  if(!player)return '<div class="imcmr-xi-feature"><span class="imcmr-xi-feature-fallback">XI</span></div>';
  const url=imageCache.get(Number(player.smPlayerId))||"";
  return `<div class="imcmr-xi-feature">${url?`<img src="${esc(url)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="imcmr-xi-feature-fallback" style="display:none">${esc(initials(player.playerName))}</span>`:`<span class="imcmr-xi-feature-fallback">${esc(initials(player.playerName))}</span>`}<span class="imcmr-xi-feature-number">${esc(player.lineupSlot)}</span><div class="imcmr-xi-feature-label"><strong class="imcmr-xi-feature-name">${esc(player.playerName)}</strong><small class="imcmr-xi-feature-team">${esc(teamName)}</small></div></div>`;
}

function starterRows(players,featured){
  return players.filter(p=>p.isStarter).map(p=>{
    const isFeatured=featured&&String(p.smPlayerId||"")===String(featured.smPlayerId||"");
    return `<div class="imcmr-xi-row${isFeatured?" featured":""}"><span class="imcmr-xi-num">${esc(p.lineupSlot)}</span><span class="imcmr-xi-name">${esc(p.playerName)}</span>${p.isCaptain?'<span class="imcmr-xi-cap">C</span>':'<span></span>'}</div>`;
  }).join("");
}

function subRows(players){
  const subs=players.filter(p=>!p.isStarter);
  if(!subs.length)return '<div class="imcmr-xi-sub"><b>—</b><span>Nessun sostituto</span></div>';
  return subs.map(p=>`<div class="imcmr-xi-sub"><b>${esc(p.lineupSlot)}</b><span>${esc(p.playerName)}</span></div>`).join("");
}

function headerMarkup(team){
  const logo=team.logo?`<img src="${esc(team.logo)}" alt="" loading="lazy">`:`<span class="imcmr-xi-club-fallback">${esc(initials(team.name))}</span>`;
  const manager=team.manager?`<small class="imcmr-xi-manager">MANAGER&nbsp;&nbsp;<b>${esc(team.manager)}</b></small>`:"";
  return `<div class="imcmr-xi-head"><div class="imcmr-xi-club"><div class="imcmr-xi-club-logo">${logo}</div><div class="imcmr-xi-club-copy"><strong class="imcmr-xi-club-name">${esc(team.name)}</strong>${manager}</div></div><div class="imcmr-xi-comp"><strong>GW001</strong>🏆 ${esc(team.competition||"National Cup")}</div></div>`;
}

function teamMarkup(report,team,side){
  const featured=featuredPlayer(report,team,side);
  return `<section class="imcmr-xi-card">${headerMarkup(team)}<div class="imcmr-xi-main">${featureMarkup(featured,team.name)}<div class="imcmr-xi-list"><h2 class="imcmr-xi-title">Starting <span>XI</span></h2>${starterRows(team.players,featured)}</div></div><div class="imcmr-xi-subs"><div class="imcmr-xi-subs-head">Substitutes</div><div class="imcmr-xi-subs-grid">${subRows(team.players)}</div></div></section>`;
}

async function renderStartingXi(root,report){
  const panel=root.querySelector('[data-imcmr-panel="lineups"]');
  if(!panel)return;
  const payload=report.source_payload||{};
  const home=teamData(payload,"home",root),away=teamData(payload,"away",root);
  await playerImages(home.players.concat(away.players));
  const tab=root.querySelector('[data-imcmr-tab="lineups"]');
  if(tab)tab.textContent="STARTING XI";
  panel.dataset.startingXiReady="1";
  panel.innerHTML=`<div class="imcmr-xi-switch"><button type="button" data-xi-side="home" class="active">${esc(home.name)}</button><button type="button" data-xi-side="away">${esc(away.name)}</button></div><div data-xi-body>${teamMarkup(report,home,"home")}</div>`;
  panel.querySelectorAll("[data-xi-side]").forEach(btn=>btn.addEventListener("click",()=>{
    const side=btn.dataset.xiSide;
    panel.querySelectorAll("[data-xi-side]").forEach(x=>x.classList.toggle("active",x===btn));
    const target=panel.querySelector("[data-xi-body]");
    if(target)target.innerHTML=side==="away"?teamMarkup(report,away,"away"):teamMarkup(report,home,"home");
  }));
}

async function apply(){
  const root=document.getElementById(ROOT_ID);if(!root)return;
  installCss();
  const tab=root.querySelector('[data-imcmr-tab="lineups"]');if(tab)tab.textContent="STARTING XI";
  const panel=root.querySelector('[data-imcmr-panel="lineups"]');
  if(!panel||panel.dataset.startingXiReady==="1")return;
  panel.innerHTML='<div class="imcmr-xi-loading">Caricamento Starting XI…</div>';
  try{
    const reports=await loadReports(),key=currentMatchKey(root),report=reports.find(r=>reportMatches(r,key));
    if(!report){panel.innerHTML='<div class="imcmr-xi-loading">Starting XI non disponibile.</div>';return;}
    await renderStartingXi(root,report);
  }catch(error){panel.innerHTML='<div class="imcmr-xi-loading">Starting XI non disponibile.</div>';console.error("IMC GW001 Starting XI",error);}
}

function schedule(){clearTimeout(timer);timer=setTimeout(apply,40);}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener("click",event=>{if(event.target&&event.target.closest&&event.target.closest('[data-imcmr-tab="lineups"]'))schedule();},true);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
window.addEventListener("pageshow",schedule);
window.IMC_MATCH_REPORT_GW001_LINEUPS={version:VERSION,refresh:apply,clearCache:()=>{reportIndexPromise=null;imageCache.clear();featuredCache.clear();}};
})();