(function(){
"use strict";

const V="1.0.0-build56";
const URL="https://toanuzojdkfjgucztpze.supabase.co";
const KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
const cache=new Map();
let db=null;
let observer=null;

const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const norm=v=>String(v==null?"":v).trim().toLowerCase();
const validWorld=id=>/^GW(?:00[1-9]|010)$/.test(String(id||""));
const worldTable=(id,suffix)=>String(id).toLowerCase()+suffix;
const cupCountryActions=new Set(["leaguecup","leagueshield","charityshield"]);

function client(){
  if(db)return db;
  if(!window.supabase)throw new Error("Client Supabase non disponibile.");
  let cfg=null;
  try{cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){}
  db=window.supabase.createClient(cfg&&cfg.url?cfg.url:URL,cfg&&cfg.key?cfg.key:KEY);
  return db;
}

function css(){
  if(document.getElementById("imcCompetitionsCss"))return;
  const s=document.createElement("style");
  s.id="imcCompetitionsCss";
  s.textContent=`
.nx-competitions-index[data-imc-competitions-mounted="1"]{overflow:hidden}
.imcc-wrap{width:100%;color:#111820}.imcc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px}.imcc-head h1{margin:0;font-size:25px;line-height:1;font-weight:1000;letter-spacing:-.035em}.imcc-head p{margin:5px 0 0;color:#7b838d;font-size:10px;font-weight:850}.imcc-keyline{display:inline-flex;align-items:center;min-height:30px;padding:0 9px;border:1px solid #dfe5e9;border-radius:10px;background:#f7f9fa;color:#64707b;font-size:8px;font-weight:950;white-space:nowrap}
.imcc-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:0 0 10px}.imcc-tabs button{min-width:0;min-height:54px;padding:7px 5px;border:1px solid #e0e5e8;border-radius:13px;background:#fff;color:#606973;font:inherit;font-size:8px;font-weight:950}.imcc-tabs button span{display:block;margin-bottom:3px;font-size:16px}.imcc-tabs button.active{border-color:#188d45;background:#edf8f1;color:#13793b;box-shadow:inset 0 0 0 1px rgba(24,141,69,.08)}
.imcc-tools{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;margin-bottom:10px}.imcc-search{height:42px;padding:0 12px;border:1px solid #dfe5e9;border-radius:12px;background:#f7f9fa;color:#111820;font:inherit;font-size:12px;font-weight:800;outline:none}.imcc-country{max-width:155px;height:42px;padding:0 8px;border:1px solid #dfe5e9;border-radius:12px;background:#fff;color:#18212a;font:inherit;font-size:9px;font-weight:900}.imcc-summary{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 1px 10px;color:#848c95;font-size:8px;font-weight:900}.imcc-summary strong{color:#1b242d}
.imcc-country-box{margin:0 0 11px;padding:10px;border:1px solid #e1e6e9;border-radius:15px;background:#fbfcfd}.imcc-country-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin:0 1px 8px}.imcc-country-head strong{font-size:11px;font-weight:1000}.imcc-country-head small{color:#90979f;font-size:7px;font-weight:900}.imcc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.imcc-tile{min-width:0;min-height:80px;padding:10px;border:1px solid #e1e6e9;border-radius:14px;background:#fff;color:#111820;text-align:left;font:inherit;box-shadow:0 4px 13px rgba(17,24,32,.035)}.imcc-tile .ico{display:flex;align-items:center;justify-content:center;width:29px;height:29px;margin-bottom:8px;border-radius:9px;background:#eef8f1;font-size:15px}.imcc-tile strong{display:block;overflow:hidden;text-overflow:ellipsis;font-size:10px;line-height:1.2;font-weight:1000}.imcc-tile small{display:block;margin-top:4px;overflow:hidden;text-overflow:ellipsis;color:#8a929a;font-size:7px;font-weight:900;white-space:nowrap}.imcc-empty,.imcc-loading,.imcc-error{padding:25px 12px;border:1px solid #e2e7ea;border-radius:14px;background:#fafbfc;color:#7b848d;text-align:center;font-size:10px;font-weight:850}.imcc-error{color:#a43c42}
.imcc-back{display:inline-flex;align-items:center;gap:5px;margin:0 0 10px;padding:0;border:0;background:transparent;color:#168744;font:inherit;font-size:9px;font-weight:1000}.imcc-hero{padding:14px;border-radius:18px;background:linear-gradient(135deg,#071a36,#0a3b68 68%,#12693c);color:#fff}.imcc-hero small{display:block;color:#68df90;font-size:7px;font-weight:950;letter-spacing:.08em}.imcc-hero h2{margin:5px 0 0;font-size:22px;line-height:1.05;font-weight:1000;letter-spacing:-.03em}.imcc-hero p{margin:7px 0 0;color:#d9e4ed;font-size:8px;font-weight:850}.imcc-detail-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:10px 0}.imcc-detail-tabs.two{grid-template-columns:repeat(2,minmax(0,1fr))}.imcc-detail-tabs button{height:40px;border:1px solid #dfe5e9;border-radius:11px;background:#fff;color:#69727b;font:inherit;font-size:8px;font-weight:1000}.imcc-detail-tabs button.active{border-color:#188d45;background:#edf8f1;color:#13793b}
.imcc-match-list{overflow:hidden;border:1px solid #e2e6e9;border-radius:15px;background:#fff}.imcc-match{padding:10px;border-top:1px solid #eceff1}.imcc-match:first-child{border-top:0}.imcc-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;color:#9299a1;font-size:7px;font-weight:900}.imcc-teams{display:grid;grid-template-columns:minmax(0,1fr) 58px minmax(0,1fr);gap:6px;align-items:center}.imcc-teams strong{overflow:hidden;text-overflow:ellipsis;font-size:10px;font-weight:1000;white-space:nowrap}.imcc-teams strong:last-child{text-align:right}.imcc-score{display:flex;align-items:center;justify-content:center;min-height:30px;border-radius:9px;background:#f2f5f6;color:#18212a;font-size:12px;font-weight:1000}.imcc-pen{margin-top:5px;color:#8a929a;text-align:center;font-size:7px;font-weight:850}
.imcc-table{width:100%;border-collapse:separate;border-spacing:0;overflow:hidden;border:1px solid #e1e6e9;border-radius:14px;background:#fff;font-size:8px}.imcc-table th,.imcc-table td{padding:8px 5px;border-bottom:1px solid #edf0f2;text-align:right;font-weight:850}.imcc-table th{background:#f7f9fa;color:#7e8790;font-size:7px;font-weight:1000}.imcc-table th:nth-child(2),.imcc-table td:nth-child(2){text-align:left}.imcc-table tr:last-child td{border-bottom:0}.imcc-table .pos{width:25px;text-align:center}.imcc-table .team{max-width:122px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:1000}.imcc-table .pts{color:#168744;font-weight:1000}
@media(max-width:390px){.imcc-head h1{font-size:22px}.imcc-keyline{font-size:7px}.imcc-tabs{gap:5px}.imcc-tabs button{min-height:50px;font-size:7px}.imcc-grid{gap:6px}.imcc-tile{min-height:75px;padding:9px}.imcc-tile strong{font-size:9px}.imcc-tools{grid-template-columns:minmax(0,1fr) 120px}.imcc-country{max-width:120px}.imcc-teams{grid-template-columns:minmax(0,1fr) 50px minmax(0,1fr)}}
@media(min-width:620px){.imcc-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.imcc-wrap{max-width:900px;margin:auto}}
`;
  document.head.appendChild(s);
}

async function fetchAll(table,select,orderColumn,ascending){
  const out=[];let from=0;
  while(true){
    let q=client().from(table).select(select);
    if(orderColumn)q=q.order(orderColumn,{ascending:ascending!==false});
    const r=await q.range(from,from+999);
    if(r.error)throw r.error;
    const page=r.data||[];out.push(...page);
    if(page.length<1000)break;
    from+=1000;
  }
  return out;
}

function worldFromSection(section){
  const txt=String(section.querySelector(".nx-page-title p")?.textContent||"");
  const m=txt.match(/GW\d{3}/i);
  if(m&&validWorld(m[0].toUpperCase()))return m[0].toUpperCase();
  const tagged=document.querySelector("[data-imc-codex-world],[data-imc-transfers-world]");
  if(tagged){
    const id=tagged.getAttribute("data-imc-codex-world")||tagged.getAttribute("data-imc-transfers-world");
    if(validWorld(id))return id;
  }
  return "";
}

function divisionNumber(v){
  const m=String(v==null?"":v).match(/\d+/);
  return m?String(Number(m[0])):"";
}

function globalClassForAction(globalRows,action){
  const a=norm(action);
  const row=(globalRows||[]).find(x=>norm(x.sm_action)===a);
  return row?String(row.competition_class||""):"";
}

function resolveMatch(match,data){
  const action=norm(match&&match.sm_action);
  if(!action)return null;
  const registry=data.registry||[];
  let candidates=registry.filter(r=>norm(r.sm_action)===action);
  if(!candidates.length)return null;

  if(data.meta.game_world_type==="single_league"){
    if(action==="league"){
      const div=divisionNumber(match.sm_division);
      candidates=candidates.filter(r=>divisionNumber(r.IMC_league_divisions)===div);
    }
  }else if(data.meta.game_world_type==="multi_league"){
    if(action==="league"){
      const country=norm(match.sm_country),div=divisionNumber(match.sm_division);
      candidates=candidates.filter(r=>norm(r.sm_country)===country&&divisionNumber(r.IMC_league_divisions)===div);
    }else if(cupCountryActions.has(action)){
      const country=norm(match.sm_country);
      candidates=candidates.filter(r=>norm(r.sm_country)===country);
    }else{
      const cls=norm(globalClassForAction(data.global,action));
      if(cls!=="international"&&cls!=="nations"&&cls!=="friendly")return null;
    }
  }else{
    return null;
  }
  return candidates.length===1?String(candidates[0].competition_key||""):null;
}

function classMap(globalRows,world){
  const map=new Map();
  (globalRows||[]).forEach(row=>{
    const keys=row&&row.worlds&&Array.isArray(row.worlds[world])?row.worlds[world]:[];
    keys.forEach(key=>map.set(String(key),String(row.competition_class||"")));
  });
  return map;
}

function todayISO(){
  const d=new Date();
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}

async function loadData(world,force){
  if(cache.has(world)&&!force)return cache.get(world);
  const metaR=await client().from("imc_game_worlds").select("game_world_id,name,game_world_type,imc_season").eq("game_world_id",world).maybeSingle();
  if(metaR.error)throw metaR.error;
  if(!metaR.data)throw new Error("Game World non trovato.");

  const globalP=fetchAll("competition_codex_global","sm_action,competition_class,worlds","sm_action",true);
  const registryP=fetchAll(worldTable(world,"_gw_competitions"),"*","competition_key",true);
  const resultsP=fetchAll(worldTable(world,"_results"),"raw_match_id,season_number,sm_fixture_id,source_page_date,home_name,away_name,home_score,away_score,home_penalties,away_penalties,decided_on_penalties,penalty_text,sm_action,sm_division,sm_country,sm_round_label","source_page_date",false);
  const scheduleP=fetchAll(worldTable(world,"_schedule"),"schedule_id,season_id,matchday_number,match_date,sm_action,sm_division,sm_country,sm_round_label,sm_fixture_id,home_name,away_name","match_date",true);
  const [globalRows,registryRows,resultRows,scheduleRows]=await Promise.all([globalP,registryP,resultsP,scheduleP]);

  const keyClass=classMap(globalRows,world);
  const registry=registryRows.map(r=>Object.assign({},r,{competition_class:keyClass.get(String(r.competition_key||""))||""}));
  const data={world,meta:metaR.data,global:globalRows,registry,results:resultRows,schedule:scheduleRows,resultsByKey:new Map(),scheduleByKey:new Map(),unresolvedResults:0,unresolvedSchedule:0};
  const currentSeason=metaR.data.imc_season==null?null:Number(metaR.data.imc_season);
  resultRows.forEach(row=>{
    if(currentSeason!=null&&Number(row.season_number)!==currentSeason)return;
    const key=resolveMatch(row,data);
    if(!key){data.unresolvedResults++;return;}
    if(!data.resultsByKey.has(key))data.resultsByKey.set(key,[]);
    data.resultsByKey.get(key).push(row);
  });
  const today=todayISO();
  scheduleRows.forEach(row=>{
    if(row.match_date&&String(row.match_date)<today)return;
    const key=resolveMatch(row,data);
    if(!key){data.unresolvedSchedule++;return;}
    if(!data.scheduleByKey.has(key))data.scheduleByKey.set(key,[]);
    data.scheduleByKey.get(key).push(row);
  });
  cache.set(world,data);
  return data;
}

function iconFor(row){
  const a=norm(row.sm_action);
  if(a==="league")return "🏆";
  if(a==="worldcup"||a==="interqualifier")return "🌎";
  if(norm(row.competition_class)==="international")return "🌍";
  return "🏅";
}

function categoryKey(cls){
  const n=norm(cls);
  return n==="international"?"international":n==="nations"?"nations":n==="friendly"?"friendly":"domestic";
}
function categoryLabel(key){return key==="international"?"International":key==="nations"?"Nations":key==="friendly"?"Friendly":"Domestic";}
function categoryIcon(key){return key==="international"?"🌍":key==="nations"?"🌎":key==="friendly"?"🤝":"🏠";}

function sortRegistry(rows){
  return rows.slice().sort((a,b)=>{
    const ca=norm(a.sm_country),cb=norm(b.sm_country);
    if(ca!==cb)return ca.localeCompare(cb);
    const aa=norm(a.sm_action),ab=norm(b.sm_action);
    if(aa!==ab)return aa.localeCompare(ab);
    return Number(divisionNumber(a.IMC_league_divisions)||0)-Number(divisionNumber(b.IMC_league_divisions)||0);
  });
}

function fmtDate(value){
  if(!value)return "Data non disponibile";
  const s=String(value).slice(0,10),p=s.split("-");
  return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:s;
}

function competitionName(row){return String(row&&row.sm_competition_name||row&&row.competition_key||"Competizione");}

function renderList(section,ui){
  const data=ui.data;
  const isMulti=data.meta.game_world_type==="multi_league";
  const categories=["domestic","international","nations"];
  if(!categories.includes(ui.category))ui.category="domestic";
  const q=norm(ui.search),country=ui.country;
  let rows=sortRegistry(data.registry).filter(r=>categoryKey(r.competition_class)===ui.category);
  const countries=[...new Set(rows.map(r=>String(r.sm_country||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  if(q)rows=rows.filter(r=>norm(competitionName(r)).includes(q)||norm(r.competition_key).includes(q));
  if(isMulti&&ui.category==="domestic"&&country!=="all")rows=rows.filter(r=>String(r.sm_country||"")===country);

  section.innerHTML=`<div class="imcc-wrap">
    <div class="imcc-head"><div><h1>Competitions</h1><p>${esc(data.world)} · ${esc(data.meta.name||"Game World")}${data.meta.imc_season!=null?" · Season "+esc(data.meta.imc_season):""}</p></div><span class="imcc-keyline">COMPETITION CODEX</span></div>
    <div class="imcc-tabs">${categories.map(k=>`<button type="button" data-imcc-category="${k}" class="${ui.category===k?"active":""}"><span>${categoryIcon(k)}</span>${categoryLabel(k)}</button>`).join("")}</div>
    <div class="imcc-tools"><input class="imcc-search" data-imcc-search type="search" placeholder="Cerca competizione" value="${esc(ui.search)}">${isMulti&&ui.category==="domestic"?`<select class="imcc-country" data-imcc-country><option value="all">Tutte</option>${countries.map(c=>`<option value="${esc(c)}" ${country===c?"selected":""}>${esc(c)}</option>`).join("")}</select>`:"<span></span>"}</div>
    <div class="imcc-summary"><span>${categoryLabel(ui.category)}: <strong>${rows.length}</strong> · Totale: <strong>${data.registry.length}</strong></span><span><strong>${data.meta.game_world_type==="multi_league"?"Multi League":"Single League"}</strong></span></div>
    ${rows.length?renderCompetitionRows(rows,isMulti&&ui.category==="domestic"):"<div class=\"imcc-empty\">Nessuna competizione disponibile.</div>"}
  </div>`;
  bindList(section,ui);
}

function renderCompetitionRows(rows,groupCountries){
  if(!groupCountries)return `<div class="imcc-grid">${rows.map(tileMarkup).join("")}</div>`;
  const groups=[...new Set(rows.map(r=>String(r.sm_country||"Domestic")))];
  return groups.map(country=>{
    const group=rows.filter(r=>String(r.sm_country||"Domestic")===country);
    return `<section class="imcc-country-box"><div class="imcc-country-head"><strong>${esc(country)}</strong><small>${group.length} competizion${group.length===1?"e":"i"}</small></div><div class="imcc-grid">${group.map(tileMarkup).join("")}</div></section>`;
  }).join("");
}

function tileMarkup(row){
  return `<button type="button" class="imcc-tile" data-imcc-key="${esc(row.competition_key)}"><span class="ico">${iconFor(row)}</span><strong>${esc(competitionName(row))}</strong><small>${esc(row.competition_key)}</small></button>`;
}

function bindList(section,ui){
  section.querySelectorAll("[data-imcc-category]").forEach(btn=>btn.addEventListener("click",()=>{ui.category=btn.getAttribute("data-imcc-category")||"domestic";ui.country="all";renderList(section,ui);}));
  const search=section.querySelector("[data-imcc-search]");
  if(search)search.addEventListener("input",()=>{ui.search=search.value||"";renderList(section,ui);requestAnimationFrame(()=>{const x=section.querySelector("[data-imcc-search]");if(x){x.focus();x.setSelectionRange(x.value.length,x.value.length);}});});
  const country=section.querySelector("[data-imcc-country]");
  if(country)country.addEventListener("change",()=>{ui.country=country.value||"all";renderList(section,ui);});
  section.querySelectorAll("[data-imcc-key]").forEach(btn=>btn.addEventListener("click",()=>{ui.selectedKey=btn.getAttribute("data-imcc-key")||"";ui.detailTab="results";renderDetail(section,ui);}));
}

function renderDetail(section,ui){
  const row=ui.data.registry.find(r=>String(r.competition_key)===String(ui.selectedKey));
  if(!row){ui.selectedKey="";renderList(section,ui);return;}
  const isLeague=norm(row.sm_action)==="league";
  if(!["results","standings","schedule"].includes(ui.detailTab))ui.detailTab="results";
  if(!isLeague&&ui.detailTab==="standings")ui.detailTab="results";
  const tabs=isLeague?["results","standings","schedule"]:["results","schedule"];
  section.innerHTML=`<div class="imcc-wrap"><button type="button" class="imcc-back" data-imcc-back>‹ Torna a Competitions</button>
    <div class="imcc-hero"><small>${esc(row.competition_class||"Competition")}</small><h2>${esc(competitionName(row))}</h2><p>${esc(row.competition_key)}${row.sm_country?" · "+esc(row.sm_country):""}${row.IMC_league_divisions?" · "+esc(row.IMC_league_divisions):""}</p></div>
    <div class="imcc-detail-tabs ${tabs.length===2?"two":""}">${tabs.map(t=>`<button type="button" data-imcc-tab="${t}" class="${ui.detailTab===t?"active":""}">${t==="results"?"RESULTS":t==="standings"?"STANDINGS":"SCHEDULE"}</button>`).join("")}</div>
    <div>${detailBody(row,ui)}</div></div>`;
  section.querySelector("[data-imcc-back]")?.addEventListener("click",()=>{ui.selectedKey="";renderList(section,ui);});
  section.querySelectorAll("[data-imcc-tab]").forEach(btn=>btn.addEventListener("click",()=>{ui.detailTab=btn.getAttribute("data-imcc-tab")||"results";renderDetail(section,ui);}));
}

function detailBody(row,ui){
  const key=String(row.competition_key||"");
  if(ui.detailTab==="schedule")return matchList(ui.data.scheduleByKey.get(key)||[],false);
  if(ui.detailTab==="standings")return standings(ui.data.resultsByKey.get(key)||[]);
  return matchList(ui.data.resultsByKey.get(key)||[],true);
}

function matchList(rows,played){
  if(!rows.length)return `<div class="imcc-empty">${played?"Nessun risultato disponibile.":"Nessuna partita in programma."}</div>`;
  const sorted=rows.slice().sort((a,b)=>String(played?b.source_page_date:a.match_date).localeCompare(String(played?a.source_page_date:b.match_date)));
  return `<div class="imcc-match-list">${sorted.map(r=>{
    const date=played?r.source_page_date:r.match_date;
    const round=r.sm_round_label||(r.matchday_number?"Matchday "+r.matchday_number:"");
    let score="VS",pen="";
    if(played){
      const hs=r.home_score,as=r.away_score;
      score=(hs==null||as==null)?"-":String(hs)+" - "+String(as);
      if(r.decided_on_penalties){
        if(r.home_penalties!=null&&r.away_penalties!=null)pen="Rigori "+r.home_penalties+" - "+r.away_penalties;
        else if(r.penalty_text)pen=String(r.penalty_text);
      }
    }
    return `<div class="imcc-match"><div class="imcc-meta"><span>${esc(round||"Competizione")}</span><span>${esc(fmtDate(date))}</span></div><div class="imcc-teams"><strong>${esc(r.home_name||"-")}</strong><span class="imcc-score">${esc(score)}</span><strong>${esc(r.away_name||"-")}</strong></div>${pen?`<div class="imcc-pen">${esc(pen)}</div>`:""}</div>`;
  }).join("")}</div>`;
}

function standings(rows){
  if(!rows.length)return `<div class="imcc-empty">Nessun risultato disponibile per la classifica.</div>`;
  const map=new Map();
  function team(name){const key=String(name||"").trim();if(!map.has(key))map.set(key,{name:key,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});return map.get(key);}
  rows.forEach(r=>{
    if(r.home_score==null||r.away_score==null)return;
    const h=team(r.home_name),a=team(r.away_name),hs=Number(r.home_score),as=Number(r.away_score);
    h.p++;a.p++;h.gf+=hs;h.ga+=as;a.gf+=as;a.ga+=hs;
    if(hs>as){h.w++;a.l++;h.pts+=3;}else if(hs<as){a.w++;h.l++;a.pts+=3;}else{h.d++;a.d++;h.pts++;a.pts++;}
  });
  const list=[...map.values()].map(x=>Object.assign(x,{gd:x.gf-x.ga})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name));
  return `<table class="imcc-table"><thead><tr><th class="pos">#</th><th>Club</th><th>G</th><th>V</th><th>N</th><th>P</th><th>DR</th><th>PT</th></tr></thead><tbody>${list.map((r,i)=>`<tr><td class="pos">${i+1}</td><td class="team">${esc(r.name)}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gd>0?"+":""}${r.gd}</td><td class="pts">${r.pts}</td></tr>`).join("")}</tbody></table>`;
}

async function mount(section,world){
  section.setAttribute("data-imc-competitions-mounted","1");
  section.setAttribute("data-imc-competitions-world",world);
  section.innerHTML='<div class="imcc-loading">Caricamento competizioni…</div>';
  try{
    const data=await loadData(world,false);
    if(!section.isConnected||section.getAttribute("data-imc-competitions-world")!==world)return;
    const ui={data,category:"domestic",country:"all",search:"",selectedKey:"",detailTab:"results"};
    section.__imcCompetitionsUi=ui;
    renderList(section,ui);
  }catch(error){
    if(section.isConnected)section.innerHTML=`<div class="imcc-error">Errore caricamento Competition: ${esc(error&&error.message||"errore sconosciuto")}</div>`;
  }
}

function scan(){
  document.querySelectorAll("#app .nx-competitions-index:not([data-imc-competitions-mounted])").forEach(section=>{
    const world=worldFromSection(section);
    if(validWorld(world))mount(section,world);
  });
}

function attach(){
  const app=document.getElementById("app");
  if(!app||observer)return;
  css();
  observer=new MutationObserver(scan);
  observer.observe(app,{childList:true,subtree:true});
  scan();
}

window.IMC_COMPETITIONS={version:V,mount:function(){scan();},resolveMatch:function(match,world){const data=cache.get(world);return data?resolveMatch(match,data):null;},clearCache:function(){cache.clear();}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach,{once:true});
else attach();
})();
