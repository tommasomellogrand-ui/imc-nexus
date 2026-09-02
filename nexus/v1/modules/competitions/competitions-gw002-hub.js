(function(){
"use strict";
if(window.IMC_COMPETITIONS_GW002_HUB)return;
const VERSION="1.0.0";
function clean(v){return String(v==null?"":v).trim()}
function svg(kind,watermark){
  const cls=watermark?' aria-hidden="true"':'';
  if(kind==='domestic')return `<svg viewBox="0 0 72 72"${cls}><path d="M13 57h46M18 57V31l18-15 18 15v26M25 57V38h22v19M22 28h28M29 38v19M43 38v19"/><path d="M16 31 36 14l20 17"/></svg>`;
  if(kind==='international')return `<svg viewBox="0 0 72 72"${cls}><circle cx="36" cy="36" r="22"/><path d="M14 36h44M36 14c8 9 12 15 12 22S44 49 36 58M36 14c-8 9-12 15-12 22s4 13 12 22M20 22c10 6 22 6 32 0M20 50c10-6 22-6 32 0"/></svg>`;
  return `<svg viewBox="0 0 72 72"${cls}><path d="M22 12v48M25 16c15-8 22 8 35 0v25c-13 8-20-8-35 0Z"/><path d="M22 12h6"/></svg>`;
}
function countFrom(root,selector){return clean(root.querySelector(selector)?.textContent)||'0'}
function card(kind,title,description,count){return `<button type="button" class="cp-editorial-card cp-editorial-card-${kind}" data-cp-open="${kind}"><span class="cp-editorial-icon">${svg(kind,false)}</span><span class="cp-editorial-copy"><h3>${title}</h3><p>${description}</p><b class="cp-editorial-count">${count} COMPETITIONS</b></span><span class="cp-editorial-arrow">›</span><span class="cp-editorial-watermark">${svg(kind,true)}</span></button>`}
function apply(){
  document.querySelectorAll('.cp-hub').forEach(hub=>{
    if(hub.dataset.gw002EditorialVersion===VERSION)return;
    const worldId=clean(hub.querySelector('.cp-world-mark span')?.textContent);
    if(worldId!=='GW002')return;
    const domestic=countFrom(hub,'.cp-domestic .cp-count strong');
    const international=countFrom(hub,'.cp-international strong');
    const nations=countFrom(hub,'.cp-nations strong');
    let stack=hub.querySelector('.cp-editorial-stack');
    if(!stack){stack=document.createElement('section');stack.className='cp-editorial-stack';hub.appendChild(stack)}
    stack.innerHTML=[
      card('domestic','DOMESTIC','Leagues and cups across the Game World.',domestic),
      card('international','INTERNATIONAL','Club competitions beyond domestic borders.',international),
      card('nations','NATIONS','National team competitions and tournaments.',nations)
    ].join('');
    hub.classList.add('cp-gw002-editorial');
    hub.dataset.gw002EditorialVersion=VERSION;
  });
}
const observer=new MutationObserver(apply);
observer.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',apply);
apply();
window.IMC_COMPETITIONS_GW002_HUB={version:VERSION,apply};
})();
