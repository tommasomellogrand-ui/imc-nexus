(function(){
"use strict";
if(window.IMC_GAME_WORLD_SHELL)return;
const VERSION="1.0.1";
let state={container:null,worldId:"",worldName:""};
function clean(v){return String(v==null?"":v).trim()}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
  if(!state.container)return;
  state.container.innerHTML=`<section class="gw-shell" data-gw-shell-version="${VERSION}">
    <header class="gw-shell-hero"><span>${esc(state.worldId)}</span><h1>${esc(state.worldName||state.worldId)}</h1><p>IMC Nexus</p></header>
    <div class="gw-shell-tabs" role="navigation" aria-label="Sezioni Game World">
      <button type="button" data-gw-section="home">HOME</button>
      <button type="button" data-gw-section="teams">TEAMS</button>
      <button type="button" data-gw-section="managers">MANAGERS</button>
      <button type="button" data-gw-section="competitions">COMPETITIONS</button>
      <button type="button" data-gw-section="transfers">TRASFERIMENTI</button>
      <button type="button" data-gw-section="trophy-room">TROPHY ROOM</button>
    </div>
    <div class="gw-shell-content" data-gw-content><div class="gw-shell-empty">Game World pronto.</div></div>
  </section>`;
}
function mount(opts){if(!opts||!opts.container||!opts.worldId)throw new Error("Game World Shell: parametri mancanti");state={container:opts.container,worldId:clean(opts.worldId),worldName:clean(opts.worldName)};render()}
function setWorld(opts){if(!opts||!opts.worldId)return;state.worldId=clean(opts.worldId);state.worldName=clean(opts.worldName);render()}
function unmount(){if(state.container)state.container.innerHTML="";state={container:null,worldId:"",worldName:""}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-gw-section]");if(!b)return;document.dispatchEvent(new CustomEvent("nexus:navigate",{detail:{target:"game-world-section",worldId:state.worldId,section:clean(b.getAttribute("data-gw-section"))}}))});
window.IMC_GAME_WORLD_SHELL={version:VERSION,mount,setWorld,unmount};
})();