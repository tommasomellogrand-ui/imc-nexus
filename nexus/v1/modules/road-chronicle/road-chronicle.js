(function(){
"use strict";
if(window.IMC_ROAD_CHRONICLE)return;
const VERSION="1.1.0";
let state={container:null,client:null,worldId:"",view:"home",division:"1",rows:[],loading:false,error:""};
const c=v=>String(v==null?"":v).trim();
const e=v=>c(v).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
function dateLabel(v){const s=c(v);if(!s)return"";const d=new Date(s+"T12:00:00");return isNaN(d)?s:d.toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()}
function masthead(){return `<div class="rc-masthead"><div class="rc-kicker"><span></span><b>GW001 / ROAD TO HISTORY</b><span></span></div><h1><small>THE ROAD</small>CHRONICLE</h1><div class="rc-divider"><i></i><strong>▤</strong><i></i></div><p>ROAD TO HISTORY OFFICIAL JOURNAL</p></div>`}
function renderHome(){return `<section class="rc-page" aria-label="The Road Chronicle">${masthead()}
    <article class="rc-cover rc-card">
      <div class="rc-copy"><em>COVER STORY</em><h2>Cover<br>Story</h2><span class="rc-arrow">→</span></div>
      <div class="rc-stadium" aria-hidden="true"><i class="rc-stadium-sky"></i><i class="rc-stadium-ring r1"></i><i class="rc-stadium-ring r2"></i><i class="rc-stadium-ring r3"></i><i class="rc-stadium-roof"></i></div><div class="rc-bookmark">★</div>
    </article>
    <section class="rc-feature-grid">
      <button type="button" class="rc-featured rc-card rc-results-entry" data-rc-open="results">
        <div class="rc-copy"><em>RESULTS</em><h2>Results<br>Analysis</h2><span class="rc-arrow">→</span></div>
        <div class="rc-results-art" aria-hidden="true"><i></i><i></i><i></i><i></i><strong>1·2·3·4</strong></div>
      </button>
      <article class="rc-latest rc-card">
        <div class="rc-copy"><em>LATEST EDITION</em><h2>Latest<br>Edition</h2><span class="rc-arrow">→</span></div>
        <div class="rc-edition-mini" aria-hidden="true"><small>THE ROAD</small><strong>CHRONICLE</strong><i></i></div><div class="rc-date-chip">▣&nbsp; ED. 01 · 12 JUL 2026</div>
      </article>
    </section>
    <section class="rc-headlines rc-card"><div class="rc-headline-top"><em>HEADLINES</em><span>VIEW ALL&nbsp; →</span></div><div class="rc-headline-icons" aria-hidden="true"><i>☆</i><b>·</b><i>♙♙</i><b>·</b><i>♜</i><b>·</b><i>♛</i><b>·</b><i>▥</i><b>·</b><i>▤</i></div></section>
  </section>`}
function resultRows(){if(state.loading)return '<div class="rc-results-status">Caricamento risultati…</div>';if(state.error)return `<div class="rc-results-status">${e(state.error)}</div>`;if(!state.rows.length)return '<div class="rc-results-status">Nessun risultato disponibile.</div>';return state.rows.map(x=>`<div class="rc-result-row"><div><span>${e(dateLabel(x.source_page_date))}</span>${x.sm_round_label?`<small>${e(x.sm_round_label)}</small>`:""}</div><strong>${e(x.home_name)} <b>${e(x.home_score)}</b><i>-</i><b>${e(x.away_score)}</b> ${e(x.away_name)}</strong></div>`).join("")}
function renderResults(){const tabs=[1,2,3,4].map(n=>`<button type="button" class="rc-div-tab${state.division===String(n)?" active":""}" data-rc-division="${n}">DIV ${n}</button>`).join("");return `<section class="rc-page rc-results-page" aria-label="The Road Chronicle Results"><button type="button" class="rc-back" data-rc-back>← THE ROAD CHRONICLE</button>${masthead()}<div class="rc-results-heading"><em>RESULTS</em><h2>League Analysis</h2><p>ROAD TO HISTORY · DIVISIONE ${e(state.division)}</p></div><nav class="rc-div-tabs" aria-label="Divisioni">${tabs}</nav><section class="rc-editorial-placeholder rc-card"><em>ANALISI REDAZIONALE</em><h3>Divisione ${e(state.division)}</h3><p>Spazio riservato all’analisi editoriale dei risultati.</p></section><section class="rc-results-list rc-card"><div class="rc-results-list-head"><em>RISULTATI</em><span>${state.loading?"…":e(state.rows.length)} PARTITE</span></div>${resultRows()}</section></section>`}
function render(){if(!state.container)return;state.container.innerHTML=state.view==="results"?renderResults():renderHome()}
async function loadDivision(){if(!state.client)return;state.loading=true;state.error="";state.rows=[];render();const key=`GW001-LEAGUE-D${state.division}`;try{const r=await state.client.rpc("imc_nexus_gateway",{p_action:"results",p_args:{gameWorld:state.worldId||"GW001",competitionKey:key,limit:200}});if(r.error)throw r.error;state.rows=Array.isArray(r.data&&r.data.rows)?r.data.rows:[]}catch(err){state.error=c(err&&err.message)||"Results non disponibili"}finally{state.loading=false;render()}}
async function openResults(){state.view="results";state.division="1";await loadDivision()}
async function setDivision(v){const d=c(v);if(!/^[1-4]$/.test(d)||d===state.division)return;state.division=d;await loadDivision()}
async function mount(o){if(!o||!o.container)throw new Error("Road Chronicle: container mancante");state={container:o.container,client:o.client||null,worldId:c(o.worldId)||"GW001",view:"home",division:"1",rows:[],loading:false,error:""};render()}
function unmount(){if(state.container)state.container.innerHTML="";state={container:null,client:null,worldId:"",view:"home",division:"1",rows:[],loading:false,error:""}}
document.addEventListener("click",async ev=>{if(!state.container||!state.container.contains(ev.target))return;const open=ev.target.closest&&ev.target.closest("[data-rc-open='results']");if(open){await openResults();return}const tab=ev.target.closest&&ev.target.closest("[data-rc-division]");if(tab){await setDivision(tab.getAttribute("data-rc-division"));return}const back=ev.target.closest&&ev.target.closest("[data-rc-back]");if(back){state.view="home";state.rows=[];state.error="";render()}});
window.IMC_ROAD_CHRONICLE={version:VERSION,mount,unmount};
})();