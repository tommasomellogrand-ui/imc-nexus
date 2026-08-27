(function(){
"use strict";

const VERSION="0.2.0-editorial-lineups";
const ROOT_ID="imcMatchReportGW001";
const STYLE_ID="imcMatchReportGW001LineupsCss";
const URL="https://toanuzojdkfjgucztpze.supabase.co";
const KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
let timer=null;
let reportIndexPromise=null;
const imageCache=new Map();
let cfg=null;
try{cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){}
const db=window.__IMC_NEXUS_CLIENT__||(window.supabase?window.supabase.createClient(cfg&&cfg.url?cfg.url:URL,cfg&&cfg.key?cfg.key:KEY):null);
if(!db)return;

const clean=v=>String(v==null?"":v).replace(/\s+/g," ").trim();
const norm=v=>clean(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const esc=v=>clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const img=v=>{v=clean(v);return v.startsWith("//")?"https:"+v:v;};

const POS={
  1:[50,91],
  2:[15,72],3:[38,72],4:[62,72],5:[85,72],
  6:[38,52],7:[62,52],
  8:[15,31],10:[50,31],11:[85,31],
  9:[50,12]
};

function installCss(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent=`
#${ROOT_ID} [data-imcmr-panel="lineups"]{padding-bottom:10px}
#${ROOT_ID} .imcmr-editorial-switch{display:grid;grid-template-columns:1fr 1fr;margin:0 0 10px;border:1px solid #dfe5ee;border-radius:13px;overflow:hidden;background:#fff;box-shadow:0 3px 12px rgba(18,39,73,.035)}
#${ROOT_ID} .imcmr-editorial-switch button{height:42px;border:0;background:#fff;color:#63718a;font:800 9px/1 Inter,system-ui;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 9px}
#${ROOT_ID} .imcmr-editorial-switch button.active{background:#173766;color:#fff}
#${ROOT_ID} .imcmr-editorial-shell{padding:10px;border:1px solid #dce4ef;border-radius:19px;background:#fff;box-shadow:0 7px 22px rgba(18,39,73,.055)}
#${ROOT_ID} .imcmr-editorial-board{position:relative;height:650px;overflow:hidden;border-radius:15px;border:1px solid #d7e1ed;background:linear-gradient(180deg,rgba(255,255,255,.95),rgba(248,250,253,.96)),repeating-linear-gradient(0deg,rgba(23,55,102,.015) 0,rgba(23,55,102,.015) 1px,transparent 1px,transparent 4px);box-shadow:inset 0 0 0 8px rgba(255,255,255,.72)}
#${ROOT_ID} .imcmr-editorial-board:before{content:"";position:absolute;left:11%;right:11%;top:7%;bottom:7%;border:1.5px solid #c7d4e5;border-radius:3px;opacity:.85}
#${ROOT_ID} .imcmr-editorial-board:after{content:"";position:absolute;left:50%;top:49%;width:105px;height:105px;border:1.5px solid #c7d4e5;border-radius:50%;transform:translate(-50%,-50%);opacity:.8}
#${ROOT_ID} .imcmr-editorial-half{position:absolute;left:11%;right:11%;top:49%;height:1.5px;background:#c7d4e5;opacity:.8}
#${ROOT_ID} .imcmr-editorial-box-top,#${ROOT_ID} .imcmr-editorial-box-bottom{position:absolute;left:31%;width:38%;height:13%;border:1.5px solid #c7d4e5;opacity:.8}
#${ROOT_ID} .imcmr-editorial-box-top{top:7%;border-top:0}
#${ROOT_ID} .imcmr-editorial-box-bottom{bottom:7%;border-bottom:0}
#${ROOT_ID} .imcmr-editorial-formation{position:absolute;left:18px;top:15px;z-index:3;color:#173766;font:700 24px/1.05 "Marker Felt","Comic Sans MS",cursive;transform:rotate(-3deg)}
#${ROOT_ID} .imcmr-editorial-formation:after{content:"";display:block;width:72px;height:3px;margin-top:5px;border-radius:4px;background:#173766;transform:rotate(-2deg);opacity:.8}
#${ROOT_ID} .imcmr-scribble{position:absolute;z-index:1;color:#8eb0de;font:700 27px/1 "Marker Felt","Comic Sans MS",cursive;opacity:.38;pointer-events:none}
#${ROOT_ID} .imcmr-s1{left:8%;top:18%;transform:rotate(-18deg)}#${ROOT_ID} .imcmr-s2{right:9%;top:22%;transform:rotate(14deg)}#${ROOT_ID} .imcmr-s3{left:12%;bottom:19%;transform:rotate(-12deg)}#${ROOT_ID} .imcmr-s4{right:12%;bottom:15%;transform:rotate(17deg)}#${ROOT_ID} .imcmr-s5{left:46%;top:43%;font-size:20px;transform:rotate(8deg)}
#${ROOT_ID} .imcmr-editorial-player{position:absolute;left:var(--left);top:var(--top);z-index:4;width:82px;transform:translate(-50%,-50%);text-align:center}
#${ROOT_ID} .imcmr-editorial-portrait{position:relative;width:68px;height:70px;margin:0 auto;border:2px solid #173766;border-radius:36px 36px 23px 23px;background:linear-gradient(180deg,#f7faff,#e9eef7);overflow:hidden;box-shadow:0 5px 14px rgba(16,42,93,.16)}
#${ROOT_ID} .imcmr-editorial-portrait img{display:block;width:100%;height:100%;object-fit:contain;object-position:center bottom}
#${ROOT_ID} .imcmr-editorial-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#173766;font-size:18px;font-weight:900}
#${ROOT_ID} .imcmr-editorial-number{position:absolute;right:-7px;top:-6px;display:flex;align-items:center;justify-content:center;width:25px;height:25px;border:3px solid #fff;border-radius:50%;background:#173766;color:#fff;font-size:9px;font-weight:900;box-shadow:0 2px 7px rgba(16,42,93,.18)}
#${ROOT_ID} .imcmr-editorial-cap{position:absolute;left:-5px;top:-5px;display:flex;align-items:center;justify-content:center;width:20px;height:20px;border:2px solid #fff;border-radius:50%;background:#d1a129;color:#fff;font-size:7px;font-weight:900}
#${ROOT_ID} .imcmr-editorial-name{position:relative;z-index:3;display:block;width:max-content;max-width:88px;margin:-5px auto 0;padding:5px 8px;border-radius:7px;background:#173766;color:#fff;font-size:8px;font-weight:900;line-height:1;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;box-shadow:0 3px 10px rgba(16,42,93,.18)}
#${ROOT_ID} .imcmr-editorial-club{display:flex;align-items:center;justify-content:center;width:23px;height:23px;margin:-1px auto 0;border:2px solid #fff;border-radius:50%;background:#fff;box-shadow:0 2px 7px rgba(16,42,93,.13);overflow:hidden}
#${ROOT_ID} .imcmr-editorial-club img{max-width:100%;max-height:100%;object-fit:contain}
#${ROOT_ID} .imcmr-editorial-loading{display:flex;align-items:center;justify-content:center;height:240px;color:#6f7d91;font-size:9px;font-weight:800}
@media(max-width:390px){#${ROOT_ID} .imcmr-editorial-board{height:605px}#${ROOT_ID} .imcmr-editorial-player{width:74px}#${ROOT_ID} .imcmr-editorial-portrait{width:61px;height:64px}#${ROOT_ID} .imcmr-editorial-name{max-width:78px;font-size:7px;padding:4px 6px}#${ROOT_ID} .imcmr-editorial-number{width:23px;height:23px;font-size:8px}}
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
  const p=report?.source_payload||{};
  const m=p.match||{};
  const r=p.result||{};
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
  return imageCache;
}

function initials(name){return clean(name).split(" ").filter(Boolean).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()||"?";}
function surname(name){const parts=clean(name).split(" ").filter(Boolean);return parts.length>1?parts.slice(1).join(" "):parts[0]||"-";}

function cardMarkup(player,clubLogo){
  const pos=POS[Number(player.lineupSlot)]||[50,50];
  const image=imageCache.get(Number(player.smPlayerId))||"";
  return `<div class="imcmr-editorial-player" style="--left:${pos[0]}%;--top:${pos[1]}%"><div class="imcmr-editorial-portrait">${image?`<img src="${esc(image)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="imcmr-editorial-fallback" style="display:none">${esc(initials(player.playerName))}</span>`:`<span class="imcmr-editorial-fallback">${esc(initials(player.playerName))}</span>`}<span class="imcmr-editorial-number">${esc(player.lineupSlot)}</span>${player.isCaptain?'<span class="imcmr-editorial-cap">C</span>':''}</div><span class="imcmr-editorial-name">${esc(surname(player.playerName))}</span>${clubLogo?`<span class="imcmr-editorial-club"><img src="${esc(clubLogo)}" alt=""></span>`:""}</div>`;
}

function boardMarkup(players,formation,clubLogo){
  const starters=players.filter(p=>p.isStarter).sort((a,b)=>Number(a.lineupSlot||99)-Number(b.lineupSlot||99));
  return `<section class="imcmr-editorial-shell"><div class="imcmr-editorial-board"><span class="imcmr-editorial-half"></span><span class="imcmr-editorial-box-top"></span><span class="imcmr-editorial-box-bottom"></span><strong class="imcmr-editorial-formation">${esc(formation||"XI")}</strong><span class="imcmr-scribble imcmr-s1">↗</span><span class="imcmr-scribble imcmr-s2">↙</span><span class="imcmr-scribble imcmr-s3">⤴</span><span class="imcmr-scribble imcmr-s4">↖</span><span class="imcmr-scribble imcmr-s5">×</span>${starters.map(p=>cardMarkup(p,clubLogo)).join("")}</div></section>`;
}

function teamData(payload,side){
  const players=(Array.isArray(payload.players)?payload.players:[]).filter(p=>p.side===side);
  const tactic=(Array.isArray(payload.tactics)?payload.tactics:[]).find(t=>t.side===side&&Number(t.minute)===0)||{};
  const match=payload.match||{};
  return {name:side==="home"?clean(match.homeTeam||"Casa"):clean(match.awayTeam||"Ospite"),players,formation:clean(tactic.formation||"")};
}

async function renderLineups(root,report){
  const panel=root.querySelector('[data-imcmr-panel="lineups"]');
  if(!panel)return;
  const payload=report.source_payload||{};
  const home=teamData(payload,"home");
  const away=teamData(payload,"away");
  await playerImages(home.players.concat(away.players));
  const heroLogos=root.querySelectorAll(".imcmr-hero .imcmr-side img");
  const logos={home:heroLogos[0]?.getAttribute("src")||"",away:heroLogos[1]?.getAttribute("src")||""};
  panel.dataset.editorialReady="1";
  panel.innerHTML=`<div class="imcmr-editorial-switch"><button type="button" data-editorial-side="home" class="active">${esc(home.name)}</button><button type="button" data-editorial-side="away">${esc(away.name)}</button></div><div data-editorial-board>${boardMarkup(home.players,home.formation,logos.home)}</div>`;
  panel.querySelectorAll("[data-editorial-side]").forEach(btn=>btn.addEventListener("click",()=>{
    const side=btn.dataset.editorialSide;
    panel.querySelectorAll("[data-editorial-side]").forEach(x=>x.classList.toggle("active",x===btn));
    const team=side==="away"?away:home;
    const logo=side==="away"?logos.away:logos.home;
    const target=panel.querySelector("[data-editorial-board]");
    if(target)target.innerHTML=boardMarkup(team.players,team.formation,logo);
  }));
}

async function apply(){
  const root=document.getElementById(ROOT_ID);
  if(!root)return;
  installCss();
  const panel=root.querySelector('[data-imcmr-panel="lineups"]');
  if(!panel||panel.dataset.editorialReady==="1")return;
  panel.innerHTML='<div class="imcmr-editorial-loading">Caricamento formazione…</div>';
  try{
    const reports=await loadReports();
    const key=currentMatchKey(root);
    const report=reports.find(r=>reportMatches(r,key));
    if(!report){panel.innerHTML='<div class="imcmr-editorial-loading">Formazione non disponibile.</div>';return;}
    await renderLineups(root,report);
  }catch(error){
    panel.innerHTML='<div class="imcmr-editorial-loading">Formazione non disponibile.</div>';
    console.error("IMC GW001 editorial lineups",error);
  }
}

function schedule(){clearTimeout(timer);timer=setTimeout(apply,40);}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener("click",event=>{if(event.target&&event.target.closest&&event.target.closest('[data-imcmr-tab="lineups"]'))schedule();},true);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
window.addEventListener("pageshow",schedule);
window.IMC_MATCH_REPORT_GW001_LINEUPS={version:VERSION,refresh:apply,clearCache:()=>{reportIndexPromise=null;imageCache.clear();}};
})();
