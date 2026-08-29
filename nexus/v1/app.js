(function(){
"use strict";

const BUILD="1.0";
const SUPABASE_URL="https://toanuzojdkfjgucztpze.supabase.co";
const SUPABASE_KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
const WORLDS={GW001:"Road To History",GW002:"Gold 558",GW003:"Gold 557",GW004:"World League",GW005:"Hall Of Famers",GW006:"Master League World",GW007:"The Four Kingdoms",GW008:"Gold 1",GW009:"Kick Off",GW010:"Sensible Soccer Academy"};

let db=null,identity=null,currentView="clubhouse",selectedWorld=null;
function el(id){return document.getElementById(id)}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function technicalEmail(username){return username.trim().toLowerCase()+"@users.imcnexus.local"}
function setStatus(msg,isError){const n=el("status");if(!n)return;n.textContent=msg||"";n.classList.toggle("error",!!isError)}
function show(id){["loginView","appView"].forEach(x=>{const n=el(x);if(n)n.hidden=x!==id})}

async function loadIdentity(user){
  const r=await db.from("imc_users").select("auth_user_id,manager_id,username,role,must_change_password").eq("auth_user_id",user.id).maybeSingle();
  if(r.error)throw r.error;
  if(!r.data)throw new Error("Account Nexus non associato a un manager IMC");
  return r.data;
}
function renderHeader(){
  el("userName").textContent=identity.username||"Nexus User";
  el("managerId").textContent=identity.manager_id||"";
  el("buildLabel").textContent="BUILD "+BUILD;
}
async function openClubHouse(){
  currentView="clubhouse";selectedWorld=null;
  const host=el("moduleHost");host.hidden=false;el("worldArea").hidden=true;el("worldArea").innerHTML="";
  if(!window.IMC_CLUBHOUSE)throw new Error("Modulo Club House non disponibile");
  await window.IMC_CLUBHOUSE.mount({container:host,client:db,user:identity,managerId:identity.manager_id,username:identity.username});
}
function openWorld(worldId){
  currentView="game-world";selectedWorld=worldId;
  if(window.IMC_CLUBHOUSE)window.IMC_CLUBHOUSE.unmount();
  el("moduleHost").hidden=true;
  const area=el("worldArea");area.hidden=false;
  const name=WORLDS[worldId]||worldId;
  area.innerHTML=`<section class="world-home"><button id="backClubHouse" class="back">← CLUB HOUSE</button><div class="world-hero"><span>${esc(worldId)}</span><h2>${esc(name)}</h2><p>Nexus Build 1.0</p></div><div class="empty">Game World pronto per il prossimo modulo autonomo.</div></section>`;
}
async function enter(user){
  identity=await loadIdentity(user);renderHeader();show("appView");await openClubHouse();
}
async function boot(){
  document.title="IMC Nexus · Build 1.0";
  if(!window.supabase)throw new Error("Supabase non disponibile");
  db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);window.__IMC_NEXUS_CLIENT__=db;
  const r=await db.auth.getSession();if(r.error)throw r.error;
  if(r.data.session&&r.data.session.user){try{await enter(r.data.session.user);return}catch(e){await db.auth.signOut()}}
  show("loginView");
}

document.addEventListener("submit",async e=>{
  if(e.target.id!=="loginForm")return;e.preventDefault();setStatus("Accesso in corso…");
  const username=el("username").value.trim(),password=el("password").value;
  if(!username||!password){setStatus("Inserisci username e password",true);return;}
  try{
    const auth=await db.auth.signInWithPassword({email:technicalEmail(username),password});if(auth.error)throw auth.error;
    await enter(auth.data.user);setStatus("");
  }catch(err){setStatus(err.message||"Accesso non riuscito",true)}
});

document.addEventListener("nexus:navigate",e=>{
  const d=e.detail||{};
  if(d.target==="game-world"&&d.worldId)openWorld(String(d.worldId));
});

document.addEventListener("click",async e=>{
  if(e.target.closest("#backClubHouse")){await openClubHouse();return;}
  if(e.target.closest("#logout")){if(window.IMC_CLUBHOUSE)window.IMC_CLUBHOUSE.unmount();await db.auth.signOut();identity=null;selectedWorld=null;currentView="clubhouse";show("loginView");setStatus("")}
});

boot().catch(e=>{show("loginView");setStatus(e.message||String(e),true)});
})();
