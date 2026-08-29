(function(){
"use strict";
if(window.IMC_COMPETITIONS)return;
const VERSION="1.0.0";
let state={container:null,client:null,worldId:"",items:[]};
function clean(v){return String(v==null?"":v).trim()}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function tableName(){return state.worldId.toLowerCase()+"_gw_competitions"}
async function load(){const r=await state.client.from(tableName()).select('sm_competition_name,sm_action,IMC_competition_type,IMC_league_divisions,IMC_league_playoffs,IMC_league_teams_count,competition_key,"Nexus View",sm_round_label,expected_total_matches');if(r.error)throw r.error;state.items=r.data||[]}
function render(){if(!state.container)return;state.container.innerHTML=`<section class="cp" data-competitions-version="${VERSION}"><header class="cp-head"><div><span>${esc(state.worldId)}</span><h2>Competitions</h2></div><strong>${state.items.length}</strong></header><div class="cp-grid">${state.items.length?state.items.map(x=>`<article class="cp-card"><strong>${esc(x["Nexus View"]||x.sm_competition_name||x.competition_key)}</strong><small>${esc(x.IMC_competition_type||x.sm_action||"")}</small>${x.sm_round_label?`<p>${esc(x.sm_round_label)}</p>`:""}${x.competition_key?`<code>${esc(x.competition_key)}</code>`:""}</article>`).join(""):'<div class="cp-empty">Nessuna competizione disponibile.</div>'}</div></section>`}
async function mount(opts){if(!opts||!opts.container||!opts.client||!opts.worldId)throw new Error("Competitions: parametri mancanti");state={...state,...opts,worldId:clean(opts.worldId),items:[]};state.container.innerHTML='<div class="cp-empty">Caricamento Competitions…</div>';await load();render()}
function unmount(){if(state.container)state.container.innerHTML="";state.container=null}
window.IMC_COMPETITIONS={version:VERSION,mount,unmount};
})();