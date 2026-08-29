(function(){
"use strict";
if(window.IMC_CLUBHOUSE)return;

const VERSION="1.0.2";
let state={container:null,client:null,user:null,managerId:"",username:"",worlds:[],assignments:[],teams:new Map(),nations:new Map()};

function clean(v){return String(v==null?"":v).trim()}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function fmtDate(v){if(!v)return"";const d=new Date(v+"T12:00:00");return Number.isNaN(d.getTime())?clean(v):d.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"})}
function isActive(a){const today=new Date().toISOString().slice(0,10);return (!a.start_date||a.start_date<=today)&&(!a.end_date||a.end_date>=today)}
function worldName(id){const w=state.worlds.find(x=>x.game_world_id===id);return clean(w&&(w.imc_name||w.name||w.soccer_manager_name))||id}
function teamKey(worldId,teamId){return clean(worldId)+"|"+clean(teamId)}
function teamName(a){if(a.assignment_type==="national_team")return state.nations.get(String(a.nation_id))||("Nazionale "+clean(a.nation_id));return state.teams.get(teamKey(a.game_world_id,a.team_id))||("Club "+clean(a.team_id))}

async function required(query,label){const r=await query;if(r.error)throw new Error(label+": "+(r.error.message||"errore dati"));return r.data||[]}
async function optional(query){try{const r=await query;return r.error?[]:(r.data||[])}catch(_){return[]}}

async function load(){
  const c=state.client,m=state.managerId;
  const worldsPromise=required(c.from("imc_game_worlds").select("game_world_id,imc_name,name,soccer_manager_name").order("game_world_id",{ascending:true}),"Game World");
  const assignmentsPromise=required(c.from("gw_manager_assignments").select("assignment_id,game_world_id,manager_id,team_id,nation_id,assignment_type,start_date,end_date,season_id").eq("manager_id",m).order("start_date",{ascending:true}),"Incarichi manager");
  const nationsPromise=optional(c.from("imc_national_teams").select("nation_id,nation_name"));
  const [worlds,assignments,nations]=await Promise.all([worldsPromise,assignmentsPromise,nationsPromise]);
  state.worlds=worlds;state.assignments=assignments;
  const clubAssignments=assignments.filter(a=>a.assignment_type==="club"&&a.team_id!=null);
  const ids=[...new Set(clubAssignments.map(a=>a.team_id))];
  const teams=ids.length?await optional(c.from("gw_teams").select("team_id,game_world_id,team_name,display_name").in("team_id",ids)):[];
  state.teams=new Map(teams.map(x=>[teamKey(x.game_world_id,x.team_id),clean(x.display_name||x.team_name)]));
  state.nations=new Map(nations.map(x=>[String(x.nation_id),clean(x.nation_name)]));
}

function renderAssignment(a){const active=isActive(a);return `<article class="ch-assignment ${active?"is-active":""}"><div class="ch-assignment-top"><span>${esc(a.game_world_id)}</span><b>${active?"ATTIVO":"STORICO"}</b></div><strong>${esc(teamName(a))}</strong><small>${a.assignment_type==="national_team"?"NAZIONALE":"CLUB"} · ${esc(worldName(a.game_world_id))}</small><p>${fmtDate(a.start_date)||"-"}${a.end_date?" → "+fmtDate(a.end_date):" → OGGI"}</p></article>`}

function render(){
  const root=state.container;if(!root)return;
  const active=state.assignments.filter(isActive),historic=state.assignments.filter(a=>!isActive(a));
  const worldIds=[...new Set(state.assignments.map(a=>a.game_world_id).filter(Boolean))].sort();
  root.innerHTML=`<section class="clubhouse" data-clubhouse-version="${VERSION}"><header class="ch-hero"><div><span>CLUB HOUSE</span><h1>${esc(state.username||state.managerId)}</h1><p>${esc(state.managerId)}</p></div><div class="ch-count"><strong>${worldIds.length}</strong><small>GAME WORLD</small></div></header><section class="ch-block"><div class="ch-head"><div><span>OGGI</span><h2>Incarichi attivi</h2></div><strong>${active.length}</strong></div><div class="ch-assignments">${active.length?active.map(renderAssignment).join(""):'<div class="ch-empty">Nessun incarico attivo.</div>'}</div></section><section class="ch-block"><div class="ch-head"><div><span>NEXUS</span><h2>I tuoi Game World</h2></div><strong>${worldIds.length}</strong></div><div class="ch-worlds">${worldIds.map(id=>`<button type="button" class="ch-world" data-ch-world="${esc(id)}"><span>${esc(id)}</span><strong>${esc(worldName(id))}</strong><small>APRI GAME WORLD</small></button>`).join("")}</div></section><section class="ch-block"><div class="ch-head"><div><span>STORICO</span><h2>Incarichi conclusi</h2></div><strong>${historic.length}</strong></div><div class="ch-assignments">${historic.length?historic.slice().reverse().map(renderAssignment).join(""):'<div class="ch-empty">Nessun incarico concluso.</div>'}</div></section></section>`;
}

async function mount(opts){if(!opts||!opts.container||!opts.client||!opts.managerId)throw new Error("Club House: parametri mancanti");state={...state,...opts,managerId:clean(opts.managerId),username:clean(opts.username)};state.container.innerHTML='<div class="ch-loading">Caricamento Club House…</div>';try{await load();render()}catch(err){state.container.innerHTML=`<div class="ch-empty"><strong>Club House non disponibile</strong><br>${esc(err&&err.message||err)}</div>`;throw err}}
function unmount(){if(state.container)state.container.innerHTML="";state.container=null}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-ch-world]");if(!b)return;document.dispatchEvent(new CustomEvent("nexus:navigate",{detail:{target:"game-world",worldId:clean(b.getAttribute("data-ch-world"))}}))});
window.IMC_CLUBHOUSE={version:VERSION,mount,unmount};
})();