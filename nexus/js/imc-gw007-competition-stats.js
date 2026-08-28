(function(){
"use strict";
if(window.__IMC_GW007_COMPETITION_STATS__)return;
window.__IMC_GW007_COMPETITION_STATS__=true;

const VERSION="1.0.0";
const WORLD="GW007";
const TABLE="gw007_competition_player_stats";
const STYLE_ID="imcGw007CompetitionStatsCss";
let client=null,observer=null,timer=null,activeSubtab="goals";
const cache=new Map();

function clean(v){return String(v==null?"":v).replace(/\s+/g," ").trim();}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function db(){
  if(window.__IMC_NEXUS_CLIENT__)return window.__IMC_NEXUS_CLIENT__;
  if(client)return client;
  try{
    const cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");
    if(window.supabase&&cfg&&cfg.url&&cfg.key)client=window.supabase.createClient(cfg.url,cfg.key);
  }catch(_){}
  return client;
}
function detailRoot(){return document.querySelector(`.imc-competitions-all-worlds.imc-comp-detail[data-imc-competitions-world="${WORLD}"]`);}
function competitionKey(root){
  const p=root&&root.querySelector(".imc-comp-detail-head p");
  const text=clean(p&&p.textContent);
  if(!text)return"";
  const parts=text.split("·").map(clean).filter(Boolean);
  return parts.length?parts[parts.length-1]:"";
}
function installCss(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.imc-gw007-stats-subtabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin:0 0 12px;padding:4px;border:1px solid #e0e6ef;border-radius:14px;background:#f7f9fc}
.imc-gw007-stats-subtabs button{min-width:0;min-height:34px;padding:5px 2px;border:0;border-radius:10px;background:transparent;color:#657289;font:inherit;font-size:6.8px;font-weight:950}
.imc-gw007-stats-subtabs button.is-active{background:#0a255d;color:#fff;box-shadow:0 4px 10px rgba(10,37,93,.13)}
.imc-gw007-stats-list{overflow:hidden;border:1px solid #e0e6ef;border-radius:17px;background:#fff;box-shadow:0 6px 16px rgba(20,39,83,.045)}
.imc-gw007-stats-head,.imc-gw007-stats-row{display:grid;grid-template-columns:29px minmax(0,1.2fr) minmax(0,.9fr) 48px;gap:6px;align-items:center}
.imc-gw007-stats-head{padding:9px 10px;border-bottom:1px solid #e8edf4;color:#7c8798;font-size:6px;font-weight:950;text-transform:uppercase}
.imc-gw007-stats-head span:last-child{text-align:center}
.imc-gw007-stats-row{min-height:52px;padding:8px 10px;border-bottom:1px solid #edf1f5;color:#13264d}
.imc-gw007-stats-row:last-child{border-bottom:0}
.imc-gw007-stats-pos{font-size:10px;font-weight:950;text-align:center;color:#0a255d}
.imc-gw007-stats-player,.imc-gw007-stats-team{min-width:0}
.imc-gw007-stats-player strong,.imc-gw007-stats-team strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#0b1b3f;font-size:8px;font-weight:950}
.imc-gw007-stats-player small{display:block;margin-top:3px;color:#8994a6;font-size:6.3px;font-weight:800}
.imc-gw007-stats-team strong{font-size:7px;color:#53627a}
.imc-gw007-stats-value{display:flex;align-items:center;justify-content:center;min-height:30px;padding:0 5px;border-radius:10px;background:#0a255d;color:#fff;font-size:10px;font-weight:950;text-align:center}
.imc-gw007-stats-cards{display:flex;align-items:center;justify-content:center;gap:5px}.imc-gw007-stats-card-pill{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:27px;padding:0 4px;border-radius:7px;background:#f4c631;color:#4d3c00;font-size:8px;font-weight:950}.imc-gw007-stats-card-pill.red{background:#c83d3d;color:#fff}
@media(min-width:600px){.imc-gw007-stats-subtabs button{font-size:8px}.imc-gw007-stats-head,.imc-gw007-stats-row{grid-template-columns:34px minmax(0,1.2fr) minmax(0,.9fr) 58px;gap:8px}.imc-gw007-stats-player strong{font-size:9px}.imc-gw007-stats-team strong{font-size:8px}.imc-gw007-stats-value{font-size:11px}}
`;document.head.appendChild(s);
}
async function loadStats(key){
  if(cache.has(key))return cache.get(key);
  const p=(async()=>{
    const c=db();if(!c)throw new Error("Client Supabase non disponibile");
    const rows=[];let from=0;
    while(true){
      const r=await c.from(TABLE).select("sm_player_id,player_name,sm_team_id,team_name,appearances,goals,avg_rating,assists,mom,yellow_cards,red_cards,competition_key").eq("competition_key",key).range(from,from+999);
      if(r.error)throw r.error;
      const page=r.data||[];rows.push(...page);
      if(page.length<1000)break;
      from+=1000;
    }
    return rows;
  })();
  cache.set(key,p);
  try{return await p;}catch(e){cache.delete(key);throw e;}
}
function numeric(v){const n=Number(v);return Number.isFinite(n)?n:0;}
function filteredSorted(rows,kind){
  const copy=(rows||[]).slice();
  if(kind==="goals")return copy.filter(r=>numeric(r.goals)>0).sort((a,b)=>numeric(b.goals)-numeric(a.goals)||numeric(b.appearances)-numeric(a.appearances)||clean(a.player_name).localeCompare(clean(b.player_name),"it"));
  if(kind==="assists")return copy.filter(r=>numeric(r.assists)>0).sort((a,b)=>numeric(b.assists)-numeric(a.assists)||numeric(b.appearances)-numeric(a.appearances)||clean(a.player_name).localeCompare(clean(b.player_name),"it"));
  if(kind==="rating")return copy.filter(r=>r.avg_rating!=null&&clean(r.avg_rating)!=="").sort((a,b)=>numeric(b.avg_rating)-numeric(a.avg_rating)||numeric(b.appearances)-numeric(a.appearances)||clean(a.player_name).localeCompare(clean(b.player_name),"it"));
  if(kind==="mom")return copy.filter(r=>numeric(r.mom)>0).sort((a,b)=>numeric(b.mom)-numeric(a.mom)||numeric(b.appearances)-numeric(a.appearances)||clean(a.player_name).localeCompare(clean(b.player_name),"it"));
  return copy.filter(r=>numeric(r.yellow_cards)>0||numeric(r.red_cards)>0).sort((a,b)=>(numeric(b.yellow_cards)+numeric(b.red_cards))-(numeric(a.yellow_cards)+numeric(a.red_cards))||numeric(b.red_cards)-numeric(a.red_cards)||clean(a.player_name).localeCompare(clean(b.player_name),"it"));
}
function valueMarkup(row,kind){
  if(kind==="goals")return `<span class="imc-gw007-stats-value">${numeric(row.goals)}</span>`;
  if(kind==="assists")return `<span class="imc-gw007-stats-value">${numeric(row.assists)}</span>`;
  if(kind==="rating")return `<span class="imc-gw007-stats-value">${Number(row.avg_rating).toFixed(2)}</span>`;
  if(kind==="mom")return `<span class="imc-gw007-stats-value">${numeric(row.mom)}</span>`;
  return `<span class="imc-gw007-stats-cards"><i class="imc-gw007-stats-card-pill">${numeric(row.yellow_cards)}</i><i class="imc-gw007-stats-card-pill red">${numeric(row.red_cards)}</i></span>`;
}
function valueHeader(kind){return kind==="goals"?"GOALS":kind==="assists"?"ASSISTS":kind==="rating"?"RATING":kind==="mom"?"MOM":"Y / R";}
function statsMarkup(rows,kind){
  const list=filteredSorted(rows,kind);
  if(!list.length)return `<div class="imc-comp-loading">Nessun dato disponibile.</div>`;
  return `<div class="imc-gw007-stats-list"><div class="imc-gw007-stats-head"><span>POS</span><span>PLAYER</span><span>CLUB</span><span>${valueHeader(kind)}</span></div>${list.map((r,i)=>`<div class="imc-gw007-stats-row"><span class="imc-gw007-stats-pos">${i+1}</span><span class="imc-gw007-stats-player"><strong>${esc(r.player_name||"-")}</strong><small>${numeric(r.appearances)} presenze</small></span><span class="imc-gw007-stats-team"><strong>${esc(r.team_name||"-")}</strong></span>${valueMarkup(r,kind)}</div>`).join("")}</div>`;
}
async function renderStats(root,key){
  const content=root.querySelector("[data-imc-content]");if(!content)return;
  root.querySelectorAll(".imc-comp-tabs button").forEach(b=>b.classList.toggle("is-active",b.hasAttribute("data-gw007-stats-main")));
  content.innerHTML=`<div class="imc-gw007-stats-subtabs"><button data-gw007-stat="goals" class="${activeSubtab==="goals"?"is-active":""}">GOALS</button><button data-gw007-stat="assists" class="${activeSubtab==="assists"?"is-active":""}">ASSISTS</button><button data-gw007-stat="rating" class="${activeSubtab==="rating"?"is-active":""}">RATING</button><button data-gw007-stat="mom" class="${activeSubtab==="mom"?"is-active":""}">MOM</button><button data-gw007-stat="cards" class="${activeSubtab==="cards"?"is-active":""}">CARDS</button></div><div data-gw007-stats-body><div class="imc-comp-loading">Caricamento statistiche…</div></div>`;
  content.querySelectorAll("[data-gw007-stat]").forEach(b=>b.addEventListener("click",()=>{activeSubtab=b.dataset.gw007Stat||"goals";renderStats(root,key);}));
  const body=content.querySelector("[data-gw007-stats-body]");
  try{body.innerHTML=statsMarkup(await loadStats(key),activeSubtab);}catch(e){body.innerHTML=`<div class="imc-comp-error">${esc(e&&e.message||"Caricamento non riuscito")}</div>`;}
}
function enhance(){
  const root=detailRoot();if(!root)return;
  const tabs=root.querySelector(".imc-comp-tabs"),content=root.querySelector("[data-imc-content]"),key=competitionKey(root);
  if(!tabs||!content||!key)return;
  let stats=tabs.querySelector("[data-gw007-stats-main]");
  if(!stats){
    stats=document.createElement("button");stats.type="button";stats.textContent="STATS";stats.setAttribute("data-gw007-stats-main","1");tabs.appendChild(stats);
    const nativeCount=tabs.querySelectorAll("button:not([data-gw007-stats-main])").length;
    tabs.style.gridTemplateColumns=`repeat(${nativeCount+1},minmax(0,1fr))`;
    stats.addEventListener("click",()=>{activeSubtab="goals";renderStats(root,key);});
  }
}
function schedule(){clearTimeout(timer);timer=setTimeout(enhance,35);}
function start(){installCss();observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true});schedule();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.IMC_GW007_COMPETITION_STATS={version:VERSION,refresh:enhance,clearCache:()=>cache.clear()};
})();
