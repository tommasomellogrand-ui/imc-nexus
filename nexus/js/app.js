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

  function loadAfterCore(){
    appendScript("js/imc-results-scorers.js?v=1.0.0");
    appendScript("js/imc-transfers.js?v=1.0.1");
    appendScript("js/imc-player-codex-gw.js?v=1.0.0");
    appendScript("js/imc-player-codex-global.js?v=1.0.0");
  }

  function loadCoreAsync(){
    appendScript("js/app-core-54.js?v=54.0-core",loadAfterCore);
  }

  if(document.readyState==="loading"){
    writeScript("js/app-core-54.js?v=54.0-core");
    writeScript("js/imc-results-scorers.js?v=1.0.0");
    writeScript("js/imc-transfers.js?v=1.0.1");
    writeScript("js/imc-player-codex-gw.js?v=1.0.0");
    writeScript("js/imc-player-codex-global.js?v=1.0.0");
    return;
  }

  loadCoreAsync();
})();
