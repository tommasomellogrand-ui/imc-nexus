(function(){
"use strict";

const V="1.3-build54-repository-transfers";
const URL="https://toanuzojdkfjgucztpze.supabase.co";
const KEY="sb_publishable_DYmVU7yEavK_ddsdNMUjcg_a7HesB-l";
const OID="imcWorldTransfers54";
const CODEX_BLOCKED_WORLDS=new Set(["GW002","GW003","GW008","GW010"]);
const WORLD_BY_NAME={
  "road to history":"GW001",
  "gold 558":"GW002",
  "gold 557":"GW003",
  "world league":"GW004",
  "hall of famers":"GW005",
  "master league world":"GW006",
  "the four kingdoms":"GW007",
  "gold 1":"GW008",
  "kick off":"GW009",
  "sensible soccer academy":"GW010"
};

if(!window.supabase)return;
let cfg=null;
try{cfg=JSON.parse(localStorage.getItem("imc_nexus_config")||"null");}catch(_){ }
const db=window.supabase.createClient(cfg&&cfg.url?cfg.url:URL,cfg&&cfg.key?cfg.key:KEY);
const cache={enabled:null,names:{},transfers:new Map()};
const ui={world:null,name:null,rows:[],q:"",limit:80};

const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const validWorld=id=>/^GW(?:00[1-9]|010)$/.test(String(id||""));
const tableForWorld=id=>String(id||"").toLowerCase()+"_gw_transfers";
const initials=name=>String(name||"?").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x.charAt(0)||"").join("").toUpperCase();

function css(){
  if(document.getElementById("imcWorld54Css"))return;
  const s=document.createElement("style");
  s.id="imcWorld54Css";
  s.textContent=`
.nx-bottom.nx-bottom-b6 [data-page="transfers"]{display:none!important}
.nx-world-nav.nx-world-nav-b6{gap:5px!important;padding:6px!important}.nx-world-nav.nx-world-nav-b6 button{min-height:52px!important;padding:6px 4px!important;gap:3px!important;border-radius:12px!important}.nx-world-nav.nx-world-nav-b6 button b{display:flex!important;align-items:center!important;justify-content:center!important;width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important;margin:0 auto!important;font-size:14px!important}.nx-world-nav.nx-world-nav-b6 button b svg{width:15px!important;height:15px!important}.nx-world-nav.nx-world-nav-b6 button span{font-size:7px!important;line-height:1!important;white-space:nowrap!important}.nx-bottom.nx-bottom-b6 button{min-width:0!important;padding:6px 2px!important;gap:2px!important}.nx-bottom.nx-bottom-b6 button b{display:flex!important;align-items:center!important;justify-content:center!important;min-height:19px!important;font-size:14px!important}.nx-bottom.nx-bottom-b6 button b svg{width:16px!important;height:16px!important}.nx-bottom.nx-bottom-b6 button span{font-size:6.5px!important;line-height:1!important;white-space:nowrap!important}
#${OID}{position:fixed;inset:0;z-index:2147483100;overflow:auto;background:#fff;color:#101217;font-family:inherit}#${OID} *{box-sizing:border-box}
.t54top{position:sticky;top:0;z-index:10;display:grid;grid-template-columns:42px minmax(0,1fr) 42px;gap:8px;align-items:center;padding:10px 12px;background:rgba(255,255,255,.96);backdrop-filter:blur(16px);border-bottom:1px solid #eceff3}.t54top button{width:40px;height:40px;border:1px solid #e2e5e9;border-radius:12px;background:#fff;color:#20242b;font:inherit;font-size:19px;font-weight:900}.t54title{text-align:center;min-width:0}.t54title small{display:block;color:#16883c;font-size:8px;font-weight:950;letter-spacing:.07em}.t54title strong{display:block;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:950}
.t54main{max-width:720px;margin:auto;padding:16px 14px 34px}.t54heading{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:2px 0 14px}.t54heading h1{margin:0;font-size:29px;line-height:1;font-weight:1000;letter-spacing:-.035em}.t54heading p{margin:5px 0 0;color:#70757f;font-size:10px;font-weight:800}.t54heading p b{color:#16883c}.t54search{width:100%;height:48px;padding:0 15px;border:1px solid #e6e8eb;border-radius:14px;background:#f6f7f8;color:#11151b;font:inherit;font-size:15px;font-weight:750;outline:none}.t54search:focus{border-color:#9fd2ae;background:#fff;box-shadow:0 0 0 3px rgba(26,145,66,.08)}
.t54kpis{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:11px 0 12px}.t54kpi{min-height:68px;padding:11px 13px;border:1px solid #e5e7ea;border-radius:15px;background:#fff;box-shadow:0 3px 12px rgba(16,24,40,.025)}.t54kpi small{display:block;color:#858a93;font-size:7px;font-weight:950;letter-spacing:.05em;text-transform:uppercase}.t54kpi strong{display:block;margin-top:5px;color:#15191f;font-size:18px;line-height:1;font-weight:1000}.t54kpi:first-child strong{color:#16883c}
.t54last{display:grid;grid-template-columns:62px minmax(0,1fr) auto;gap:12px;align-items:center;min-height:118px;padding:13px;border:1px solid #dce4df;border-left:3px solid #179343;border-radius:17px;background:linear-gradient(110deg,#f7fbf8 0%,#fff 62%);box-shadow:0 7px 22px rgba(16,24,40,.055)}.t54avatar{width:60px;height:84px;display:flex;align-items:center;justify-content:center;border-radius:13px;background:linear-gradient(150deg,#0d6930,#168f46);color:#fff;font-size:21px;font-weight:1000;letter-spacing:-.04em}.t54lastcopy{min-width:0}.t54tag{display:block;color:#16883c;font-size:7.5px;font-weight:1000;letter-spacing:.08em}.t54lastcopy h2{margin:5px 0 7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:21px;line-height:1;font-weight:1000;letter-spacing:-.035em}.t54route{display:flex;align-items:center;gap:7px;min-width:0;color:#30363d;font-size:9px;font-weight:850}.t54route span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.t54route b{flex:0 0 auto;color:#199545;font-size:17px;line-height:1}.t54amount{text-align:right;white-space:nowrap}.t54amount strong{display:block;color:#b67a00;font-size:24px;line-height:1;font-weight:1000}.t54amount small{display:block;margin-top:5px;color:#91969e;font-size:7px;font-weight:900}.t54lastdate{display:block;margin-top:7px;color:#8a9098;font-size:7.5px;font-weight:850}
.t54section{display:flex;align-items:center;justify-content:space-between;margin:18px 0 8px}.t54section strong{font-size:12px;font-weight:1000;letter-spacing:.01em}.t54section span{color:#8b9098;font-size:8px;font-weight:900}.t54list{border:1px solid #e6e8eb;border-radius:17px;background:#fff;overflow:hidden}.t54row{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:10px;align-items:center;min-height:74px;padding:10px 12px;border-top:1px solid #eceef0}.t54row:first-child{border-top:0}.t54mini{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#f0f2f4;color:#4d5662;font-size:11px;font-weight:1000}.t54copy{min-width:0}.t54copy h3{margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:1.05;font-weight:1000}.t54copy p{display:flex;align-items:center;gap:6px;min-width:0;margin:6px 0 0;color:#555d67;font-size:8.5px;font-weight:800}.t54copy p span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.t54copy p b{flex:0 0 auto;color:#199545;font-size:14px}.t54side{text-align:right;white-space:nowrap}.t54side strong{display:block;color:#16883c;font-size:15px;line-height:1;font-weight:1000}.t54side time{display:block;margin-top:5px;color:#989da4;font-size:7px;font-weight:850}.t54empty{padding:24px 14px;color:#7d838c;text-align:center;font-size:10px;font-weight:800}.t54more{width:100%;min-height:44px;margin-top:10px;border:1px solid #dfe3e7;border-radius:13px;background:#fff;color:#16883c;font:inherit;font-size:9px;font-weight:1000}.t54more[hidden]{display:none}
@media(max-width:520px){.nx-world-nav.nx-world-nav-b6 button span{font-size:6.5px!important}.nx-bottom.nx-bottom-b6 button span{font-size:6px!important}.t54main{padding:14px 11px 28px}.t54heading h1{font-size:27px}.t54last{grid-template-columns:56px minmax(0,1fr) auto;gap:9px;min-height:108px;padding:11px}.t54avatar{width:54px;height:76px;font-size:18px}.t54lastcopy h2{font-size:18px}.t54amount strong{font-size:20px}.t54route{font-size:8px}.t54row{grid-template-columns:38px minmax(0,1fr) auto;gap:9px;min-height:70px;padding:9px 10px}.t54mini{width:38px;height:38px}.t54copy h3{font-size:11px}.t54copy p{font-size:7.8px}.t54side strong{font-size:14px}}
`;
  document.head.appendChild(s);
}

async function enabled(force){
  if(cache.enabled&&!force)return cache.enabled;
  const [w,e]=await Promise.all([
    db.from("imc_game_worlds").select("game_world_id,name,owner"),
    db.from("imc_player_codex_world_exceptions").select("game_world_id")
  ]);
  if(w.error)throw w.error;
  const ex=new Set(e.error?["GW004","GW007"]:(e.data||[]).map(x=>String(x.game_world_id||"")));
  const set=new Set();
  (w.data||[]).forEach(x=>{
    const id=String(x.game_world_id||"");
    cache.names[id]=x.name||id;
    if(!CODEX_BLOCKED_WORLDS.has(id)&&(x.owner==="Manager"||ex.has(id)))set.add(id);
  });
  cache.enabled=set;
  return set;
}

function world(){
  const guard=window.IMC_WORLD_CONTEXT_FIX;
  if(guard&&typeof guard.currentWorld==="function"){
    const id=guard.currentWorld();
    if(id)return id;
  }
  const header=document.querySelector("#openDrawerWorld strong,.nx-sport-world strong");
  const headerName=norm(header&&header.textContent);
  if(headerName&&WORLD_BY_NAME[headerName])return WORLD_BY_NAME[headerName];
  for(const sel of ["[data-world-id].active","[data-game-world-id].active","[data-world].active","[data-select-world].active"]){
    const e=document.querySelector(sel);
    if(e){
      const v=e.getAttribute("data-world-id")||e.getAttribute("data-game-world-id")||e.getAttribute("data-world")||e.getAttribute("data-select-world")||"";
      if(validWorld(v))return v;
    }
  }
  const n=document.querySelector(".nx-world-nav");
  if(!n)return null;
  let x=n;
  for(let i=0;i<6&&x;i++,x=x.parentElement){
    const m=String(x.textContent||"").match(/\bGW\d{3}\b/);
    if(m&&validWorld(m[0]))return m[0];
  }
  return null;
}

function openCodex(id){
  if(CODEX_BLOCKED_WORLDS.has(id))return;
  const a=window.IMC_PLAYER_CODEX_BUILD53||window.IMC_PLAYER_CODEX_BUILD52;
  if(a&&typeof a.openWorld==="function")a.openWorld(id);
}

async function menus(){
  const id=world();
  const top=document.querySelector(".nx-world-nav");
  const bot=document.querySelector(".nx-bottom.nx-bottom-b6");
  if(!id||(!top&&!bot))return;

  let set=new Set();
  try{set=await enabled(false);}catch(_){ }
  const codexOn=!CODEX_BLOCKED_WORLDS.has(id)&&set.has(id);

  if(top){
    let b=top.querySelector("[data-imc-codex-world]");
    const native=top.querySelector('[data-world-section="player-codex"]');
    if(codexOn&&!native&&!b){
      b=document.createElement("button");
      b.type="button";
      b.dataset.imcCodexWorld=id;
      b.innerHTML='<b>▣</b><span>PLAYER CODEX</span>';
      top.insertBefore(b,top.firstChild);
    }
    if(b){
      b.dataset.imcCodexWorld=id;
      b.onclick=e=>{e.preventDefault();e.stopPropagation();openCodex(id);};
    }
    if(!codexOn&&b)b.remove();
  }

  if(bot){
    bot.querySelectorAll('[data-page="transfers"]').forEach(x=>x.remove());
    let b=bot.querySelector("[data-imc-transfers-world]");
    if(validWorld(id)){
      if(!b){
        b=document.createElement("button");
        b.type="button";
        b.innerHTML='<b>⇄</b><span>TRANSFERS</span>';
        const stats=bot.querySelector('[data-page="stats"]');
        const h2h=bot.querySelector('[data-page="h2h"]');
        if(stats)stats.insertAdjacentElement("afterend",b);
        else if(h2h)h2h.insertAdjacentElement("beforebegin",b);
        else bot.appendChild(b);
      }
      b.dataset.imcTransfersWorld=id;
      b.onclick=e=>{e.preventDefault();e.stopPropagation();openTransfers(id);};
    }else if(b){
      b.remove();
    }
    bot.style.setProperty("grid-template-columns","repeat("+bot.querySelectorAll(":scope > button").length+",minmax(0,1fr))","important");
  }
}

async function getTransfers(id,force){
  if(cache.transfers.has(id)&&!force)return cache.transfers.get(id);
  const rows=[];
  let from=0;
  while(true){
    const r=await db.from(tableForWorld(id))
      .select("transfer_id,player_id,player_name,from_sm_world_club_id,club_from,to_sm_world_club_id,club_to,amount_text,transfer_date_text,imported_at")
      .order("transfer_id",{ascending:false})
      .range(from,from+999);
    if(r.error)throw r.error;
    const page=r.data||[];
    rows.push(...page);
    if(page.length<1000)break;
    from+=1000;
  }
  cache.transfers.set(id,rows);
  return rows;
}

function filteredRows(){
  const q=norm(ui.q);
  const rows=ui.rows.slice(1);
  if(!q)return rows;
  return rows.filter(x=>norm([x.player_name,x.player_id,x.club_from,x.club_to,x.amount_text,x.transfer_date_text].join(" ")).includes(q));
}

function formatImported(value){
  if(!value)return "—";
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return "—";
  return d.toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"numeric"}).replace(".","").toUpperCase();
}

