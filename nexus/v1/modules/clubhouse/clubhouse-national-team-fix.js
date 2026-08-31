(function(){
"use strict";
if(window.IMC_CLUBHOUSE_NATIONAL_TEAM_FIX)return;
const VERSION="1.0.0";
const mod=window.IMC_CLUBHOUSE;
if(!mod||mod.__nationalTeamFixWrapped){window.IMC_CLUBHOUSE_NATIONAL_TEAM_FIX={version:VERSION};return}
const previousMount=mod.mount;
mod.mount=async function(o){
  if(!o||!o.client||typeof o.client.rpc!=="function")return previousMount.call(mod,o);
  const source=o.client;
  const proxy=Object.create(source);
  proxy.rpc=function(fn,args){
    const result=source.rpc(fn,args);
    const action=String(args&&args.p_action||"").trim().toLowerCase();
    if(fn!=="imc_nexus_gateway"||action!=="club_house")return result;
    return result.then(r=>{
      if(r&&r.data&&Array.isArray(r.data.assignments)){
        r={...r,data:{...r.data,assignments:r.data.assignments.map(a=>String(a&&a.assignment_type||"").trim().toLowerCase()==="national_team"?{...a,assignment_type:"nation"}:a)}};
      }
      return r;
    });
  };
  return previousMount.call(mod,{...o,client:proxy});
};
mod.__nationalTeamFixWrapped=true;
window.IMC_CLUBHOUSE_NATIONAL_TEAM_FIX={version:VERSION};
})();