/* World home aliases: data endpoints and existing page code remain shared. */
(()=>{'use strict';
const match=location.pathname.match(/^\/nexus\/(gw00[1-9]|gw01[01])\/$/i);if(!match)return;
const world=match[1].toUpperCase(),root='/nexus/'+world.toLowerCase()+'/';
window.NexusWorldRoute={world,get search(){const p=new URLSearchParams(location.search);p.set('world',world);return '?'+p},pathname:'/nexus/'};
const canonical=u=>{const x=new URL(u,document.baseURI);if(x.origin!==location.origin)return x.href;if(['/nexus/','/nexus/index.html'].includes(x.pathname)){const w=x.searchParams.get('world')||world;if(/^GW00[1-9]$|^GW01[01]$/.test(w)){x.pathname='/nexus/'+w.toLowerCase()+'/';x.searchParams.delete('world')}}return x.href};
for(const method of ['pushState','replaceState']){const original=history[method].bind(history);history[method]=function(state,title,url){return original(state,title,url==null?url:canonical(url))}}
const p=new URLSearchParams(location.search);p.delete('world');history.replaceState(null,'',root+(p.size?'?'+p:'')+location.hash);
const rewrite=()=>{for(const a of document.querySelectorAll('a[href]')){const url=canonical(a.href);if(url!==a.href)a.href=url}};
let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;rewrite()})};
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});
document.addEventListener('DOMContentLoaded',()=>{rewrite();if(world==='GW011'){const s=document.getElementById('shortcuts');if(s&&!s.querySelector('[data-rising-stars]')){const a=document.createElement('a');a.className='shortcut';a.dataset.risingStars='1';a.href=root+'risingstarsleague/';a.innerHTML='<span aria-hidden="true">★</span><span>Rising Stars League · U21</span>';s.append(a)}}});
})();
