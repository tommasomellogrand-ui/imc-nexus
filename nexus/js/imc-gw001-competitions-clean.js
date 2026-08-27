(function(){
"use strict";

if(window.__IMC_GW001_COMPETITIONS_CLEAN__)return;
window.__IMC_GW001_COMPETITIONS_CLEAN__=true;

const VERSION="0.1.1-data-only";
const WORLD="GW001";
let ownClient=null;
let observer=null;
let renderTimer=null;
let activeView="list";
let activeCompetition=null;
let activeTab="results";

function clean(value){return String(value==null?"":value).replace(/\s+/g," ").trim();}
function norm(value){return clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function esc(value){return clean(value).replace(/[&<>"']/g,function(char){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];});}
function db(){
  if(window.__IMC_NEXUS_CLIENT__)return window.__IMC_NEXUS_CLIENT__;
  return ownClient;
}
function currentWorld(){
  const nodes=document.querySelectorAll("#openDrawerWorld strong,.nx-sport-world strong,.nx-competitions-title p,.nx-competition-cover-copy p");
  for(const node of nodes){
    const text=clean(node.textContent);
    const match=text.match(/GW\d{3}/i);
    if(match)return match[0].toUpperCase();
    if(norm(text)==="road to history")return WORLD;
  }
  return "";
}
function competitionButton(){return document.querySelector('.nx-world-nav [data-world-section="competitions"]');}
function competitionIsActive(){const button=competitionButton();return !!(button&&button.classList.contains("active"));}
function pageRoot(){return document.getElementById("pageRoot");}
function markCompetitionActive(){
  const nav=document.querySelector(".nx-world-nav");
  if(!nav)return;
  nav.querySelectorAll("[data-world-section]").forEach(function(button){
    button.classList.toggle("active",button.getAttribute("data-world-section")==="competitions");
  });
}
function isOurPage(){const root=pageRoot();return !!(root&&root.querySelector('[data-imc-gw001-competitions-clean="1"]'));}

async function loadRegistry(){
  const client=db();
  if(!client)throw new Error("Client Supabase non disponibile");
  const result=await client.from("gw001_gw_competitions").select("*");
  if(result.error)throw result.error;
  return result.data||[];
}

function registryLabel(row){return clean(row&&row["Nexus View"])||clean(row&&row.sm_competition_name)||clean(row&&row.competition_key)||"Competition";}
function categoryOrder(value){const key=norm(value);if(key==="domestic")return 1;if(key==="international")return 2;if(key==="nations")return 3;if(key==="friendly")return 4;return 9;}

function renderListLoading(){
  const root=pageRoot();if(!root)return;
  root.innerHTML='<section data-imc-gw001-competitions-clean="1"><h1>Competitions</h1><p>Caricamento dati…</p></section>';
}
function renderList(rows){
  const root=pageRoot();if(!root)return;
  const ordered=(rows||[]).slice().sort(function(a,b){
    const c=categoryOrder(a.IMC_competition_type)-categoryOrder(b.IMC_competition_type);
    return c||registryLabel(a).localeCompare(registryLabel(b),"it",{numeric:true});
  });
  root.innerHTML='<section data-imc-gw001-competitions-clean="1">'+
    '<h1>Competitions</h1>'+
    '<p>GW001 · Road To History</p>'+
    '<div data-clean-competition-list>'+ordered.map(function(row){
      return '<button type="button" data-clean-competition-key="'+esc(row.competition_key)+'" style="display:block;width:100%;text-align:left;margin:8px 0;padding:12px">'+
        '<strong>'+esc(registryLabel(row))+'</strong><br>'+
        '<span>'+esc(row.IMC_competition_type||"")+'</span><br>'+
        '<small>'+esc(row.competition_key||"")+'</small>'+
      '</button>';
    }).join("")+'</div>'+
  '</section>';
  root.querySelectorAll("[data-clean-competition-key]").forEach(function(button){
    button.addEventListener("click",function(){
      const key=button.getAttribute("data-clean-competition-key");
      const row=ordered.find(function(item){return String(item.competition_key)===String(key);});
      if(row)openCompetition(row);
    });
  });
}

async function showList(){
  if(currentWorld()!==WORLD)return;
  activeView="list";activeCompetition=null;activeTab="results";
  markCompetitionActive();
  renderListLoading();
  try{renderList(await loadRegistry());}
  catch(error){const root=pageRoot();if(root)root.innerHTML='<section data-imc-gw001-competitions-clean="1"><h1>Competitions</h1><p>Errore: '+esc(error&&error.message||"caricamento non riuscito")+'</p></section>';}
}

async function loadResults(key){
  const client=db();
  const result=await client.from("gw001_results")
    .select("raw_match_id,sm_fixture_id,source_page_date,home_name,away_name,home_score,away_score,home_penalties,away_penalties,decided_on_penalties,sm_round_label,competition_key")
    .eq("competition_key",key)
    .order("source_page_date",{ascending:false})
    .order("raw_match_id",{ascending:true})
    .range(0,999);
  if(result.error)throw result.error;
  return result.data||[];
}
async function loadSchedule(key){
  const client=db();
  const result=await client.from("gw001_schedule")
    .select("schedule_id,sm_fixture_id,match_date,matchday_number,home_name,away_name,sm_round_label,competition_key")
    .eq("competition_key",key)
    .order("match_date",{ascending:true})
    .order("schedule_id",{ascending:true})
    .range(0,999);
  if(result.error)throw result.error;
  return result.data||[];
}
function buildStandings(rows){
  const fixtures=new Map();
  (rows||[]).forEach(function(row){
    if(row.home_score==null||row.away_score==null)return;
    const key=row.sm_fixture_id!=null?String(row.sm_fixture_id):[row.source_page_date,row.home_name,row.away_name].join("|");
    fixtures.set(key,row);
  });
  const table=new Map();
  function ensure(name){
    const key=norm(name);
    if(!table.has(key))table.set(key,{team_name:clean(name),played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,points:0});
    return table.get(key);
  }
  fixtures.forEach(function(row){
    const home=ensure(row.home_name),away=ensure(row.away_name);
    const hs=Number(row.home_score),as=Number(row.away_score);
    home.played+=1;away.played+=1;
    home.gf+=hs;home.ga+=as;away.gf+=as;away.ga+=hs;
    if(hs>as){home.won+=1;away.lost+=1;home.points+=3;}
    else if(hs<as){away.won+=1;home.lost+=1;away.points+=3;}
    else{home.drawn+=1;away.drawn+=1;home.points+=1;away.points+=1;}
  });
  return Array.from(table.values()).map(function(row){row.gd=row.gf-row.ga;return row;}).sort(function(a,b){
    return b.points-a.points||b.gd-a.gd||b.gf-a.gf||a.team_name.localeCompare(b.team_name,"it");
  });
}

function resultRowsMarkup(rows){
  if(!rows.length)return '<p>Nessun risultato presente.</p>';
  return '<table style="width:100%;border-collapse:collapse"><thead><tr><th>Data</th><th>Casa</th><th>Risultato</th><th>Trasferta</th><th>Turno</th></tr></thead><tbody>'+rows.map(function(row){
    const score=row.home_score==null||row.away_score==null?"-":row.home_score+" - "+row.away_score;
    return '<tr><td>'+esc(row.source_page_date||"")+'</td><td>'+esc(row.home_name||"")+'</td><td>'+esc(score)+'</td><td>'+esc(row.away_name||"")+'</td><td>'+esc(row.sm_round_label||"")+'</td></tr>';
  }).join("")+'</tbody></table>';
}
function scheduleRowsMarkup(rows){
  if(!rows.length)return '<p>Nessuna partita in schedule.</p>';
  return '<table style="width:100%;border-collapse:collapse"><thead><tr><th>Data</th><th>Casa</th><th>Trasferta</th><th>Matchday</th><th>Turno</th></tr></thead><tbody>'+rows.map(function(row){
    return '<tr><td>'+esc(row.match_date||"")+'</td><td>'+esc(row.home_name||"")+'</td><td>'+esc(row.away_name||"")+'</td><td>'+esc(row.matchday_number==null?"":row.matchday_number)+'</td><td>'+esc(row.sm_round_label||"")+'</td></tr>';
  }).join("")+'</tbody></table>';
}
function standingsMarkup(rows){
  if(!rows.length)return '<p>Classifica non disponibile.</p>';
  return '<table style="width:100%;border-collapse:collapse"><thead><tr><th>Pos</th><th>Squadra</th><th>PG</th><th>V</th><th>N</th><th>P</th><th>GF</th><th>GS</th><th>DR</th><th>PTS</th></tr></thead><tbody>'+rows.map(function(row,index){
    return '<tr><td>'+(index+1)+'</td><td>'+esc(row.team_name)+'</td><td>'+row.played+'</td><td>'+row.won+'</td><td>'+row.drawn+'</td><td>'+row.lost+'</td><td>'+row.gf+'</td><td>'+row.ga+'</td><td>'+row.gd+'</td><td>'+row.points+'</td></tr>';
  }).join("")+'</tbody></table>';
}

function detailShell(row){
  const root=pageRoot();if(!root)return null;
  const isLeague=clean(row.sm_action).toLowerCase()==="league";
  root.innerHTML='<section data-imc-gw001-competitions-clean="1">'+
    '<button type="button" data-clean-back>‹ Competitions</button>'+
    '<h1>'+esc(registryLabel(row))+'</h1>'+
    '<p>'+esc(row.IMC_competition_type||"")+' · '+esc(row.competition_key||"")+'</p>'+
    '<div data-clean-tabs style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">'+
      '<button type="button" data-clean-tab="results">RESULTS</button>'+
      (isLeague?'<button type="button" data-clean-tab="standings">STANDINGS</button>':'')+
      '<button type="button" data-clean-tab="schedule">SCHEDULE</button>'+
    '</div>'+
    '<div data-clean-content><p>Caricamento dati…</p></div>'+
  '</section>';
  root.querySelector("[data-clean-back]").addEventListener("click",showList);
  root.querySelectorAll("[data-clean-tab]").forEach(function(button){button.addEventListener("click",function(){openTab(button.getAttribute("data-clean-tab"));});});
  return root.querySelector("[data-clean-content]");
}

async function openCompetition(row){
  activeView="detail";activeCompetition=row;activeTab="results";
  markCompetitionActive();
  await openTab("results");
}
async function openTab(tab){
  if(!activeCompetition)return;
  activeTab=tab;
  const content=detailShell(activeCompetition);
  if(!content)return;
  try{
    if(tab==="results")content.innerHTML=resultRowsMarkup(await loadResults(activeCompetition.competition_key));
    else if(tab==="schedule")content.innerHTML=scheduleRowsMarkup(await loadSchedule(activeCompetition.competition_key));
    else if(tab==="standings")content.innerHTML=standingsMarkup(buildStandings(await loadResults(activeCompetition.competition_key)));
  }catch(error){content.innerHTML='<p>Errore: '+esc(error&&error.message||"caricamento non riuscito")+'</p>';}
}

function scheduleRender(){
  clearTimeout(renderTimer);
  renderTimer=setTimeout(function(){
    if(currentWorld()!==WORLD)return;
    if(!competitionIsActive())return;
    if(activeView==="detail"&&activeCompetition){
      if(!isOurPage())openTab(activeTab);
    }else if(!isOurPage())showList();
  },30);
}

function start(){
  if(!ownClient&&window.supabase){
    let cfg=null;try{cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){}
    const url=cfg&&cfg.url?cfg.url:"https://toanuzojdkfjgucztpze.supabase.co";
    const key=cfg&&cfg.key?cfg.key:"sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
    ownClient=window.supabase.createClient(url,key);
  }
  document.addEventListener("click",function(event){
    const button=event.target&&event.target.closest?event.target.closest('.nx-world-nav [data-world-section="competitions"]'):null;
    if(!button||currentWorld()!==WORLD)return;
    activeView="list";activeCompetition=null;activeTab="results";
    setTimeout(showList,0);
  },true);
  const app=document.getElementById("app")||document.documentElement;
  observer=new MutationObserver(scheduleRender);
  observer.observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
  scheduleRender();
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.IMC_GW001_COMPETITIONS_CLEAN={version:VERSION,showList:showList};
})();