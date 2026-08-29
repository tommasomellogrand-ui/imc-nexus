(function(){
  "use strict";

  if(window.__NEXUS_VISUAL_SYSTEM_V1__) return;
  window.__NEXUS_VISUAL_SYSTEM_V1__=true;

  function norm(value){
    return String(value||"").trim().toLowerCase();
  }

  function categoryForText(text){
    var value=norm(text);
    if(!value) return "domestic";
    if(/world cup|nations|national team|qualifying|uefa nations|coppa del mondo|nazional/i.test(value)) return "nations";
    if(/imc champions|imc shield|imc super cup|champions|international|intercontinental|continental|smfa/i.test(value)) return "international";
    return "domestic";
  }

  function installOverrideCss(){
    if(document.getElementById("nexusVisualSystemRuntimeCss")) return;
    var style=document.createElement("style");
    style.id="nexusVisualSystemRuntimeCss";
    style.textContent=`
      :root{--nx-deep:#0A1F44;--nx-blue:#1565FF;--nx-gold:#F0AA17;--nx-teal:#0B8FA8}
      body,.nx-shell,.imc-competitions-all-worlds{background:linear-gradient(180deg,#fff 0%,#f8fafc 58%,#eef3f8 100%)!important;color:var(--nx-deep)!important}

      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-hero{
        border:1px solid rgba(21,101,255,.28)!important;
        background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(238,245,255,.64))!important;
        box-shadow:0 18px 44px rgba(10,31,68,.09),inset 0 1px 0 rgba(255,255,255,.98)!important;
        backdrop-filter:blur(20px) saturate(140%)!important;
        -webkit-backdrop-filter:blur(20px) saturate(140%)!important;
      }
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-hero:before{
        background:radial-gradient(circle at 82% 18%,rgba(21,101,255,.14),transparent 38%)!important;
      }
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-hero-copy strong,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-hero-copy h1{color:var(--nx-deep)!important}
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-hero-copy span,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-hero-copy small,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-trophy{color:var(--nx-blue)!important;border-color:rgba(21,101,255,.30)!important}

      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-filter{
        border:1px solid rgba(10,31,68,.12)!important;
        background:rgba(255,255,255,.72)!important;
        color:var(--nx-deep)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.96),0 6px 18px rgba(10,31,68,.04)!important;
        backdrop-filter:blur(14px)!important;
        -webkit-backdrop-filter:blur(14px)!important;
      }
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-filter.is-active{
        border-color:var(--nx-blue)!important;background:linear-gradient(135deg,#0A1F44,#1565FF)!important;color:#fff!important;box-shadow:0 8px 22px rgba(21,101,255,.22)!important
      }

      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-section-head{border-bottom-color:rgba(10,31,68,.10)!important}
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-section-head strong{color:var(--nx-deep)!important}
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-section-head span{color:#6d7890!important}
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-section-head b{background:var(--nx-deep)!important;color:#fff!important}

      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-card.imc-premium-card{
        --tone:var(--nx-blue);
        display:grid!important;
        border:1px solid color-mix(in srgb,var(--tone) 25%,#dfe7f1)!important;
        background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(243,247,252,.62))!important;
        color:var(--nx-deep)!important;
        box-shadow:0 16px 38px rgba(10,31,68,.08),inset 0 1px 0 rgba(255,255,255,.98)!important;
        backdrop-filter:blur(18px) saturate(135%)!important;
        -webkit-backdrop-filter:blur(18px) saturate(135%)!important;
      }
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-card.imc-premium-card.nx-tone-international{--tone:var(--nx-gold)}
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-card.imc-premium-card.nx-tone-nations{--tone:var(--nx-teal)}
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-comp-card.imc-premium-card:before{
        background:radial-gradient(circle at 100% 0%,color-mix(in srgb,var(--tone) 13%,transparent),transparent 38%),linear-gradient(120deg,transparent,rgba(255,255,255,.50),transparent)!important;
      }
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-visual{
        border-right:1px solid color-mix(in srgb,var(--tone) 16%,#dfe7f1)!important;
        background:linear-gradient(145deg,rgba(255,255,255,.62),color-mix(in srgb,var(--tone) 8%,#eef3f8))!important;
        color:var(--tone)!important;
      }
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-visual:before{background:linear-gradient(145deg,color-mix(in srgb,var(--tone) 12%,transparent),transparent 55%)!important}
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-badge{
        border-color:color-mix(in srgb,var(--tone) 34%,#cfd9e7)!important;
        background:rgba(255,255,255,.58)!important;color:var(--tone)!important;
        box-shadow:0 8px 18px rgba(10,31,68,.07),inset 0 1px 0 rgba(255,255,255,.98)!important;
      }
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-titleline strong,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-fact-value,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-team,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-champion strong{color:var(--nx-deep)!important}
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-chevron,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-meta b,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-fact-label,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-round strong,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-vs{color:var(--tone)!important}
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-meta,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-date,
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-champion small{color:#738096!important}
      .imc-competitions-all-worlds:not(.imc-comp-detail) .imc-premium-fact{
        border-color:rgba(10,31,68,.09)!important;background:rgba(255,255,255,.55)!important
      }

      .nx-tone-international{--nx-tone:#F0AA17!important}.nx-tone-nations{--nx-tone:#0B8FA8!important}.nx-tone-domestic{--nx-tone:#1565FF!important}
    `;
    document.head.appendChild(style);
  }

  function decorate(){
    var candidates=document.querySelectorAll(
      ".nx-competition-card,.nx-competition-detail-card,.nx-league-cover,.nx-competition-cover,.nx-cup-round-card,.nx-premium-standings,.nx-league-matchday-card,.comp-card,.imc-comp-card.imc-premium-card"
    );

    candidates.forEach(function(node){
      var category="";
      var visual=node.querySelector&&node.querySelector(".imc-premium-visual");
      if(visual&&visual.classList.contains("international")) category="international";
      else if(visual&&visual.classList.contains("nations")) category="nations";
      else category=categoryForText(node.textContent||"");

      node.classList.remove("nx-tone-domestic","nx-tone-international","nx-tone-nations");
      node.dataset.nxCompetitionTone=category;
      node.classList.add("nx-tone-"+category);
      node.dataset.nxVisualDecorated="1";
    });

    document.querySelectorAll("[data-competition-filter],.nx-competition-filter button,.world-tabs .world-tab,.imc-comp-filter").forEach(function(node){
      var text=norm(node.textContent);
      if(text.indexOf("international")>=0) node.classList.add("nx-tone-pill-international");
      else if(text.indexOf("nation")>=0) node.classList.add("nx-tone-pill-nations");
      else if(text.indexOf("domestic")>=0) node.classList.add("nx-tone-pill-domestic");
    });
  }

  installOverrideCss();

  var timer=null;
  function scheduleDecorate(){
    clearTimeout(timer);
    timer=setTimeout(decorate,50);
  }

  new MutationObserver(scheduleDecorate).observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",decorate);
  else decorate();
})();
