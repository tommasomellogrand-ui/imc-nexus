const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium,devices}=require('playwright');
const base='https://www.italianmastersclub.it/nexus/alltoplayfor/';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true});
 try{
 const context=await browser.newContext({...devices['iPhone 13'],defaultBrowserType:undefined});const page=await context.newPage();page.setDefaultTimeout(60000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(process.env.PREVIEW==='1')await page.route(base+'**',route=>{
  let relative=new URL(route.request().url()).pathname.slice(new URL(base).pathname.length);if(!relative||relative.endsWith('/'))relative+='index.html';
  const file=path.join(__dirname,'dist',relative);if(fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file,contentType:relative.endsWith('.html')?'text/html':relative.endsWith('.css')?'text/css':relative.endsWith('.js')?'application/javascript':relative.endsWith('.json')?'application/json':'image/webp'});return route.continue();
 });
 async function open(p){await page.goto(base+p,{waitUntil:'domcontentloaded'});assert.equal(await page.locator('.atpf-pages input[type=date]:visible,.atpf-pages select:visible').count(),0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow '+p)}
 await open('');assert.equal(await page.locator('.programme-card').count(),4);assert.equal(await page.locator('a[href*="2026-10-25"]').count(),0);
 await page.locator('.programme-card').first().click();await page.waitForURL('**/rth-24/');await page.waitForFunction(()=>document.querySelector('.section-banner').naturalWidth>0);await page.screenshot({path:'/tmp/programme-rth24-mobile.png'});
 await open('coffee-time/');await page.locator('.cda-tabs').waitFor();assert.equal(await page.locator('.cda-match').count(),20);await page.locator('.edition-archive a').last().click();await page.waitForURL('**/coffee-time/2026-10-22/');await page.locator('.coffee-schedule').waitFor();
 await open('daytime/');assert.equal(await page.locator('.daytime-tabs button').count(),5);await page.locator('#daytime-tab-mercato').click();await page.waitForURL('**/daytime/mercato/');await page.locator('.daytime-market-edition').waitFor();assert.equal(await page.locator('.market-player-card').count(),10);
 await open('daytime/europa/');await page.locator('.daytime-imc-controls').waitFor();assert(await page.locator('#daytime-section-europa').isVisible());
 await open('final-whistle/');await page.waitForFunction(()=>document.querySelectorAll('.fw-match').length===20);
 await open('final-whistle/2026-10-20/');await page.locator('.pm-opening').waitFor();assert.equal(await page.locator('.pm-match').count(),8);
 await open('?section=daytime&daytime=mercato&date=2026-10-22');await page.waitForURL('**/daytime/mercato/2026-10-22/');assert(await page.locator('.daytime-market-edition').isVisible());
 await open('');await page.setViewportSize({width:375,height:812});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'/tmp/programme-home-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/tmp/programme-home-desktop.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS '+(process.env.PREVIEW?'PREVIEW':'PUBLIC')+': four programme pages, RTH24 banner, archive URLs, Coffee Time 22/23, Final Whistle 20/22, market and live IMC, legacy links, no date selectors/future previews, mobile and desktop');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
