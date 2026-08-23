(function(){
  "use strict";
  function writeScript(src){
    document.write('<script src="'+src+'"></'+'script>');
  }
  if(document.readyState==="loading"){
    writeScript("js/app-core-53.js?v=53.0-core");
    writeScript("js/imc-results-scorers.js?v=1.0.0");
    writeScript("js/imc-match-report-beta.js?v=1.0.0");
    return;
  }
  var core=document.createElement("script");
  core.src="js/app-core-53.js?v=53.0-core";
  core.onload=function(){
    var scorers=document.createElement("script");
    scorers.src="js/imc-results-scorers.js?v=1.0.0";
    scorers.onload=function(){
      var matchReport=document.createElement("script");
      matchReport.src="js/imc-match-report-beta.js?v=1.0.0";
      document.head.appendChild(matchReport);
    };
    document.head.appendChild(scorers);
  };
  document.head.appendChild(core);
})();
