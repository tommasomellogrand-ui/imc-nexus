(function(){
"use strict";

const VERSION="1.0.0";
const WORLD_BY_NAME={
  "road to history":"GW001",
  "gold 558":"GW002",
  "gold 557":"GW003",
  "world league":"GW004",
  "hall of famers":"GW005",
  "master league world":"GW006",
  "the four kingdoms":"GW007",
  "gold 1":"GW008",
  "kick off":"GW009",
  "sensible soccer academy":"GW010"
};
const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const valid=id=>/^GW(?:00[1-9]|010)$/.test(String(id||""));

function currentWorld(){
  const guard=window.IMC_WORLD_CONTEXT_FIX;
  if(guard&&typeof guard.currentWorld==="function"){
    const id=String(guard.currentWorld()||"");
    if(valid(id))return id;
  }
  const text=document.querySelector("#openDrawerWorld strong,.nx-sport-world strong")?.textContent||"";
  return WORLD_BY_NAME[norm(text)]||"";
}

function sync(){
  const id=currentWorld();
  if(!valid(id))return;

  const bottom=document.querySelector(".nx-bottom.nx-bottom-b6");
  if(bottom){
    bottom.querySelectorAll('[data-world-section="player-codex"],[data-imc-codex-world]').forEach(el=>el.remove());
  }

  const nav=document.querySelector(".nx-world-nav");
  if(!nav)return;

  const matches=[...nav.querySelectorAll('[data-world-section="player-codex"],[data-imc-codex-world]')];
  let button=matches.shift()||null;
  matches.forEach(el=>el.remove());

  if(!button){
    button=document.createElement("button");
    button.type="button";
    button.innerHTML='<b>▣</b><span>PLAYER CODEX</span>';
  }

  button.setAttribute("data-world-section","player-codex");
  button.setAttribute("data-imc-codex-world",id);

  if(nav.firstElementChild!==button)nav.insertBefore(button,nav.firstElementChild||null);
}

function schedule(){
  [0,60,140,280,520,900,1500].forEach(ms=>setTimeout(sync,ms));
}

document.addEventListener("click",function(e){
  const target=e.target&&e.target.closest&&e.target.closest('[data-drawer-world],[data-select-world],[data-world-id],[data-game-world-id],[data-world],.nx-world-nav button,#openDrawerWorld');
  if(target)schedule();
},true);

window.addEventListener("pageshow",schedule);
document.addEventListener("visibilitychange",function(){if(!document.hidden)schedule();});

schedule();
window.IMC_PLAYER_CODEX_MENU={version:VERSION,sync,schedule};
})();