function lastTransferMarkup(x){
  if(!x)return '<div class="t54empty">Nessun trasferimento disponibile.</div>';
  return `<section class="t54last">
    <div class="t54avatar">${esc(initials(x.player_name))}</div>
    <div class="t54lastcopy">
      <span class="t54tag">LAST TRANSFER</span>
      <h2>${esc(x.player_name||("Player "+x.player_id))}</h2>
      <div class="t54route"><span>${esc(x.club_from||"—")}</span><b>››</b><span>${esc(x.club_to||"—")}</span></div>
      <time class="t54lastdate">${esc(x.transfer_date_text||"")}</time>
    </div>
    <div class="t54amount"><strong>${esc(x.amount_text||"—")}</strong><small>FEE</small></div>
  </section>`;
}

function rowMarkup(x){
  return `<article class="t54row">
    <div class="t54mini">${esc(initials(x.player_name))}</div>
    <div class="t54copy">
      <h3>${esc(x.player_name||("Player "+x.player_id))}</h3>
      <p><span>${esc(x.club_from||"—")}</span><b>››</b><span>${esc(x.club_to||"—")}</span></p>
    </div>
    <div class="t54side"><strong>${esc(x.amount_text||"—")}</strong><time>${esc(x.transfer_date_text||"")}</time></div>
  </article>`;
}

