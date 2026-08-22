(function(){
  "use strict";

  const VERSION="1.0.0";
  const WORLD_ID="GW001";
  const SUPABASE_URL="https://toanuzojdkfjgucztpze.supabase.co";
  const SUPABASE_KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
  const STYLE_ID="imcNativeResultsScorersStyle";
  const scorerMap=new Map();
  let loaded=false;
  let loading=null;
  let decorated=0;

  window.IMC_RESULTS_SCORERS_STATUS={version:VERSION,loaded:false,rows:0,decorated:0,error:null};

  function key(date,homeId,awayId,side){
    return [String(date||""),String(homeId||""),String(awayId||""),String(side||"")].join("|");
  }

  function isoDate(value){
    const text=String(value||"").trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(text))return text;
    const m=text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(!m)return "";
    return m[3]+"-"+String(m[2]).padStart(2,"0")+"-"+String(m[1]).padStart(2,"0");
  }

  function addCss(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
      .nx-native-scorers-panel{margin:0 4px 13px;padding:8px 12px 10px;border:1px solid #e0e6f0;border-radius:15px;background:#fbfcff;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
      .nx-native-scorers-title{display:block;margin:0 0 6px;color:var(--nx-league-accent,#163B8C);font-size:8px;line-height:1;font-weight:950;letter-spacing:.05em;text-align:center;text-transform:uppercase}
      .nx-native-scorers-grid{display:grid;grid-template-columns:minmax(0,1fr) 1px minmax(0,1fr);gap:8px;align-items:center}
      .nx-native-scorers-divider{width:1px;align-self:stretch;background:#e3e8f1}
      .nx-native-scorers-side{min-width:0;color:#1d2c47;font-size:8.5px;line-height:1.35;font-weight:800;text-align:center}
      .nx-native-scorers-side b{color:#11213d;font-weight:950}
      .nx-native-scorers-side em{color:var(--nx-league-accent,#163B8C);font-style:normal;font-weight:950}
      .nx-native-scorers-empty{color:#8d98aa;font-weight:900}
      @media(max-width:520px){
        .nx-native-scorers-panel{margin:0 4px 11px;padding:7px 8px 9px;border-radius:13px}
        .nx-native-scorers-title{font-size:7px;margin-bottom:5px}
        .nx-native-scorers-grid{gap:7px}
        .nx-native-scorers-side{font-size:7.4px;line-height:1.32}
      }
    `;
    document.head.appendChild(style);
  }

  async function load(){
    if(loaded)return scorerMap;
    if(loading)return loading;
    loading=(async function(){
      if(!window.supabase)throw new Error("Supabase JS non disponibile");
      let cfg=null;
      try{cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){ }
      const url=cfg&&cfg.url?cfg.url:SUPABASE_URL;
      const apiKey=cfg&&cfg.key?cfg.key:SUPABASE_KEY;
      const client=window.supabase.createClient(url,apiKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
      const result=await client
        .from("gw_match_scorer_headers_public")
        .select("match_id,game_world_id,match_date,home_team_id,away_team_id,side,scorer_header")
        .eq("game_world_id",WORLD_ID)
        .range(0,999);
      if(result.error)throw result.error;
      (result.data||[]).forEach(function(row){
        if(!row||!row.scorer_header)return;
        scorerMap.set(key(row.match_date,row.home_team_id,row.away_team_id,row.side),String(row.scorer_header));
      });
      loaded=true;
      window.IMC_RESULTS_SCORERS_STATUS.loaded=true;
      window.IMC_RESULTS_SCORERS_STATUS.rows=(result.data||[]).length;
      return scorerMap;
    })().catch(function(error){
      window.IMC_RESULTS_SCORERS_STATUS.error=String(error&&error.message||error);
      console.error("IMC Results scorers load",error);
      loading=null;
      throw error;
    });
    return loading;
  }

  function normalize(value){
    return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  }

  function parseHeader(raw){
    let text=String(raw||"").replace(/\s+/g," ").trim();
    if(!text)return [];
    const firstNum=text.search(/\d/);
    if(firstNum>=0){
      const prefix=text.slice(0,firstNum).trim();
      const rest=text.slice(firstNum).trim();
      const tokens=prefix.split(/\s+/).filter(Boolean);
      if(tokens.length>1&&tokens.length%2===0){
        const half=tokens.length/2;
        const left=tokens.slice(0,half).join(" ");
        const right=tokens.slice(half).join(" ");
        if(normalize(left)===normalize(right))text=left+" "+rest;
      }
    }
    const re=/([^\d,]+?)\s+(\d{1,3}(?:\s+\((?:rig|autorete)\))?(?:\s*,\s*\d{1,3}(?:\s+\((?:rig|autorete)\))?)*)/giu;
    const rows=[];
    let m;
    while((m=re.exec(text))){
      const name=String(m[1]||"").trim();
      const times=String(m[2]||"").split(",").map(function(item){
        const t=String(item||"").trim().match(/^(\d{1,3})(?:\s+\((rig|autorete)\))?$/i);
        return t?{minute:Number(t[1]),kind:String(t[2]||"").toLowerCase()}:null;
      }).filter(Boolean);
      if(name&&times.length)rows.push({name:name,times:times});
    }
    return rows;
  }

  function sideNode(raw){
    const container=document.createElement("div");
    container.className="nx-native-scorers-side";
    const rows=parseHeader(raw);
    if(!rows.length){
      const empty=document.createElement("span");
      empty.className="nx-native-scorers-empty";
      empty.textContent="—";
      container.appendChild(empty);
      return container;
    }
    rows.forEach(function(row,index){
      if(index)container.appendChild(document.createTextNode(", "));
      const name=document.createElement("b");
      name.textContent=row.name;
      container.appendChild(name);
      container.appendChild(document.createTextNode(" "));
      row.times.forEach(function(time,timeIndex){
        if(timeIndex)container.appendChild(document.createTextNode(", "));
        container.appendChild(document.createTextNode(time.minute+"'"));
        if(time.kind){
          const flag=document.createElement("em");
          flag.textContent=time.kind==="rig"?" (rig.)":" (aut.)";
          container.appendChild(flag);
        }
      });
    });
    return container;
  }

  function scoreTotal(row){
    const score=row.querySelector(".nx-league-score-pill strong:not(.is-vs)");
    if(!score)return null;
    const m=String(score.textContent||"").match(/(\d+)\s*-\s*(\d+)/);
    return m?Number(m[1])+Number(m[2]):null;
  }

  function decorateRow(row){
    if(!row||row.getAttribute("data-imc-native-scorers")==="1")return false;
    const total=scoreTotal(row);
    if(total===null)return false;
    const card=row.closest(".nx-league-matchday-card");
    const time=card&&card.querySelector(".nx-unified-matchday-head time,.nx-league-matchday-head time");
    const date=isoDate(time&&time.textContent);
    const home=row.querySelector('.nx-league-result-team.home [data-match-entity-id]');
    const away=row.querySelector('.nx-league-result-team.away [data-match-entity-id]');
    if(!date||!home||!away)return false;
    const homeId=home.getAttribute("data-match-entity-id")||"";
    const awayId=away.getAttribute("data-match-entity-id")||"";
    const homeHeader=scorerMap.get(key(date,homeId,awayId,"home"))||"";
    const awayHeader=scorerMap.get(key(date,homeId,awayId,"away"))||"";
    if(total>0&&!homeHeader&&!awayHeader)return false;

    const panel=document.createElement("div");
    panel.className="nx-native-scorers-panel";
    panel.setAttribute("data-imc-native-scorer-panel","1");
    const title=document.createElement("span");
    title.className="nx-native-scorers-title";
    title.textContent="SCORERS";
    const grid=document.createElement("div");
    grid.className="nx-native-scorers-grid";
    const divider=document.createElement("span");
    divider.className="nx-native-scorers-divider";
    grid.appendChild(sideNode(homeHeader));
    grid.appendChild(divider);
    grid.appendChild(sideNode(awayHeader));
    panel.appendChild(title);
    panel.appendChild(grid);
    row.insertAdjacentElement("afterend",panel);
    row.setAttribute("data-imc-native-scorers","1");
    decorated+=1;
    window.IMC_RESULTS_SCORERS_STATUS.decorated=decorated;
    return true;
  }

  async function decorate(){
    addCss();
    try{await load();}catch(_){return;}
    document.querySelectorAll(".nx-league-result-row").forEach(decorateRow);
  }

  let timer=null;
  const observer=new MutationObserver(function(){
    clearTimeout(timer);
    timer=setTimeout(decorate,60);
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  [0,250,750,1500,3000].forEach(function(ms){setTimeout(decorate,ms);});

  window.IMC_RESULTS_SCORERS={
    version:VERSION,
    refresh:function(){
      document.querySelectorAll('[data-imc-native-scorer-panel="1"]').forEach(function(el){el.remove();});
      document.querySelectorAll('[data-imc-native-scorers="1"]').forEach(function(el){el.removeAttribute("data-imc-native-scorers");});
      decorated=0;
      window.IMC_RESULTS_SCORERS_STATUS.decorated=0;
      return decorate();
    }
  };
})();
