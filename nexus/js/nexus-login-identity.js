(function(){
  "use strict";
  function apply(){
    var screen=document.querySelector(".login-screen:not(.nx-password-change-screen)");
    if(!screen)return;
    var brand=screen.querySelector(".login-brand");
    if(!brand)return;
    var title=brand.querySelector("h1");
    var subtitle=brand.querySelector("p");
    if(title && title.dataset.nexusIdentity!=="1"){
      title.dataset.nexusIdentity="1";
      title.innerHTML='NE<span class="nx-x">X</span>US';
    }
    if(subtitle && subtitle.dataset.nexusIdentity!=="1"){
      subtitle.dataset.nexusIdentity="1";
      subtitle.textContent="POWERED BY";
    }
  }
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply);
  else apply();
})();
