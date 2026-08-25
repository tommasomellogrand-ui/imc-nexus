(function(){
  "use strict";

  const NEXUS_BUILD = "55";
  document.title = "IMC Nexus · Build 55";
  var buildMeta = document.querySelector('meta[name="imc-nexus-build"]');
  if(buildMeta) buildMeta.setAttribute("content", NEXUS_BUILD);

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
    appendScript("js/imc-transfers-v2.js?v=2.2.0");
  }

  function loadCoreAsync(){
    appendScript("js/app-core-54.js?v=55.0-core",loadAfterCore);
  }

  if(document.readyState==="loading"){
    writeScript("js/app-core-54.js?v=55.0-core");
    writeScript("js/imc-results-scorers.js?v=1.0.0");
    writeScript("js/imc-transfers-v2.js?v=2.2.0");
    return;
  }

  loadCoreAsync();
})();
