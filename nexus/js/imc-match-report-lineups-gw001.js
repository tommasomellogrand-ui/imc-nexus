(function(){
"use strict";

const VERSION="0.1.0-lineups-formation-only";
const ROOT_ID="imcMatchReportGW001";
const STYLE_ID="imcMatchReportGW001LineupsCss";
let timer=null;

function installCss(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent=`
#${ROOT_ID} [data-imcmr-panel="lineups"] > .imcmr-team-lists,
#${ROOT_ID} [data-imcmr-panel="lineups"] > .imcmr-sub-card{display:none!important}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-pitch-wrap{
  padding:14px;
  border:1px solid #dce4ef;
  border-radius:20px;
  background:linear-gradient(180deg,#ffffff 0%,#f7f9fd 100%);
  box-shadow:0 7px 22px rgba(18,39,73,.055);
}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-formations{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin:0 0 12px;
  color:#173766;
  font-size:8px;
  font-weight:900;
  letter-spacing:.015em;
}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-formations span{
  min-width:0;
  padding:8px 10px;
  border:1px solid #e1e7f0;
  border-radius:12px;
  background:#fff;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-formations span:last-child{text-align:right}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-pitch{
  height:430px;
  border:1.5px solid #9eb2ce;
  border-radius:18px;
  background:
    linear-gradient(rgba(23,55,102,.035),rgba(23,55,102,.035)),
    #fbfcff;
  box-shadow:inset 0 0 0 7px #fff, inset 0 0 0 8px #c9d5e5;
}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-pitch:before{
  width:1px;
  background:#b6c5d9;
}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-pitch:after{
  width:82px;
  height:82px;
  border:1px solid #b6c5d9;
  background:rgba(255,255,255,.68);
}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-player-dot{
  width:68px;
  z-index:2;
}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-player-dot b{
  width:38px;
  height:38px;
  border:3px solid #fff;
  background:linear-gradient(145deg,#f6d24f,#e7b81f);
  color:#102a5d;
  font-size:10px;
  box-shadow:0 4px 12px rgba(16,42,93,.18),0 0 0 1px #d6a81f;
}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-player-dot.away b{
  background:linear-gradient(145deg,#173766,#0d234b);
  color:#fff;
  box-shadow:0 4px 12px rgba(16,42,93,.18),0 0 0 1px #173766;
}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-player-dot small{
  width:max-content;
  max-width:72px;
  margin:4px auto 0;
  padding:4px 6px;
  border-radius:7px;
  background:#173766;
  color:#fff;
  font-size:7px;
  font-weight:900;
  letter-spacing:.015em;
  text-shadow:none;
  box-shadow:0 2px 8px rgba(16,42,93,.12);
}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-player-dot.away small{
  background:#fff;
  color:#173766;
  border:1px solid #d7e0ec;
}
#${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-player-dot .cap{
  right:-3px;
  top:-3px;
  width:13px;
  height:13px;
  background:#c99522;
  color:#fff;
  border:2px solid #fff;
  font-size:6px;
}
@media(max-width:390px){
  #${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-pitch{height:395px}
  #${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-player-dot{width:61px}
  #${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-player-dot b{width:34px;height:34px;font-size:9px}
  #${ROOT_ID} [data-imcmr-panel="lineups"] .imcmr-player-dot small{max-width:64px;font-size:6.5px;padding:3px 5px}
}
`;
  document.head.appendChild(style);
}

function apply(){
  const root=document.getElementById(ROOT_ID);
  if(!root)return;
  installCss();
}

function schedule(){
  clearTimeout(timer);
  timer=setTimeout(apply,30);
}

new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
else schedule();

window.IMC_MATCH_REPORT_GW001_LINEUPS={version:VERSION,refresh:apply};
})();