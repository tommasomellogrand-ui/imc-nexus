const {webkit,devices}=require('/tmp/daytime-qa/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await webkit.launch(),page=await browser.newPage({...devices['iPhone 13'],timezoneId:'Europe/Rome'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('https://www.italianmastersclub.it/nexus/alltoplayfor/?section=final-whistle&date=2026-10-22',{waitUntil:'domcontentloaded'});
 await page.locator('.fw-match').first().waitFor({timeout:90000});
 assert.equal(await page.locator('.fw-match').count(),20);
 assert.equal(await page.locator('.fw-warning').count(),0,'Live sources could not be verified');
 assert.equal(await page.locator('.fw-tabs button').count(),4);
 const source=await page.request.get('https://www.italianmastersclub.it/nexus/alltoplayfor/2026-10-22-coffee.json'); const coffee=await source.json();
 assert.deepEqual(await page.locator('.fw-match').evaluateAll(nodes=>nodes.map(n=>n.dataset.fixture)),coffee.divisions.flatMap(d=>d.fixtures.map(f=>String(f.id))));
 for(let i=0;i<4;i++){await page.locator('#fw-tab-'+i).click();assert.equal(await page.locator('.fw-match:visible').count(),5);assert.equal(await page.locator('#fw-tab-'+i).getAttribute('aria-selected'),'true');}
 for(const width of [390,375]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow');for(const b of await page.locator('.fw-tabs button').all())assert((await b.boundingBox()).height>=44);}
 await page.locator('.fw-title').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/fw-live-iphone.png'});
 await page.locator('#tab-coffee-time').click();await page.locator('.coffee-title-box').waitFor({state:'visible'});
 await page.locator('#tab-daytime').click();await page.locator('#daytime-tab-mercato').click();assert.equal(await page.locator('.market-player-card').count(),10);
 await page.locator('#tab-final-whistle').click();await page.locator('#prev').click();await page.locator('#prev').click();await page.locator('#postmatch-opening').waitFor({state:'visible'});assert.equal(await page.locator('.pm-match').count(),8);assert(!await page.locator('.fw-edition').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS live: 20 exact Coffee fixtures, four working divisions, responsive 390/375px, Coffee/Daytime and old Final Whistle preserved; no JS errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
