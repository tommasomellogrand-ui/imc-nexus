(function(){
"use strict";
if(window.__IMC_MANAGERS_GW008__)return;
window.__IMC_MANAGERS_GW008__=true;

const VERSION="1.0.0";
const WORLD="GW008";
const ROOT_FLAG="imc-managers-gw008";
const STYLE_ID="imcManagersGw008Css";
let cache=null,observer=null,timer=null;

function clean(v){return String(v==null?"":v).replace(/\s+/g," ").trim();}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function pageRoot(){return document.getElementById("pageRoot");}
function db(){return window.__IMC_NEXUS_CLIENT__||null;}
function currentWorld(){const nodes=document.querySelectorAll("#openDrawerWorld strong,.nx-sport-world strong,.nx-world-header strong,.nx-world-header p");for(const node of nodes){const m=clean(node.textContent).match(/GW\d{3}/i);if(m)return m[0].toUpperCase();}return"";}
function managersButton(){return document.querySelector('.nx-world-nav [data-world-section="managers"]');}
function managersActive(){const b=managersButton();return !!(b&&b.classList.contains("active"));}
function isOurPage(){const root=pageRoot();return !!(root&&root.querySelector(':scope > [data-imc-managers-world="GW008"]'));}
function todayIso(){const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${day}`;}
function assignmentActive(a,today){const start=clean(a&&a.start_date),end=clean(a&&a.end_date);return (!start||start<=today)&&(!end||end>=today);}
function formatDate(v){const s=clean(v);if(!s)return"Presente";const d=new Date(`${s}T12:00:00`);if(Number.isNaN(d.getTime()))return s;return d.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"});}

function installStyles(){if(document.getElementById(STYLE_ID))return;const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
#pageRoot:has(> .${ROOT_FLAG}){padding-top:0!important}
.${ROOT_FLAG}{padding:0 0 28px;color:#0b1b3f;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.imc-mgr8-hero{position:relative;width:100%;aspect-ratio:800/203;margin:4px 0 16px;overflow:hidden;border:1px solid rgba(203,160,54,.72);border-radius:17px;background:linear-gradient(104deg,#041833 0%,#08234b 52%,#061a38 100%);box-shadow:0 8px 20px rgba(15,29,58,.09);color:#fff}.imc-mgr8-hero-copy{position:absolute;left:28px;top:50%;transform:translateY(-50%)}.imc-mgr8-hero-copy span{display:inline-flex;min-height:17px;align-items:center;padding:0 7px;border:1px solid #d7ad48;border-radius:6px;color:#e9c56d;font-size:7px;font-weight:950;letter-spacing:.08em}.imc-mgr8-hero-copy strong{display:block;margin-top:7px;font-size:22px;line-height:1;font-weight:950;letter-spacing:-.03em}.imc-mgr8-hero-copy small{display:block;margin-top:6px;color:#e2b855;font-size:8px;font-weight:850}.imc-mgr8-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:0 0 15px}.imc-mgr8-summary div{padding:10px 8px;border:1px solid #dfe5ed;border-radius:13px;background:#fff;text-align:center}.imc-mgr8-summary strong{display:block;font-size:17px;font-weight:950;color:#0a255d}.imc-mgr8-summary span{display:block;margin-top:3px;font-size:7px;font-weight:900;color:#7b8799;text-transform:uppercase}.imc-mgr8-list{display:grid;gap:8px}.imc-mgr8-card{border:1px solid #dfe5ed;border-radius:15px;background:#fff;box-shadow:0 7px 16px rgba(22,42,78,.055);overflow:hidden}.imc-mgr8-head{padding:11px 12px;border-bottom:1px solid #edf1f5}.imc-mgr8-head strong{display:block;font-size:13px;font-weight:950;color:#091c46}.imc-mgr8-head span{display:block;margin-top:4px;font-size:7px;font-weight:850;color:#7b8799}.imc-mgr8-assignments{display:grid}.imc-mgr8-assignment{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:10px 12px;border-top:1px solid #edf1f5}.imc-mgr8-assignment:first-child{border-top:0}.imc-mgr8-assignment strong{display:block;font-size:9px;font-weight:950;color:#0b1b3f}.imc-mgr8-assignment span{display:block;margin-top:3px;font-size:7px;font-weight:800;color:#7b8799}.imc-mgr8-badge{margin:0!important;padding:4px 7px;border-radius:999px;background:#eef4fc;color:#245aa5!important;font-size:6.5px!important;font-weight:950!important;text-transform:uppercase}.imc-mgr8-badge.is-current{background:#eaf8ef;color:#16743b!important}.imc-mgr8-loading,.imc-mgr8-error{padding:24px 16px;border:1px solid #e1e6ee;border-radius:17px;background:#fff;color:#798498;text-align:center;font-size:10px;font-weight:850}.imc-mgr8-error{color:#9d3030}
`;document.head.appendChild(s);}

async function allRows(table,select){const c=db();if(!c)throw new Error("Client Supabase non disponibile");const out=[];let from=0;while(true){const r=await c.from(table).select(select||"*").range(from,from+999);if(r.error)throw r.error;const page=r.data||[];out.push(...page);if(page.length<1000)break;from+=1000;}return out;}

async function loadData(force){if(cache&&!force)return cache;const p=(async()=>{const [assignments,teams,nations]=await Promise.all([
  allRows("gw_manager_assignments","assignment_id,game_world_id,manager_id,team_id,assignment_type,start_date,end_date,season_id,nation_id"),
  allRows("gw_teams","team_id,game_world_id,country_id,team_type,team_name,display_name,logo_file,area_id,sm_club_id,team_scope,sm_world_club_id"),
  allRows("imc_national_teams","nation_id,nation_name,continent")
]);
const gwAssignments=assignments.filter(a=>clean(a.game_world_id).toUpperCase()===WORLD),today=todayIso();
const activeIds=[...new Set(gwAssignments.filter(a=>assignmentActive(a,today)).map(a=>clean(a.manager_id)).filter(Boolean))];
const managers=await allRows("imc_managers","manager_id,full_name,imc_join_date,sm_manager_id");
const activeManagers=managers.filter(m=>activeIds.includes(clean(m.manager_id)));
const activeSet=new Set(activeIds),managerAssignments=gwAssignments.filter(a=>activeSet.has(clean(a.manager_id)));
const teamMap=new Map(teams.filter(t=>clean(t.game_world_id).toUpperCase()===WORLD).map(t=>[String(t.team_id),t]));
const nationMap=new Map(nations.map(n=>[String(n.nation_id),n]));
const models=activeManagers.map(m=>({manager:m,assignments:managerAssignments.filter(a=>clean(a.manager_id)===clean(m.manager_id)).map(a=>({raw:a,team:a.team_id!=null?teamMap.get(String(a.team_id))||null:null,nation:a.nation_id!=null?nationMap.get(String(a.nation_id))||null:null,current:assignmentActive(a,today)}))}));
return {world:WORLD,today,managers:activeManagers,assignments:managerAssignments,teams:[...teamMap.values()],nations,models};})();cache=p;try{return await p;}catch(e){cache=null;throw e;}}

function hero(){return `<div class="imc-mgr8-hero"><div class="imc-mgr8-hero-copy"><span>GW008</span><strong>MANAGERS</strong><small>Gold 1</small></div></div>`;}
function assignmentName(x){if(x.team)return clean(x.team.display_name)||clean(x.team.team_name)||"Club";if(x.nation)return clean(x.nation.nation_name)||"Nazionale";return clean(x.raw.assignment_type)||"Incarico";}
function assignmentMeta(x){const type=x.team?"Club":(x.nation?"Nazionale":clean(x.raw.assignment_type));return `${type} · ${formatDate(x.raw.start_date)} → ${x.raw.end_date?formatDate(x.raw.end_date):"Presente"}`;}
function render(data){installStyles();const root=pageRoot();if(!root)return;const currentCount=data.assignments.filter(a=>assignmentActive(a,data.today)).length,historicalCount=data.assignments.length-currentCount;root.innerHTML=`<section class="${ROOT_FLAG}" data-imc-managers-world="GW008">${hero()}<div class="imc-mgr8-summary"><div><strong>${data.managers.length}</strong><span>Manager attivi</span></div><div><strong>${currentCount}</strong><span>Incarichi attuali</span></div><div><strong>${historicalCount}</strong><span>Incarichi storici</span></div></div><div class="imc-mgr8-list">${data.models.map(model=>{const m=model.manager;return `<article class="imc-mgr8-card" data-manager-id="${esc(m.manager_id)}"><div class="imc-mgr8-head"><strong>${esc(m.full_name||m.manager_id)}</strong><span>${esc(m.manager_id)} · SM ${esc(m.sm_manager_id||"-")} · IMC ${esc(m.imc_join_date||"-")}</span></div><div class="imc-mgr8-assignments">${model.assignments.map(x=>`<div class="imc-mgr8-assignment"><div><strong>${esc(assignmentName(x))}</strong><span>${esc(assignmentMeta(x))}</span></div><span class="imc-mgr8-badge ${x.current?"is-current":""}">${x.current?"Attuale":"Storico"}</span></div>`).join("")}</div></article>`;}).join("")}</div></section>`;}
function renderLoading(){installStyles();const root=pageRoot();if(root)root.innerHTML=`<section class="${ROOT_FLAG}" data-imc-managers-world="GW008">${hero()}<div class="imc-mgr8-loading">Caricamento manager e incarichi…</div></section>`;}
async function renderIfNeeded(){if(currentWorld()!==WORLD||!managersActive())return;if(isOurPage())return;renderLoading();try{render(await loadData(false));}catch(e){const root=pageRoot();if(root)root.innerHTML=`<section class="${ROOT_FLAG}" data-imc-managers-world="GW008">${hero()}<div class="imc-mgr8-error">${esc(e&&e.message||"Caricamento non riuscito")}</div></section>`;}}
function schedule(){clearTimeout(timer);timer=setTimeout(renderIfNeeded,45);}
function start(){installStyles();document.addEventListener("click",e=>{const b=e.target&&e.target.closest?e.target.closest('.nx-world-nav [data-world-section="managers"]'):null;if(b)setTimeout(renderIfNeeded,0);},true);observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});schedule();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.IMC_MANAGERS_GW008={version:VERSION,refresh:()=>{cache=null;renderIfNeeded();},load:()=>loadData(false),clearCache:()=>{cache=null;}};
})();
