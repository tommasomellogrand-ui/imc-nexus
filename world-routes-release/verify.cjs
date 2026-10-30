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
 if(errors.length)throw Error('JS errors: '+errors.join(';'));
 console.log('PASS legacy redirect, competition, desktop/mobile, JS');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
