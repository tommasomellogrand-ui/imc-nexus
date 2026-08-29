(function(){
"use strict";
if(window.IMC_COMPETITIONS)return;
const VERSION="1.0.2";
let state={container:null,client:null,worldId:"",items:[]};
function clean(v){return String(v==null?"":v).trim()}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function load(){const r=await state.client.rpc("imc_nexus_gateway",{p_action:"gw_competitions",p_args:{gameWorld:state.worldId}});if(r.error)throw r.error;state.items=(r.data&&r.data.rows)||[]}
function render(){if(!state.container)return;state.container.innerHTML=`<section class="cp" data-competitions-version="${VERSION}"><header class="cp-head"><div><span>${esc(state.worldId)}</span><h2>Competitions</h2></div><strong>${state.items.length}</strong></header><div class="cp-grid">${state.items.length?state.items.map(x=>`<button type="button" class="cp-card" data-cp-key="${esc(x.competition_key||"")}" data-cp-name="${esc(x["Nexus View"]||x.sm_competition_name||x.competition_key)}"><strong>${esc(x["Nexus View"]||x.sm_competition_name||x.competition_key)}</strong><small>${esc(x.IMC_competition_type||x.sm_action||"")}</small>${x.sm_round_label?`<p>${esc(x.sm_round_label)}</p>`:""}${x.competition_key?`<code>${esc(x.competition_key)}</code>`:""}</button>`).join(""):'<div class="cp-empty">Nessuna competizione disponibile.</div>'}</div></section>`}
async function mount(opts){if(!opts||!opts.container||!opts.client||!opts.worldId)throw new Error("Competitions: parametri mancanti");state={...state,...opts,worldId:clean(opts.worldId),items:[]};state.container.innerHTML='<div class="cp-empty">Caricamento Competitions…</div>';await load();render()}
function unmount(){if(state.container)state.container.innerHTML="";state.container=null}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-cp-key]");if(b&&state.container&&state.container.contains(b)){const key=clean(b.getAttribute("data-cp-key"));if(key)document.dispatchEvent(new CustomEvent("nexus:navigate",{detail:{target:"competition-detail",worldId:state.worldId,competitionKey:key,name:clean(b.getAttribute("data-cp-name"))}}))}});
window.IMC_COMPETITIONS={version:VERSION,mount,unmount};
})();