(function(){
  "use strict";

  function stripResultsFromMatchdays(root){
    var scope=root&&root.querySelectorAll?root:document;
    scope.querySelectorAll(".nx-league-matchday-card, .nx-cup-round-card").forEach(function(card){
      Array.prototype.slice.call(card.children).forEach(function(child){
        if(!child.classList.contains("nx-unified-matchday-head")){
          child.remove();
        }
      });
    });
  }

  function run(){
    stripResultsFromMatchdays(document);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",run,{once:true});
  }else{
    run();
  }

  var observer=new MutationObserver(function(){
    run();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
