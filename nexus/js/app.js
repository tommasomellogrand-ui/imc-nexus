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
    appendScript("js/imc-repository-results-schedule.js?v=1.0.2");
    appendScript("js/imc-results-scorers.js?v=1.0.0");
  }

  function loadCoreAsync(){
    appendScript("js/app-core-54.js?v=54.0-core",loadAfterCore);
  }

  if(document.readyState==="loading"){
    writeScript("js/app-core-54.js?v=54.0-core");
    writeScript("js/imc-repository-results-schedule.js?v=1.0.2");
    writeScript("js/imc-results-scorers.js?v=1.0.0");
    return;
  }

  loadCoreAsync();
})();
