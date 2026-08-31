(function(){
"use strict";
if(window.IMC_CLUBHOUSE_WORLD_SCROLL)return;
const VERSION="1.0.0";
let state={container:null,client:null,managerId:"",worlds:[],index:0};
const c=v=>String(v==null?"":v).trim();
function uniqueAssignedWorlds(data){
  const assignments=Array.isArray(data&&data.assignments)?data.assignments:[];
  const worlds=Array.isArray(data&&data.worlds)?data.worlds:[];
  const names=new Map(worlds.map(w=>[c(w.game_world_id),c(w.imc_name||w.name||w.soccer_manager_name||w.game_world_id)]));
  const seen=new Set(),out=[];
  for(const a of assignments){
    const id=c(a.game_world_id);
    if(!id||seen.has(id))continue;
    seen.add(id);
    out.push({id,name:names.get(id)||id});
  }
  return out;
}
function groupBlocks(){
  if(!state.container)return null;
  const canvas=state.container.querySelector(".ch-clubhouse-canvas");
  if(!canvas)return null;
  let group=canvas.querySelector("[data-ch-world-group]");
  if(group)return group;
  const first=canvas.querySelector(".ch-mock-world");
  const performance=canvas.querySelector(".ch-performance");
  const pulse=canvas.querySelector(".ch-competition");
  if(!first||!performance||!pulse)return null;
  group=document.createElement("div");
  group.className="ch-world-scroll-group";
  group.setAttribute("data-ch-world-group","");
  canvas.insertBefore(group,first);
  group.appendChild(first);
  group.appendChild(performance);
  group.appendChild(pulse);
  return group;
}
function ensureControls(group){
  if(!group||group.querySelector("[data-ch-world-switcher]"))return;
  const controls=document.createElement("div");
  controls.className="ch-world-switcher";
  controls.setAttribute("data-ch-world-switcher","");
  controls.innerHTML='<button type="button" data-ch-world-prev aria-label="Game World precedente">‹</button><div><strong data-ch-world-current>—</strong><span data-ch-world-current-name>—</span></div><button type="button" data-ch-world-next aria-label="Game World successivo">›</button>';
  group.insertBefore(controls,group.firstChild);
}
function paint(direction){
  const group=groupBlocks();if(!group)return;
  ensureControls(group);
  const current=state.worlds[state.index]||null;
  const id=current?current.id:"—",name=current?current.name:"—";
  const a=group.querySelector("[data-ch-world-current]");
  const b=group.querySelector("[data-ch-world-current-name]");
  if(a)a.textContent=id;if(b)b.textContent=name;
  const heading=group.querySelector(".ch-world-heading");
  if(heading){const hs=heading.querySelector("strong"),hn=heading.querySelector("span");if(hs)hs.textContent=id;if(hn)hn.textContent=name.toUpperCase()}
  group.classList.remove("is-prev","is-next");
  if(direction){void group.offsetWidth;group.classList.add(direction<0?"is-prev":"is-next")}
  const disable=state.worlds.length<2;
  group.querySelectorAll("[data-ch-world-prev],[data-ch-world-next]").forEach(x=>x.disabled=disable);
}
async function load(){
  const r=await state.client.rpc("imc_nexus_gateway",{p_action:"club_house",p_args:{managerId:state.managerId}});
  if(r.error)throw r.error;
  state.worlds=uniqueAssignedWorlds(r.data||{});
  state.index=0;
  paint(0);
}
function attach(o){
  state={...state,container:o&&o.container||null,client:o&&o.client||null,managerId:c(o&&o.managerId),worlds:[],index:0};
  if(!state.container||!state.client||!state.managerId)return;
  load().catch(()=>{groupBlocks();paint(0)});
}
document.addEventListener("click",e=>{
  if(!state.container||state.worlds.length<2)return;
  const prev=e.target.closest&&e.target.closest("[data-ch-world-prev]");
  const next=e.target.closest&&e.target.closest("[data-ch-world-next]");
  if(prev&&state.container.contains(prev)){state.index=(state.index-1+state.worlds.length)%state.worlds.length;paint(-1);return}
  if(next&&state.container.contains(next)){state.index=(state.index+1)%state.worlds.length;paint(1)}
});
function bind(){
  const mod=window.IMC_CLUBHOUSE;
  if(!mod||mod.__worldScrollWrapped)return;
  const mount=mod.mount,unmount=mod.unmount;
  mod.mount=async function(o){const r=await mount.call(mod,o);attach(o);return r};
  mod.unmount=function(){state={container:null,client:null,managerId:"",worlds:[],index:0};return unmount.call(mod)};
  mod.__worldScrollWrapped=true;
}
bind();
window.IMC_CLUBHOUSE_WORLD_SCROLL={version:VERSION,attach};
})();