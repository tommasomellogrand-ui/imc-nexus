(function(){
"use strict";

if(window.__IMC_TROPHY_ROOM_ALL_WORLDS__)return;
window.__IMC_TROPHY_ROOM_ALL_WORLDS__=true;

const VERSION="1.0.0";
const ROOT_ATTR="data-imc-trophy-room-module";

function clean(value){return String(value==null?"":value).replace(/\s+/g," ").trim();}
function esc(value){return clean(value).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});}
function pageRoot(){return document.getElementById("pageRoot");}

function currentWorld(){
  const selectors=[
    "#openDrawerWorld strong",
    ".nx-sport-world strong",
    ".nx-world-header strong",
    ".nx-world-header p"
  ];
  for(const selector of selectors){
    const nodes=document.querySelectorAll(selector);
    for(const node of nodes){
      const text=clean(node.textContent);
      const match=text.match(/GW\d{3}/i);
      if(match)return match[0].toUpperCase();
    }
  }
  return "";
}

function currentWorldName(){
  const nodes=document.querySelectorAll("#openDrawerWorld strong,.nx-sport-world strong");
  for(const node of nodes){
    const text=clean(node.textContent);
    if(text&&!/^GW\d{3}$/i.test(text)&&text.toLowerCase()!=="club house")return text;
  }
  return "Game World";
}

function setTrophyNavActive(){
  document.querySelectorAll(".nx-bottom [data-page]").forEach(function(button){
    button.classList.toggle("active",button.getAttribute("data-page")==="trophies");
  });
}

function render(worldId){
  const root=pageRoot();
  if(!root||!worldId)return false;

  root.innerHTML=`
    <section class="nx-card nx-trophy-room" ${ROOT_ATTR}="${esc(worldId)}">
      <div class="nx-page-title">
        <div>
          <small>${esc(worldId)}</small>
          <h1>🏆 Trophy Room</h1>
          <p>${esc(currentWorldName())}</p>
        </div>
      </div>
      <div class="nx-empty-box">
        <strong>Trophy Room pronta</strong>
        <span>Nuovo modulo indipendente attivo. I dati verranno collegati separatamente.</span>
      </div>
    </section>`;

  setTrophyNavActive();
  return true;
}

function open(worldId){
  const resolved=clean(worldId||currentWorld()).toUpperCase();
  if(!/^GW\d{3}$/.test(resolved))return false;
  return render(resolved);
}

function isTrophyTrigger(target){
  return !!(target&&target.closest&&target.closest('.nx-bottom [data-page="trophies"]'));
}

document.addEventListener("click",function(event){
  if(!isTrophyTrigger(event.target))return;
  const worldId=currentWorld();
  if(!worldId)return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  open(worldId);
},true);

window.IMC_TROPHY_ROOM_ALL_WORLDS={
  version:VERSION,
  open:open,
  currentWorld:currentWorld
};
})();
