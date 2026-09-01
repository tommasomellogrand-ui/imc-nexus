(function(){
"use strict";
if(window.IMC_CLUBHOUSE_FEED_ICONS)return;
const VERSION="1.1.0";
const SPRITE="assets/icons/nexus-feed-icons.svg";
const clean=v=>String(v==null?"":v).trim();
const upper=v=>clean(v).toLocaleUpperCase("it-IT");
const emojiChars=/[🔥⚖⚠🎟💔🏆⚔]/gu;
const emojiJoiners=/[\uFE0F\u200D]/gu;
function iconMarkup(name,cls="ch-nexus-icon"){
  return `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="${SPRITE}#${name}"></use></svg>`;
}
function stripEmoji(el){
  if(!el)return;
  for(const node of [...el.childNodes]){
    if(node.nodeType!==Node.TEXT_NODE)continue;
    const next=String(node.nodeValue||"")
      .replace(emojiChars,"")
      .replace(emojiJoiners,"")
      .replace(/^\s+/,"");
    if(next!==node.nodeValue)node.nodeValue=next;
  }
}
function prependIcon(el,name,cls){
  if(!el||!name||el.querySelector(":scope > .ch-nexus-icon"))return;
  el.insertAdjacentHTML("afterbegin",iconMarkup(name,cls||"ch-nexus-icon"));
}
function phaseIcon(label){
  const v=upper(label);
  if(v.includes("GIRONE"))return"group";
  if(v.includes("ANDATA"))return"first-leg";
  if(v.includes("RITORNO"))return"second-leg";
  if(v.includes("FINALE"))return"final";
  return"trophy";
}
function statusIcon(card){
  const status=upper(card.querySelector(".ch-feed-status")?.textContent);
  if(status.includes("DERBY"))return"derby";
  if(status.includes("CAMPIONE")||status.includes("FINALISTA"))return"final";
  if(status.includes("QUALIFICATO"))return"qualified";
  if(status.includes("ELIMINATO"))return"eliminated";
  if(status.includes("ANDATA"))return"first-leg";
  if(status.includes("GIRONE"))return"group";
  return"trophy";
}
function headlineIcon(card){
  const headline=upper(card.querySelector(".ch-feed-copy h3")?.textContent);
  if(headline.includes("DERBY IMC"))return"derby";
  if(headline.includes("CAMPIONE")||headline.includes("TROFEO"))return"final";
  if(headline.includes("ELIMINATO")||headline.includes("FUORI DALLA COPPA")||headline.includes("FINALE AMARA"))return"eliminated";
  if(card.querySelector(".ch-feed-pen"))return"penalties";
  return statusIcon(card);
}
function processCard(card){
  if(!card)return;
  const meta=[...card.querySelectorAll(".ch-feed-copy-meta span")];
  if(meta[0]){
    stripEmoji(meta[0]);
    prependIcon(meta[0],"trophy","ch-nexus-icon ch-nexus-icon-meta ch-nexus-icon-gold");
  }
  if(meta[1])prependIcon(meta[1],phaseIcon(meta[1].textContent),"ch-nexus-icon ch-nexus-icon-meta");
  const headline=card.querySelector(".ch-feed-copy h3");
  if(headline){
    stripEmoji(headline);
    prependIcon(headline,headlineIcon(card),"ch-nexus-icon ch-nexus-icon-headline");
  }
  const status=card.querySelector(".ch-feed-status");
  if(status)prependIcon(status,statusIcon(card),"ch-nexus-icon ch-nexus-icon-status");
  const pen=card.querySelector(".ch-feed-pen");
  if(pen)prependIcon(pen,"penalties","ch-nexus-icon ch-nexus-icon-inline");
  const foot=[...card.querySelectorAll(".ch-feed-copy-foot span")];
  if(foot[1]){
    const text=upper(foot[1].textContent);
    if(text.includes("AVVERSARIO IMC"))prependIcon(foot[1],"manager-imc","ch-nexus-icon ch-nexus-icon-inline");
    else if(text.includes("AVVERSARIO EXTERNAL"))prependIcon(foot[1],"external-manager","ch-nexus-icon ch-nexus-icon-inline");
  }
  card.dataset.nexusIcons=VERSION;
}
function processPanel(panel){
  if(!panel)return;
  const titleBadge=panel.querySelector(".ch-feed-head h2 b");
  if(titleBadge){
    stripEmoji(titleBadge);
    prependIcon(titleBadge,"trophy","ch-nexus-icon ch-nexus-icon-title ch-nexus-icon-gold");
  }
  panel.querySelectorAll(".ch-feed-card").forEach(processCard);
}
function scan(root=document){root.querySelectorAll?.(".ch-feed-panel").forEach(processPanel)}
const observer=new MutationObserver(mutations=>{
  for(const mutation of mutations){
    for(const node of mutation.addedNodes){
      if(node.nodeType!==Node.ELEMENT_NODE)continue;
      if(node.matches?.(".ch-feed-card"))processCard(node);
      if(node.matches?.(".ch-feed-panel"))processPanel(node);
      node.querySelectorAll?.(".ch-feed-card").forEach(processCard);
      node.querySelectorAll?.(".ch-feed-panel").forEach(processPanel);
    }
  }
});
function rescanBurst(){[0,60,180,500,1200].forEach(ms=>setTimeout(()=>scan(),ms))}
function init(){
  scan();
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener("click",ev=>{
    const btn=ev.target.closest?.(".clubhouse .ch-bottom-nav button");
    if(btn&&upper(btn.textContent)==="FEED")rescanBurst();
  },true);
  window.addEventListener("pageshow",rescanBurst);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
window.IMC_CLUBHOUSE_FEED_ICONS={version:VERSION,scan,rescan:rescanBurst};
})();