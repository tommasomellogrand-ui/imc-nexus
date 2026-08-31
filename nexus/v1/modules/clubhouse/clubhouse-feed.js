(function(){
"use strict";
if(window.IMC_CLUBHOUSE_FEED)return;
const VERSION="1.0.0";
let loading=false;
const c=v=>String(v==null?"":v).trim();
const e=v=>c(v).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const upper=v=>c(v).toLocaleUpperCase("it-IT");
function surname(v){const p=c(v).split(/\s+/).filter(Boolean);return upper(p[p.length-1]||v||"IMC")}
function dateLabel(v){const s=c(v);if(!s)return"";const d=new Date(s+"T12:00:00");if(isNaN(d))return s;return d.toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()}
function competitionName(row){let s=c(row.source_competition_name)||"Coppa";const patterns=[/\s+Quarter Final Leg [12]$/i,/\s+Quarti di Finalee(?: Andata| Ritorno)?$/i,/\s+Turno\s+\d+\s+Leg\s+[12]$/i,/\s+Turno\s+\d+(?: Andata| Ritorno)?$/i,/\s+Semifinale$/i,/\s+Girone\s+[^ ]+$/i,/\s+(?:Finale|Final)$/i];for(const r of patterns)s=s.replace(r,"");return c(s)||c(row.source_competition_name)||"Coppa"}
function sideData(row,side){const other=side==="home"?"away":"home";return{side,other,team:c(row[side+"_team"]),otherTeam:c(row[other+"_team"]),score:Number(row[side+"_score"]),otherScore:Number(row[other+"_score"]),pens:Number(row[side+"_penalties"]),otherPens:Number(row[other+"_penalties"]),agg:Number(row[side+"_aggregate_score"]),otherAgg:Number(row[other+"_aggregate_score"]),managerName:c(row[side+"_imc_manager_name"]||row[side+"_manager_name"]),otherManagerName:c(row[other+"_imc_manager_name"]||row[other+"_manager_name"]),otherType:c(row[other+"_manager_type"])}}
function imcSides(row){const out=[];if(c(row.home_manager_type)==="IMC")out.push("home");if(c(row.away_manager_type)==="IMC")out.push("away");return out}
function resultWord(row,side){const winner=c(row.match_winner_side);if(winner==="draw")return"pareggia";return winner===side?"vince":"perde"}
function scoreText(row){const base=`${c(row.home_team)} ${c(row.home_score)}-${c(row.away_score)} ${c(row.away_team)}`;if(row.decided_on_penalties)return `${base} · rigori ${c(row.home_penalties)}-${c(row.away_penalties)}`;return base}
function opponentDescriptor(d){if(d.otherType==="IMC")return `${d.otherTeam}, guidato dal manager IMC ${d.otherManagerName}`;if(d.otherType==="External")return `${d.otherTeam}, guidato dal manager External ${d.otherManagerName}`;if(d.otherType==="Unmanaged")return `${d.otherTeam}, squadra senza manager`;return `${d.otherTeam}, avversario senza classificazione manager disponibile`}
function qualifiedSide(row){const q=c(row.qualified_team);if(!q)return"";if(q===c(row.home_team))return"home";if(q===c(row.away_team))return"away";return""}
function oneImcStory(row,side){const d=sideData(row,side),phase=c(row.phase_type),name=surname(d.managerName),verb=resultWord(row,side),win=c(row.match_winner_side)===side,draw=c(row.match_winner_side)==="draw",opp=opponentDescriptor(d),comp=competitionName(row),pens=!!row.decided_on_penalties,qSide=qualifiedSide(row),qualified=qSide===side;
let headline="",body="";
if(phase==="group"){
  headline=win?`🔥 ${name} FA LA VOCE GROSSA!`:draw?`⚖️ ${name}, UN PUNTO NEL GIRONE!`:`⚠️ SERATA STORTA PER ${name}`;
  body=`${d.team} ${verb} ${d.score}-${d.otherScore} contro ${opp} nel girone di ${comp}. Nessun verdetto sulla qualificazione viene ancora dichiarato.`;
}else if(phase==="first_leg"){
  headline=win?`🔥 ${name} PARTE FORTE!`:draw?`⚖️ TUTTO APERTO PER ${name}!`:`⚠️ ${name} CADE NELL'ANDATA`;
  body=`${d.team} ${verb} l'andata ${d.score}-${d.otherScore} contro ${opp}. La sfida resta aperta in vista del ritorno.`;
}else if(phase==="second_leg"){
  headline=qualified?`🎟️ ${name} AVANTI!`:`💔 ${name} ELIMINATO`;
  const agg=Number.isFinite(d.agg)&&Number.isFinite(d.otherAgg)?`${d.agg}-${d.otherAgg}`:"—";
  body=`${d.team} ${verb} il ritorno ${d.score}-${d.otherScore} contro ${opp}. ${agg} il risultato complessivo: ${qualified?"qualificazione conquistata":"eliminazione dalla competizione"}.`;
}else if(phase==="final"){
  headline=win?`🏆 ${name} È CAMPIONE!`:`💔 FINALE AMARA PER ${name}`;
  if(pens)body=`Dopo il ${d.score}-${d.otherScore}, ${d.team} ${win?"vince":"perde"} ${d.pens}-${d.otherPens} ai rigori contro ${opp}. ${win?`Il trofeo di ${comp} è suo.`:`Il trofeo di ${comp} sfuma all'ultimo atto.`}`;
  else body=`${d.team} ${verb} ${d.score}-${d.otherScore} contro ${opp} nella finale di ${comp}. ${win?"Trofeo conquistato.":"Il sogno si ferma all'ultimo atto."}`;
}else{
  headline=win?`🔥 ${name} NON SI FERMA!`:`💔 ${name} FUORI DALLA COPPA`;
  if(pens)body=`Dopo il ${d.score}-${d.otherScore}, ${d.team} ${win?"vince":"perde"} ${d.pens}-${d.otherPens} ai rigori contro ${opp}. ${win?"Passaggio al turno successivo conquistato.":"Eliminazione dalla competizione."}`;
  else body=`${d.team} ${verb} ${d.score}-${d.otherScore} contro ${opp}. ${win?"Passaggio al turno successivo conquistato.":"Eliminazione dalla competizione."}`;
}
return{headline,body,score:scoreText(row),opponentType:d.otherType};}
function twoImcStory(row){const phase=c(row.phase_type),winner=c(row.match_winner_side),q=qualifiedSide(row),home=sideData(row,"home"),away=sideData(row,"away"),comp=competitionName(row);let headline="",body="";
if(phase==="group"){
  if(winner==="draw"){headline="⚔️ DERBY IMC, EQUILIBRIO TOTALE!";body=`${home.team} e ${away.team} chiudono ${home.score}-${away.score}: un punto a testa per ${home.managerName} e ${away.managerName} nel girone di ${comp}.`;}
  else{const w=winner==="home"?home:away,l=winner==="home"?away:home;headline=`⚔️ DERBY IMC, FESTEGGIA ${surname(w.managerName)}!`;body=`${w.team} supera ${l.team} ${w.score}-${w.otherScore}: ${w.managerName} vince il derby IMC, ${l.managerName} esce sconfitto dalla sfida del girone.`;}
}else if(phase==="first_leg"){
  if(winner==="draw"){headline="⚔️ DERBY IMC, TUTTO APERTO!";body=`${home.team}-${away.team} finisce ${home.score}-${away.score}: ${home.managerName} e ${away.managerName} rimandano ogni verdetto al ritorno.`;}
  else{const w=winner==="home"?home:away,l=winner==="home"?away:home;headline=`⚔️ DERBY IMC, PRIMO ROUND A ${surname(w.managerName)}!`;body=`${w.team} vince l'andata ${w.score}-${w.otherScore} contro ${l.team}: vantaggio per ${w.managerName}, ma nessun verdetto prima del ritorno.`;}
}else if(phase==="second_leg"){
  const qual=q==="home"?home:q==="away"?away:null,elim=q==="home"?away:q==="away"?home:null,matchSentence=winner==="draw"?`Il ritorno termina ${home.score}-${away.score}.`:`${winner==="home"?home.managerName:away.managerName} vince il ritorno ${home.score}-${away.score}.`,agg=Number.isFinite(home.agg)&&Number.isFinite(away.agg)?`${home.agg}-${away.agg}`:"—";
  headline=qual?`⚔️ DERBY IMC, PASSA ${surname(qual.managerName)}!`:"⚔️ DERBY IMC, VERDETTO AL RITORNO!";
  body=qual&&elim?`${matchSentence} ${agg} il risultato complessivo: ${qual.managerName} conquista la qualificazione, ${elim.managerName} viene eliminato.`:`${matchSentence} Risultato complessivo ${agg}.`;
}else if(phase==="final"){
  const w=winner==="home"?home:winner==="away"?away:null,l=winner==="home"?away:winner==="away"?home:null;
  headline=w?`🏆 DERBY IMC, IL TROFEO È DI ${surname(w.managerName)}!`:"🏆 DERBY IMC, FINALE IN EQUILIBRIO!";
  body=w&&l?`${w.team} supera ${l.team} ${w.score}-${w.otherScore}${row.decided_on_penalties?` (${w.pens}-${w.otherPens} ai rigori)`:""}: ${w.managerName} conquista ${comp}, ${l.managerName} perde la finale.`:scoreText(row);
}else{
  const w=winner==="home"?home:winner==="away"?away:null,l=winner==="home"?away:winner==="away"?home:null;
  headline=w?`⚔️ DERBY IMC, FESTEGGIA ${surname(w.managerName)}!`:"⚔️ DERBY IMC, PARITÀ!";
  body=w&&l?`${w.team} supera ${l.team} ${w.score}-${w.otherScore}${row.decided_on_penalties?` (${w.pens}-${w.otherPens} ai rigori)`:""}: ${w.managerName} passa al turno successivo, ${l.managerName} saluta la competizione.`:scoreText(row);
}
return{headline,body,score:scoreText(row),opponentType:"IMC"};}
function story(row){const sides=imcSides(row);return sides.length>1?twoImcStory(row):oneImcStory(row,sides[0])}
function phaseLabel(v){return({group:"GIRONE",first_leg:"ANDATA",second_leg:"RITORNO",single_leg:"PARTITA SECCA",final:"FINALE"})[c(v)]||upper(v)}
function article(row){const s=story(row),comp=competitionName(row);return `<article class="ch-feed-card"><div class="ch-feed-meta"><span>${e(dateLabel(row.match_date))}</span><span>${e(row.game_world_id)}</span><span>${e(row.competition_type==="International"?"INTERNAZIONALE":"DOMESTICA")}</span></div><h3>${e(s.headline)}</h3><div class="ch-feed-score">${e(s.score)}</div><p>${e(s.body)}</p><div class="ch-feed-tags"><span>${e(comp)}</span><span>${e(phaseLabel(row.phase_type))}</span><span>AVVERSARIO: ${e(s.opponentType==="Unmanaged"?"SENZA MANAGER":upper(s.opponentType))}</span></div></article>`}
function panel(root){const canvas=root.querySelector(".ch-clubhouse-canvas");if(!canvas)return null;let p=canvas.querySelector("[data-ch-feed-panel]");if(p)return p;p=document.createElement("section");p.className="ch-feed-panel";p.setAttribute("data-ch-feed-panel","");p.hidden=true;p.innerHTML=`<div class="ch-feed-head"><span>IMC NEXUS</span><h2>FEED COPPE</h2><small>Match Report · Coppe domestiche e internazionali</small></div><div class="ch-feed-list" data-ch-feed-list><div class="ch-feed-loading">Caricamento news…</div></div>`;const nav=canvas.querySelector(".ch-bottom-nav");canvas.insertBefore(p,nav||null);return p}
function setActive(root,label){for(const b of root.querySelectorAll(".ch-bottom-nav button"))b.classList.toggle("active",upper(b.textContent)===label)}
function hideHome(root){const canvas=root.querySelector(".ch-clubhouse-canvas"),p=panel(root);if(!canvas||!p)return;for(const child of [...canvas.children]){if(child===p||child.classList.contains("ch-bottom-nav"))continue;if(!child.hidden){child.hidden=true;child.setAttribute("data-ch-feed-hidden","")}}p.hidden=false;setActive(root,"FEED")}
function showHome(root){const canvas=root.querySelector(".ch-clubhouse-canvas"),p=canvas&&canvas.querySelector("[data-ch-feed-panel]");if(!canvas)return;if(p)p.hidden=true;for(const child of canvas.querySelectorAll("[data-ch-feed-hidden]")){child.hidden=false;child.removeAttribute("data-ch-feed-hidden")}setActive(root,"HOME")}
async function load(root){if(loading)return;const p=panel(root),list=p&&p.querySelector("[data-ch-feed-list]"),client=window.__IMC_NEXUS_CLIENT__;if(!list||!client)return;loading=true;list.innerHTML='<div class="ch-feed-loading">Caricamento news…</div>';try{const r=await client.rpc("imc_nexus_gateway",{p_action:"club_house_feed",p_args:{}});if(r.error)throw r.error;const rows=Array.isArray(r.data&&r.data.rows)?r.data.rows:[];list.innerHTML=rows.length?rows.map(article).join(""):'<div class="ch-feed-empty">Nessuna news di Coppa disponibile.</div>'}catch(err){list.innerHTML=`<div class="ch-feed-empty">${e(err.message||"Feed non disponibile")}</div>`}finally{loading=false}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".clubhouse .ch-bottom-nav button");if(!b)return;const root=b.closest(".clubhouse"),label=upper(b.textContent);if(label==="FEED"){hideHome(root);load(root)}else if(label==="HOME")showHome(root)});
window.IMC_CLUBHOUSE_FEED={version:VERSION,show:()=>{const root=document.querySelector(".clubhouse");if(root){hideHome(root);load(root)}},home:()=>{const root=document.querySelector(".clubhouse");if(root)showHome(root)}};
})();
