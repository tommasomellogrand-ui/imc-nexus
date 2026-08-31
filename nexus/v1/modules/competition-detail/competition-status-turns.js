(function(){
"use strict";
if(window.IMC_COMPETITION_STATUS_TURNS)return;
const VERSION="1.0.0";
let observer=null,host=null;
function num(v){const n=Number(String(v==null?"":v).replace(/[^0-9.]/g,""));return Number.isFinite(n)?n:0}
function apply(root){
  if(!root)return;
  const box=root.querySelector(".cd-status");
  if(!box||box.dataset.turnsApplied==="1")return;
  const metric=[...box.querySelectorAll(":scope > div")].find(x=>x.querySelector("small")&&x.querySelector("small").textContent.trim()==="MATCHES PLAYED");
  const teamsBox=[...box.querySelectorAll(":scope > div")].find(x=>x.querySelector("small")&&x.querySelector("small").textContent.trim()==="TEAMS");
  if(!metric||!teamsBox)return;
  const strong=metric.querySelector("strong"),teamsStrong=teamsBox.querySelector("strong");
  if(!strong||!teamsStrong)return;
  const parts=strong.textContent.split("/").map(num),played=parts[0]||0,total=parts[1]||0,teams=num(teamsStrong.textContent);
  const matchesPerTurn=teams>1?teams/2:0;
  if(!matchesPerTurn||!total||total%matchesPerTurn!==0)return;
  const playedTurns=Math.floor(played/matchesPerTurn),totalTurns=total/matchesPerTurn,percent=Math.min(100,Math.round(played/total*100));
  strong.innerHTML=`${playedTurns}<i>/</i>${totalTurns}`;
  metric.querySelector("small").textContent="TURNI PLAYED";
  const pct=document.createElement("div");
  pct.className="cd-status-percent";
  pct.innerHTML=`<strong>${percent}%</strong><small>MATCHES PLAYED %</small>`;
  const progress=box.querySelector(".cd-progress");
  box.insertBefore(pct,progress||null);
  const old=box.querySelector(":scope > em");if(old)old.remove();
  box.dataset.turnsApplied="1";
}
function attach(container){
  if(observer)observer.disconnect();
  host=container||null;
  if(!host)return;
  apply(host);
  observer=new MutationObserver(()=>apply(host));
  observer.observe(host,{childList:true,subtree:true});
}
const bind=()=>{
  const mod=window.IMC_COMPETITION_DETAIL;
  if(!mod||mod.__turnsWrapped)return;
  const originalMount=mod.mount,originalUnmount=mod.unmount;
  mod.mount=async function(o){const r=await originalMount.call(mod,o);attach(o&&o.container);return r};
  mod.unmount=function(){if(observer)observer.disconnect();observer=null;host=null;return originalUnmount.call(mod)};
  mod.__turnsWrapped=true;
};
bind();
window.IMC_COMPETITION_STATUS_TURNS={version:VERSION,apply,attach};
})();