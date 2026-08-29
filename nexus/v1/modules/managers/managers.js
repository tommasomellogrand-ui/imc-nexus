(function(){
"use strict";
if(window.IMC_MANAGERS)return;
const VERSION="1.0.0";
let state={container:null,client:null,worldId:"",managers:[],assignments:[],teams:new Map(),nations:new Map()};
function clean(v){return String(v==null?"":v).trim()}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function active(a){const d=new Date().toISOString().slice(0,10);return (!a.start_date||a.start_date<=d)&&(!a.end_date||a.end_date>=d)}
function assignmentName(a){if(a.assignment_type==="national_team")return state.nations.get(String(a.nation_id))||"Nazionale";return state.teams.get(String(a.team_id))||"Club"}
async function load(){
 const c=state.client,w=state.worldId;
 const [ma,im,te,na]=await Promise.all([
  c.from("gw_manager_assignments").select("manager_id,team_id,nation_id,assignment_type,start_date,end_date").eq("game_world_id",w),
  c.from("imc_managers").select("manager_id,full_name,sm_manager_id"),
  c.from("gw_teams").select("team_id,display_name,team_name").eq("game_world_id",w),
  c.from("imc_national_teams").select("nation_id,nation_name")
 ]);
 if(ma.error)throw ma.error;if(im.error)throw im.error;
 state.assignments=ma.data||[];state.managers=im.data||[];
 state.teams=new Map((te.error?[]:te.data||[]).map(x=>[String(x.team_id),clean(x.display_name||x.team_name)]));
 state.nations=new Map((na.error?[]:na.data||[]).map(x=>[String(x.nation_id),clean(x.nation_name)]));
}
function render(){if(!state.container)return;const ids=[...new Set(state.assignments.map(a=>a.manager_id).filter(Boolean))];const map=new Map(state.managers.map(m=>[m.manager_id,m]));const rows=ids.map(id=>{const m=map.get(id)||{manager_id:id,full_name:id};const aa=state.assignments.filter(a=>a.manager_id===id&&active(a));const labels=aa.map(assignmentName).filter(Boolean);return {m,labels}}).sort((a,b)=>clean(a.m.full_name).localeCompare(clean(b.m.full_name),"it"));state.container.innerHTML=`<section class="mgr-module" data-managers-version="${VERSION}"><header class="mgr-head"><div><span>${esc(state.worldId)}</span><h2>Managers</h2></div><strong>${rows.length}</strong></header><div class="mgr-grid">${rows.length?rows.map(r=>`<article class="mgr-card"><strong>${esc(r.m.full_name||r.m.manager_id)}</strong><small>${esc(r.m.manager_id)}${r.m.sm_manager_id?" · SM "+esc(r.m.sm_manager_id):""}</small><p>${r.labels.length?r.labels.map(esc).join(" · "):"Nessun incarico attivo"}</p></article>`).join(""):'<div class="mgr-empty">Nessun manager presente.</div>'}</div></section>`}
async function mount(opts){if(!opts||!opts.container||!opts.client||!opts.worldId)throw new Error("Managers: parametri mancanti");state={...state,...opts,worldId:clean(opts.worldId)};state.container.innerHTML='<div class="mgr-empty">Caricamento Managers…</div>';await load();render()}
function unmount(){if(state.container)state.container.innerHTML="";state.container=null}
window.IMC_MANAGERS={version:VERSION,mount,unmount};
})();