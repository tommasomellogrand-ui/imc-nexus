(function(){
"use strict";
if(window.IMC_CLUBHOUSE_WORLDS_DIRECTORY)return;
const VERSION="1.0.0";
const WORLDS=[["GW001","Road To History"],["GW002","Gold 558"],["GW003","Gold 557"],["GW004","World League"],["GW005","Hall Of Famers"],["GW006","Master League World"],["GW007","The Four Kingdoms"],["GW008","Gold 1"],["GW009","Kick Off"]];
let loading=false,loaded=false;
const clean=v=>String(v==null?"":v).trim();
const esc=v=>clean(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function shell(){
  const panel=document.querySelector(".clubhouse [data-ch-feed-panel]");
  if(!panel)return null;
  let section=panel.querySelector("[data-ch-worlds-directory]");
  if(section)return section;
  section=document.createElement("section");
  section.className="ch-worlds-directory";
  section.setAttribute("data-ch-worlds-directory","");
  section.setAttribute("data-version",VERSION);
  section.innerHTML=`<header class="ch-worlds-directory-head"><span>IMC COMMUNITY</span><h2>OUR GAME WORLDS</h2><p>I 9 mondi di gioco della community e i manager IMC che vi partecipano.</p></header><div class="ch-worlds-directory-list">${WORLDS.map(([id,name])=>`<article class="ch-world-directory-card" data-world-card="${id}"><button type="button" class="ch-world-directory-toggle" data-world-toggle="${id}" aria-expanded="false"><span><small>${id}</small><strong>${esc(name)}</strong></span><b data-world-count>—</b><i>⌄</i></button><div class="ch-world-directory-body" data-world-body hidden><div class="ch-world-directory-loading">Caricamento manager…</div></div></article>`).join("")}</div>`;
  const head=panel.querySelector(".ch-feed-head");
  if(head)head.insertAdjacentElement("afterend",section);else panel.prepend(section);
  return section;
}

function activeManagers(rows){
  const managers=[];
  for(const row of Array.isArray(rows)?rows:[]){
    const teams=[...new Set((Array.isArray(row.assignments)?row.assignments:[])
      .filter(a=>clean(a.assignment_type).toLowerCase()==="club"&&a.is_active===true&&clean(a.team_name))
      .map(a=>clean(a.team_name)))];
    if(!teams.length)continue;
    managers.push({id:clean(row.manager_id),name:clean(row.full_name||row.manager_id),teams});
  }
  return managers.sort((a,b)=>a.name.localeCompare(b.name,"it",{sensitivity:"base"}));
}

function renderWorld(section,id,managers,error){
  const card=section.querySelector(`[data-world-card="${id}"]`);
  if(!card)return;
  const count=card.querySelector("[data-world-count]"),body=card.querySelector("[data-world-body]");
  if(error){count.textContent="—";body.innerHTML='<div class="ch-world-directory-empty">Dati non disponibili.</div>';return}
  count.textContent=`${managers.length} ${managers.length===1?"MANAGER":"MANAGER"}`;
  body.innerHTML=managers.length?`<div class="ch-world-manager-list">${managers.map(manager=>`<div class="ch-world-manager-row"><span><strong>${esc(manager.name)}</strong><small>${esc(manager.id)}</small></span><b>${esc(manager.teams.join(" · "))}</b></div>`).join("")}</div>`:'<div class="ch-world-directory-empty">Nessun manager IMC attualmente assegnato.</div>';
}

async function load(){
  if(loading||loaded)return;
  const root=document.querySelector(".clubhouse.ch-clubhouse-feed-view"),section=shell(),client=window.__IMC_NEXUS_CLIENT__;
  if(!root||!section||!client)return;
  loading=true;
  try{
    const results=await Promise.allSettled(WORLDS.map(([id])=>client.rpc("imc_nexus_gateway",{p_action:"managers",p_args:{gameWorld:id}})));
    results.forEach((result,index)=>{
      const id=WORLDS[index][0];
      if(result.status!=="fulfilled"||result.value.error){renderWorld(section,id,[],true);return}
      renderWorld(section,id,activeManagers(result.value.data&&result.value.data.rows),false);
    });
    loaded=true;
  }finally{loading=false}
}

function ensure(){shell();load()}
document.addEventListener("click",event=>{
  const button=event.target.closest&&event.target.closest("[data-world-toggle]");
  if(!button)return;
  const card=button.closest("[data-world-card]"),body=card&&card.querySelector("[data-world-body]");
  if(!body)return;
  const open=body.hidden;
  body.hidden=!open;
  button.setAttribute("aria-expanded",String(open));
  card.classList.toggle("open",open);
});
new MutationObserver(ensure).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
window.IMC_CLUBHOUSE_WORLDS_DIRECTORY={version:VERSION,load};
})();
