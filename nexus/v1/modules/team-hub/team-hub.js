(function(){
"use strict";
if(window.IMC_TEAM_HUB)return;
const VERSION="1.0.3";
let state={container:null,client:null,worldId:"",mode:"clubs",clubs:[],nations:[]};
function clean(v){return String(v==null?"":v).trim()}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function load(){
 const [clubs,nations]=await Promise.all([
  state.client.rpc("imc_nexus_gateway",{p_action:"gw_teams",p_args:{gameWorld:state.worldId}}),
  state.client.rpc("imc_nexus_gateway",{p_action:"gw_national_teams",p_args:{gameWorld:state.worldId}})
 ]);
 if(clubs.error)throw clubs.error;if(nations.error)throw nations.error;
 state.clubs=(clubs.data&&clubs.data.rows)||[];state.nations=(nations.data&&nations.data.rows)||[];
}
function cardClub(x){const name=clean(x.display_name||x.club_name)||("Club "+(x.team_id||x.sm_world_club_id));return `<button type="button" class="th-card" data-th-open="club" data-th-id="${esc(x.team_id||"")}" data-th-name="${esc(name)}"><strong>${esc(name)}</strong><small>CLUB</small></button>`}
function cardNation(x){return `<button type="button" class="th-card" data-th-open="national" data-th-id="${esc(x.sm_world_national_club_id)}" data-th-name="${esc(x.nation_name)}"><strong>${esc(x.nation_name)}</strong><small>NAZIONALE</small></button>`}
function render(){if(!state.container)return;const list=state.mode==="nations"?state.nations:state.clubs;state.container.innerHTML=`<section class="team-hub" data-team-hub-version="${VERSION}"><header class="th-head"><div><span>${esc(state.worldId)}</span><h2>Team Hub</h2></div><strong>${list.length}</strong></header><div class="th-switch"><button data-th-mode="clubs" class="${state.mode==="clubs"?"active":""}">CLUB</button><button data-th-mode="nations" class="${state.mode==="nations"?"active":""}">NAZIONALI</button></div><div class="th-grid">${list.length?list.map(state.mode==="nations"?cardNation:cardClub).join(""):'<div class="th-empty">Nessuna squadra disponibile.</div>'}</div></section>`}
async function mount(opts){if(!opts||!opts.container||!opts.client||!opts.worldId)throw new Error("Team Hub: parametri mancanti");state={...state,...opts,worldId:clean(opts.worldId),mode:"clubs",clubs:[],nations:[]};state.container.innerHTML='<div class="th-empty">Caricamento Team Hub…</div>';await load();render()}
function unmount(){if(state.container)state.container.innerHTML="";state.container=null}
document.addEventListener("click",e=>{const mode=e.target.closest&&e.target.closest("[data-th-mode]");if(mode&&state.container&&state.container.contains(mode)){state.mode=clean(mode.getAttribute("data-th-mode"));render();return}const open=e.target.closest&&e.target.closest("[data-th-open]");if(open&&state.container&&state.container.contains(open)){const teamType=clean(open.getAttribute("data-th-open")),teamId=clean(open.getAttribute("data-th-id")),teamName=clean(open.getAttribute("data-th-name"));document.dispatchEvent(new CustomEvent("nexus:navigate",{detail:{target:"team-detail",worldId:state.worldId,teamType,teamId,teamName}}))}});
window.IMC_TEAM_HUB={version:VERSION,mount,unmount};
})();