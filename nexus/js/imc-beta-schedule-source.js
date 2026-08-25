(function(){
  "use strict";

  var timer=null;
  var cache=new Map();

  function clean(value){
    return String(value==null?"":value).replace(/\s+/g," ").trim();
  }

  function esc(value){
    return clean(value).replace(/[&<>"']/g,function(char){
      if(char==="&")return "&amp;";
      if(char==="<")return "&lt;";
      if(char===">")return "&gt;";
      if(char==='"')return "&quot;";
      return "&#39;";
    });
  }

  function formatDate(value){
    var raw=clean(value);
    var match=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match?match[3]+"/"+match[2]+"/"+match[1]:raw;
  }

  function divisionNumberFromTitle(title){
    var value=clean(title);
    var numeric=value.match(/(?:League\s+Div|Division)\s+(\d+)/i);
    if(numeric)return Number(numeric[1]);
    var word=value.match(/Division\s+(One|Two|Three|Four|Five)/i);
    if(!word)return 0;
    var map={one:1,two:2,three:3,four:4,five:5};
    return map[String(word[1]).toLowerCase()]||0;
  }

  function context(){
    var active=document.querySelector('[data-div-tab="schedule"].active, [data-division-tab="schedule"].active');
    if(!active)return null;
    var section=active.closest("section");
    if(!section)return null;
    var target=section.querySelector("#divisionContent");
    var title=section.querySelector(".nx-competition-cover-copy h1");
    var meta=section.querySelector(".nx-competition-cover-copy p");
    if(!target||!title||!meta)return null;
    var worldMatch=clean(meta.textContent).match(/GW\d{3}/i);
    if(!worldMatch)return null;
    var worldId=worldMatch[0].toUpperCase();
    if(worldId!=="GW005")return null;
    var sourceTitle=clean(title.dataset.betaSourceName||title.textContent);
    var divisionNumber=divisionNumberFromTitle(sourceTitle)||divisionNumberFromTitle(title.textContent);
    if(!divisionNumber||divisionNumber<1||divisionNumber>3)return null;
    return {target:target,worldId:worldId,divisionNumber:divisionNumber};
  }

  function renderRows(rows){
    if(!rows.length){
      return '<div class="nx-beta-schedule-source"><div class="nx-empty-box"><strong>Nessuna schedule disponibile</strong><span>Nessuna data presente in gw005_schedule per questa divisione.</span></div></div>';
    }

    return '<div class="nx-beta-schedule-source">'+rows.map(function(row){
      var label=clean(row.sm_round_label)||"Schedule";
      return '<article class="nx-league-matchday-card">'+
        '<div class="nx-unified-matchday-head"><div><small>'+esc(label.toUpperCase())+'</small><strong>'+esc(formatDate(row.match_date))+'</strong></div></div>'+
      '</article>';
    }).join("")+'</div>';
  }

  function loadDivision(divisionNumber){
    if(cache.has(divisionNumber))return Promise.resolve(cache.get(divisionNumber));
    var client=window.__IMC_BETA_CLIENT__;
    if(!client)return Promise.resolve({rows:[]});

    return client.from("gw005_schedule")
      .select("schedule_id,game_world_id,season_id,competition_id,matchday_number,match_date,sm_action,sm_division,sm_country,sm_compid,sm_round_label")
      .eq("game_world_id","GW005")
      .eq("sm_action","league")
      .eq("sm_division",String(divisionNumber))
      .eq("sm_country","CUS")
      .order("match_date",{ascending:true})
      .then(function(result){
        if(result.error)throw result.error;
        var payload={rows:result.data||[]};
        cache.set(divisionNumber,payload);
        return payload;
      })
      .catch(function(error){
        console.error("Nexus beta schedule source",error);
        return {rows:[],error:error};
      });
  }

  function run(){
    var ctx=context();
    if(!ctx)return;
    var key=ctx.worldId+"|"+ctx.divisionNumber;
    if(ctx.target.dataset.betaScheduleLoading===key)return;
    if(ctx.target.dataset.betaScheduleSource===key&&ctx.target.querySelector(".nx-beta-schedule-source"))return;
    ctx.target.dataset.betaScheduleLoading=key;

    loadDivision(ctx.divisionNumber).then(function(payload){
      var latest=context();
      if(!latest||latest.target!==ctx.target||latest.divisionNumber!==ctx.divisionNumber)return;
      if(payload&&payload.error){
        ctx.target.innerHTML='<div class="nx-beta-schedule-source"><div class="nx-empty-box"><strong>Errore schedule</strong><span>'+esc(payload.error.message||"Impossibile leggere gw005_schedule.")+'</span></div></div>';
      }else{
        ctx.target.innerHTML=renderRows(payload?payload.rows:[]);
      }
      ctx.target.dataset.betaScheduleSource=key;
      delete ctx.target.dataset.betaScheduleLoading;
    });
  }

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(run,30);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
  else schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
