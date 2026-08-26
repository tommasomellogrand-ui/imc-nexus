(function(){
"use strict";

const VERSION="1.1.0";
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
let observer=null;
let frame=0;

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
  let button=matches.find(el=>el.getAttribute("data-world-section")==="player-codex")||matches[0]||null;
  matches.forEach(el=>{if(el!==button)el.remove();});

  if(!button){
    button=document.createElement("button");
    button.type="button";
    button.innerHTML='<b>▣</b><span>PLAYER CODEX</span>';
  }

  button.setAttribute("data-world-section","player-codex");
  button.setAttribute("data-imc-codex-world",id);

  if(nav.firstElementChild!==button)nav.insertBefore(button,nav.firstElementChild||null);
}

function queueSync(){
  if(frame)return;
  frame=requestAnimationFrame(function(){
    frame=0;
    sync();
  });
}

function start(){
  const root=document.getElementById("app");
  if(!root)return false;
  if(observer)observer.disconnect();
  observer=new MutationObserver(queueSync);
  observer.observe(root,{childList:true,subtree:true});
  sync();
  return true;
}

if(!start()){
  document.addEventListener("DOMContentLoaded",start,{once:true});
}
window.addEventListener("pageshow",sync);

window.IMC_PLAYER_CODEX_MENU={version:VERSION,sync};
})();
