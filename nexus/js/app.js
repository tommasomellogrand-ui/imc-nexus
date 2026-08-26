(function(){
  "use strict";

  const NEXUS_BUILD = "54";

  function writeScript(src){
    document.write('<script src="'+src+'"></'+'script>');
  }

  function appendScript(src,onload,onerror){
    var script=document.createElement("script");
    script.src=src;
    if(onload) script.onload=onload;
    if(onerror) script.onerror=onerror;
    document.head.appendChild(script);
  }

  function currentWorld(){
    var guard=window.IMC_WORLD_CONTEXT_FIX;
    if(guard&&typeof guard.currentWorld==="function") return String(guard.currentWorld()||"");
    var text=(document.querySelector("#openDrawerWorld strong,.nx-sport-world strong")||{}).textContent||"";
    return /road to history/i.test(text)?"GW001":"";
  }

  document.addEventListener("click",function(event){
    var target=event.target&&event.target.closest?event.target.closest('[data-world-section="player-codex"]'):null;
    if(!target||currentWorld()!=="GW001") return;
    var codex=window.IMC_PLAYER_CODEX_GW001;
    if(!codex||typeof codex.open!=="function") return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    codex.open();
  },true);

  function loadAfterCore(){
    appendScript("js/imc-results-scorers.js?v=1.0.0");
    appendScript("js/imc-transfers.js?v=1.0.1");
    appendScript("js/imc-player-codex-gw001.js?v=1.0.1");
  }

  function loadCoreAsync(){
    appendScript("js/app-core-54.js?v=54.0-core",loadAfterCore);
  }

  if(document.readyState==="loading"){
    writeScript("js/app-core-54.js?v=54.0-core");
    writeScript("js/imc-results-scorers.js?v=1.0.0");
    writeScript("js/imc-transfers.js?v=1.0.1");
    writeScript("js/imc-player-codex-gw001.js?v=1.0.1");
    return;
  }

  loadCoreAsync();
})();
