(function(){
"use strict";
const VERSION="1.0-build53-world-context";
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
  const worlds=(window.IMC_DATA&&Array.isArray(window.IMC_DATA.worlds))?window.IMC_DATA.worlds:[];
  if(name){
    const match=worlds.find(w=>norm(w&&w.name)===name);
    if(match&&/^GW\d{3}$/.test(String(match.id||"")))return String(match.id);
  }
  const root=document.getElementById("pageRoot");
  const m=String(root&&root.textContent||"").match(/\bGW\d{3}\b/);
  return m?m[0]:null;
}
function sync(){
  const id=currentWorld();
  document.querySelectorAll("[data-imc-transfers-world]").forEach(b=>{if(id)b.dataset.imcTransfersWorld=id;});
  document.querySelectorAll("[data-imc-codex-world]").forEach(b=>{if(id)b.dataset.imcCodexWorld=id;});
}
document.addEventListener("click",function(event){
  const button=event.target&&event.target.closest?event.target.closest("[data-imc-transfers-world]"):null;
  if(!button)return;
  const id=currentWorld();
  if(!id||id==="GW010")return;
  const api=window.IMC_WORLD_FEATURES_BUILD53;
  if(!api||typeof api.openTransfers!=="function")return;
  event.preventDefault();
  event.stopImmediatePropagation();
  button.dataset.imcTransfersWorld=id;
  api.openTransfers(id);
},true);
let timer=null;
new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(sync,25);}).observe(document.documentElement,{childList:true,subtree:true});
sync();
window.IMC_WORLD_CONTEXT_FIX={version:VERSION,currentWorld};
})();
