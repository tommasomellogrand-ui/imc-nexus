(function(){
"use strict";
if(window.IMC_ROAD_CHRONICLE_COVER_STORIES)return;
const VERSION="1.0.7";
let host=null;
let homeHtml="";
let activeTag="TUTTO";
let allowBaseCover=false;
const TAGS=["TUTTO","VITTORIE","NEWS","INTERVISTE","SCONFITTE","CRISI","MOMENTO POSITIVO","DERBY","MERCATO"];
const STORY_TAGS=["VITTORIE","NEWS"];
const IMAGE_PARTS=["road-chronicle-image-hero-1.js","road-chronicle-image-hero-2.js","road-chronicle-image-hero-3.js","road-chronicle-image-final-1.js","road-chronicle-image-final-2.js","road-chronicle-image-final-3.js"];
function addScript(file,version){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=`v1/modules/road-chronicle/${file}?v=${version}`;s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});}
function loadArticleImages(){if(window.__RC_IMAGE_LOADING__)return;if(window.IMC_ROAD_CHRONICLE_ARTICLE_IMAGES&&window.IMC_ROAD_CHRONICLE_ARTICLE_IMAGES.version==='1.4.0'){window.IMC_ROAD_CHRONICLE_ARTICLE_IMAGES.refresh?.();return;}window.__RC_IMAGE_LOADING__=true;(async()=>{try{window.__RC_HERO_PARTS__=[];window.__RC_FINAL_PARTS__=[];for(const file of IMAGE_PARTS)await addScript(file,'1.0.1');await addScript('road-chronicle-article-images.js','1.4.0');}catch(err){console.error('[Road Chronicle images]',err);}finally{window.__RC_IMAGE_LOADING__=false;}})();}
function patchHomeLabels(){document.querySelectorAll('.rc-cover-entry').forEach(btn=>{const em=btn.querySelector('.rc-copy em');const h2=btn.querySelector('.rc-copy h2');if(em&&em.textContent!=='COVER STORIES')em.textContent='COVER STORIES';if(h2&&h2.textContent.replace(/\s+/g,'')!=='CoverStories')h2.innerHTML='Cover<br>Stories';});}
function tagsHtml(){return TAGS.map(t=>`<button type="button" class="rc-cs-tag${activeTag===t?' active':''}" data-rc-cs-tag="${t}">${t}</button>`).join('');}
function storyVisible(){return activeTag==='TUTTO'||STORY_TAGS.includes(activeTag);}
function feedHtml(){return `<section class="rc-page rc-cs-page" aria-label="The Road Chronicle Cover Stories">
  <button type="button" class="rc-back rc-cs-back" data-rc-cs-back>← THE ROAD CHRONICLE</button>
  <div class="rc-masthead"><div class="rc-kicker"><span></span><b>GW001 / ROAD TO HISTORY</b><span></span></div><h1><small>THE ROAD</small>CHRONICLE</h1><div class="rc-divider"><i></i><strong>▤</strong><i></i></div><p>ROAD TO HISTORY OFFICIAL JOURNAL</p></div>
  <header class="rc-cs-head"><em>COVER STORIES</em><h2>Stories from<br>Road To History</h2><p>News, vittorie, sconfitte, interviste e momenti che costruiscono la storia del Game World.</p></header>
  <nav class="rc-cs-tags" aria-label="Filtra Cover Stories">${tagsHtml()}</nav>
  <section class="rc-cs-feed">
    ${storyVisible()?`<button type="button" class="rc-cs-story" data-rc-story-open>
      <div class="rc-cs-image"><span>IMMAGINE</span><strong>BORUSSIA DORTMUND CAMPIONE</strong><small>SPAZIO RISERVATO</small></div>
      <div class="rc-cs-story-body">
        <div class="rc-cs-story-tags"><span>VITTORIE</span><span>NEWS</span></div>
        <p class="rc-cs-date">25 AGOSTO 2026 · SEASON 1</p>
        <h3>LA PRIMA È GIALLONERA</h3>
        <h4>Il Borussia Dortmund di Giorgio Grugni conquista la prima Road To History Cup.</h4>
        <p>Sei partite, sei vittorie. Dal Boca Juniors al Bologna, il Dortmund scrive la prima riga dell’albo d’oro di Road To History.</p>
        <div class="rc-cs-read">LEGGI LA COVER STORY <b>→</b></div>
      </div>
    </button>`:`<div class="rc-cs-empty">Nessun contenuto per questo tag.</div>`}
  </section>
</section>`;}
function renderFeed(){if(!host)return;host.innerHTML=feedHtml();}
function restoreHome(){if(!host||!homeHtml)return;host.innerHTML=homeHtml;patchHomeLabels();}
function openFeedFromCover(ev,cover){host=cover.closest('.rc-page')?.parentElement||null;if(!host)return;homeHtml=host.innerHTML;activeTag='TUTTO';renderFeed();ev.preventDefault();ev.stopImmediatePropagation();window.scrollTo({top:0,behavior:'auto'});}
function openStory(ev){ev.preventDefault();ev.stopImmediatePropagation();restoreHome();const cover=host&&host.querySelector('.rc-cover-entry');if(!cover)return;allowBaseCover=true;cover.click();window.scrollTo({top:0,behavior:'auto'});}
document.addEventListener('click',ev=>{
  const story=ev.target.closest&&ev.target.closest('[data-rc-story-open]');if(story){openStory(ev);return;}
  const back=ev.target.closest&&ev.target.closest('[data-rc-cs-back]');if(back){ev.preventDefault();ev.stopImmediatePropagation();restoreHome();window.scrollTo({top:0,behavior:'auto'});return;}
  const tag=ev.target.closest&&ev.target.closest('[data-rc-cs-tag]');if(tag){ev.preventDefault();ev.stopImmediatePropagation();activeTag=tag.getAttribute('data-rc-cs-tag')||'TUTTO';renderFeed();return;}
  const cover=ev.target.closest&&ev.target.closest("[data-rc-open='cover']");if(cover){if(allowBaseCover){allowBaseCover=false;return;}openFeedFromCover(ev,cover);}
},true);
const observer=new MutationObserver(()=>patchHomeLabels());
function start(){loadArticleImages();patchHomeLabels();observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.IMC_ROAD_CHRONICLE_COVER_STORIES={version:VERSION};
})();