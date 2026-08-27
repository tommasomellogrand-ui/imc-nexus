(function(){
"use strict";

if(window.__IMC_GW001_COMPETITIONS_CLEAN__)return;
window.__IMC_GW001_COMPETITIONS_CLEAN__=true;

const VERSION="0.2.0-approved-cards";
const WORLD="GW001";
const STYLE_ID="imcGw001CompetitionsCleanCss";
let ownClient=null;
let observer=null;
let renderTimer=null;
let activeView="list";
let activeCompetition=null;
let activeTab="results";
let activeCategory="all";
let overviewCache=null;

function clean(value){return String(value==null?"":value).replace(/\s+/g," ").trim();}
function norm(value){return clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function esc(value){return clean(value).replace(/[&<>"']/g,function(char){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];});}
function db(){if(window.__IMC_NEXUS_CLIENT__)return window.__IMC_NEXUS_CLIENT__;return ownClient;}
function currentWorld(){
  const nodes=document.querySelectorAll("#openDrawerWorld strong,.nx-sport-world strong,.nx-competitions-title p,.nx-competition-cover-copy p");
  for(const node of nodes){
    const text=clean(node.textContent),match=text.match(/GW\d{3}/i);
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
  nav.querySelectorAll("[data-world-section]").forEach(function(button){button.classList.toggle("active",button.getAttribute("data-world-section")==="competitions");});
}
function isOurPage(){const root=pageRoot();return !!(root&&root.querySelector('[data-imc-gw001-competitions-clean="1"]'));}

function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent=`
.imc-clean-competitions{padding:2px 0 24px;color:#0b1b3f;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.imc-clean-head{padding:8px 2px 5px}.imc-clean-head h1{margin:0;color:#071d52;font-size:32px;line-height:1;font-weight:950;letter-spacing:-.045em;text-transform:uppercase}.imc-clean-head p{margin:7px 0 0;color:#67748c;font-size:11px;font-weight:800}
.imc-clean-filters{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:17px 0 20px;padding:0}.imc-clean-filter{min-width:0;min-height:38px;padding:7px 5px;border:1px solid #dce3ed;border-radius:999px;background:#fff;color:#1a2d55;font:inherit;font-size:8px;font-weight:900;box-shadow:0 4px 10px rgba(20,39,83,.035)}.imc-clean-filter.is-active{border-color:#08245c;background:#08245c;color:#fff;box-shadow:0 6px 14px rgba(8,36,92,.16)}
.imc-clean-sections{display:grid;gap:22px}.imc-clean-section[hidden]{display:none!important}.imc-clean-section-head{display:flex;align-items:center;gap:9px;margin:0 2px 10px;padding-bottom:8px;border-bottom:1px solid #e4e9f1}.imc-clean-section-head b{display:flex;align-items:center;justify-content:center;width:27px;height:27px;border-radius:9px;background:#edf3ff;color:#1556c7;font-size:14px}.imc-clean-section-head strong{color:#0a1c45;font-size:15px;font-weight:950}.imc-clean-section-head span{margin-left:auto;color:#8a95a7;font-size:8px;font-weight:900}
.imc-clean-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.imc-clean-card{position:relative;display:grid;grid-template-columns:44px minmax(0,1fr) 16px;gap:9px;align-items:center;min-width:0;min-height:93px;padding:11px 10px;border:1px solid #dfe5ed;border-radius:17px;background:linear-gradient(180deg,#fff 0%,#fdfefe 100%);color:#0b1b3f;text-align:left;font:inherit;box-shadow:0 8px 17px rgba(22,42,78,.075),inset 0 1px 0 rgba(255,255,255,.95);transform:translateY(0);transition:transform .12s ease,box-shadow .12s ease}.imc-clean-card:active{transform:translateY(2px);box-shadow:0 3px 8px rgba(22,42,78,.07),inset 0 1px 0 rgba(255,255,255,.95)}
.imc-clean-icon{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:14px;background:#f0f5ff;color:#103f91}.imc-clean-icon svg{width:28px;height:28px;display:block}.imc-clean-copy{min-width:0}.imc-clean-copy strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#091c46;font-size:10.5px;line-height:1.08;font-weight:950;text-transform:uppercase}.imc-clean-copy small{display:block;margin-top:7px;color:#7b8799;font-size:7px;line-height:1.32;font-weight:800}.imc-clean-arrow{color:#1858d8;font-size:19px;font-weight:700;text-align:center}
.imc-clean-loading,.imc-clean-error{padding:24px 16px;border:1px solid #e1e6ee;border-radius:17px;background:#fff;color:#798498;text-align:center;font-size:10px;font-weight:850}.imc-clean-error{color:#9d3030}
.imc-clean-detail{padding:4px 0 24px}.imc-clean-back{border:0;background:transparent;padding:4px 0;color:#2862cf;font:inherit;font-size:13px;font-weight:900}.imc-clean-detail h1{margin:14px 0 4px;color:#081c49;font-size:28px;line-height:1;font-weight:950}.imc-clean-detail>p{margin:0;color:#7c8799;font-size:9px;font-weight:800}.imc-clean-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:15px 0}.imc-clean-tabs button{min-height:37px;padding:8px 12px;border:1px solid #dce3ed;border-radius:12px;background:#fff;color:#53617a;font:inherit;font-size:8px;font-weight:950}.imc-clean-tabs button.is-active{border-color:#0a255d;background:#0a255d;color:#fff}.imc-clean-content{overflow:auto;-webkit-overflow-scrolling:touch}.imc-clean-content table{width:100%;min-width:620px;border-collapse:collapse;background:#fff}.imc-clean-content th,.imc-clean-content td{padding:9px 7px;border-bottom:1px solid #e9edf3;font-size:8px;text-align:left}.imc-clean-content th{color:#718097;font-weight:950;text-transform:uppercase}.imc-clean-content td{color:#13264d;font-weight:750}
@media(max-width:390px){.imc-clean-head h1{font-size:29px}.imc-clean-filters{gap:4px}.imc-clean-filter{font-size:7px;padding-left:3px;padding-right:3px}.imc-clean-grid{gap:7px}.imc-clean-card{grid-template-columns:38px minmax(0,1fr) 13px;gap:7px;min-height:84px;padding:9px 8px;border-radius:15px}.imc-clean-icon{width:38px;height:38px;border-radius:12px}.imc-clean-icon svg{width:24px;height:24px}.imc-clean-copy strong{font-size:9px}.imc-clean-copy small{font-size:6.4px}.imc-clean-arrow{font-size:17px}}
`;
  document.head.appendChild(style);
}

async function loadRegistry(){
  const client=db();if(!client)throw new Error("Client Supabase non disponibile");
  const result=await client.from("gw001_gw_competitions").select("*");
  if(result.error)throw result.error;
  return result.data||[];
}
async function loadCompetitionKeys(table){
  const client=db();if(!client)throw new Error("Client Supabase non disponibile");
  const rows=[];let from=0;
  while(true){
    const result=await client.from(table).select("competition_key").range(from,from+999);
    if(result.error)throw result.error;
    const page=result.data||[];rows.push.apply(rows,page);
    if(page.length<1000)break;
    from+=1000;
  }
  return rows;
}
function countByKey(rows){const map=new Map();(rows||[]).forEach(function(row){const key=clean(row.competition_key);if(key)map.set(key,(map.get(key)||0)+1);});return map;}
async function loadOverview(){
  if(overviewCache)return overviewCache;
  const values=await Promise.all([loadRegistry(),loadCompetitionKeys("gw001_results"),loadCompetitionKeys("gw001_schedule")]);
  overviewCache={rows:values[0],results:countByKey(values[1]),schedule:countByKey(values[2])};
  return overviewCache;
}

function registryLabel(row){return clean(row&&row["Nexus View"])||clean(row&&row.sm_competition_name)||clean(row&&row.competition_key)||"Competition";}
function categoryKey(row){const key=norm(row&&row.IMC_competition_type);if(key==="international")return"international";if(key==="nations")return"nations";if(key==="friendly")return"friendly";return"domestic";}
function categoryOrder(value){if(value==="domestic")return 1;if(value==="international")return 2;if(value==="nations")return 3;if(value==="friendly")return 4;return 9;}
function competitionRank(row){
  const action=norm(row&&row.sm_action),label=norm(registryLabel(row));
  if(action==="league"){const m=label.match(/(?:div|division)\s*(\d+)/);return m?Number(m[1]):20;}
  if(action==="leaguecup")return 100;
  if(action==="leagueshield")return 110;
  if(action==="charityshield")return 120;
  if(action==="smfacup")return 200;
  if(action==="smfashield")return 210;
  if(action==="supercup")return 220;
  if(action==="worldcup")return 300;
  if(action==="interqualifier")return 310;
  if(action==="friendly")return 400;
  return 999;
}
function categoryMeta(key){
  if(key==="international")return {label:"International",icon:"globe"};
  if(key==="nations")return {label:"Nations",icon:"flag"};
  if(key==="friendly")return {label:"Friendly",icon:"friendly"};
  return {label:"Domestic",icon:"home"};
}
function iconSvg(type,text){
  const common='viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  if(type==="trophy")return '<svg '+common+'><path d="M10 5h12v6c0 5-2.8 8-6 8s-6-3-6-8V5Z"/><path d="M10 8H6c0 4 1.4 6 5 7M22 8h4c0 4-1.4 6-5 7M16 19v5M11 27h10M13 24h6"/></svg>';
  if(type==="globe")return '<svg '+common+'><circle cx="16" cy="16" r="11"/><path d="M5 16h22M16 5c3 3 4.5 6.7 4.5 11S19 24 16 27M16 5c-3 3-4.5 6.7-4.5 11S13 24 16 27"/></svg>';
  if(type==="flag")return '<svg '+common+'><path d="M8 27V6M9 7h13l-2 4 2 4H9"/></svg>';
  if(type==="friendly")return '<svg '+common+'><path d="M6 12l5-4 5 3 5-3 5 4-7 8-3-2-3 2-7-8Z"/><path d="M11 17l3 3M21 17l-3 3"/></svg>';
  if(type==="home")return '<svg '+common+'><path d="M5 15 16 6l11 9M8 14v12h16V14M13 26v-8h6v8"/></svg>';
  if(type==="shield")return '<svg '+common+'><path d="M16 4 25 7v7c0 6-3.8 10-9 14-5.2-4-9-8-9-14V7l9-3Z"/>'+(text?'<text x="16" y="18" text-anchor="middle" fill="currentColor" stroke="none" font-size="9" font-weight="900">'+esc(text)+'</text>':'')+'</svg>';
  return iconSvg("trophy");
}
function cardIcon(row){
  const action=norm(row&&row.sm_action),label=registryLabel(row);
  if(action==="league"){const m=label.match(/(\d+)/);return iconSvg("shield",m?m[1]:"");}
  if(action==="smfashield"||action==="charityshield")return iconSvg("shield","");
  if(action==="worldcup"||action==="interqualifier")return iconSvg("globe");
  if(action==="friendly")return iconSvg("friendly");
  return iconSvg("trophy");
}
function sectionIcon(key){return iconSvg(categoryMeta(key).icon);}
function metricText(row,overview){
  const parts=[];
  const teams=Number(row&&row.IMC_league_teams_count);
  if(Number.isFinite(teams)&&teams>0)parts.push(teams+" teams");
  const results=overview.results.get(clean(row.competition_key))||0;
  const schedule=overview.schedule.get(clean(row.competition_key))||0;
  if(results)parts.push(results+" results");
  if(schedule)parts.push(schedule+" schedule");
  return parts.join(" · ")||clean(row.sm_action)||"Competition";
}

function renderListLoading(){
  installStyles();
  const root=pageRoot();if(!root)return;
  root.innerHTML='<section class="imc-clean-competitions" data-imc-gw001-competitions-clean="1"><div class="imc-clean-head"><h1>Competitions</h1><p>GW001 · Road To History</p></div><div class="imc-clean-loading">Caricamento dati…</div></section>';
}
function renderList(overview){
  installStyles();
  const root=pageRoot();if(!root)return;
  const rows=(overview.rows||[]).slice().sort(function(a,b){const ca=categoryKey(a),cb=categoryKey(b);return categoryOrder(ca)-categoryOrder(cb)||competitionRank(a)-competitionRank(b)||registryLabel(a).localeCompare(registryLabel(b),"it",{numeric:true});});
  const categories=["domestic","international","nations","friendly"];
  const filters=[{key:"all",label:"All"},{key:"domestic",label:"Domestic"},{key:"international",label:"International"},{key:"nations",label:"Nations"},{key:"friendly",label:"Friendly"}];
  root.innerHTML='<section class="imc-clean-competitions" data-imc-gw001-competitions-clean="1">'+
    '<div class="imc-clean-head"><h1>Competitions</h1><p>GW001 · Road To History</p></div>'+
    '<div class="imc-clean-filters">'+filters.map(function(item){return '<button type="button" class="imc-clean-filter '+(activeCategory===item.key?'is-active':'')+'" data-clean-category="'+item.key+'">'+item.label+'</button>';}).join("")+'</div>'+
    '<div class="imc-clean-sections">'+categories.map(function(category){
      const list=rows.filter(function(row){return categoryKey(row)===category;});
      if(!list.length)return '';
      const meta=categoryMeta(category),hidden=activeCategory!=="all"&&activeCategory!==category;
      return '<section class="imc-clean-section" data-clean-section="'+category+'" '+(hidden?'hidden':'')+'><div class="imc-clean-section-head"><b>'+sectionIcon(category)+'</b><strong>'+meta.label+'</strong><span>'+list.length+' '+(list.length===1?'competition':'competitions')+'</span></div><div class="imc-clean-grid">'+list.map(function(row){return '<button type="button" class="imc-clean-card" data-clean-competition-key="'+esc(row.competition_key)+'"><span class="imc-clean-icon">'+cardIcon(row)+'</span><span class="imc-clean-copy"><strong>'+esc(registryLabel(row))+'</strong><small>'+esc(metricText(row,overview))+'</small></span><span class="imc-clean-arrow">›</span></button>';}).join("")+'</div></section>';
    }).join("")+'</div></section>';

  root.querySelectorAll("[data-clean-category]").forEach(function(button){button.addEventListener("click",function(){activeCategory=button.getAttribute("data-clean-category")||"all";renderList(overview);});});
  root.querySelectorAll("[data-clean-competition-key]").forEach(function(button){button.addEventListener("click",function(){const key=button.getAttribute("data-clean-competition-key");const row=rows.find(function(item){return String(item.competition_key)===String(key);});if(row)openCompetition(row);});});
}

async function showList(force){
  if(currentWorld()!==WORLD)return;
  activeView="list";activeCompetition=null;activeTab="results";
  markCompetitionActive();
  renderListLoading();
  try{if(force)overviewCache=null;renderList(await loadOverview());}
  catch(error){const root=pageRoot();if(root)root.innerHTML='<section class="imc-clean-competitions" data-imc-gw001-competitions-clean="1"><div class="imc-clean-head"><h1>Competitions</h1><p>GW001 · Road To History</p></div><div class="imc-clean-error">Errore: '+esc(error&&error.message||"caricamento non riuscito")+'</div></section>';}
}

async function loadResults(key){
  const client=db();
  const result=await client.from("gw001_results").select("raw_match_id,sm_fixture_id,source_page_date,home_name,away_name,home_score,away_score,home_penalties,away_penalties,decided_on_penalties,sm_round_label,competition_key").eq("competition_key",key).order("source_page_date",{ascending:false}).order("raw_match_id",{ascending:true}).range(0,999);
  if(result.error)throw result.error;return result.data||[];
}
async function loadSchedule(key){
  const client=db();
  const result=await client.from("gw001_schedule").select("schedule_id,sm_fixture_id,match_date,matchday_number,home_name,away_name,sm_round_label,competition_key").eq("competition_key",key).order("match_date",{ascending:true}).order("schedule_id",{ascending:true}).range(0,999);
  if(result.error)throw result.error;return result.data||[];
}
function buildStandings(rows){
  const fixtures=new Map();
  (rows||[]).forEach(function(row){if(row.home_score==null||row.away_score==null)return;const key=row.sm_fixture_id!=null?String(row.sm_fixture_id):[row.source_page_date,row.home_name,row.away_name].join("|");fixtures.set(key,row);});
  const table=new Map();
  function ensure(name){const key=norm(name);if(!table.has(key))table.set(key,{team_name:clean(name),played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,points:0});return table.get(key);}
  fixtures.forEach(function(row){const home=ensure(row.home_name),away=ensure(row.away_name),hs=Number(row.home_score),as=Number(row.away_score);home.played+=1;away.played+=1;home.gf+=hs;home.ga+=as;away.gf+=as;away.ga+=hs;if(hs>as){home.won+=1;away.lost+=1;home.points+=3;}else if(hs<as){away.won+=1;home.lost+=1;away.points+=3;}else{home.drawn+=1;away.drawn+=1;home.points+=1;away.points+=1;}});
  return Array.from(table.values()).map(function(row){row.gd=row.gf-row.ga;return row;}).sort(function(a,b){return b.points-a.points||b.gd-a.gd||b.gf-a.gf||a.team_name.localeCompare(b.team_name,"it");});
}
function resultRowsMarkup(rows){
  if(!rows.length)return '<p>Nessun risultato presente.</p>';
  return '<table><thead><tr><th>Data</th><th>Casa</th><th>Risultato</th><th>Trasferta</th><th>Turno</th></tr></thead><tbody>'+rows.map(function(row){const score=row.home_score==null||row.away_score==null?"-":row.home_score+" - "+row.away_score;return '<tr><td>'+esc(row.source_page_date||"")+'</td><td>'+esc(row.home_name||"")+'</td><td>'+esc(score)+'</td><td>'+esc(row.away_name||"")+'</td><td>'+esc(row.sm_round_label||"")+'</td></tr>';}).join("")+'</tbody></table>';
}
function scheduleRowsMarkup(rows){
  if(!rows.length)return '<p>Nessuna partita in schedule.</p>';
  return '<table><thead><tr><th>Data</th><th>Casa</th><th>Trasferta</th><th>Matchday</th><th>Turno</th></tr></thead><tbody>'+rows.map(function(row){return '<tr><td>'+esc(row.match_date||"")+'</td><td>'+esc(row.home_name||"")+'</td><td>'+esc(row.away_name||"")+'</td><td>'+esc(row.matchday_number==null?"":row.matchday_number)+'</td><td>'+esc(row.sm_round_label||"")+'</td></tr>';}).join("")+'</tbody></table>';
}
function standingsMarkup(rows){
  if(!rows.length)return '<p>Classifica non disponibile.</p>';
  return '<table><thead><tr><th>Pos</th><th>Squadra</th><th>PG</th><th>V</th><th>N</th><th>P</th><th>GF</th><th>GS</th><th>DR</th><th>PTS</th></tr></thead><tbody>'+rows.map(function(row,index){return '<tr><td>'+(index+1)+'</td><td>'+esc(row.team_name)+'</td><td>'+row.played+'</td><td>'+row.won+'</td><td>'+row.drawn+'</td><td>'+row.lost+'</td><td>'+row.gf+'</td><td>'+row.ga+'</td><td>'+row.gd+'</td><td>'+row.points+'</td></tr>';}).join("")+'</tbody></table>';
}
function detailShell(row){
  installStyles();
  const root=pageRoot();if(!root)return null;
  const isLeague=norm(row.sm_action)==="league";
  root.innerHTML='<section class="imc-clean-detail" data-imc-gw001-competitions-clean="1"><button type="button" class="imc-clean-back" data-clean-back>‹ Competitions</button><h1>'+esc(registryLabel(row))+'</h1><p>'+esc(row.IMC_competition_type||"")+' · '+esc(row.competition_key||"")+'</p><div class="imc-clean-tabs"><button type="button" data-clean-tab="results" class="'+(activeTab==="results"?'is-active':'')+'">RESULTS</button>'+(isLeague?'<button type="button" data-clean-tab="standings" class="'+(activeTab==="standings"?'is-active':'')+'">STANDINGS</button>':'')+'<button type="button" data-clean-tab="schedule" class="'+(activeTab==="schedule"?'is-active':'')+'">SCHEDULE</button></div><div class="imc-clean-content" data-clean-content><p>Caricamento dati…</p></div></section>';
  root.querySelector("[data-clean-back]").addEventListener("click",function(){showList(false);});
  root.querySelectorAll("[data-clean-tab]").forEach(function(button){button.addEventListener("click",function(){openTab(button.getAttribute("data-clean-tab"));});});
  return root.querySelector("[data-clean-content]");
}
async function openCompetition(row){activeView="detail";activeCompetition=row;activeTab="results";markCompetitionActive();await openTab("results");}
async function openTab(tab){
  if(!activeCompetition)return;activeTab=tab;
  const content=detailShell(activeCompetition);if(!content)return;
  try{if(tab==="results")content.innerHTML=resultRowsMarkup(await loadResults(activeCompetition.competition_key));else if(tab==="schedule")content.innerHTML=scheduleRowsMarkup(await loadSchedule(activeCompetition.competition_key));else if(tab==="standings")content.innerHTML=standingsMarkup(buildStandings(await loadResults(activeCompetition.competition_key)));}
  catch(error){content.innerHTML='<p>Errore: '+esc(error&&error.message||"caricamento non riuscito")+'</p>';}
}

function scheduleRender(){
  clearTimeout(renderTimer);
  renderTimer=setTimeout(function(){if(currentWorld()!==WORLD||!competitionIsActive())return;if(activeView==="detail"&&activeCompetition){if(!isOurPage())openTab(activeTab);}else if(!isOurPage())showList(false);},30);
}
function start(){
  installStyles();
  if(!ownClient&&window.supabase){let cfg=null;try{cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){}const url=cfg&&cfg.url?cfg.url:"https://toanuzojdkfjgucztpze.supabase.co",key=cfg&&cfg.key?cfg.key:"sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";ownClient=window.supabase.createClient(url,key);}
  document.addEventListener("click",function(event){const button=event.target&&event.target.closest?event.target.closest('.nx-world-nav [data-world-section="competitions"]'):null;if(!button||currentWorld()!==WORLD)return;activeView="list";activeCompetition=null;activeTab="results";setTimeout(function(){showList(false);},0);},true);
  const app=document.getElementById("app")||document.documentElement;observer=new MutationObserver(scheduleRender);observer.observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});scheduleRender();
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.IMC_GW001_COMPETITIONS_CLEAN={version:VERSION,showList:function(){showList(false);}};
})();