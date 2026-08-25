(function(){
  "use strict";

  if(window.__IMC_GW001_SCHEDULE_RESULTS__) return;
  window.__IMC_GW001_SCHEDULE_RESULTS__=true;

  var registryCache=null;
  var scheduleCache=new Map();
  var resultsCache=new Map();
  var timer=null;
  var clientTimer=null;

  function clean(value){
    return String(value==null?"":value).replace(/\s+/g," ").trim();
  }

  function norm(value){
    return clean(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .toLowerCase()
      .replace(/[·]/g," ")
      .replace(/[^a-z0-9]+/g," ")
      .trim();
  }

  function esc(value){
    return clean(value).replace(/[&<>"']/g,function(char){
      if(char==="&") return "&amp;";
      if(char==="<") return "&lt;";
      if(char===">") return "&gt;";
      if(char==='"') return "&quot;";
      return "&#39;";
    });
  }

  function localIsoDate(){
    var now=new Date();
    var local=new Date(now.getTime()-now.getTimezoneOffset()*60000);
    return local.toISOString().slice(0,10);
  }

  function formatDate(value){
    var raw=clean(value);
    var match=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match?match[3]+"/"+match[2]+"/"+match[1]:raw;
  }

  function worldFromDom(){
    var nodes=document.querySelectorAll(".nx-competition-cover-copy p, .nx-competitions-title p");
    for(var i=0;i<nodes.length;i+=1){
      var match=clean(nodes[i].textContent).match(/GW\d{3}/i);
      if(match) return match[0].toUpperCase();
    }
    return "";
  }

  function splitAliases(value){
    return clean(value).split("|").map(clean).filter(Boolean);
  }

  function registryCandidates(alias,source){
    var out=[alias,source];
    if(/^World Cup Qualifier$/i.test(alias)) out.push("World Cup Qualifying");
    return out.filter(Boolean);
  }

  function buildRegistry(rows){
    var byName=new Map();
    (rows||[]).forEach(function(row){
      splitAliases(row.IMC_competition_alias).forEach(function(alias){
        var item={alias:alias,action:clean(row.sm_action)};
        registryCandidates(alias,clean(row.sm_competition_name)).forEach(function(candidate){
          byName.set(norm(candidate),item);
        });
      });
    });
    return byName;
  }

  function loadRegistry(){
    if(registryCache) return Promise.resolve(registryCache);
    var client=window.__IMC_NEXUS_CLIENT__;
    if(!client) return Promise.resolve(null);
    return client.from("gw001_gw_competitions")
      .select("sm_competition_name,sm_action,IMC_competition_alias")
      .then(function(result){
        if(result.error) throw result.error;
        registryCache=buildRegistry(result.data||[]);
        return registryCache;
      })
      .catch(function(error){
        console.error("Nexus GW001 competition registry",error);
        return null;
      });
  }

  function divisionNumber(value){
    var numeric=clean(value).match(/(?:League\s+Div|Division)\s+(\d+)/i);
    if(numeric) return String(Number(numeric[1]));
    var word=clean(value).match(/Division\s+(One|Two|Three|Four|Five)/i);
    if(!word) return "";
    var map={one:1,two:2,three:3,four:4,five:5};
    return String(map[String(word[1]).toLowerCase()]||"");
  }

  function tabContext(registry,tabName){
    if(worldFromDom()!=="GW001") return null;

    var divisionTab=document.querySelector('[data-div-tab="'+tabName+'"].active');
    if(divisionTab){
      var divisionTarget=document.getElementById("divisionContent");
      var divisionTitle=document.querySelector(".nx-competition-cover-copy h1");
      if(!divisionTarget||!divisionTitle) return null;
      var division=divisionNumber(divisionTitle.textContent);
      if(!division) return null;
      return {target:divisionTarget,action:"league",division:division,label:"League Div "+division};
    }

    var competitionTab=document.querySelector('[data-comp-tab="'+tabName+'"].active');
    if(!competitionTab) return null;
    var competitionTarget=document.getElementById("competitionContent");
    var competitionTitle=document.querySelector(".nx-competition-cover-copy h1");
    if(!competitionTarget||!competitionTitle||!registry) return null;
    var item=registry.get(norm(competitionTitle.textContent));
    if(!item||!item.action) return null;
    return {target:competitionTarget,action:item.action,division:null,label:item.alias||clean(competitionTitle.textContent)};
  }

  function cacheKey(context){
    return context.action+"|"+(context.division||"");
  }

  function loadScheduleRows(context){
    var key=cacheKey(context);
    if(scheduleCache.has(key)) return Promise.resolve(scheduleCache.get(key));
    var client=window.__IMC_NEXUS_CLIENT__;
    if(!client) return Promise.resolve([]);
    var query=client.from("gw001_schedule")
      .select("schedule_id,game_world_id,season_id,sm_fixture_id,match_date,home_team_id,home_name,away_team_id,away_name,sm_action,sm_division,sm_country,sm_compid,sm_round_label")
      .eq("game_world_id","GW001")
      .eq("sm_action",context.action);
    if(context.division!=null) query=query.eq("sm_division",context.division);
    return query.order("match_date",{ascending:true}).order("schedule_id",{ascending:true}).then(function(result){
      if(result.error) throw result.error;
      var rows=(result.data||[]).filter(function(row){
        return row.sm_fixture_id!=null&&clean(row.home_name)&&clean(row.away_name)&&clean(row.match_date);
      });
      scheduleCache.set(key,rows);
      return rows;
    });
  }

  function loadResultRows(context){
    var key=cacheKey(context);
    if(resultsCache.has(key)) return Promise.resolve(resultsCache.get(key));
    var client=window.__IMC_NEXUS_CLIENT__;
    if(!client) return Promise.resolve([]);
    var query=client.from("gw001_results")
      .select("raw_match_id,sm_fixture_id,source_page_date,home_name,away_name,home_score,away_score,home_penalties,away_penalties,decided_on_penalties,sm_action,sm_division,sm_country,sm_compid,sm_round_label")
      .eq("game_world_id","GW001")
      .eq("sm_action",context.action);
    if(context.division!=null) query=query.eq("sm_division",context.division);
    return query.order("source_page_date",{ascending:false}).order("raw_match_id",{ascending:true}).then(function(result){
      if(result.error) throw result.error;
      var rows=result.data||[];
      resultsCache.set(key,rows);
      return rows;
    });
  }

  function matchScore(row){
    if(row.home_score==null||row.away_score==null) return "-";
    var score=esc(row.home_score)+" - "+esc(row.away_score);
    if(row.decided_on_penalties&&row.home_penalties!=null&&row.away_penalties!=null){
      score+=' <small>('+esc(row.home_penalties)+'-'+esc(row.away_penalties)+' rig.)</small>';
    }
    return score;
  }

  function matchRow(row,played){
    return '<div class="nx-entity-match nx-gw001-fixture-row">'+
      '<div class="match-line">'+
        '<strong class="nx-gw001-team">'+esc(row.home_name)+'</strong>'+
        '<span class="match-score">'+(played?matchScore(row):'-')+'</span>'+
        '<strong class="nx-gw001-team">'+esc(row.away_name)+'</strong>'+
      '</div></div>';
  }

  function groupRows(rows,dateField){
    var groups=[];
    var map=new Map();
    (rows||[]).forEach(function(row){
      var date=clean(row[dateField]);
      var round=clean(row.sm_round_label);
      var key=date+"|"+round;
      if(!map.has(key)){
        var group={date:date,round:round,rows:[]};
        map.set(key,group);
        groups.push(group);
      }
      map.get(key).rows.push(row);
    });
    return groups;
  }

  function groupsMarkup(groups,played){
    if(!groups.length){
      return '<div class="nx-empty-box"><strong>Nessuna partita disponibile</strong></div>';
    }
    return '<div class="nx-gw001-fixture-source">'+groups.map(function(group){
      return '<section class="nx-gw001-date-group">'+
        '<div class="nx-schedule-day-head"><div>'+
          (group.round?'<small>'+esc(group.round.toUpperCase())+'</small>':'')+
          '<h2>'+esc(formatDate(group.date))+'</h2></div><span>'+group.rows.length+' partite</span></div>'+
        '<div class="nx-entity-match-list">'+group.rows.map(function(row){return matchRow(row,played);}).join("")+'</div>'+
      '</section>';
    }).join("")+'</div>';
  }

  function scheduleMarkup(rows){
    var today=localIsoDate();
    var future=(rows||[]).filter(function(row){return clean(row.match_date)>=today;});
    future.sort(function(a,b){
      var dateCompare=clean(a.match_date).localeCompare(clean(b.match_date));
      if(dateCompare) return dateCompare;
      return Number(a.schedule_id||0)-Number(b.schedule_id||0);
    });
    return groupsMarkup(groupRows(future,"match_date"),false);
  }

  function resultsMarkup(scheduleRows,resultRows){
    var today=localIsoDate();
    var historicalResults=(resultRows||[]).filter(function(row){return clean(row.source_page_date)<today;});
    var resultByFixture=new Map();
    historicalResults.forEach(function(row){
      if(row.sm_fixture_id!=null) resultByFixture.set(String(row.sm_fixture_id),row);
    });

    var placeholders=(scheduleRows||[]).filter(function(row){
      return clean(row.match_date)<today&&!resultByFixture.has(String(row.sm_fixture_id));
    }).map(function(row){
      return {
        raw_match_id:null,
        sm_fixture_id:row.sm_fixture_id,
        source_page_date:row.match_date,
        home_name:row.home_name,
        away_name:row.away_name,
        home_score:null,
        away_score:null,
        home_penalties:null,
        away_penalties:null,
        decided_on_penalties:false,
        sm_round_label:row.sm_round_label
      };
    });

    var combined=historicalResults.concat(placeholders);
    combined.sort(function(a,b){
      var dateCompare=clean(b.source_page_date).localeCompare(clean(a.source_page_date));
      if(dateCompare) return dateCompare;
      return Number(a.raw_match_id||a.sm_fixture_id||0)-Number(b.raw_match_id||b.sm_fixture_id||0);
    });

    return groupsMarkup(groupRows(combined,"source_page_date"),true);
  }

  function applySchedule(registry){
    var context=tabContext(registry,"schedule");
    if(!context) return;
    var key=cacheKey(context);
    if(context.target.dataset.gw001ScheduleLoading===key) return;
    if(context.target.dataset.gw001ScheduleSource===key&&context.target.querySelector(".nx-gw001-fixture-source")) return;
    if(context.target.dataset.gw001ScheduleChecked===key&&!context.target.dataset.gw001ScheduleSource) return;
    context.target.dataset.gw001ScheduleLoading=key;
    loadScheduleRows(context).then(function(rows){
      var latest=tabContext(registry,"schedule");
      if(!latest||latest.target!==context.target) return;
      delete context.target.dataset.gw001ScheduleLoading;
      if(!rows.length){
        context.target.dataset.gw001ScheduleChecked=key;
        return;
      }
      delete context.target.dataset.gw001ScheduleChecked;
      context.target.innerHTML=scheduleMarkup(rows);
      context.target.dataset.gw001ScheduleSource=key;
    }).catch(function(error){
      delete context.target.dataset.gw001ScheduleLoading;
      console.error("Nexus GW001 schedule",error);
    });
  }

  function applyResults(registry){
    var context=tabContext(registry,"results");
    if(!context) return;
    var key=cacheKey(context);
    if(context.target.dataset.gw001ResultsLoading===key) return;
    if(context.target.dataset.gw001ResultsSource===key&&context.target.querySelector(".nx-gw001-fixture-source")) return;
    if(context.target.dataset.gw001ResultsChecked===key&&!context.target.dataset.gw001ResultsSource) return;
    context.target.dataset.gw001ResultsLoading=key;
    Promise.all([loadScheduleRows(context),loadResultRows(context)]).then(function(values){
      var latest=tabContext(registry,"results");
      if(!latest||latest.target!==context.target) return;
      delete context.target.dataset.gw001ResultsLoading;
      var scheduleRows=values[0]||[];
      if(!scheduleRows.length){
        context.target.dataset.gw001ResultsChecked=key;
        return;
      }
      delete context.target.dataset.gw001ResultsChecked;
      context.target.innerHTML=resultsMarkup(scheduleRows,values[1]||[]);
      context.target.dataset.gw001ResultsSource=key;
    }).catch(function(error){
      delete context.target.dataset.gw001ResultsLoading;
      console.error("Nexus GW001 results",error);
    });
  }

  function run(){
    if(worldFromDom()!=="GW001") return;
    if(!window.__IMC_NEXUS_CLIENT__) return;
    loadRegistry().then(function(registry){
      applyResults(registry);
      applySchedule(registry);
    });
  }

  function scheduleRun(){
    clearTimeout(timer);
    timer=setTimeout(run,25);
  }

  function start(){
    scheduleRun();
    new MutationObserver(scheduleRun).observe(document.documentElement,{childList:true,subtree:true});
    if(!window.__IMC_NEXUS_CLIENT__){
      var attempts=0;
      clientTimer=setInterval(function(){
        attempts+=1;
        if(window.__IMC_NEXUS_CLIENT__){
          clearInterval(clientTimer);
          clientTimer=null;
          scheduleRun();
        }else if(attempts>=200){
          clearInterval(clientTimer);
          clientTimer=null;
        }
      },50);
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
