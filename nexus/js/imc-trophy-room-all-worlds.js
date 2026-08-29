(function(){
"use strict";

if(window.__IMC_TROPHY_ROOM_ALL_WORLDS__)return;
window.__IMC_TROPHY_ROOM_ALL_WORLDS__=true;

const VERSION="1.1.0";
const ROOT_ATTR="data-imc-trophy-room-module";
const TROPHIES=[
  ["Charity Shield","assets/trophies/charity-shield.png"],
  ["Division One","assets/trophies/division-one.png"],
  ["Division Two","assets/trophies/division-two.png"],
  ["Division Three","assets/trophies/division-three.png"],
  ["Division Four","assets/trophies/division-four.png"],
  ["Division Five","assets/trophies/division-five.png"],
  ["IMC Champions","assets/trophies/imc-champions.png"],
  ["IMC Champions V27","assets/trophies/imc-champions-v27.png"],
  ["IMC Shield","assets/trophies/imc-shield.png"],
  ["IMC Super Cup","assets/trophies/imc-super-cup.png"],
  ["Kick Off Cup","assets/trophies/kick-off-cup.webp"],
  ["League Cup","assets/trophies/league-cup.png"],
  ["National Cup","assets/trophies/national-cup.png"],
  ["Playoff","assets/trophies/playoff.png"],
  ["SMFA Champions","assets/trophies/smfa-champions.png"],
  ["SMFA Shield","assets/trophies/smfa-shield.png"],
  ["SMFA Super Cup","assets/trophies/smfa-super-cup.png"],
  ["World Cup Qualifying","assets/trophies/world-cup-qualifying.png"],
  ["World Cup","assets/trophies/world-cup.png"]
];

function clean(value){return String(value==null?"":value).replace(/\s+/g," ").trim();}
function esc(value){return clean(value).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});}
function pageRoot(){return document.getElementById("pageRoot");}

function currentWorld(){
  const selectors=["#openDrawerWorld strong",".nx-sport-world strong",".nx-world-header strong",".nx-world-header p"];
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

function ensureStyle(){
  if(document.getElementById("imcTrophyRoomAssetStyle"))return;
  const style=document.createElement("style");
  style.id="imcTrophyRoomAssetStyle";
  style.textContent=`
    .nx-trophy-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:18px}
    .nx-trophy-card{min-width:0;border:1px solid rgba(8,43,99,.10);border-radius:18px;background:#fff;padding:14px 10px 12px;text-align:center;box-shadow:0 8px 24px rgba(8,43,99,.07)}
    .nx-trophy-card img{display:block;width:100%;height:150px;object-fit:contain;margin:0 auto 10px}
    .nx-trophy-card strong{display:block;color:#082b63;font-family:Inter,system-ui,sans-serif;font-size:13px;line-height:1.25}
    @media(max-width:380px){.nx-trophy-grid{gap:10px}.nx-trophy-card{padding:10px 8px}.nx-trophy-card img{height:128px}.nx-trophy-card strong{font-size:12px}}
  `;
  document.head.appendChild(style);
}

function trophyGrid(){
  return `<div class="nx-trophy-grid">${TROPHIES.map(function(item){
    return `<article class="nx-trophy-card"><img src="${esc(item[1])}" alt="${esc(item[0])}" loading="lazy"><strong>${esc(item[0])}</strong></article>`;
  }).join("")}</div>`;
}

function render(worldId){
  const root=pageRoot();
  if(!root||!worldId)return false;
  ensureStyle();
  root.innerHTML=`
    <section class="nx-card nx-trophy-room" ${ROOT_ATTR}="${esc(worldId)}">
      <div class="nx-page-title">
        <div>
          <small>${esc(worldId)}</small>
          <h1>🏆 Trophy Room</h1>
          <p>${esc(currentWorldName())}</p>
        </div>
      </div>
      ${trophyGrid()}
    </section>`;
  setTrophyNavActive();
  return true;
}

function open(worldId){
  const resolved=clean(worldId||currentWorld()).toUpperCase();
  if(!/^GW\d{3}$/.test(resolved))return false;
  return render(resolved);
}

function isTrophyTrigger(target){return !!(target&&target.closest&&target.closest('.nx-bottom [data-page="trophies"]'));}

document.addEventListener("click",function(event){
  if(!isTrophyTrigger(event.target))return;
  const worldId=currentWorld();
  if(!worldId)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  open(worldId);
},true);

window.IMC_TROPHY_ROOM_ALL_WORLDS={version:VERSION,open:open,currentWorld:currentWorld};
})();
