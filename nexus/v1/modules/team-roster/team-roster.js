(function(){
"use strict";
if(window.IMC_TEAM_ROSTER)return;
const VERSION="2.0.0";
let s={container:null};
const c=v=>String(v==null?"":v).trim();
const e=v=>c(v).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const bool=v=>v===true||String(v).toLowerCase()==="true";
function markerMinute(rawHtml,spriteClass){
  const html=c(rawHtml);
  if(!html||!spriteClass)return null;
  const host=document.createElement("div");
  host.innerHTML=html;
  const img=host.querySelector("."+spriteClass);
  const abbr=img&&img.closest("abbr");
  if(!abbr)return null;
  const prev=c(abbr.previousSibling&&abbr.previousSibling.textContent);
  const next=c(abbr.nextSibling&&abbr.nextSibling.textContent);
  let m=prev.match(/\(([0-9]{1,3})\)\s*$/);
  if(m)return Number(m[1]);
  m=next.match(/^\s*\(([0-9]{1,3})\)/);
  if(m)return Number(m[1]);
  return null;
}
function redMinute(player){
  const markers=player&&player.metadata&&Array.isArray(player.metadata.markers)?player.metadata.markers:[];
  const values=markers.filter(x=>c(x&&x.type).toLowerCase()==="red").map(x=>num(x&&x.minute)).filter(Number.isFinite);
  return values.length?Math.min(...values):null;
}
function duration(payload,players){
  let max=90;
  const events=Array.isArray(payload&&payload.events)?payload.events:[];
  for(const x of events){const n=num(x&&x.minute);if(Number.isFinite(n))max=Math.max(max,n)}
  for(const p of players){
    const raw=p&&p.metadata&&p.metadata.rawHtml;
    for(const cls of ["spritev_subon","spritev_suboff"]){const n=markerMinute(raw,cls);if(Number.isFinite(n))max=Math.max(max,n)}
    const r=redMinute(p);if(Number.isFinite(r))max=Math.max(max,r);
  }
  return max;
}
function playerMinutes(player,matchDuration){
  const raw=player&&player.metadata&&player.metadata.rawHtml;
  const starter=bool(player&&player.isStarter);
  const subOn=markerMinute(raw,"spritev_subon");
  const subOff=markerMinute(raw,"spritev_suboff");
  const red=redMinute(player);
  if(!starter&&!Number.isFinite(subOn))return 0;
  const start=starter?0:subOn;
  const exits=[matchDuration,subOff,red].filter(Number.isFinite);
  const end=Math.min(...exits);
  return Math.max(0,end-start);
}
function emptyPlayer(p){return {smPlayerId:p.smPlayerId??null,playerName:c(p.playerName),starter:0,substitute:0,bench:0,minutes:0,ratingSum:0,ratingCount:0,assists:0,goals:0,mom:0,yellow:0,red:0}}
function addPlayer(target,p,matchDuration){
  const starter=bool(p.isStarter);
  const subOn=markerMinute(p&&p.metadata&&p.metadata.rawHtml,"spritev_subon");
  if(starter)target.starter+=1;
  else if(Number.isFinite(subOn))target.substitute+=1;
  else target.bench+=1;
  target.minutes+=playerMinutes(p,matchDuration);
  const rating=num(p.rating);if(Number.isFinite(rating)){target.ratingSum+=rating;target.ratingCount+=1}
  target.assists+=num(p.assists)||0;
  target.goals+=num(p.goals)||0;
  target.mom+=bool(p.isManOfMatch)?1:0;
  target.yellow+=num(p.yellowCards)||0;
  target.red+=num(p.redCards)||0;
}
function stat(label,value){return `<div class="tr-stat"><span>${e(label)}</span><strong>${e(value)}</strong></div>`}
function render(groups){
  if(!groups.size){s.container.innerHTML="<div class='nx-empty'>Nessun giocatore disponibile nei Match Report della squadra.</div>";return}
  s.container.innerHTML=`<div class="tr-roster">${Array.from(groups.entries()).map(([competitionKey,players])=>`<section class="tr-competition"><h3>${e(competitionKey)}</h3><div class="tr-players">${Array.from(players.values()).map(p=>{
    const avg=p.ratingCount?(p.ratingSum/p.ratingCount).toFixed(2):"—";
    return `<article class="tr-player"><h4>${e(p.playerName||p.smPlayerId||"Giocatore")}</h4><div class="tr-player-stats">${stat("PRESENZE TITOLARE",p.starter)}${stat("PRESENZE SUBENTRATO",p.substitute)}${stat("PRESENZE IN PANCHINA",p.bench)}${stat("MINUTI GIOCATI",p.minutes)}${stat("MEDIA VOTO",avg)}${stat("ASSIST",p.assists)}${stat("GOL",p.goals)}${stat("MIGLIORE IN CAMPO",p.mom)}${stat("AMMONIZIONI",p.yellow)}${stat("ESPULSIONI",p.red)}</div></article>`
  }).join("")}</div></section>`).join("")}</div>`;
}
async function mount(o){
  if(!o||!o.container||!o.client||!o.worldId||!o.clubWorldId)throw Error("Team Roster: parametri mancanti");
  s.container=o.container;
  s.container.innerHTML="<div class='nx-loading'>Caricamento Team Roster dai Match Report...</div>";
  const resultsResponse=await o.client.rpc("imc_nexus_gateway",{p_action:"results",p_args:{gameWorld:o.worldId,clubWorldId:o.clubWorldId,limit:1000}});
  if(resultsResponse.error)throw resultsResponse.error;
  const results=Array.isArray(resultsResponse.data&&resultsResponse.data.rows)?resultsResponse.data.rows:[];
  const fixtures=results.filter(x=>x&&x.sm_fixture_id!=null);
  if(!fixtures.length){s.container.innerHTML="<div class='nx-empty'>Nessun Match Report disponibile per la squadra.</div>";return}
  const reportResponses=await Promise.all(fixtures.map(x=>o.client.rpc("imc_nexus_gateway",{p_action:"match_report",p_args:{gameWorld:o.worldId,fixtureId:x.sm_fixture_id}})));
  const groups=new Map();
  for(let i=0;i<fixtures.length;i++){
    const response=reportResponses[i];
    if(response&&response.error)throw response.error;
    const row=response&&response.data&&response.data.row;
    if(!row||!row.source_payload)continue;
    const payload=row.source_payload||{};
    const match=payload.match||{};
    const clubId=String(o.clubWorldId);
    const side=String(match.homeSmClubId??"")===clubId?"home":String(match.awaySmClubId??"")===clubId?"away":null;
    if(!side)continue;
    const competitionKey=c(fixtures[i].competition_key);
    if(!competitionKey)continue;
    const allPlayers=Array.isArray(payload.players)?payload.players:[];
    const teamPlayers=allPlayers.filter(p=>c(p&&p.side).toLowerCase()===side);
    if(!teamPlayers.length)continue;
    const matchDuration=duration(payload,teamPlayers);
    if(!groups.has(competitionKey))groups.set(competitionKey,new Map());
    const playerMap=groups.get(competitionKey);
    for(const p of teamPlayers){
      const playerId=p&&p.smPlayerId!=null?String(p.smPlayerId):"";
      const key=playerId||c(p&&p.playerName);
      if(!key)continue;
      if(!playerMap.has(key))playerMap.set(key,emptyPlayer(p));
      addPlayer(playerMap.get(key),p,matchDuration);
    }
  }
  render(groups);
}
function unmount(){if(s.container)s.container.innerHTML="";s.container=null}
window.IMC_TEAM_ROSTER={version:VERSION,mount,unmount};
})();