function render(){
  const h=document.getElementById("t54list");
  const status=document.getElementById("t54status");
  const more=document.getElementById("t54more");
  if(!h)return;
  const all=filteredRows();
  const visible=all.slice(0,ui.limit);
  h.innerHTML=visible.map(rowMarkup).join("")||`<div class="t54empty">${ui.rows.length?"Nessun trasferimento corrisponde alla ricerca.":"Nessun trasferimento importato per "+esc(ui.world)+"."}</div>`;
  if(status)status.textContent=all.length.toLocaleString("it-IT")+" movimenti";
  if(more){
    more.hidden=visible.length>=all.length;
    more.textContent="CARICA ALTRI";
  }
}

async function load(force){
  const h=document.getElementById("t54list");
  if(h)h.innerHTML='<div class="t54empty">Caricamento trasferimenti…</div>';
  try{
    ui.rows=await getTransfers(ui.world,force);
    ui.q="";
    ui.limit=80;
    const total=document.getElementById("t54count");
    const updated=document.getElementById("t54updated");
    const last=document.getElementById("t54last");
    if(total)total.textContent=ui.rows.length.toLocaleString("it-IT");
    if(updated)updated.textContent=ui.rows.length?formatImported(ui.rows[0].imported_at):"—";
    if(last)last.innerHTML=lastTransferMarkup(ui.rows[0]||null);
    render();
  }catch(e){
    if(h)h.innerHTML='<div class="t54empty">Impossibile caricare i trasferimenti.</div>';
    console.error("IMC repository transfers Build54",e);
  }
}

