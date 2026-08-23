(function(){
  "use strict";

  var API_URL="https://toanuzojdkfjgucztpze.supabase.co/functions/v1/nexus-beta-match-report";
  var API_KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
  var reports=[];
  var ready=false;
  var timer=null;

  function clean(v){return String(v==null?"":v).replace(/\s+/g," ").trim();}
  function norm(v){return clean(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}

  function fetchIndex(){
    return fetch(API_URL,{method:"POST",headers:{"content-type":"application/json","apikey":API_KEY},body:JSON.stringify({action:"index"})})
      .then(function(res){return res.json().catch(function(){return {};}).then(function(body){if(!res.ok||!body.ok)throw new Error(body.detail||body.error||("HTTP "+res.status));return body.matches||[];});});
  }

  function teams(row){
    var els=row.querySelectorAll(".nx-league-team-link,.nx-cup-team-link");
    if(els.length<2)return null;
    return {home:clean(els[0].getAttribute("data-match-entity-name")||els[0].textContent),away:clean(els[1].getAttribute("data-match-entity-name")||els[1].textContent)};
  }

  function score(row){
    var el=row.querySelector(".nx-league-score-pill strong,.nx-cup-score-pill strong");
    var m=el&&clean(el.textContent).match(/(\d+)\s*-\s*(\d+)/);
    return m?{home:Number(m[1]),away:Number(m[2])}:null;
  }

  function reportFor(row){
    var t=teams(row),s=score(row);
    if(!t||!s)return null;
    var found=reports.filter(function(r){
      var hn=[r.home_display_name,r.home_team_name].map(norm);
      var an=[r.away_display_name,r.away_team_name].map(norm);
      return hn.indexOf(norm(t.home))!==-1&&an.indexOf(norm(t.away))!==-1&&Number(r.home_score)===s.home&&Number(r.away_score)===s.away;
    });
    return found.length===1?found[0]:null;
  }

  function scorerBox(row){
    var n=row.nextElementSibling;
    for(var i=0;n&&i<3;i++,n=n.nextElementSibling){if(/\bSCORERS\b/i.test(clean(n.textContent)))return n;}
    return null;
  }

  function addButton(row,report){
    if(row.dataset.nxMrButtonDone==="1")return;
    row.dataset.nxMrButtonDone="1";
    row.dataset.nxMrId=String(report.match_id);
    row.classList.add("nx-mr-enabled");
    var b=document.createElement("button");
    b.type="button";
    b.className="nx-mr-result-button";
    b.textContent="MATCH REPORT";
    b.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();row.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,view:window}));});
    var box=scorerBox(row);
    if(box)box.appendChild(b);else row.insertAdjacentElement("afterend",b);
  }

  function decorate(){
    if(!ready)return;
    document.querySelectorAll(".nx-league-result-row,.nx-cup-result-row").forEach(function(row){
      if(row.dataset.nxMrButtonDone==="1")return;
      var r=reportFor(row);
      if(r)addButton(row,r);
    });
  }

  function injectStyle(){
    if(document.getElementById("nxMrResultButtonStyle"))return;
    var s=document.createElement("style");
    s.id="nxMrResultButtonStyle";
    s.textContent=".nx-mr-result-button{display:block;width:100%;margin:10px 0 0;padding:11px 12px;border:0;border-top:1px solid #e3e8f0;background:transparent;color:#174b9b;font:900 10px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.11em;text-align:center}.nx-mr-result-button:active{opacity:.55}";
    document.head.appendChild(s);
  }

  function init(){
    injectStyle();
    fetchIndex().then(function(rows){reports=rows;ready=true;decorate();}).catch(function(err){console.error("Nexus Match Report button",err);});
    new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(decorate,80);}).observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
