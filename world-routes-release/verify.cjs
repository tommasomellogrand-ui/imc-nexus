const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox']});try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='https://www.italianmastersclub.it/nexus/';
 for(let i=1;i<=11;i++){
  const gw='GW'+String(i).padStart(3,'0');const r=await page.goto(base+gw.toLowerCase()+'/',{waitUntil:'networkidle'});if(r.status()!==200)throw Error(gw+' HTTP '+r.status());
  const actual=await page.evaluate(()=>({world:window.NexusWorldRoute?.world,url:location.pathname,query:location.search,selected:document.querySelector('#world')?.value}));
  if(actual.world!==gw||actual.query.includes('world=')||actual.selected!==gw)throw Error('World context failed '+JSON.stringify(actual));
  console.log('PASS '+gw);
 }
 await page.goto(base+'?world=GW011&season=1',{waitUntil:'networkidle'});if(!page.url().includes('/gw011/'))throw Error('Legacy redirect failed');
 await page.locator('[data-rising-stars]').click();await page.waitForLoadState('networkidle');
 if(!page.url().includes('/gw011/risingstarsleague/'))throw Error('Competition link failed');
 for(const width of [1280,390]){await page.setViewportSize({width,height:900});await page.screenshot({path:'/tmp/world-routes-'+width+'.png',fullPage:true});const ok=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&[...document.images].every(i=>i.complete&&i.naturalWidth>0));if(!ok)throw Error('Layout/image failed '+width)}
 await page.goto(base+'gw011/risingstarsleague/club/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelectorAll('.card').length===20,{},{timeout:120000});
 if(await page.locator('.pool').filter({hasText:'Premier Pool'}).count()!==10||await page.locator('.pool').filter({hasText:'Challenger Pool'}).count()!==10)throw Error('Pool allocation mismatch');
 const total=await page.locator('#summary').innerText();console.log('PASS live clubs: '+total.replace(/\n/g,' '));
 await page.locator('.card').first().click();await page.waitForFunction(()=>document.querySelectorAll('tbody tr').length>0,{},{timeout:120000});
 const dates=await page.locator('tbody tr').evaluateAll(rows=>rows.map(r=>r.cells[2].textContent.split('/').reverse().join('-')));if(dates.some(d=>d<'2004-10-15'))throw Error('Ineligible DOB rendered');
 await page.locator('#sort').selectOption('value');
 await page.locator('#search').fill('zzzz-no-match');if(await page.locator('tbody tr').count())throw Error('Search filter failed');
 await page.locator('#search').fill('');await page.screenshot({path:'/tmp/world-routes-club-mobile.png',fullPage:true});
 if(await page.locator('#nx-world-select').inputValue()!=='GW011')throw Error('Wrong Nexus world');
 for(const width of [390,1280]){await page.setViewportSize({width,height:900});await page.screenshot({path:'/tmp/world-routes-roster-'+width+'.png',fullPage:true});const layout=await page.evaluate(()=>({columns:getComputedStyle(document.querySelector('tbody')).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth}));if(layout.columns!==(width===390?2:3)||layout.overflow)throw Error('Roster layout '+JSON.stringify(layout));}
 await page.locator('[data-view="purchases"]').click();await page.waitForFunction(()=>document.querySelector('#summary').textContent.includes('ACQUISTI ELEGGIBILI'));
 const purchaseCheck=await page.evaluate(async()=>{const club=new URLSearchParams(location.search).get('club');const tx=await fetch('/nexus/transfers/index.php?world=GW011').then(r=>r.json());const ids=new Set();for(const t of tx.rows){if(String(t.to_sm_world_club_id)===club)ids.add(String(t.player_id));if(String(t.from_sm_world_club_id)===club)for(const p of JSON.parse(t.exchange_players||'[]'))ids.add(String(p.player_id))}return [...document.querySelectorAll('tbody a.player')].every(a=>ids.has(new URL(a.href).searchParams.get('player')))});if(!purchaseCheck)throw Error('Purchase evidence mismatch');
 await page.screenshot({path:'/tmp/world-routes-purchases.png',fullPage:true});await page.locator('[data-view="roster"]').click();
 console.log('PASS live roster, purchases evidence, tabs, eligibility, sorting, search, Nexus shell and compact grids');
 if(errors.length)throw Error('JS errors: '+errors.join(';'));
 console.log('PASS legacy redirect, competition, desktop/mobile, JS');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
