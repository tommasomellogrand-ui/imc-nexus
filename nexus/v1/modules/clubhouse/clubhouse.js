(function(){
"use strict";
if(window.IMC_CLUBHOUSE)return;
const VERSION="2.0.0";
let state={container:null};
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
    <div class="ch-clubhouse-canvas" aria-hidden="true"></div>
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