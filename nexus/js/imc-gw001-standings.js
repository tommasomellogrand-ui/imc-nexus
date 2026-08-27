(function(){
  "use strict";

  if(window.__IMC_GW001_STANDINGS_V1__) return;
  window.__IMC_GW001_STANDINGS_V1__=true;

  const VERSION="1.0.0-nexus-sport";
  const WORLD="GW001";
  const STYLE_ID="imcGw001StandingsV1Css";
  let timer=null;
  let refreshTimer=null;
  let loading=false;

  const clean=value=>String(value==null?"":value).replace(/\s+/g," ").trim();
  const esc=value=>clean(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  const norm=value=>clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const signed=value=>{const n=Number(value||0);return n>0?"+"+n:String(n);};

  function installCss(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
#divisionContent .nx-gw001-standings-v1{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#0b1c4d;background:#fff}
#divisionContent .nx-gw001-standings-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:4px 0 18px;padding:4px 3px 14px;border-bottom:1px solid #e4e9f2}
#divisionContent .nx-gw001-standings-head h2{margin:0;color:#0a1d52;font-size:31px;font-weight:950;line-height:.92;letter-spacing:-.055em;text-transform:uppercase}
#divisionContent .nx-gw001-standings-head p{margin:7px 0 0;color:#4f66e8;font-size:8px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}
#divisionContent .nx-gw001-matchday-pill{flex:0 0 auto;padding:8px 11px;border:1px solid #e3e8f1;border-radius:999px;background:#fff;color:#5b6982;font-size:7px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;box-shadow:0 3px 10px rgba(20,39,83,.035)}
#divisionContent .nx-gw001-standings-labels{display:grid;grid-template-columns:30px minmax(0,1fr) repeat(4,29px) 45px 54px;gap:4px;align-items:center;padding:0 11px 7px;color:#76839a;font-size:6.5px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}
#divisionContent .nx-gw001-standings-labels span:not(:nth-child(2)){text-align:center}
#divisionContent .nx-gw001-standing-list{display:grid;gap:7px}
#divisionContent .nx-gw001-standing-row{position:relative;display:grid;grid-template-columns:30px minmax(0,1fr) repeat(4,29px) 45px 54px;gap:4px;align-items:center;min-height:59px;padding:7px 9px 7px 12px;border:1px solid #e3e8f1;border-radius:17px;background:#fff;box-shadow:0 4px 14px rgba(20,39,83,.045);overflow:hidden}
#divisionContent .nx-gw001-standing-row:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#aeb8cc}
#divisionContent .nx-gw001-standing-row.zone-title:before{background:#13b94f}
#divisionContent .nx-gw001-standing-row.zone-blue:before{background:#2f7df4}
#divisionContent .nx-gw001-standing-row.zone-purple:before{background:#7a35ef}
#divisionContent .nx-gw001-standing-row.zone-red:before{background:#f12634}
#divisionContent .nx-gw001-pos{font-size:14px;font-weight:950;text-align:center;color:#0a1d52}
#divisionContent .nx-gw001-club{display:grid;grid-template-columns:34px minmax(0,1fr);gap:8px;align-items:center;min-width:0}
#divisionContent .nx-gw001-club-logo{display:flex;align-items:center;justify-content:center;width:34px;height:34px;overflow:hidden}
#divisionContent .nx-gw001-club-logo img{display:block;max-width:100%;max-height:100%;object-fit:contain}
#divisionContent .nx-gw001-club-fallback{display:flex;align-items:center;justify-content:center;width:31px;height:31px;border-radius:50%;background:#eff3f9;color:#183268;font-size:8px;font-weight:950}
#divisionContent .nx-gw001-club strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#0b1c4d;font-size:9px;font-weight:900;text-transform:uppercase}
#divisionContent .nx-gw001-stat{color:#102451;font-size:8px;font-weight:850;text-align:center}
#divisionContent .nx-gw001-gd{font-size:8px;font-weight:900;text-align:center;color:#172a55}
#divisionContent .nx-gw001-points{display:flex;align-items:center;justify-content:center;min-height:37px;border-radius:13px;background:#091c4d;color:#fff;font-size:16px;font-weight:950;line-height:1;box-shadow:inset 0 -2px 0 rgba(255,255,255,.05)}
#divisionContent .zone-title .nx-gw001-points{background:#14b94f}
#divisionContent .zone-blue .nx-gw001-points{background:#2168ed}
#divisionContent .zone-purple .nx-gw001-points{background:#722de7}
#divisionContent .zone-red .nx-gw001-points{background:#f12634}
#divisionContent .nx-gw001-standings-legend{display:flex;flex-wrap:wrap;gap:10px 15px;margin-top:16px;padding:11px 5px 2px;color:#718097;font-size:6.5px;font-weight:850;text-transform:uppercase}
#divisionContent .nx-gw001-standings-legend span{display:flex;align-items:center;gap:5px}
#divisionContent .nx-gw001-standings-legend i{display:block;width:13px;height:4px;border-radius:4px;background:#aeb8cc}
#divisionContent .nx-gw001-standings-legend .green{background:#13b94f}.nx-gw001-standings-legend .blue{background:#2f7df4}.nx-gw001-standings-legend .purple{background:#7a35ef}.nx-gw001-standings-legend .red{background:#f12634}
#divisionContent .nx-gw001-standings-loading{padding:45px 12px;text-align:center;color:#718097;font-size:9px;font-weight:850}
@media(max-width:390px){
  #divisionContent .nx-gw001-standings-head h2{font-size:28px}
  #divisionContent .nx-gw001-standings-labels,#divisionContent .nx-gw001-standing-row{grid-template-columns:27px minmax(0,1fr) repeat(3,24px) 39px 48px;gap:3px}
  #divisionContent .nx-gw001-standings-labels .losses,#divisionContent .nx-gw001-standing-row .losses{display:none}
  #divisionContent .nx-gw001-standing-row{min-height:56px;padding-left:9px;padding-right:7px}
  #divisionContent .nx-gw001-club{grid-template-columns:30px minmax(0,1fr);gap:6px}
  #divisionContent .nx-gw001-club-logo{width:30px;height:30px}
  #divisionContent .nx-gw001-club strong{font-size:8px}
  #divisionContent .nx-gw001-stat,#divisionContent .nx-gw001-gd{font-size:7.4px}
  #divisionContent .nx-gw001-points{min-height:35px;font-size:15px}
}
`;
    document.head.appendChild(style);
  }

  function currentWorld(){
    const nodes=document.querySelectorAll(".nx-competition-cover-copy p,.nx-competitions-title p,#openDrawerWorld strong,.nx-sport-world strong");
    for(const node of nodes){
      const text=clean(node.textContent);
      const match=text.match(/GW\d{3}/i);
      if(match)return match[0].toUpperCase();
      if(norm(text)==="road to history")return WORLD;
    }
    return "";
  }

  function activeContext(){
    if(currentWorld()!==WORLD)return null;
    const tab=document.querySelector('[data-div-tab="standings"].active');
    const target=document.getElementById("divisionContent");
    const title=document.querySelector(".nx-competition-cover-copy h1");
    if(!tab||!target||!title)return null;
    const match=clean(title.textContent).match(/(?:Division|League\s+Div)\s+(\d+)/i);
    if(!match)return null;
    return {target,division:String(Number(match[1])),title:"DIVISION "+Number(match[1])};
  }

  function initials(name){
    return clean(name).split(" ").filter(Boolean).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()||"?";
  }

  function zoneClass(position,total){
    if(position===1)return "zone-title";
    if(position>=2&&position<=Math.min(4,total))return "zone-blue";
    if(position>=5&&position<=Math.min(6,total))return "zone-purple";
    if(position>Math.max(0,total-2))return "zone-red";
    return "zone-neutral";
  }

  function buildStandings(rows){
    const seasons=rows.map(r=>Number(r.season_number)).filter(Number.isFinite);
    const season=seasons.length?Math.max(...seasons):null;
    const current=season==null?rows:rows.filter(r=>Number(r.season_number)===season);
    const byFixture=new Map();
    current.forEach(row=>{
      const key=row.sm_fixture_id!=null?String(row.sm_fixture_id):[row.source_page_date,row.home_name,row.away_name].join("|");
      byFixture.set(key,row);
    });
    const played=[...byFixture.values()].filter(row=>row.home_score!=null&&row.away_score!=null);
    const table=new Map();

    function ensure(name){
      const key=norm(name);
      if(!table.has(key))table.set(key,{team_name:clean(name),played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,points:0});
      return table.get(key);
    }

    played.forEach(row=>{
      const home=ensure(row.home_name),away=ensure(row.away_name);
      const hs=Number(row.home_score),as=Number(row.away_score);
      home.played+=1;away.played+=1;
      home.gf+=hs;home.ga+=as;away.gf+=as;away.ga+=hs;
      if(hs>as){home.won+=1;away.lost+=1;home.points+=3;}
      else if(hs<as){away.won+=1;home.lost+=1;away.points+=3;}
      else{home.drawn+=1;away.drawn+=1;home.points+=1;away.points+=1;}
    });

    const standings=[...table.values()].map(row=>{row.gd=row.gf-row.ga;return row;}).sort((a,b)=>{
      if(b.points!==a.points)return b.points-a.points;
      if(b.gd!==a.gd)return b.gd-a.gd;
      if(b.gf!==a.gf)return b.gf-a.gf;
      return a.team_name.localeCompare(b.team_name,"it");
    });
    return {season,standings,matchday:standings.reduce((max,row)=>Math.max(max,row.played),0)};
  }

  async function loadLogos(names){
    const client=window.__IMC_NEXUS_CLIENT__;
    const map=new Map();
    if(!client||!names.length)return map;
    const result=await client.from("club_codex_global").select("n,i").in("n",names);
    if(result.error)throw result.error;
    (result.data||[]).forEach(row=>map.set(norm(row.n),clean(row.i)));
    return map;
  }

  function logoMarkup(name,logoFile){
    if(!logoFile)return `<span class="nx-gw001-club-fallback">${esc(initials(name))}</span>`;
    const src=`assets/clubs/${esc(logoFile)}`;
    return `<img src="${src}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="nx-gw001-club-fallback" style="display:none">${esc(initials(name))}</span>`;
  }

  function render(context,data,logos){
    const rows=data.standings||[];
    if(!rows.length){
      context.target.innerHTML='<div class="nx-empty-box"><strong>Classifica non disponibile</strong><span>Nessun risultato League importato per questa divisione.</span></div>';
      return;
    }
    context.target.innerHTML=`<section class="nx-gw001-standings-v1" data-version="${VERSION}">
      <header class="nx-gw001-standings-head">
        <div><h2>${esc(context.title)}</h2><p>League Standings</p></div>
        <span class="nx-gw001-matchday-pill">Matchday ${esc(data.matchday)}</span>
      </header>
      <div class="nx-gw001-standings-labels" aria-hidden="true">
        <span>Pos</span><span>Club</span><span>PG</span><span>V</span><span>N</span><span class="losses">P</span><span>DR</span><span>PTS</span>
      </div>
      <div class="nx-gw001-standing-list">
        ${rows.map((row,index)=>{
          const pos=index+1;
          const logo=logos.get(norm(row.team_name))||"";
          return `<article class="nx-gw001-standing-row ${zoneClass(pos,rows.length)}">
            <span class="nx-gw001-pos">${pos}</span>
            <div class="nx-gw001-club"><span class="nx-gw001-club-logo">${logoMarkup(row.team_name,logo)}</span><strong>${esc(row.team_name)}</strong></div>
            <span class="nx-gw001-stat">${row.played}</span>
            <span class="nx-gw001-stat">${row.won}</span>
            <span class="nx-gw001-stat">${row.drawn}</span>
            <span class="nx-gw001-stat losses">${row.lost}</span>
            <span class="nx-gw001-gd">${esc(signed(row.gd))}</span>
            <strong class="nx-gw001-points">${row.points}</strong>
          </article>`;
        }).join("")}
      </div>
      <footer class="nx-gw001-standings-legend">
        <span><i class="green"></i>Title zone</span>
        <span><i class="blue"></i>Champions League</span>
        <span><i class="purple"></i>Europa League</span>
        <span><i class="red"></i>Relegation zone</span>
      </footer>
    </section>`;
  }

  async function apply(force){
    const context=activeContext();
    if(!context||loading)return;
    if(!force&&context.target.querySelector('.nx-gw001-standings-v1'))return;
    const client=window.__IMC_NEXUS_CLIENT__;
    if(!client)return;
    loading=true;
    if(!context.target.querySelector('.nx-gw001-standings-v1'))context.target.innerHTML='<div class="nx-gw001-standings-loading">Caricamento classifica…</div>';
    try{
      const result=await client.from("gw001_results")
        .select("raw_match_id,season_number,sm_fixture_id,source_page_date,home_name,away_name,home_score,away_score,sm_action,sm_division")
        .eq("game_world_id",WORLD)
        .eq("sm_action","league")
        .eq("sm_division",context.division)
        .order("source_page_date",{ascending:true})
        .order("raw_match_id",{ascending:true});
      if(result.error)throw result.error;
      const latest=activeContext();
      if(!latest||latest.target!==context.target||latest.division!==context.division)return;
      const data=buildStandings(result.data||[]);
      const logos=await loadLogos(data.standings.map(row=>row.team_name));
      render(context,data,logos);
    }catch(error){
      console.error("Nexus GW001 standings",error);
      if(context.target)context.target.innerHTML='<div class="nx-empty-box"><strong>Errore classifica</strong><span>Impossibile leggere i risultati GW001.</span></div>';
    }finally{
      loading=false;
    }
  }

  function schedule(force){
    clearTimeout(timer);
    timer=setTimeout(()=>apply(!!force),35);
  }

  function start(){
    installCss();
    schedule(false);
    new MutationObserver(()=>schedule(false)).observe(document.documentElement,{childList:true,subtree:true});
    document.addEventListener("click",event=>{
      if(event.target&&event.target.closest&&event.target.closest('[data-div-tab="standings"]'))schedule(true);
    },true);
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)schedule(true);});
    window.addEventListener("pageshow",()=>schedule(true));
    refreshTimer=setInterval(()=>{if(activeContext())apply(true);},30000);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();

  window.IMC_GW001_STANDINGS={version:VERSION,refresh:()=>apply(true)};
})();
