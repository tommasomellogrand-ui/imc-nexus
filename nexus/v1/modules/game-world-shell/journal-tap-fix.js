(function(){
"use strict";
if(window.IMC_GW_JOURNAL_TAP_FIX)return;
const VERSION="1.0.2";
async function openJournal(ev){
  const card=ev.target&&ev.target.closest?ev.target.closest(".gw3-journal,[data-gw-section='road-chronicle']"):null;
  if(!card)return;
  const area=document.getElementById("worldArea");
  if(!area||!area.contains(card))return;
  const content=area.querySelector("[data-gw-content]");
  if(!content)return;
  ev.preventDefault();
  ev.stopImmediatePropagation();
  try{
    if(!window.IMC_ROAD_CHRONICLE||typeof window.IMC_ROAD_CHRONICLE.mount!=="function")throw new Error("Modulo Road Chronicle non disponibile");
    if(window.IMC_ROAD_CHRONICLE.unmount)window.IMC_ROAD_CHRONICLE.unmount();
    await window.IMC_ROAD_CHRONICLE.mount({container:content,client:window.__IMC_NEXUS_CLIENT__||null,worldId:"GW001"});
    window.scrollTo({top:0,behavior:"auto"});
  }catch(err){
    content.innerHTML='<div class="gw-shell-empty">'+String(err&&err.message||err)+'</div>';
  }
}
document.addEventListener("click",openJournal,true);
window.IMC_GW_JOURNAL_TAP_FIX={version:VERSION};
})();