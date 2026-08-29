(function(){
  "use strict";

  if(window.__NEXUS_VISUAL_SYSTEM_V1__) return;
  window.__NEXUS_VISUAL_SYSTEM_V1__=true;

  function norm(value){
    return String(value||"").trim().toLowerCase();
  }

  function categoryForText(text){
    var value=norm(text);
    if(!value) return "domestic";

    if(/world cup|nations|national team|qualifying|uefa nations|coppa del mondo|nazional/i.test(value)){
      return "nations";
    }

    if(/imc champions|imc shield|imc super cup|champions|international|intercontinental|continental|smfa/i.test(value)){
      return "international";
    }

    return "domestic";
  }

  function decorate(){
    var candidates=document.querySelectorAll(
      ".nx-competition-card,.nx-competition-detail-card,.nx-league-cover,.nx-competition-cover,.nx-cup-round-card,.nx-premium-standings,.nx-league-matchday-card,.comp-card"
    );

    candidates.forEach(function(node){
      if(node.dataset.nxVisualDecorated==="1") return;
      var text=node.textContent||"";
      var category=categoryForText(text);
      node.dataset.nxCompetitionTone=category;
      node.classList.add("nx-tone-"+category);
      node.dataset.nxVisualDecorated="1";
    });

    document.querySelectorAll("[data-competition-filter],.nx-competition-filter button,.world-tabs .world-tab").forEach(function(node){
      var text=norm(node.textContent);
      if(text.indexOf("international")>=0) node.classList.add("nx-tone-pill-international");
      else if(text.indexOf("nation")>=0) node.classList.add("nx-tone-pill-nations");
      else if(text.indexOf("domestic")>=0) node.classList.add("nx-tone-pill-domestic");
    });
  }

  var timer=null;
  function scheduleDecorate(){
    clearTimeout(timer);
    timer=setTimeout(decorate,40);
  }

  new MutationObserver(scheduleDecorate).observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",decorate);
  else decorate();
})();
