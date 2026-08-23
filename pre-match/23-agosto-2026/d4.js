Object.assign(RTH.T,{111:['Borussia Dortmund',26,24,9,'L W D W L',56.4,16.3,6.7,'https://cdn.soccerwiki.org/images/logos/clubs/392.png','RAPHINHA · 8.9'],149:['Lazio',25,28,16,'W W D W W',55.3,16.3,6.8,'https://cdn.soccerwiki.org/images/logos/clubs/111.png','K MBAPPÉ · 9.1'],142:['Dynamo Kyiv',22,23,9,'W W L W W',57.3,17.9,7.3,'https://cdn.soccerwiki.org/images/logos/clubs/347.png','J BELLINGHAM · 8.2'],148:['Roma',22,18,11,'W W D L W',51,14.1,5.3,'https://cdn.soccerwiki.org/images/logos/clubs/123.png','ENDRICK · 7.9'],139:['Legia Warszawa',20,19,17,'L W W L L',46.1,12.2,3.4,'https://cdn.soccerwiki.org/images/logos/clubs/651.png','A GRIEZMANN · 7.8'],150:['Hertha Berlino',19,21,19,'W L W L W',54.8,14.6,6.2,'https://cdn.soccerwiki.org/images/logos/clubs/404.png','F WIRTZ · 9.0'],144:['River Plate',10,13,26,'L L D W L',45.2,10.7,3.1,'https://cdn.soccerwiki.org/images/logos/clubs/282.png','F BALOGUN · 7.3'],143:['Campobasso',9,19,25,'L L W L L',45.8,14.6,5.3,'https://cdn.soccerwiki.org/images/logos/clubs/3874.png','L DÍAZ · 7.9'],146:['Club América',8,12,31,'L L L W W',43.3,10.3,2.9,'https://cdn.soccerwiki.org/images/logos/clubs/439.png','J PANICHELLI · 7.6'],145:['Flamengo',7,10,24,'W L L L L',44.9,11.1,2.7,'https://cdn.soccerwiki.org/images/logos/clubs/294.png','RODRYGO · 7.1']});RTH.D[4]=[111,149,142,148,139,150,144,143,146,145];RTH.F[4]=[[143,139],[148,142],[149,145],[146,144],[150,111]];

/* Data Room readability patch: always show both club logos */
(function(){
  function patchDataRoom(){
    var m=(location.hash||'').match(/^#data-(\d)-(\d)$/);
    if(!m) return;
    var d=Number(m[1]), i=Number(m[2]);
    if(!RTH.F[d] || !RTH.F[d][i]) return;
    var ids=RTH.F[d][i], x=RTH.T[ids[0]], y=RTH.T[ids[1]];
    if(!x || !y) return;
    var metrics=document.querySelectorAll('.metric');
    if(metrics.length<6) return;
    var values=[[x[5]+'%',y[5]+'%'],[x[6],y[6]],[x[7],y[7]],[x[2],y[2]],[x[3],y[3]],[x[1]+' PT',y[1]+' PT']];
    var labels=['POSSESSO MEDIO','TIRI / MATCH','IN PORTA / MATCH','GOL FATTI','GOL SUBITI','PUNTI IN CLASSIFICA'];
    metrics.forEach(function(box,idx){
      var label=box.querySelector('small'); if(label) label.textContent=labels[idx];
      var row=box.querySelector('.metric-v'); if(!row) return;
      row.style.gridTemplateColumns='32px minmax(0,1fr) 20px minmax(0,1fr) 32px'; row.style.gap='6px';
      row.innerHTML='<img src="'+x[8]+'" alt="'+x[0]+'"><b style="text-align:left">'+values[idx][0]+'</b><span style="font-size:8px;font-weight:900;color:#718096;text-align:center">VS</span><b class="away" style="text-align:right">'+values[idx][1]+'</b><img src="'+y[8]+'" alt="'+y[0]+'">';
      row.querySelectorAll('img').forEach(function(img){img.style.width='30px';img.style.height='30px';img.style.objectFit='contain';});
    });
  }
  var obs=new MutationObserver(patchDataRoom); obs.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('hashchange',function(){setTimeout(patchDataRoom,0);}); setTimeout(patchDataRoom,0);

  /* Global iPhone-safe navigation: every internal RTH button follows its href explicitly */
  function follow(e){
    var a=e.target.closest('a[href^="#"]'); if(!a) return;
    var target=a.getAttribute('href'); if(!target) return;
    e.preventDefault(); e.stopPropagation();
    if(location.hash===target){ if(typeof render==='function') render(); }
    else location.hash=target;
  }
  document.addEventListener('click',follow,true);
  document.addEventListener('touchend',function(e){
    var a=e.target.closest('a[href^="#"]'); if(!a) return;
    e.preventDefault(); e.stopPropagation();
    var target=a.getAttribute('href');
    if(location.hash===target){ if(typeof render==='function') render(); }
    else location.hash=target;
  },{capture:true,passive:false});
})();
