(function(){
"use strict";
if(window.IMC_COMPETITIONS_TAP)return;
const VERSION="1.0.0";
const cache=new Map();
const clean=v=>String(v==null?"":v).trim();
async function getCompetitions(worldId){
  if(cache.has(worldId))return cache.get(worldId);
  const client=window.__IMC_NEXUS_CLIENT__;
  if(!client)throw new Error("Client Nexus non disponibile");
  const r=await client.rpc("imc_nexus_gateway",{p_action:"gw_competitions",p_args:{gameWorld:worldId}});
  if(r.error)throw r.error;
  const rows=(r.data&&r.data.rows)||[];
  cache.set(worldId,rows);
  return rows;
}
function rowName(x){return clean(x&&x["Nexus View"]||x&&x.sm_competition_name||x&&x.competition_key)}
document.addEventListener("click",async e=>{
  const card=e.target.closest&&e.target.closest(".cp-preview-card");
  if(!card)return;
  const menu=card.closest(".cp-menu");
  if(!menu)return;
  const worldId=clean(menu.querySelector(".cp-menu-world span")?.textContent);
  const name=clean(card.querySelector("h3")?.textContent);
  if(!worldId||!name)return;
  try{
    const rows=await getCompetitions(worldId);
    const row=rows.find(x=>rowName(x)===name);
    const key=clean(row&&row.competition_key);
    if(!key)return;
    document.dispatchEvent(new CustomEvent("nexus:navigate",{detail:{target:"competition-detail",worldId,competitionKey:key,name}}));
  }catch(err){console.error("Competition tap error",err)}
});
window.IMC_COMPETITIONS_TAP={version:VERSION};
})();