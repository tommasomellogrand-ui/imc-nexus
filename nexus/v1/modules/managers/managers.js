(function(){
"use strict";
if(window.IMC_MANAGERS)return;
const VERSION="1.0.2";
let state={container:null,client:null,worldId:"",items:[]};
function clean(v){return String(v==null?"":v).trim()}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function load(){const r=await state.client.rpc("imc_nexus_gateway",{p_action:"managers",p_args:{gameWorld:state.worldId}});if(r.error)throw r.error;state.items=(r.data&&r.data.rows)||[]}
function currentLabels(x){return (Array.isArray(x.assignments)?x.assignments:[]).filter(a=>a&&a.is_active).map(a=>clean(a.assignment_type)==="national_team"?clean(a.nation_name||"Nazionale"):clean(a.team_name||"Club")).filter(Boolean)}
function render(){if(!state.container)return;const rows=state.items.slice().sort((a,b)=>clean(a.full_name).localeCompare(clean(b.full_name),"it"));state.container.innerHTML=`<section class="mgr-module" data-managers-version="${VERSION}"><header class="mgr-head"><div><span>${esc(state.worldId)}</span><h2>Managers</h2></div><strong>${rows.length}</strong></header><div class="mgr-grid">${rows.length?rows.map(m=>{const labels=currentLabels(m);return `<button type="button" class="mgr-card" data-mgr-id="${esc(m.manager_id)}" data-mgr-sm="${esc(m.sm_manager_id||"")}" data-mgr-name="${esc(m.full_name||m.manager_id)}"><strong>${esc(m.full_name||m.manager_id)}</strong><small>${esc(m.manager_id)}${m.sm_manager_id?" · SM "+esc(m.sm_manager_id):""}</small><p>${labels.length?labels.map(esc).join(" · "):"Nessun incarico attivo"}</p></button>`}).join(""):'<div class="mgr-empty">Nessun manager IMC presente.</div>'}</div></section>`}
async function mount(opts){if(!opts||!opts.container||!opts.client||!opts.worldId)throw new Error("Managers: parametri mancanti");state={...state,...opts,worldId:clean(opts.worldId),items:[]};state.container.innerHTML='<div class="mgr-empty">Caricamento Managers…</div>';await load();render()}
function unmount(){if(state.container)state.container.innerHTML="";state.container=null}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-mgr-id]");if(b&&state.container&&state.container.contains(b))document.dispatchEvent(new CustomEvent("nexus:navigate",{detail:{target:"manager-detail",worldId:state.worldId,managerId:clean(b.getAttribute("data-mgr-id")),smManagerId:clean(b.getAttribute("data-mgr-sm")),name:clean(b.getAttribute("data-mgr-name"))}}))});
window.IMC_MANAGERS={version:VERSION,mount,unmount};
})();