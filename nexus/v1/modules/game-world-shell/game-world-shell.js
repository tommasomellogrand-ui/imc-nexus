(function(){
"use strict";
if(window.IMC_GAME_WORLD_SHELL)return;
const VERSION="3.0.0";
let state={container:null,worldId:"",worldName:""};
const clean=v=>String(v==null?"":v).trim();
const esc=v=>clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function icon(type){const m={competitions:'<path d="M7 4h10v4c0 5-2 8-5 9-3-1-5-4-5-9V4Z"/><path d="M9 17v3h6v-3M4 6H2c0 4 2 6 5 6M20 6h2c0 4-2 6-5 6"/>',teams:'<path d="M12 3 20 6v6c0 5-3 8-8 10-5-2-8-5-8-10V6Z"/><circle cx="9" cy="10" r="2"/><circle cx="15" cy="10" r="2"/><path d="M7 16c.3-2 1.3-3 3-3s2.7 1 3 3M11 16c.3-2 1.3-3 3-3s2.7 1 3 3"/>',managers:'<circle cx="12" cy="7" r="4"/><path d="M5 21c.6-5 3-8 7-8s6.4 3 7 8"/>',schedule:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 18h2"/>',codex:'<path d="M4 4h7a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 1Z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13h7a3 3 0 0 1 3 1Z"/>',transfers:'<path d="M4 8h14M15 5l3 3-3 3M20 16H6M9 13l-3 3 3 3"/>'};return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${m[type]||''}</svg>`}
function shellHeader(){return `<header class="gw3-header"><div class="gw3-logo"><img src="assets/imc-logo.png" alt="IMC"></div><div class="gw3-brand"><h1>NEXUS</h1><div><i></i><span>GAME WORLD</span><i></i></div></div><button class="gw3-menu" type="button" data-gw-action="clubhouse" aria-label="Torna alla Club House"><i></i><i></i><i></i></button></header>`}
function card(cls,title,sub,type){return `<button type="button" class="gw3-card ${cls}"><div class="gw3-card-copy"><h2>${title}</h2><p>${sub}</p></div><div class="gw3-card-art">${icon(type)}</div></button>`}
function renderHome(){const id=esc(state.worldId||"GW001"),name=esc(state.worldName||"Road To History");return `<div class="gw3-home"><section class="gw3-identity"><div><strong>${id}</strong><span>·</span><b>${name}</b></div><small>SEASON 2 · INIZIO 31 AGO 2026 · FINE —</small></section><section class="gw3-grid">${card("gw3-competitions","COMPETITIONS","League · Cups · Intl","competitions")}${card("gw3-teamhub","TEAM HUB","Club · Nazionali","teams")}${card("gw3-managers","MANAGERS","Attivi · Storico","managers")}${card("gw3-schedule","SCHEDULE","Prossimi · Passati","schedule")}${card("gw3-codex","CODEX","Archivio del GW","codex")}${card("gw3-transfers","TRANSFERS","Mercato del GW","transfers")}</section></div>`}
function render(){if(!state.container)return;state.container.innerHTML=`<section class="gw3-shell">${shellHeader()}<main class="gw3-content" data-gw-content>${renderHome()}</main></section>`}
async function mount(o){if(!o||!o.container)throw Error("Game World: container mancante");state={...state,...o,container:o.container,worldId:clean(o.worldId),worldName:clean(o.worldName)};render()}
async function setWorld(o){state.worldId=clean(o.worldId);state.worldName=clean(o.worldName);render()}
function unmount(){if(state.container)state.container.innerHTML="";state.container=null}
document.addEventListener("click",e=>{const a=e.target.closest?.("[data-gw-action]");if(a&&state.container?.contains(a)){document.dispatchEvent(new CustomEvent("nexus:navigate",{detail:{target:"clubhouse"}}))}});
window.IMC_GAME_WORLD_SHELL={version:VERSION,mount,setWorld,unmount};
})();