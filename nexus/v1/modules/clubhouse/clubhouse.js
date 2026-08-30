(function(){
"use strict";
if(window.IMC_CLUBHOUSE)return;
const VERSION="2.1.0";
const INTER="https://commons.wikimedia.org/wiki/Special:Redirect/file/FC_Internazionale_Milano_2021.svg";
const MILAN="https://commons.wikimedia.org/wiki/Special:Redirect/file/Logo_of_AC_Milan.svg";
const JUVE="https://commons.wikimedia.org/wiki/Special:Redirect/file/Juventus_FC_-_logo_black_%28Italy%2C_2020%29.svg";
let state={container:null};
function italyShield(){return '<span class="ch-italy-shield" aria-label="Italia"><i></i><i></i><i></i></span>'}
function navIcon(type){const icons={home:'⌂',feed:'▤',schedule:'▦',worlds:'◎',calendar:'▣'};return `<span class="ch-bottom-icon">${icons[type]||'•'}</span>`}
function render(){
  const root=state.container;
  if(!root)return;
  root.innerHTML=`<section class="clubhouse clubhouse-reset" data-clubhouse-version="${VERSION}">
    <div class="ch-hero-header-shell">
      <header class="ch-hero-header">
        <div class="ch-hero-logo"><img src="assets/imc-logo.png" alt="IMC"></div>
        <div class="ch-hero-brand" aria-label="Nexus Club House">
          <h1>NEXUS</h1>
          <div class="ch-hero-subtitle"><i></i><span>CLUB HOUSE</span><i></i></div>
        </div>
        <button class="ch-hero-menu" type="button" data-ch-menu aria-label="Apri menu" aria-expanded="false"><i></i><i></i><i></i></button>
      </header>
      <div class="ch-hero-drawer" data-ch-drawer hidden>
        <div class="ch-hero-drawer-head"><strong>MENU</strong><button type="button" data-ch-menu-close aria-label="Chiudi menu">×</button></div>
      </div>
    </div>

    <div class="ch-clubhouse-canvas">
      <section class="ch-mock-world" aria-label="Game World overview">
        <article class="ch-mock-card ch-mock-club">
          <span class="ch-card-kicker">IL TUO CLUB</span>
          <img class="ch-main-badge" src="${INTER}" alt="Inter">
          <strong>Inter</strong>
          <small>Serie A</small>
        </article>

        <div class="ch-world-heading">
          <strong>GW001</strong>
          <span>THE BEGINNING</span>
        </div>

        <article class="ch-mock-card ch-mock-nation">
          <span class="ch-card-kicker">LA TUA NAZIONALE</span>
          ${italyShield()}
          <strong>Italia</strong>
          <small>Nazionale</small>
        </article>

        <article class="ch-mock-card ch-mock-next">
          <span class="ch-card-kicker">NEXT MATCH</span>
          <small class="ch-match-meta">Serie A · Giornata 28</small>
          <div class="ch-fixture-row">
            <div><img src="${INTER}" alt="Inter"><b>Inter</b></div>
            <strong>VS</strong>
            <div><img src="${JUVE}" alt="Juventus"><b>Juventus</b></div>
          </div>
          <div class="ch-match-foot"><span>▣ Domani · 20:45</span><span>⌖ San Siro</span></div>
        </article>

        <div class="ch-season-core" style="--season:78%">
          <div class="ch-season-ticks"></div>
          <div class="ch-season-inner">
            <span>STAGIONE</span>
            <strong>78%</strong>
            <small>COMPLETATA</small>
          </div>
        </div>

        <article class="ch-mock-card ch-mock-last">
          <span class="ch-card-kicker">LAST MATCH</span>
          <small class="ch-match-meta">Giornata 27</small>
          <div class="ch-result-row">
            <div><img src="${MILAN}" alt="Milan"><b>Milan</b></div>
            <strong>2 - 1</strong>
            <div><img src="${INTER}" alt="Inter"><b>Inter</b></div>
          </div>
          <div class="ch-result-foot"><span>2 - 1</span><span>MVN</span></div>
        </article>
      </section>

      <section class="ch-mock-section ch-performance">
        <h2>PERFORMANCE OVERVIEW</h2>
        <div class="ch-performance-grid">
          <article><span>POSIZIONE</span><strong>1°</strong></article>
          <article><span>PUNTI</span><strong>58</strong></article>
          <article><span>GOL FATTI</span><strong>42</strong></article>
          <article><span>GOL SUBITI</span><strong>18</strong></article>
          <article class="ch-form-card"><div class="ch-form-head"><span>FORMA</span><span>ULTIME 5</span></div><div class="ch-form-bars"><i class="win"></i><i class="win tall"></i><i class="loss mid"></i><i class="win tall2"></i><i class="draw short"></i></div><div class="ch-form-labels"><b>V</b><b>V</b><b class="loss-t">P</b><b>V</b><b class="draw-t">N</b></div></article>
        </div>
      </section>

      <section class="ch-mock-section ch-competition">
        <h2>COMPETITION PULSE</h2>
        <div class="ch-competition-grid">
          <article><div class="ch-comp-ring green"><span>◆</span></div><strong>SERIE A</strong><small>1° posto</small></article>
          <article><div class="ch-comp-ring blue"><span>⚡</span></div><strong>COPPA ITALIA</strong><small>Semifinale</small></article>
          <article><div class="ch-comp-ring blue"><span>✹</span></div><strong>CHAMPIONS LEAGUE</strong><small>Ottavi</small></article>
          <article><div class="ch-comp-ring cyan"><span>⚑</span></div><strong>NATIONS LEAGUE</strong><small>Gruppo A</small></article>
        </div>
      </section>

      <section class="ch-mock-section ch-explore">
        <h2>ESPLORA GW001</h2>
        <div class="ch-explore-grid">
          <button type="button"><span>♧</span><b>TEAMS</b></button>
          <button type="button"><span>♙</span><b>MANAGERS</b></button>
          <button type="button"><span>♕</span><b>COMPETITIONS</b></button>
          <button type="button"><span>▣</span><b>RESULTS</b></button>
          <button type="button"><span>▦</span><b>SCHEDULE</b></button>
          <button type="button"><span>◇</span><b>TROPHY ROOM</b></button>
          <button type="button"><span>▥</span><b>STATS</b></button>
          <button type="button"><span>ↄ</span><b>H2H</b></button>
          <button type="button"><span>⇄</span><b>TRANSFERS</b></button>
          <button type="button"><span>▧</span><b>CODEX</b></button>
        </div>
      </section>

      <nav class="ch-bottom-nav" aria-label="Club House navigation">
        <button class="active" type="button">${navIcon('home')}<span>HOME</span></button>
        <button type="button">${navIcon('feed')}<span>FEED</span></button>
        <button type="button">${navIcon('schedule')}<span>SCHEDULE</span></button>
        <button type="button">${navIcon('worlds')}<span>WORLDS</span></button>
        <button type="button">${navIcon('calendar')}<span>CALENDAR</span></button>
      </nav>
    </div>
  </section>`;
}
async function mount(o){
  if(!o||!o.container)throw Error("Club House: container mancante");
  state={...state,...o,container:o.container};
  render();
}
function unmount(){if(state.container)state.container.innerHTML="";state.container=null}
document.addEventListener("click",e=>{
  const open=e.target.closest&&e.target.closest("[data-ch-menu]");
  if(open&&state.container&&state.container.contains(open)){
    const drawer=state.container.querySelector("[data-ch-drawer]");
    if(drawer){const show=drawer.hidden;drawer.hidden=!show;open.setAttribute("aria-expanded",String(show))}
    return;
  }
  const close=e.target.closest&&e.target.closest("[data-ch-menu-close]");
  if(close&&state.container&&state.container.contains(close)){
    const drawer=state.container.querySelector("[data-ch-drawer]");
    const button=state.container.querySelector("[data-ch-menu]");
    if(drawer)drawer.hidden=true;
    if(button)button.setAttribute("aria-expanded","false");
  }
});
window.IMC_CLUBHOUSE={version:VERSION,mount,unmount};
})();