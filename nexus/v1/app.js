(function(){
"use strict";

const BUILD="1.0";
const SUPABASE_URL="https://toanuzojdkfjgucztpze.supabase.co";
const SUPABASE_KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
const WORLDS=[
  ["GW001","Road To History"],["GW002","Gold 558"],["GW003","Gold 557"],["GW004","World League"],["GW005","Hall Of Famers"],
  ["GW006","Master League World"],["GW007","The Four Kingdoms"],["GW008","Gold 1"],["GW009","Kick Off"],["GW010","Sensible Soccer Academy"]
];

let db=null;
let session=null;
let identity=null;
let selectedWorld=null;

function el(id){return document.getElementById(id)}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function setStatus(msg,isError){const n=el("status");if(!n)return;n.textContent=msg||"";n.classList.toggle("error",!!isError)}
function show(id){["loginView","appView"].forEach(x=>{const n=el(x);if(n)n.hidden=x!==id})}

async function loadIdentity(user){
  const r=await db.from("imc_users").select("auth_user_id,manager_id,username,role,must_change_password").eq("auth_user_id",user.id).maybeSingle();
  if(r.error)throw r.error;
  if(!r.data)throw new Error("Account Nexus non associato a un manager IMC");
  return r.data;
}

function renderWorlds(){
  const root=el("worldGrid");
  root.innerHTML=WORLDS.map(([id,name])=>`<button class="world-card" data-world="${id}"><span>${id}</span><strong>${esc(name)}</strong><small>APRI GAME WORLD</small></button>`).join("");
}

function renderHeader(){
  el("userName").textContent=identity&&identity.username?identity.username:"Nexus User";
  el("managerId").textContent=identity&&identity.manager_id?identity.manager_id:"";
  el("buildLabel").textContent="BUILD "+BUILD;
}

function renderWorldHome(){
  const area=el("worldArea");
  if(!selectedWorld){area.innerHTML='<div class="empty">Seleziona un Game World.</div>';return;}
  const name=(WORLDS.find(x=>x[0]===selectedWorld)||[])[1]||selectedWorld;
  area.innerHTML=`<section class="world-home"><button id="backWorlds" class="back">← GAME WORLDS</button><div class="world-hero"><span>${selectedWorld}</span><h2>${esc(name)}</h2><p>Build 1.0 · nuova architettura Nexus</p></div><div class="empty">Nessun modulo legacy caricato. Le sezioni verranno aggiunte qui sulla nuova base.</div></section>`;
}

async function enter(user){
  identity=await loadIdentity(user);
  renderHeader();renderWorlds();selectedWorld=null;renderWorldHome();show("appView");
}

async function boot(){
  document.title="IMC Nexus · Build 1.0";
  if(!window.supabase){setStatus("Supabase non disponibile",true);return;}
  db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  window.__IMC_NEXUS_CLIENT__=db;
  const r=await db.auth.getSession();
  if(r.error){setStatus(r.error.message,true);show("loginView");return;}
  session=r.data.session;
  if(session&&session.user){try{await enter(session.user);return}catch(e){await db.auth.signOut();setStatus(e.message,true)}}
  show("loginView");
}

document.addEventListener("submit",async e=>{
  if(e.target.id!=="loginForm")return;
  e.preventDefault();setStatus("Accesso…");
  const username=el("username").value.trim();
  const password=el("password").value;
  if(!username||!password){setStatus("Inserisci username e password",true);return;}
  try{
    const lookup=await db.from("imc_users").select("auth_user_id,username").ilike("username",username).maybeSingle();
    if(lookup.error)throw lookup.error;
    if(!lookup.data)throw new Error("Username non trovato");
    const auth=await db.auth.signInWithPassword({email:username.includes("@")?username:username,password});
    if(auth.error)throw auth.error;
    await enter(auth.data.user);
  }catch(err){setStatus(err.message||"Accesso non riuscito",true)}
});

document.addEventListener("click",async e=>{
  const w=e.target.closest("[data-world]");
  if(w){selectedWorld=w.getAttribute("data-world");el("worldGrid").hidden=true;renderWorldHome();return;}
  if(e.target.closest("#backWorlds")){selectedWorld=null;el("worldGrid").hidden=false;renderWorldHome();return;}
  if(e.target.closest("#logout")){await db.auth.signOut();identity=null;session=null;show("loginView");setStatus("");}
});

boot().catch(e=>{setStatus(e.message||String(e),true);show("loginView")});
})();
