(function(){
  "use strict";
  if(window.__NEXUS_CORE61_PROMISE__)return;

  const VERSION="61.0-core";
  const SOURCE="js/app-core-56.js?v=56.0-build61-source";

  function replaceOnce(source,oldValue,newValue,label){
    const first=source.indexOf(oldValue),last=source.lastIndexOf(oldValue);
    if(first<0||first!==last)throw new Error("Build 61 core: "+label+" occurrence mismatch");
    return source.slice(0,first)+newValue+source.slice(first+oldValue.length);
  }

  window.__NEXUS_CORE61_PROMISE__=(async function(){
    const response=await fetch(SOURCE,{cache:"no-store"});
    if(!response.ok)throw new Error("Build 61 core: source load failed ("+response.status+")");
    let source=await response.text();

    source=replaceOnce(source,'const NEXUS_BUILD = "56";','const NEXUS_BUILD = "61";',"build marker");

    source=replaceOnce(
      source,
      '<b>${nexusNavIcon("clubs")}</b><span>CLUBS</span>',
      '<b>${nexusNavIcon("clubs")}</b><span>${/^GW\\d{3}$/.test(state.selectedWorld||"")?"TEAM HUB":"CLUBS"}</span>',
      "unified Team Hub label"
    );

    source=replaceOnce(
      source,
      '            <button data-world-section="national" class="${state.worldSection==="national" ? "active" : ""}">\n              <b>${nexusNavIcon("national")}</b><span>NAZIONALI</span>\n            </button>',
      '            ${/^GW\\d{3}$/.test(state.selectedWorld||"")?"":`<button data-world-section="national" class="${state.worldSection==="national" ? "active" : ""}">\n              <b>${nexusNavIcon("national")}</b><span>NAZIONALI</span>\n            </button>`}',
      "unified national nav"
    );

    source=replaceOnce(
      source,
      '      }else{\n        if(state.selectedManager){\n          root.innerHTML = managerProfilePage();\n          bindManagerProfile();\n        }else{\n          root.innerHTML = managerRegistryPage();\n          bindManagerRegistry();\n        }\n      }\n      return;',
      '      }else{\n        if(/^GW\\d{3}$/.test(state.selectedWorld||"")){\n          root.innerHTML = "";\n        }else if(state.selectedManager){\n          root.innerHTML = managerProfilePage();\n          bindManagerProfile();\n        }else{\n          root.innerHTML = managerRegistryPage();\n          bindManagerRegistry();\n        }\n      }\n      return;',
      "unified manager renderer"
    );

    source=replaceOnce(
      source,
      '<button data-page="stats" class="${state.page==="stats"?"active":""}"><b>${nexusNavIcon("stats")}</b><span>STATS</span></button>',
      '${/^GW\\d{3}$/.test(state.selectedWorld||"")?"":`<button data-page="stats" class="${state.page==="stats"?"active":""}"><b>${nexusNavIcon("stats")}</b><span>STATS</span></button>`}',
      "unified stats nav"
    );

    source=replaceOnce(
      source,
      '<button data-page="h2h" class="${state.page==="h2h"?"active":""}"><b>${nexusNavIcon("h2h")}</b><span>H2H</span></button>',
      '${/^GW\\d{3}$/.test(state.selectedWorld||"")?"":`<button data-page="h2h" class="${state.page==="h2h"?"active":""}"><b>${nexusNavIcon("h2h")}</b><span>H2H</span></button>`}',
      "unified h2h nav"
    );

    source=replaceOnce(
      source,
      '<button data-page="trophies" class="${state.worldSection==="trophy-room"||state.page==="trophies"?"active":""}"><b>${nexusNavIcon("trophy")}</b><span>TROPHY ROOM</span></button>',
      '${/^GW\\d{3}$/.test(state.selectedWorld||"")?"":`<button data-page="trophies" class="${state.worldSection==="trophy-room"||state.page==="trophies"?"active":""}"><b>${nexusNavIcon("trophy")}</b><span>TROPHY ROOM</span></button>`}',
      "unified trophy nav"
    );

    window.__NEXUS_CORE_BUILD__="61";
    window.__NEXUS_CORE_ADAPTER_VERSION__=VERSION;
    (new Function(source+"\n//# sourceURL=app-core-61-runtime.js"))();
    return true;
  })().catch(function(error){
    console.error("[Build 61 core]",error);
    const boot=document.getElementById("boot");
    if(boot)boot.innerHTML='<main class="fatal"><h1>Errore avvio Nexus</h1><p>'+String(error&&error.message||error)+'</p></main>';
    throw error;
  });
})();
