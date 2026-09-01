(function(){
"use strict";
if(window.IMC_ROAD_CHRONICLE)return;
const VERSION="1.0.0";
let state={container:null,worldId:""};
function render(){
  if(!state.container)return;
  state.container.innerHTML=`<section class="rc-page" aria-label="The Road Chronicle">
    <div class="rc-masthead">
      <div class="rc-kicker"><span></span><b>GW001 / ROAD TO HISTORY</b><span></span></div>
      <h1><small>THE ROAD</small>CHRONICLE</h1>
      <div class="rc-divider"><i></i><strong>▤</strong><i></i></div>
      <p>ROAD TO HISTORY OFFICIAL JOURNAL</p>
    </div>

    <article class="rc-cover rc-card">
      <div class="rc-copy">
        <em>COVER STORY</em>
        <h2>Cover<br>Story</h2>
        <span class="rc-arrow">→</span>
      </div>
      <div class="rc-stadium" aria-hidden="true">
        <i class="rc-stadium-sky"></i>
        <i class="rc-stadium-ring r1"></i>
        <i class="rc-stadium-ring r2"></i>
        <i class="rc-stadium-ring r3"></i>
        <i class="rc-stadium-roof"></i>
      </div>
      <div class="rc-bookmark">★</div>
    </article>

    <section class="rc-feature-grid">
      <article class="rc-featured rc-card">
        <div class="rc-copy">
          <em>FEATURED</em>
          <h2>Featured<br>Story</h2>
          <span class="rc-arrow">→</span>
        </div>
        <div class="rc-feature-art" aria-hidden="true">
          <div class="rc-flag"></div>
          <div class="rc-shield">IMC</div>
        </div>
      </article>

      <article class="rc-latest rc-card">
        <div class="rc-copy">
          <em>LATEST EDITION</em>
          <h2>Latest<br>Edition</h2>
          <span class="rc-arrow">→</span>
        </div>
        <div class="rc-edition-mini" aria-hidden="true">
          <small>THE ROAD</small>
          <strong>CHRONICLE</strong>
          <i></i>
        </div>
        <div class="rc-date-chip">▣&nbsp; ED. 01 · 12 JUL 2026</div>
      </article>
    </section>

    <section class="rc-headlines rc-card">
      <div class="rc-headline-top"><em>HEADLINES</em><span>VIEW ALL&nbsp; →</span></div>
      <div class="rc-headline-icons" aria-hidden="true">
        <i>☆</i><b>·</b><i>♙♙</i><b>·</b><i>♜</i><b>·</b><i>♛</i><b>·</b><i>▥</i><b>·</b><i>▤</i>
      </div>
    </section>
  </section>`;
}
async function mount(o){
  if(!o||!o.container)throw new Error("Road Chronicle: container mancante");
  state={container:o.container,worldId:String(o.worldId||"").trim()};
  render();
}
function unmount(){
  if(state.container)state.container.innerHTML="";
  state={container:null,worldId:""};
}
window.IMC_ROAD_CHRONICLE={version:VERSION,mount,unmount};
})();