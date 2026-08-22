(function(){
"use strict";
const VERSION="1.2-build53-world-context";
const BLOCKED_WORLDS=new Set(["GW002","GW003","GW008","GW010"]);
const ACTIVE_FALLBACK={
  "road to history":"GW001",
  "world league":"GW004",
  "hall of famers":"GW005",
  "master league world":"GW006",
  "the four kingdoms":"GW007",
  "kick off":"GW009"
};
const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
function currentWorld(){
  const header=document.querySelector("#openDrawerWorld strong,.nx-sport-world strong");
  const name=norm(header&&header.textContent);
  if(name&&ACTIVE_FALLBACK[name])return ACTIVE_FALLBACK[name];
  if(name){
    const drawerItems=[...document.querySelectorAll("[data-drawer-world]")];
    const drawerMatch=drawerItems.find(el=>norm(el.textContent).includes(name));
    if(drawerMatch){
      const id=String(drawerMatch.getAttribute("data-drawer-world")||"");
      if(/^GW\d{3}$/.test(id))return id;
    }
  }
  const worlds=(window.IMC_DATA&&Array.isArray(window.IMC_DATA.worlds))?window.IMC_DATA.worlds:[];
  if(name){
    const match=worlds.find(w=>norm(w&&w.name)===name);
    if(match&&/^GW\d{3}$/.test(String(match.id||"")))return String(match.id);
  }
  const root=document.getElementById("pageRoot");
  const m=String(root&&root.textContent||"").match(/\bGW\d{3}\b/);
  return m?m[0]:null;
}
function setRestrictedVisibility(blocked){
  document.querySelectorAll("[data-imc-transfers-world],[data-imc-codex-world]").forEach(function(button){
    if(blocked){
      button.hidden=true;
      button.dataset.imcBlockedWorld="1";
      button.setAttribute("aria-hidden","true");
      button.style.setProperty("display","none","important");
    }else{
      button.hidden=false;
      delete button.dataset.imcBlockedWorld;
      button.removeAttribute("aria-hidden");
      button.style.removeProperty("display");
    }
  });
}
function sync(){
  const id=currentWorld();
  if(id&&BLOCKED_WORLDS.has(id)){
    setRestrictedVisibility(true);
    return;
  }
  setRestrictedVisibility(false);
  document.querySelectorAll("[data-imc-transfers-world]").forEach(b=>{if(id)b.dataset.imcTransfersWorld=id;});
  document.querySelectorAll("[data-imc-codex-world]").forEach(b=>{if(id)b.dataset.imcCodexWorld=id;});
}
document.addEventListener("click",function(event){
  const transferButton=event.target&&event.target.closest?event.target.closest("[data-imc-transfers-world]"):null;
  const codexButton=event.target&&event.target.closest?event.target.closest("[data-imc-codex-world]"):null;
  if(!transferButton&&!codexButton)return;
  const id=currentWorld();
  if(!id||BLOCKED_WORLDS.has(id)){
    event.preventDefault();
    event.stopImmediatePropagation();
    setRestrictedVisibility(true);
    return;
  }
  if(transferButton){
    const api=window.IMC_WORLD_FEATURES_BUILD53;
    if(!api||typeof api.openTransfers!=="function")return;
    event.preventDefault();
    event.stopImmediatePropagation();
    transferButton.dataset.imcTransfersWorld=id;
    api.openTransfers(id);
    return;
  }
  if(codexButton){
    const api=window.IMC_PLAYER_CODEX_BUILD53||window.IMC_PLAYER_CODEX_BUILD52;
    if(!api||typeof api.openWorld!=="function")return;
    event.preventDefault();
    event.stopImmediatePropagation();
    codexButton.dataset.imcCodexWorld=id;
    api.openWorld(id);
  }
},true);
let timer=null;
new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(sync,25);}).observe(document.documentElement,{childList:true,subtree:true});
sync();
window.IMC_WORLD_CONTEXT_FIX={version:VERSION,currentWorld,blockedWorlds:BLOCKED_WORLDS};
})();
