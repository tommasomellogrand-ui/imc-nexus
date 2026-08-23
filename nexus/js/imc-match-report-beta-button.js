(function(){
  "use strict";

  var API_URL="https://toanuzojdkfjgucztpze.supabase.co/functions/v1/nexus-beta-match-report";
  var API_KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
  var reports=[];
  var loaded=false;
  var loading=false;
  var timer=null;

  function clean(value){return String(value==null?"":value).replace(/\s+/g," ").trim();}
  function norm(value){
    return clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  }

  function apiIndex(){
    return fetch(API_URL,{
      method:"POST",
      headers:{"content-type":"application/json","apikey":API_KEY},
      body:JSON.stringify({action:"index"})
    }).then(function(res){
      return res.json().catch(function(){return {};}).then(function(body){
        if(!res.ok||!body.ok)throw new Error(body.detail||body.error||("HTTP "+res.status));
        return body.matches||[];
      });
    });
  }

  function teamButtons(row){
    return Array.prototype.slice.call(row.querySelectorAll(".nx-league-team-link,.nx-cup-team-link"));
  }

  function rowTeams(row){
    var buttons=teamButtons(row);
    if(buttons.length<2)return null;
    return {
      home:clean(buttons[0].getAttribute("data-match-entity-name")||buttons[0].textContent),
      away:clean(buttons[1].getAttribute("data-match-entity-name")||buttons[1].textContent)
    };
  }

  function rowScore(row){
    var el=row.querySelector(".nx-league-score-pill strong,.nx-cup-score-pill strong");
    if(!el)return null;
    var m=clean(el.textContent).match(/(\d+)\s*-\s*(\d+)/);
    return m?{home:Number(m[1]),away:Number(m[2])}:null;
  }

  function rowCompetition(row){
    var card=row.closest(".nx-league-matchday-card,.nx-cup-round-card,.nx-matchday-block,.nx-knockout-match-card")||row.parentElement;
    var el=card&&card.querySelector(".nx-unified-matchday-head small");
    return clean(el&&el.textContent);
  }

  function namesMatch(report,teams){
    var home=[report.home_display_name,report.home_team_name].map(norm);
    var away=[report.away_display_name,report.away_team_name].map(norm);
    return home.indexOf(norm(teams.home))>=0&&away.indexOf(norm(teams.away))>=0;
  }

  function findReport(row){
    var teams=rowTeams(row),score=rowScore(row),competition=rowCompetition(row);
    if(!teams||!score)return null;
    var candidates=reports.filter(function(r){
      return namesMatch(r,teams)&&Number(r.home_score)===score.home&&Number(r.away_score)===score.away;
    });
    if(competition){
      var exact=candidates.filter(function(r){return norm(r.competition_name)===norm(competition);});
      if(exact.length===1)return exact[0];
    }
    return candidates.length===1?candidates[0]:null;
  }

  function findScorerBox(row){
    var descendants=Array.prototype.slice.call(row.querySelectorAll("div,section"));
    var inside=descendants.find(function(el){return /\bSCORERS\b/i.test(clean(el.textContent));});
    if(inside)return inside;

    var node=row.nextElementSibling;
    for(var i=0;node&&i<3;i++,node=node.nextElementSibling){
      if(/\bSCORERS\b/i.test(clean(node.textContent)))return node;
    }
    return null;
  }

  function makeButton(row){
    var button=document.createElement("button");
    button.type="button";
    button.className="nx-mr-result-button";
    button.textContent="MATCH REPORT";
    button.addEventListener("click",function(event){
      event.preventDefault();
      event.stopPropagation();
      row.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,view:window}));
    });
    return button;
  }

  function attachButton(row){
    if(row.querySelector(".nx-mr-result-button"))return;
    var box=findScorerBox(row);
    var button=makeButton(row);
    if(box){
      box.appendChild(button);
      return;
    }
    row.insertAdjacentElement("afterend",button);
  }

  function decorate(){
    if(!loaded)return;
    document.querySelectorAll(".nx-league-result-row,.nx-cup-result-row").forEach(function(row){
      if(row.dataset.nxMrButtonChecked==="1")return;
      var report=findReport(row);
      row.dataset.nxMrButtonChecked="1";
      if(!report)return;
      row.dataset.nxMrId=String(report.match_id);
      row.classList.add("nx-mr-enabled");
      attachButton(row);
    });
  }

  function styles(){
    if(document.getElementById("nxMrResultButtonStyles"))return;
    var style=document.createElement("style");
    style.id="nxMrResultButtonStyles";
    style.textContent=".nx-mr-result-button{display:block;width:calc(100% - 20px);margin:10px auto 0;padding:10px 14px;border:0;border-top:1px solid #e5e9f1;background:transparent;color:#17458a;font:900 10px/1.1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.12em;text-align:center;cursor:pointer}.nx-mr-result-button:active{opacity:.62}";
    document.head.appendChild(style);
  }

  function load(){
    if(loaded||loading)return;
    loading=true;
    apiIndex().then(function(rows){reports=rows;loaded=true;decorate();}).catch(function(err){console.error("Nexus Match Report button",err);}).finally(function(){loading=false;});
  }

  function init(){
    styles();
    load();
    new MutationObserver(function(){
      clearTimeout(timer);
      timer=setTimeout(function(){
        document.querySelectorAll("[data-nx-mr-button-checked]").forEach(function(el){delete el.dataset.nxMrButtonChecked;});
        decorate();
      },80);
    }).observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
