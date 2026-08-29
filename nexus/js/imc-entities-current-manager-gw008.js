(function(){
"use strict";
if(window.__IMC_ENTITIES_CURRENT_MANAGER_GW008__)return;
window.__IMC_ENTITIES_CURRENT_MANAGER_GW008__=true;

const VERSION="1.0.0";
const WORLD="GW008";
const STYLE_ID="imcEntitiesCurrentManagerGw008Css";
let cache=null,timer=null,observer=null,detail=null;

function clean(v){return String(v==null?"":v).replace(/\s+/g," ").trim();}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function db(){return window.__IMC_NEXUS_CLIENT__||null;}
function todayIso(){const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${day}`;}
function assignmentActive(a,today){const start=clean(a&&a.start_date),end=clean(a&&a.end_date);return (!start||start<=today)&&(!end||end>=today);}
function root(){return document.querySelector(`#pageRoot > [data-imc-entities-world="${WORLD}"]`);}

function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");
  s.id=STYLE_ID;
  s.textContent=`
.imc-ent8-current-manager{display:block!important;margin-top:5px!important;color:#0a255d!important;font-size:7px!important;font-weight:900!important;line-height:1.25!important}
`;
  document.head.appendChild(s);
}

async function allRows(table,select){
  const c=db();
  if(!c)throw new Error("Client Supabase non disponibile");
  const out=[];
  let from=0;
  while(true){
    const r=await c.from(table).select(select).range(from,from+999);
    if(r.error)throw r.error;
    const rows=r.data||[];
    out.push(...rows);
    if(rows.length<1000)break;
    from+=1000;
  }
  return out;
}

async function load(force){
  if(cache&&!force)return cache;
  const p=(async()=>{
    const [assignments,teams,managers]=await Promise.all([
      allRows("gw_manager_assignments","game_world_id,manager_id,team_id,nation_id,assignment_type,start_date,end_date"),
      allRows("gw_teams","team_id,game_world_id,sm_club_id"),
      allRows("imc_managers","manager_id,full_name")
    ]);
    const today=todayIso();
    const managerMap=new Map(managers.map(m=>[clean(m.manager_id),m]));
    const teamMap=new Map(teams.filter(t=>clean(t.game_world_id).toUpperCase()===WORLD).map(t=>[String(t.team_id),t]));
    const clubManagers=new Map();
    const nationManagers=new Map();

    assignments.filter(a=>clean(a.game_world_id).toUpperCase()===WORLD&&assignmentActive(a,today)).forEach(a=>{
      const manager=managerMap.get(clean(a.manager_id));
      if(!manager)return;
      if(clean(a.assignment_type)==="club"&&a.team_id!=null){
        const team=teamMap.get(String(a.team_id));
        if(team&&team.sm_club_id!=null)clubManagers.set(String(team.sm_club_id),manager);
      }
      if(clean(a.assignment_type)==="national_team"&&a.nation_id!=null){
        nationManagers.set(String(a.nation_id),manager);
      }
    });

    return {clubManagers,nationManagers};
  })();
  cache=p;
  try{return await p;}catch(e){cache=null;throw e;}
}

function managerFor(data,type,id){
  return type==="nation"?data.nationManagers.get(String(id))||null:data.clubManagers.get(String(id))||null;
}

function injectCards(data){
  const r=root();if(!r)return;
  r.querySelectorAll("[data-ent-open][data-ent-id]").forEach(card=>{
    if(card.querySelector("[data-imc-current-manager]"))return;
    const manager=managerFor(data,card.getAttribute("data-ent-open"),card.getAttribute("data-ent-id"));
    if(!manager)return;
    const body=card.querySelector("div");
    if(!body)return;
    const label=document.createElement("small");
    label.className="imc-ent8-current-manager";
    label.setAttribute("data-imc-current-manager","");
    label.innerHTML=`Manager · ${esc(manager.full_name||manager.manager_id)}`;
    const badge=body.querySelector(".imc-ent8-managed");
    if(badge)body.insertBefore(label,badge);else body.appendChild(label);
  });
}

function injectDetail(data){
  const r=root();
  if(!r||!detail)return;
  const fields=r.querySelector(".imc-ent8-fields");
  if(!fields||fields.querySelector("[data-imc-current-manager]"))return;
  const manager=managerFor(data,detail.type,detail.id);
  if(!manager)return;
  const field=document.createElement("div");
  field.className="imc-ent8-field";
  field.setAttribute("data-imc-current-manager","");
  field.innerHTML=`<span>Manager attuale</span><strong>${esc(manager.full_name||manager.manager_id)}</strong>`;
  fields.appendChild(field);
}

async function apply(){
  if(!root())return;
  installStyles();
  try{
    const data=await load(false);
    injectCards(data);
    injectDetail(data);
  }catch(e){
    console.error("[IMC Entities Current Manager GW008]",e);
  }
}

function schedule(){clearTimeout(timer);timer=setTimeout(apply,60);}
function start(){
  installStyles();
  document.addEventListener("click",function(e){
    const open=e.target&&e.target.closest?e.target.closest("[data-ent-open][data-ent-id]"):null;
    if(open){detail={type:open.getAttribute("data-ent-open")==="nation"?"nation":"club",id:open.getAttribute("data-ent-id")};setTimeout(schedule,0);return;}
    const back=e.target&&e.target.closest?e.target.closest("[data-ent-back],[data-ent-tab]"):null;
    if(back){detail=null;setTimeout(schedule,0);}
  },true);
  observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  schedule();
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.IMC_ENTITIES_CURRENT_MANAGER_GW008={version:VERSION,refresh:()=>{cache=null;schedule();}};
})();
