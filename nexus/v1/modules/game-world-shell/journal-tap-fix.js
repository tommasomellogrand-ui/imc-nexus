(function(){
"use strict";
if(window.IMC_GW_JOURNAL_TAP_FIX)return;
const VERSION="1.0.0";
let lastOpen=0;
function openJournal(ev){
  const card=ev.target&&ev.target.closest?ev.target.closest(".gw3-journal"):null;
  if(!card)return;
  const area=document.getElementById("worldArea");
  if(!area||!area.contains(card))return;
  const now=Date.now();
  if(now-lastOpen<500)return;
  lastOpen=now;
  ev.preventDefault();
  ev.stopImmediatePropagation();
  document.dispatchEvent(new CustomEvent("nexus:navigate",{detail:{target:"game-world-section",worldId:"GW001",section:"road-chronicle"}}));
}
document.addEventListener("pointerup",openJournal,true);
document.addEventListener("click",openJournal,true);
window.IMC_GW_JOURNAL_TAP_FIX={version:VERSION};
})();