(function(){
"use strict";
if(window.IMC_ROAD_CHRONICLE_ARTICLE_IMAGES)return;
const VERSION="1.0.0";
const HERO="data:image/jpeg;base64,"+(window.__RC_HERO_PARTS__||[]).join("");
const FINAL="data:image/jpeg;base64,"+(window.__RC_FINAL_PARTS__||[]).join("");
function put(label,src,alt){for(const slot of document.querySelectorAll(".rc-story-image")){const strong=slot.querySelector("strong");if(!strong||strong.textContent.trim()!==label||slot.dataset.rcImageLoaded==="1")continue;slot.dataset.rcImageLoaded="1";slot.innerHTML=`<img src="${src}" alt="${alt}" style="display:block;width:100%;height:auto;border-radius:inherit">`;}}
function hydrate(){put("BORUSSIA DORTMUND CAMPIONE · HERO COVER",HERO,"Borussia Dortmund festeggia la conquista della Road To History Cup");put("FINALE · RAPHINHA / FESTA CON LA COPPA",FINAL,"Borussia Dortmund 1-0 Bologna, finale della Road To History Cup");}
const observer=new MutationObserver(hydrate);observer.observe(document.documentElement,{childList:true,subtree:true});hydrate();
window.IMC_ROAD_CHRONICLE_ARTICLE_IMAGES={version:VERSION,refresh:hydrate};
})();