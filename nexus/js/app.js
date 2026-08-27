(function(){
  "use strict";

  // Build 55 production runtime.
  const NEXUS_BUILD = "55";

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

  function isClubHouse(){
    var el=document.querySelector("#openDrawerWorld strong,.nx-sport-world strong");
    var text=String(el&&el.textContent||"").trim().toLowerCase();
    if(text) return text==="club house";
    return !!document.querySelector(".nx-card.nx-clubhouse");
  }

  function removeClubHouseManagerHero(){
    if(!document.getElementById("openImcGlobalCodex")) return;
    var clubhouse=document.querySelector(".nx-card.nx-clubhouse");
    if(!clubhouse) return;
    var hero=clubhouse.querySelector(".nx-hero-card");
    if(hero) hero.remove();
  }

  var clubHouseTimer=null;
  new MutationObserver(function(){
    clearTimeout(clubHouseTimer);
    clubHouseTimer=setTimeout(removeClubHouseManagerHero,80);
  }).observe(document.documentElement,{childList:true,subtree:true});
  removeClubHouseManagerHero();

  document.addEventListener("click",function(event){
    var target=event.target&&event.target.closest?event.target.closest('#openImcGlobalCodex,[data-world-section="player-codex"]'):null;
    if(!target) return;
    if(target.id!=="openImcGlobalCodex"&&!isClubHouse()) return;
    var codex=window.IMC_PLAYER_CODEX_GLOBAL;
    if(!codex||typeof codex.open!=="function") return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    codex.open();
  },true);

  function loadAfterCore(){
    appendScript("js/imc-results-scorers.js?v=1.0.0");
    appendScript("js/imc-transfers.js?v=1.0.1");
    appendScript("js/imc-player-codex-gw.js?v=1.0.2");
    appendScript("js/imc-player-codex-menu.js?v=1.2.0");
    appendScript("js/imc-player-codex-global.js?v=1.0.0");
    appendScript("js/imc-player-codex-global-detail.js?v=1.1.0");
    appendScript("js/imc-competitions.js?v=1.3.0",function(){
      appendScript("js/imc-competition-ui.js?v=1.2.1",function(){
        appendScript("js/imc-match-report-gw001.js?v=0.1.0",function(){
          appendScript("js/imc-match-report-lineups-gw001.js?v=0.1.0");
        });
      });
    });
  }

  function loadCoreAsync(){
    appendScript("js/app-core-55.js?v=55.0-core",loadAfterCore);
  }

  if(document.readyState==="loading"){
    writeScript("js/app-core-55.js?v=55.0-core");
    writeScript("js/imc-results-scorers.js?v=1.0.0");
    writeScript("js/imc-transfers.js?v=1.0.1");
    writeScript("js/imc-player-codex-gw.js?v=1.0.2");
    writeScript("js/imc-player-codex-menu.js?v=1.2.0");
    writeScript("js/imc-player-codex-global.js?v=1.0.0");
    writeScript("js/imc-player-codex-global-detail.js?v=1.1.0");
    writeScript("js/imc-competitions.js?v=1.3.0");
    writeScript("js/imc-competition-ui.js?v=1.2.1");
    writeScript("js/imc-match-report-gw001.js?v=0.1.0");
    writeScript("js/imc-match-report-lineups-gw001.js?v=0.1.0");
    return;
  }

  loadCoreAsync();
})();