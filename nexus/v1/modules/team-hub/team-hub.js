(function(){
"use strict";
if(window.IMC_TEAM_HUB)return;
const VERSION="1.0.0";
let state={container:null,client:null,worldId:"",mode:"clubs",clubs:[],nations:[]};
function clean(v){return String(v==null?"":v).trim()}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function prefix(){return state.worldId.toLowerCase()}
async function load(){
 const clubs=await state.client.from("gw_teams").select("team_id,team_name,display_name,logo_file,sm_club_id,sm_world_club_id").eq("game_world_id",state.worldId).eq("team_type","club").order("display_name",{ascending:true});
 if(clubs.error)throw clubs.error;
 const nations=await state.client.from(prefix()+"_gw_national_teams").select("sm_world_national_club_id,nation_name").order("nation_name",{ascending:true});
 state.clubs=clubs.data||[];state.nations=nations.error?[]:(nations.data||[]);
}
function cardClub(x){const name=clean(x.display_name||x.team_name)||("Club "+x.team_id);return `<button class="th-card" data-th-type="club" data-th-id="${esc(x.team_id)}" data-th-name="${esc(name)}"><strong>${esc(name)}</strong><small>CLUB</small></button>`}
function cardNation(x){return `<button class="th-card" data-th-type="national" data-th-id="${esc(x.sm_world_national_club_id)}" data-th-name="${esc(x.nation_name)}"><strong>${esc(x.nation_name)}</strong><small>NAZIONALE</small></button>`}
function render(){if(!state.container)return;const list=state.mode==="nations"?state.nations:state.clubs;state.container.innerHTML=`<section class="team-hub" data-team-hub-version="${VERSION}"><header class="th-head"><div><span>${esc(state.worldId)}</span><h2>Team Hub</h2></div><strong>${list.length}</strong></header><div class="th-switch"><button data-th-mode="clubs" class="${state.mode==="clubs"?"active":""}">CLUB</button><button data-th-mode="nations" class="${state.mode==="nations"?"active":""}">NAZIONALI</button></div><div class="th-grid">${list.length?list.map(state.mode==="nations"?cardNation:cardClub).join(""):'<div class="th-empty">Nessuna squadra disponibile.</div>'}</div></section>`}
async function mount(opts){if(!opts||!opts.container||!opts.client||!opts.worldId)throw new Error("Team Hub: parametri mancanti");state={...state,...opts,worldId:clean(opts.worldId),mode:"clubs",clubs:[],nations:[]};state.container.innerHTML='<div class="th-empty">Caricamento Team Hub…</div>';await load();render()}
function unmount(){if(state.container)state.container.innerHTML="";state.container=null}
document.addEventListener("click",e=>{const mode=e.target.closest&&e.target.closest("[data-th-mode]");if(mode&&state.container&&state.container.contains(mode)){state.mode=clean(mode.getAttribute("data-th-mode"));render();return}const card=e.target.closest&&e.target.closest("[data-th-type]");if(card&&state.container&&state.container.contains(card)){document.dispatchEvent(new CustomEvent("nexus:navigate",{detail:{target:"team-detail",worldId:state.worldId,teamType:clean(card.getAttribute("data-th-type")),teamId:clean(card.getAttribute("data-th-id")),teamName:clean(card.getAttribute("data-th-name"))}}))}});
window.IMC_TEAM_HUB={version:VERSION,mount,unmount};
})();