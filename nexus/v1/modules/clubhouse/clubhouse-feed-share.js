(function(){
"use strict";
if(window.IMC_CLUBHOUSE_FEED_SHARE)return;
const VERSION="1.2.0";
const c=v=>String(v==null?"":v).trim();
function codeFor(gw,fixture){const n=Number(c(gw).replace(/^GW/i,""));const f=Number(fixture);if(!Number.isInteger(n)||n<1||n>10||!Number.isSafeInteger(f)||f<=0)return"";return(n===10?"a":String(n))+f.toString(36)}
function gwFromCard(card){const raw=c(card.querySelector(".ch-feed-copy-foot span:first-child")?.textContent).toUpperCase();return/^GW\d{3}$/.test(raw)?raw:""}
function shareUrl(card){const gw=gwFromCard(card),fixture=Number(card.getAttribute("data-fixture-id")),code=codeFor(gw,fixture);return code?`${location.origin}/nexus/s/${code}?v=tg1`:""}
function shareTitle(card){return c(card.querySelector(".ch-feed-copy h3")?.textContent)||"IMC Nexus"}
function shareText(card){return c(card.querySelector(".ch-feed-ed-story p")?.textContent)||c(card.querySelector(".ch-feed-copy p")?.textContent)||"News da IMC Nexus"}
function telegramUrl(card){const url=shareUrl(card);if(!url)return"";const title=shareTitle(card),text=shareText(card),message=[title,text].filter(Boolean).join("\n");return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`}
function doShare(card){const url=telegramUrl(card);if(url)window.location.assign(url)}
function buttonMarkup(){return '<div class="ch-feed-share-row"><button type="button" class="ch-feed-share-button" aria-label="Condividi news su Telegram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4 3.8 10.6c-.9.4-.9 1.1-.2 1.3l4.4 1.4 1.7 5.1c.2.6.1.8.8.8.5 0 .8-.2 1-.4l2.1-2 4.4 3.2c.8.5 1.4.2 1.6-.8L22.4 5c.3-1.2-.5-1.7-1.4-1Z"/><path d="m8 13.3 10.6-6.6M9.7 18.4 8 13.3"/></svg><span>CONDIVIDI SU TELEGRAM</span></button></div>'}
function hydrate(){for(const card of document.querySelectorAll('.ch-feed-card[data-fixture-id]')){if(card.hasAttribute("data-share-ready"))continue;const editorial=card.querySelector(".ch-feed-editorial"),target=editorial||card;target.insertAdjacentHTML("beforeend",buttonMarkup());card.setAttribute("data-share-ready","1")}}
function deepLinkTarget(){const raw=c(new URLSearchParams(location.search).get("news")).toUpperCase();const m=raw.match(/^(GW\d{3})-(\d+)$/);return m?{gw:m[1],fixture:m[2]}:null}
function openDeepLink(){const target=deepLinkTarget();if(!target)return;let tries=0;const timer=setInterval(()=>{tries++;const root=document.querySelector(".clubhouse");if(root&&window.IMC_CLUBHOUSE_FEED){clearInterval(timer);window.IMC_CLUBHOUSE_FEED.show();const seek=()=>{const card=document.querySelector(`.ch-feed-card[data-fixture-id="${target.fixture}"]`);if(card){card.scrollIntoView({behavior:"smooth",block:"start"});card.classList.add("ch-feed-share-focus");setTimeout(()=>card.classList.remove("ch-feed-share-focus"),2200)}else setTimeout(seek,300)};setTimeout(seek,350)}else if(tries>120)clearInterval(timer)},250)}
document.addEventListener("click",evt=>{const btn=evt.target.closest&&evt.target.closest(".ch-feed-share-button");if(!btn)return;const card=btn.closest(".ch-feed-card");if(card)doShare(card)});
new MutationObserver(hydrate).observe(document.documentElement,{childList:true,subtree:true});
hydrate();openDeepLink();
window.IMC_CLUBHOUSE_FEED_SHARE={version:VERSION,refresh:hydrate,codeFor,shareUrl};
})();