async function openTransfers(id){
  if(!validWorld(id))return;
  try{await enabled(false);}catch(_){ }
  document.getElementById(OID)?.remove();
  ui.world=id;
  ui.name=cache.names[id]||id;
  ui.rows=[];
  ui.q="";
  ui.limit=80;

  const o=document.createElement("div");
  o.id=OID;
  o.innerHTML=`
    <header class="t54top">
      <button id="t54back" type="button">‹</button>
      <div class="t54title"><small>${esc(id)}</small><strong>Transfers · ${esc(ui.name)}</strong></div>
      <button id="t54refresh" type="button">↻</button>
    </header>
    <main class="t54main">
      <section class="t54heading"><div><h1>TRANSFERS</h1><p><b>${esc(id)}</b> · ${esc(ui.name)}</p></div></section>
      <input class="t54search" id="t54search" type="search" placeholder="Cerca giocatore o club…" autocomplete="off">
      <section class="t54kpis">
        <div class="t54kpi"><small>Movimenti</small><strong id="t54count">…</strong></div>
        <div class="t54kpi"><small>Ultimo aggiornamento</small><strong id="t54updated">…</strong></div>
      </section>
      <div id="t54last">${lastTransferMarkup(null)}</div>
      <div class="t54section"><strong>ULTIMI TRASFERIMENTI</strong><span id="t54status">Caricamento…</span></div>
      <section class="t54list" id="t54list"><div class="t54empty">Caricamento trasferimenti…</div></section>
      <button class="t54more" id="t54more" type="button" hidden>CARICA ALTRI</button>
    </main>`;

  document.body.appendChild(o);
  document.body.style.overflow="hidden";
  document.getElementById("t54back").onclick=()=>{o.remove();document.body.style.overflow="";};
  document.getElementById("t54refresh").onclick=()=>load(true);
  document.getElementById("t54search").oninput=e=>{ui.q=e.target.value||"";ui.limit=80;render();};
  document.getElementById("t54more").onclick=()=>{ui.limit+=80;render();};
  load(false);
}

let busy=false,t=null;
async function scan(){
  css();
  if(busy)return;
  busy=true;
  try{await menus();}finally{busy=false;}
}
new MutationObserver(()=>{clearTimeout(t);t=setTimeout(scan,80);}).observe(document.documentElement,{childList:true,subtree:true});
scan();

window.IMC_WORLD_FEATURES_BUILD53={version:V,openTransfers,refresh:()=>{cache.enabled=null;cache.transfers.clear();return scan();}};
window.IMC_WORLD_FEATURES_BUILD54=window.IMC_WORLD_FEATURES_BUILD53;
})();
