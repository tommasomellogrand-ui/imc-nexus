(function(){
"use strict";

const VERSION="1.0.0";
const URL="https://toanuzojdkfjgucztpze.supabase.co";
const KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
const cache=new Map();
let currentKey="";
let timer=null;
let rootObserver=null;

let cfg=null;
try{cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){}
const db=window.__IMC_NEXUS_CLIENT__||(window.supabase?window.supabase.createClient(cfg&&cfg.url?cfg.url:URL,cfg&&cfg.key?cfg.key:KEY):null);
if(!db)return;

const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const valid=id=>/^GW(?:00[1-9]|010)$/.test(String(id||""));
const tbl=(id,s)=>String(id).toLowerCase()+s;
const img=v=>{v=String(v||"").trim();return v.startsWith("//")?"https:"+v:v;};

function world(){
  const guard=window.IMC_WORLD_CONTEXT_FIX;
  if(guard&&typeof guard.currentWorld==="function"){
    const id=String(guard.currentWorld()||"").toUpperCase();
    if(valid(id))return id;
  }
  const text=document.querySelector("#openDrawerWorld strong,.nx-sport-world strong")?.textContent||"";
  const map={"road to history":"GW001","gold 558":"GW002","gold 557":"GW003","world league":"GW004","hall of famers":"GW005","master league world":"GW006","the four kingdoms":"GW007","gold 1":"GW008","kick off":"GW009","sensible soccer academy":"GW010"};
  return map[norm(text)]||"";
}

function installCss(){
  if(document.getElementById("imcCompetitionUiCss"))return;
  const style=document.createElement("style");
  style.id="imcCompetitionUiCss";
  style.textContent=`
#imcCompetitionDetail .imcc-dtabs{grid-template-columns:repeat(4,minmax(0,1fr))!important}
#imcCompetitionDetail .imcc-dtabs .imcc-extra-tab{font-family:"Inter",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
#imcCompetitionDetail .imcc-team.imc-ui-team{display:flex!important;align-items:center;gap:7px;min-width:0}
#imcCompetitionDetail .imcc-team.imc-ui-team.aw{flex-direction:row-reverse;justify-content:flex-start}
#imcCompetitionDetail .imcc-team.imc-ui-team .imc-ui-team-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#imcCompetitionDetail .imc-ui-team-logo{display:flex;align-items:center;justify-content:center;flex:0 0 28px;width:28px;height:28px;border:1px solid #e1e6ed;border-radius:50%;overflow:hidden;background:#fff;color:#6f7d91;font-size:7px;font-weight:800}
#imcCompetitionDetail .imc-ui-team-logo img{width:100%;height:100%;object-fit:contain}
#imcCompetitionDetail .imc-ui-team-logo b{display:none;width:100%;height:100%;align-items:center;justify-content:center}
@media(max-width:390px){#imcCompetitionDetail .imc-ui-team-logo{width:25px;height:25px;flex-basis:25px}#imcCompetitionDetail .imcc-team.imc-ui-team{gap:5px}}
`;
  document.head.appendChild(style);
}

async function all(table,select){
  const out=[];
  for(let from=0;;from+=1000){
    const r=await db.from(table).select(select).range(from,from+999);
    if(r.error)throw r.error;
    const rows=r.data||[];
    out.push(...rows);
    if(rows.length<1000)break;
  }
  return out;
}

async function loadWorld(id){
  if(cache.has(id))return cache.get(id);
  const [competitions,teams]=await Promise.all([
    all(tbl(id,"_gw_competitions"),"*"),
    all(tbl(id,"_gw_teams"),"sm_world_club_id,sm_club_id,club_name")
  ]);

  const ids=[...new Set(teams.map(t=>t.sm_club_id).filter(v=>v!=null).map(String))];
  const masters=[];
  for(let i=0;i<ids.length;i+=150){
    const r=await db.from("sm_clubs_master")
      .select("sm_club_id,club_name,alias,nexus_display_name,image_filename,image_url")
      .in("sm_club_id",ids.slice(i,i+150));
    if(r.error)throw r.error;
    masters.push(...(r.data||[]));
  }

  const names=new Map();
  competitions.forEach(row=>{
    const key=String(row.competition_key||"");
    const view=String(row["Nexus View"]||"").trim();
    if(key&&view)names.set(key,view);
  });

  const masterById=new Map(masters.map(row=>[String(row.sm_club_id),row]));
  const logos=new Map();
  teams.forEach(team=>{
    const master=masterById.get(String(team.sm_club_id||""))||{};
    const url=img(master.image_url)||(master.image_filename?"assets/clubs/"+String(master.image_filename).trim():"");
    if(!url)return;
    [team.club_name,master.club_name,master.alias,master.nexus_display_name].filter(Boolean).forEach(name=>logos.set(norm(name),url));
  });

  const data={names,logos};
  cache.set(id,data);
  return data;
}

function initials(name){
  return String(name||"?").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()||"?";
}

function logoMarkup(name,url){
  const init=initials(name);
  if(!url)return `<span class="imc-ui-team-logo"><b style="display:flex">${esc(init)}</b></span>`;
  return `<span class="imc-ui-team-logo"><img src="${esc(url)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><b>${esc(init)}</b></span>`;
}

function applyCompetitionNames(data){
  document.querySelectorAll("#imcCompetitions [data-key]").forEach(card=>{
    const key=String(card.getAttribute("data-key")||"");
    const name=data.names.get(key);
    const title=card.querySelector("strong");
    if(name&&title)title.textContent=name;
  });

  if(currentKey){
    const name=data.names.get(currentKey);
    if(name){
      const top=document.querySelector("#imcCompetitionDetail .imcc-title strong");
      const hero=document.querySelector("#imcCompetitionDetail .imcc-hero h1");
      if(top)top.textContent=name;
      if(hero)hero.textContent=name;
    }
  }
}

function applyTabs(){
  const tabs=document.querySelector("#imcCompetitionDetail .imcc-dtabs");
  if(!tabs)return;
  const schedule=tabs.querySelector('[data-tab="schedule"]');
  if(!tabs.querySelector('[data-imc-extra-tab="table"]')){
    const table=document.createElement("button");
    table.type="button";
    table.className="imcc-extra-tab";
    table.setAttribute("data-imc-extra-tab","table");
    table.textContent="TABLE";
    if(schedule)tabs.insertBefore(table,schedule);else tabs.appendChild(table);
  }
  if(!tabs.querySelector('[data-imc-extra-tab="trophy-room"]')){
    const trophy=document.createElement("button");
    trophy.type="button";
    trophy.className="imcc-extra-tab";
    trophy.setAttribute("data-imc-extra-tab","trophy-room");
    trophy.textContent="TROPHY ROOM";
    tabs.appendChild(trophy);
  }
}

function applyLogos(data){
  document.querySelectorAll("#imcCompetitionDetail .imcc-game .imcc-team").forEach(team=>{
    if(team.getAttribute("data-imc-logo-ready")==="1")return;
    const name=String(team.textContent||"").trim();
    if(!name)return;
    const url=data.logos.get(norm(name))||"";
    team.classList.add("imc-ui-team");
    team.setAttribute("data-imc-logo-ready","1");
    team.innerHTML=logoMarkup(name,url)+`<span class="imc-ui-team-name">${esc(name)}</span>`;
  });
}

async function enhance(){
  const id=world();
  if(!valid(id))return;
  installCss();
  try{
    const data=await loadWorld(id);
    if(world()!==id)return;
    applyCompetitionNames(data);
    applyTabs();
    applyLogos(data);
  }catch(error){
    console.error("IMC Competition UI",id,error);
  }
}

function scheduleEnhance(){
  clearTimeout(timer);
  timer=setTimeout(enhance,50);
}

document.addEventListener("click",function(event){
  const card=event.target&&event.target.closest?event.target.closest("#imcCompetitions [data-key]"):null;
  if(card)currentKey=String(card.getAttribute("data-key")||"");

  const back=event.target&&event.target.closest?event.target.closest("#imcCompetitionDetail [data-back]"):null;
  if(back)currentKey="";

  const extra=event.target&&event.target.closest?event.target.closest("#imcCompetitionDetail [data-imc-extra-tab]"):null;
  if(extra){
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  const relevant=event.target&&event.target.closest?event.target.closest('.nx-world-nav [data-world-section="competitions"],#imcCompetitions [data-cat],#imcCompetitionDetail [data-tab],#imcCompetitions [data-key]'):null;
  if(relevant)scheduleEnhance();
},true);

document.addEventListener("input",function(event){
  if(event.target&&event.target.id==="imccQ")scheduleEnhance();
},true);

function attach(){
  installCss();
  const root=document.getElementById("pageRoot");
  if(root&&!rootObserver){
    rootObserver=new MutationObserver(scheduleEnhance);
    rootObserver.observe(root,{childList:true});
  }
  scheduleEnhance();
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach,{once:true});
else attach();
window.addEventListener("pageshow",scheduleEnhance);

window.IMC_COMPETITION_UI={version:VERSION,refresh:enhance,clearCache:()=>cache.clear()};
})();
