(function(){
"use strict";
if(window.IMC_ROAD_CHRONICLE_ISSUES)return;
const VERSION="1.0.0";
let state={container:null,worldId:"GW001"};
function render(){
  if(!state.container)return;
  state.container.innerHTML=`<section class="rci-page" aria-label="The Road Chronicle Issues">
    <button type="button" class="rci-back" data-rci-back>← GW001</button>
    <header class="rci-head">
      <div class="rci-kicker">GW001 · ROAD TO HISTORY</div>
      <h1>THE ROAD CHRONICLE</h1>
      <p>ROAD TO HISTORY OFFICIAL JOURNAL</p>
    </header>
    <section class="rci-issues">
      <div class="rci-section-title">THE ROAD CHRONICLE · ISSUES</div>
      <article class="rci-issue" data-rci-issue="issue-001">
        <div class="rci-number"><small>ISSUE</small><strong>1</strong></div>
        <div class="rci-copy">
          <span>SPECIAL EDITION</span>
          <h2>LA PRIMA È GIALLONERA</h2>
          <p>01.09.2026 · 4 PAGINE</p>
        </div>
      </article>
    </section>
  </section>`;
}
function mount(o){
  if(!o||!o.container)throw new Error("Road Chronicle Issues: container mancante");
  state={container:o.container,worldId:String(o.worldId||"GW001")};
  render();
}
function unmount(){
  if(state.container)state.container.innerHTML="";
  state={container:null,worldId:"GW001"};
}
document.addEventListener("click",e=>{
  if(!state.container||!state.container.contains(e.target))return;
  const back=e.target.closest?.("[data-rci-back]");
  if(!back)return;
  document.dispatchEvent(new CustomEvent("nexus:navigate",{detail:{target:"game-world-section",worldId:state.worldId,section:"home"}}));
});
window.IMC_ROAD_CHRONICLE_ISSUES={version:VERSION,mount,unmount};
})();