(function(){
  "use strict";

  const NEXUS_BUILD = "53";

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
    appendScript("js/imc-repository-results-schedule.js?v=1.0.0");
    appendScript("js/imc-results-scorers.js?v=1.0.0");
  }

  function loadCoreAsync(){
    appendScript("js/app-core-53.js?v=53.0-core",loadAfterCore);
  }

  if(document.readyState==="loading"){
    writeScript("js/imc-no-matchdays.js?v=1.0.2");
    writeScript("js/app-core-53.js?v=53.0-core");
    writeScript("js/imc-repository-results-schedule.js?v=1.0.0");
    writeScript("js/imc-results-scorers.js?v=1.0.0");
    return;
  }

  appendScript("js/imc-no-matchdays.js?v=1.0.2",loadCoreAsync,loadCoreAsync);
})();
