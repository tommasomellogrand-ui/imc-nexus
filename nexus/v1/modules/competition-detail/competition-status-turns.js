(function(){
"use strict";
if(window.IMC_COMPETITION_STATUS_TURNS)return;
const VERSION="2.0.0";
let observer=null,host=null,status=null;
function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
function apply(root){
  if(!root||!status)return;
  const box=root.querySelector(".cd-status");
  if(!box||box.dataset.turnsApplied==="1")return;
  const metric=[...box.querySelectorAll(":scope > div")].find(x=>x.querySelector("small")&&x.querySelector("small").textContent.trim()==="MATCHES PLAYED");
  const teamsBox=[...box.querySelectorAll(":scope > div")].find(x=>x.querySelector("small")&&x.querySelector("small").textContent.trim()==="TEAMS");
  if(!metric||!teamsBox)return;
  const strong=metric.querySelector("strong"),teamsStrong=teamsBox.querySelector("strong");
  if(!strong||!teamsStrong)return;
  const played=n(status.counts&&status.counts.results),total=n(status.expectedTotalMatches),teams=n(status.teamsCount),percent=n(status.matchesPlayedPercent);
  const matchesPerTurn=teams>1?teams/2:0;
  if(!matchesPerTurn||!total||total%matchesPerTurn!==0)return;
  const playedTurns=Math.floor(played/matchesPerTurn),totalTurns=total/matchesPerTurn;
  teamsStrong.textContent=teams||"—";
  strong.innerHTML=`${playedTurns}<i>/</i>${totalTurns}`;
  metric.querySelector("small").textContent="TURNI PLAYED";
  const pct=document.createElement("div");
  pct.className="cd-status-percent";
  pct.innerHTML=`<strong>${percent}%</strong><small>MATCHES PLAYED %</small>`;
  const progress=box.querySelector(".cd-progress");
  if(progress){const bar=progress.querySelector("b");if(bar)bar.style.width=`${percent}%`}
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
async function loadStatus(o){
  status=null;
  if(!o||!o.client||!o.worldId||!o.competitionKey)return;
  const r=await o.client.rpc("imc_nexus_gateway",{p_action:"competition_manifest",p_args:{gameWorld:o.worldId}});
  if(r.error)throw r.error;
  const rows=Array.isArray(r.data&&r.data.rows)?r.data.rows:[];
  status=rows.find(x=>String(x&&x.competition_key||"")===String(o.competitionKey))||null;
}
const bind=()=>{
  const mod=window.IMC_COMPETITION_DETAIL;
  if(!mod||mod.__turnsWrapped)return;
  const originalMount=mod.mount,originalUnmount=mod.unmount;
  mod.mount=async function(o){
    const r=await originalMount.call(mod,o);
    await loadStatus(o);
    attach(o&&o.container);
    return r;
  };
  mod.unmount=function(){if(observer)observer.disconnect();observer=null;host=null;status=null;return originalUnmount.call(mod)};
  mod.__turnsWrapped=true;
};
bind();
window.IMC_COMPETITION_STATUS_TURNS={version:VERSION,apply,attach};
})();