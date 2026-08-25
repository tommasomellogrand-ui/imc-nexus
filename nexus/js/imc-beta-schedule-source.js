(function(){
  "use strict";

  var timer=null;
  var registryPromise=null;
  var cache=new Map();

  function clean(value){
    return String(value==null?"":value).replace(/\s+/g," ").trim();
  }

  function norm(value){
    return clean(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g," ")
      .trim();
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

  function currentContext(){
    var activeDivision=document.querySelector('[data-div-tab="schedule"].active, [data-division-tab="schedule"].active');
    var activeCompetition=document.querySelector('[data-comp-tab="schedule"].active, [data-competition-tab="schedule"].active');
    var active=activeDivision||activeCompetition;
    if(!active)return null;

    var section=active.closest("section");
    if(!section)return null;

    var target=activeDivision?section.querySelector("#divisionContent"):section.querySelector("#competitionContent");
    var title=section.querySelector(".nx-competition-cover-copy h1");
    var meta=section.querySelector(".nx-competition-cover-copy p");
    if(!target||!title||!meta)return null;

    var worldMatch=clean(meta.textContent).match(/GW\d{3}/i);
    if(!worldMatch)return null;
    var worldId=worldMatch[0].toUpperCase();
    if(worldId!=="GW005")return null;

    var sourceTitle=clean(title.dataset.betaSourceName||title.textContent);
    var displayTitle=clean(title.textContent);
    var divisionNumber=activeDivision
      ? (divisionNumberFromTitle(sourceTitle)||divisionNumberFromTitle(displayTitle))
      : 0;

    if(activeDivision&&(!divisionNumber||divisionNumber<1||divisionNumber>3))return null;

    return {
      target:target,
      worldId:worldId,
      mode:activeDivision?"division":"competition",
      divisionNumber:divisionNumber,
      sourceTitle:sourceTitle,
      displayTitle:displayTitle
    };
  }

  function loadCompetitionRegistry(){
    if(registryPromise)return registryPromise;
    var client=window.__IMC_BETA_CLIENT__;
    if(!client)return Promise.resolve([]);

    registryPromise=client.from("gw005_gw_competitions")
      .select("sm_action,IMC_league_divisions,IMC_competition_alias")
      .then(function(result){
        if(result.error)throw result.error;
        return result.data||[];
      })
      .catch(function(error){
        registryPromise=null;
        throw error;
      });
    return registryPromise;
  }

  function resolveSource(ctx,registry){
    if(ctx.mode==="division"){
      return {
        action:"league",
        division:String(ctx.divisionNumber),
        country:"CUS",
        label:"League Div "+ctx.divisionNumber
      };
    }

    var wanted=[norm(ctx.displayTitle),norm(ctx.sourceTitle)].filter(Boolean);
    var row=(registry||[]).find(function(item){
      return wanted.indexOf(norm(item.IMC_competition_alias))!==-1;
    });
    if(!row||!clean(row.sm_action))return null;

    return {
      action:clean(row.sm_action),
      division:null,
      country:null,
      label:clean(row.IMC_competition_alias)||ctx.displayTitle
    };
  }

  function renderRows(rows,source){
    if(!rows.length){
      return '<div class="nx-beta-schedule-source"><div class="nx-empty-box"><strong>Nessuna schedule disponibile</strong><span>Nessuna data presente in gw005_schedule per '+esc(source.label)+'.</span></div></div>';
    }

    return '<div class="nx-beta-schedule-source">'+rows.map(function(row){
      var label=clean(row.sm_round_label)||source.label||"Schedule";
      return '<article class="'+(source.action==="league"?'nx-league-matchday-card':'nx-cup-round-card')+'">'+
        '<div class="nx-unified-matchday-head"><div><small>'+esc(label.toUpperCase())+'</small><strong>'+esc(formatDate(row.match_date))+'</strong></div></div>'+
      '</article>';
    }).join("")+'</div>';
  }

  function loadRows(source){
    var cacheKey=[source.action,source.division||"",source.country||""].join("|");
    if(cache.has(cacheKey))return Promise.resolve(cache.get(cacheKey));

    var client=window.__IMC_BETA_CLIENT__;
    if(!client)return Promise.resolve({rows:[]});

    var query=client.from("gw005_schedule")
      .select("schedule_id,game_world_id,season_id,competition_id,matchday_number,match_date,sm_action,sm_division,sm_country,sm_compid,sm_round_label")
      .eq("game_world_id","GW005")
      .eq("sm_action",source.action);

    if(source.division!=null)query=query.eq("sm_division",String(source.division));
    if(source.country)query=query.eq("sm_country",source.country);

    return query.order("match_date",{ascending:true})
      .then(function(result){
        if(result.error)throw result.error;
        var payload={rows:result.data||[]};
        cache.set(cacheKey,payload);
        return payload;
      })
      .catch(function(error){
        console.error("Nexus beta schedule source",error);
        return {rows:[],error:error};
      });
  }

  function run(){
    var ctx=currentContext();
    if(!ctx)return;

    loadCompetitionRegistry().then(function(registry){
      var source=resolveSource(ctx,registry);
      if(!source)return;

      var key=[ctx.worldId,ctx.mode,source.action,source.division||"",norm(ctx.displayTitle)].join("|");
      if(ctx.target.dataset.betaScheduleLoading===key)return;
      if(ctx.target.dataset.betaScheduleSource===key&&ctx.target.querySelector(".nx-beta-schedule-source"))return;
      ctx.target.dataset.betaScheduleLoading=key;

      loadRows(source).then(function(payload){
        var latest=currentContext();
        if(!latest||latest.target!==ctx.target)return;
        if(payload&&payload.error){
          ctx.target.innerHTML='<div class="nx-beta-schedule-source"><div class="nx-empty-box"><strong>Errore schedule</strong><span>'+esc(payload.error.message||"Impossibile leggere gw005_schedule.")+'</span></div></div>';
        }else{
          ctx.target.innerHTML=renderRows(payload?payload.rows:[],source);
        }
        ctx.target.dataset.betaScheduleSource=key;
        delete ctx.target.dataset.betaScheduleLoading;
      });
    }).catch(function(error){
      console.error("Nexus beta schedule registry",error);
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
