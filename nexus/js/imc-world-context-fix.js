(function(){
"use strict";
const VERSION="2.2-build53-world-isolation";
const BLOCKED_WORLDS=new Set(["GW002","GW003","GW008","GW010"]);
const WORLD_BY_NAME={
  "road to history":"GW001",
  "gold 558":"GW002",
  "gold 557":"GW003",
  "world league":"GW004",
  "hall of famers":"GW005",
  "master league world":"GW006",
  "the four kingdoms":"GW007",
  "gold 1":"GW008",
  "kick off":"GW009",
  "sensible soccer academy":"GW010"
};
const SENTINEL_ATTR="data-imc-codex-blocked-sentinel";
const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
function currentWorld(){
  const header=document.querySelector("#openDrawerWorld strong,.nx-sport-world strong");
  const name=norm(header&&header.textContent);
  if(name&&WORLD_BY_NAME[name])return WORLD_BY_NAME[name];
  if(name){
    const drawerItems=[...document.querySelectorAll("[data-drawer-world]")];
    const match=drawerItems.find(el=>norm(el.textContent).includes(name));
    if(match){
      const id=String(match.getAttribute("data-drawer-world")||"");
      if(/^GW\d{3}$/.test(id))return id;
    }
  }
  const root=document.getElementById("pageRoot");
  const text=String(root&&root.textContent||"");
  for(const [worldName,id] of Object.entries(WORLD_BY_NAME)){
    if(norm(text).includes(worldName))return id;
  }
  const m=text.match(/\bGW\d{3}\b/);
  return m?m[0]:null;
}
function ensureBlockedSentinel(nav){
  if(!nav||nav.querySelector("["+SENTINEL_ATTR+"]"))return;
  const sentinel=document.createElement("span");
  sentinel.setAttribute(SENTINEL_ATTR,"1");
  sentinel.setAttribute("data-world-section","player-codex");
  sentinel.hidden=true;
  sentinel.setAttribute("aria-hidden","true");
  sentinel.style.setProperty("display","none","important");
  nav.insertBefore(sentinel,nav.firstChild);
}
function removeInjectedFeatures(){
  document.querySelectorAll("[data-imc-codex-world],[data-imc-transfers-world]").forEach(el=>el.remove());
  document.querySelectorAll('.nx-bottom [data-page="transfers"]').forEach(el=>el.remove());
}
function sync(){
  const id=currentWorld();
  const nav=document.querySelector(".nx-world-nav");
  if(id&&BLOCKED_WORLDS.has(id)){
    ensureBlockedSentinel(nav);
    removeInjectedFeatures();
    if(nav)nav.setAttribute("data-imc-isolated-world",id);
    return;
  }
  document.querySelectorAll("["+SENTINEL_ATTR+"]").forEach(el=>el.remove());
  if(nav)nav.removeAttribute("data-imc-isolated-world");
  document.querySelectorAll("[data-imc-transfers-world]").forEach(el=>{if(id)el.dataset.imcTransfersWorld=id;});
  document.querySelectorAll("[data-imc-codex-world]").forEach(el=>{if(id)el.dataset.imcCodexWorld=id;});
}
document.addEventListener("click",function(event){
  const transfer=event.target&&event.target.closest?event.target.closest("[data-imc-transfers-world]"):null;
  const codex=event.target&&event.target.closest?event.target.closest("[data-imc-codex-world]"):null;
  if(!transfer&&!codex)return;
  const id=currentWorld();
  if(!id||BLOCKED_WORLDS.has(id)){
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  if(transfer){
    const api=window.IMC_WORLD_FEATURES_BUILD53;
    if(!api||typeof api.openTransfers!=="function")return;
    event.preventDefault();
    event.stopImmediatePropagation();
    transfer.dataset.imcTransfersWorld=id;
    api.openTransfers(id);
    return;
  }
  const api=window.IMC_PLAYER_CODEX_BUILD53||window.IMC_PLAYER_CODEX_BUILD52;
  if(!api||typeof api.openWorld!=="function")return;
  event.preventDefault();
  event.stopImmediatePropagation();
  codex.dataset.imcCodexWorld=id;
  api.openWorld(id);
},true);
let timer=null;
const observer=new MutationObserver(function(){
  clearTimeout(timer);
  timer=setTimeout(sync,0);
});
observer.observe(document.documentElement,{childList:true,subtree:true});
sync();
window.IMC_WORLD_CONTEXT_FIX={version:VERSION,currentWorld,blockedWorlds:BLOCKED_WORLDS};
})();

(function(){
"use strict";
const VERSION="5.0-gw001-approved-scorer-panels";
const TARGET_WORLD="GW001";
const URL="https://toanuzojdkfjgucztpze.supabase.co";
const KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
const STYLE_ID="imcGw001ApprovedScorerPanelsCss";
if(!window.supabase)return;
let cfg=null;
try{cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){ }
const apiUrl=cfg&&cfg.url?cfg.url:URL;
const apiKey=cfg&&cfg.key?cfg.key:KEY;
const db=window.supabase.createClient(apiUrl,apiKey);
let scorerPromise=null;
let scorerMap=new Map();

function esc(v){
  return String(v==null?"":v).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
  });
}
function isoDate(v){
  const s=String(v||"").trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
  const m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m?m[3]+"-"+String(m[2]).padStart(2,"0")+"-"+String(m[1]).padStart(2,"0"):"";
}
function key(date,homeId,awayId,side){
  return [String(date||""),String(homeId||""),String(awayId||""),String(side||"")].join("|");
}
function addCss(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");
  s.id=STYLE_ID;
  s.textContent=`
.nx-scorer-panel-v5{display:grid;grid-template-columns:1fr 1fr;position:relative;gap:0;margin:0 4px 14px;border:1px solid #dbe4f1;border-radius:14px;background:#f8faff;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.9)}
.nx-scorer-panel-v5:before{content:"";position:absolute;left:50%;top:30px;bottom:10px;width:1px;background:#dce4ef;transform:translateX(-.5px)}
.nx-scorer-title-v5{grid-column:1/-1;padding:8px 10px 5px;color:#174fae;font-size:9px;line-height:1;font-weight:950;letter-spacing:.05em;text-align:center;text-transform:uppercase}
.nx-scorer-side-v5{min-width:0;padding:5px 11px 10px;color:#172544;font-size:10px;line-height:1.35;font-weight:750;text-align:center;overflow-wrap:anywhere}
.nx-scorer-side-v5 b{font-weight:950}.nx-scorer-side-v5 em{color:#174fae;font-style:normal;font-weight:950}
@media(max-width:520px){.nx-scorer-panel-v5{margin:0 3px 12px;border-radius:12px}.nx-scorer-title-v5{padding:7px 7px 4px;font-size:7.5px}.nx-scorer-panel-v5:before{top:25px;bottom:8px}.nx-scorer-side-v5{padding:4px 7px 9px;font-size:8px;line-height:1.3}}
`;
  document.head.appendChild(s);
}
function cleanHeader(raw){
  let text=String(raw||"").replace(/\s+/g," ").trim();
  if(!text)return "";
  const firstNum=text.search(/\d/);
  if(firstNum<0)return text;
  const prefix=text.slice(0,firstNum).trim();
  const rest=text.slice(firstNum).trim();
  const tokens=prefix.split(/\s+/).filter(Boolean);
  if(tokens.length>1&&tokens.length%2===0){
    const half=tokens.length/2;
    const left=tokens.slice(0,half).join(" ");
    const right=tokens.slice(half).join(" ");
    const n=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
    if(n(left)===n(right))text=left+" "+rest;
  }
  return text;
}
function parseHeader(raw){
  const text=cleanHeader(raw);
  if(!text)return [];
  const re=/([^\d,]+?)\s+(\d{1,3}(?:\s+\((?:rig|autorete)\))?(?:\s*,\s*\d{1,3}(?:\s+\((?:rig|autorete)\))?)*)/giu;
  const out=[];
  let m;
  while((m=re.exec(text))){
    const name=String(m[1]||"").trim();
    const times=String(m[2]||"").split(",").map(function(part){
      const t=String(part||"").trim().match(/^(\d{1,3})(?:\s+\((rig|autorete)\))?$/i);
      return t?{minute:Number(t[1]),kind:String(t[2]||"").toLowerCase()}:null;
    }).filter(Boolean);
    if(name&&times.length)out.push({name:name,times:times});
  }
  return out;
}
function sideMarkup(header){
  const rows=parseHeader(header);
  if(!rows.length)return "—";
  return rows.map(function(row){
    const mins=row.times.map(function(t){
      const tag=t.kind==="rig"?' <em>(rig.)</em>':t.kind==="autorete"?' <em>(aut.)</em>':'';
      return t.minute+"'"+tag;
    }).join(", ");
    return `<b>${esc(row.name)}</b> ${mins}`;
  }).join(" · ");
}
function indexRows(rows){
  const m=new Map();
  (rows||[]).forEach(function(r){
    if(r&&r.scorer_header)m.set(key(r.match_date,r.home_team_id,r.away_team_id,r.side),String(r.scorer_header));
  });
  scorerMap=m;
  return scorerMap;
}
async function directRest(){
  const endpoint=apiUrl.replace(/\/$/,"")+"/rest/v1/gw_match_scorer_headers_public?select=match_date,home_team_id,away_team_id,side,scorer_header&game_world_id=eq."+TARGET_WORLD;
  const res=await fetch(endpoint,{headers:{apikey:apiKey,Authorization:"Bearer "+apiKey,Accept:"application/json"},cache:"no-store"});
  if(!res.ok)throw new Error("REST "+res.status+" "+await res.text());
  return res.json();
}
async function loadScorers(){
  if(scorerPromise)return scorerPromise;
  scorerPromise=(async function(){
    const r=await db.from("gw_match_scorer_headers_public").select("match_date,home_team_id,away_team_id,side,scorer_header").eq("game_world_id",TARGET_WORLD);
    if(!r.error&&Array.isArray(r.data))return indexRows(r.data);
    return indexRows(await directRest());
  })().catch(function(error){scorerPromise=null;console.error("IMC scorer panel load failed",error);throw error;});
  return scorerPromise;
}
function rowIdentity(row){
  const card=row.closest(".nx-league-matchday-card");
  const time=card&&card.querySelector(".nx-unified-matchday-head time,.nx-league-matchday-head time");
  const home=row.querySelector('.nx-league-result-team.home [data-match-entity-id]');
  const away=row.querySelector('.nx-league-result-team.away [data-match-entity-id]');
  if(!time||!home||!away)return null;
  return {date:isoDate(time.textContent),homeId:home.getAttribute("data-match-entity-id")||"",awayId:away.getAttribute("data-match-entity-id")||""};
}
function decorateRow(row){
  if(!row||!row.querySelector(".nx-league-score-pill strong:not(.is-vs)"))return;
  const next=row.nextElementSibling;
  if(next&&next.classList&&next.classList.contains("nx-scorer-panel-v5"))return;
  const id=rowIdentity(row);
  if(!id||!id.date)return;
  const home=scorerMap.get(key(id.date,id.homeId,id.awayId,"home"))||"";
  const away=scorerMap.get(key(id.date,id.homeId,id.awayId,"away"))||"";
  if(!home&&!away&&row.querySelector(".nx-league-score-pill strong").textContent.trim()==="0 - 0")return;
  const panel=document.createElement("div");
  panel.className="nx-scorer-panel-v5";
  panel.innerHTML=`<div class="nx-scorer-title-v5">SCORERS</div><div class="nx-scorer-side-v5">${sideMarkup(home)}</div><div class="nx-scorer-side-v5">${sideMarkup(away)}</div>`;
  row.insertAdjacentElement("afterend",panel);
}
async function decorate(){
  const rows=[...document.querySelectorAll(".nx-league-result-row")];
  if(!rows.length)return;
  addCss();
  try{await loadScorers();rows.forEach(decorateRow);}catch(error){console.error("IMC scorer panel render failed",error);}
}
let timer=null;
new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(decorate,80);}).observe(document.documentElement,{childList:true,subtree:true});
[0,250,700,1500,3000].forEach(function(ms){setTimeout(decorate,ms);});
window.IMC_RESULTS_SCORER_PANELS_GW001={version:VERSION,refresh:function(){scorerPromise=null;scorerMap=new Map();document.querySelectorAll(".nx-scorer-panel-v5").forEach(function(x){x.remove();});return decorate();}};
})();