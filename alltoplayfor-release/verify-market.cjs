const {webkit,devices}=require('/tmp/daytime-qa/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
(async()=>{const browser=await webkit.launch();const context=await browser.newContext({...devices['iPhone 13'],timezoneId:'Europe/Rome'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
if(process.env.PREVIEW==='1'){await page.route('**/nexus/alltoplayfor/**',async route=>{const u=new URL(route.request().url());let file=u.pathname.split('/alltoplayfor/')[1]||'index.html';if(['index.html','daytime.js','daytime.css'].includes(file)||file.startsWith('assets/market-')){await route.fulfill({path:path.join(__dirname,file)});}else await route.continue();});}
await page.goto('https://www.italianmastersclub.it/nexus/alltoplayfor/?section=daytime&daytime=mercato',{waitUntil:'networkidle'});
await page.locator('.daytime-market-edition').waitFor({state:'visible'});assert.equal(await page.locator('#date').inputValue(),'2026-10-22');
const deals=JSON.parse(fs.readFileSync(path.join(__dirname,'market-20261022.json'),'utf8'));
assert.equal(await page.locator('.market-player-card').count(),10);
assert.equal(await page.locator('.market-summary-item').count(),10);
for(const d of deals){const card=page.locator('#market-player-'+d.pid);assert.equal(await card.getAttribute('data-reporter'),d.reporter);for(const text of [d.name,d.price,d.fromClub,d.toClub,d.position,d.reporter])assert((await card.textContent()).includes(text));assert.equal(await card.locator('.market-speech').count(),4);assert.equal(await card.locator('.market-sources a').count(),3);}
assert.equal(new Set(deals.map(d=>d.reporter)).size,7);
for(const im of await page.locator('.daytime-market-edition img').all()){await im.scrollIntoViewIfNeeded();await im.evaluate(img=>img.decode());assert(await im.evaluate(img=>img.naturalWidth>0),'Broken image');}
assert((await page.locator('#market-player-108663').textContent()).includes('Trai Hume'));
assert((await page.locator('#market-player-58170').textContent()).includes('17 ottobre'));
await page.locator('.market-summary-item').first().click();assert.equal(new URL(page.url()).hash,'#market-player-108663');
assert.equal(await page.locator('#daytime-tab-mercato').getAttribute('aria-selected'),'true');
assert.equal(await page.locator('.daytime-tabs button:visible').count(),4);
for(const width of [390,375]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Horizontal overflow');for(const b of await page.locator('.daytime-tabs button').all()){const box=await b.boundingBox();assert(box.width>0&&box.height>=44)}}
await page.locator('#prev').click();assert.equal(await page.locator('#date').inputValue(),'2026-10-21');assert(!await page.locator('.daytime-market-edition').isVisible());assert(await page.locator('.daytime-market-empty').isVisible());assert.equal(await page.locator('.daytime-tabs button:visible').count(),4);
await page.locator('#next').click();assert(await page.locator('.daytime-market-edition').isVisible());
for(const key of ['champions','europa','conference']){await page.locator('#daytime-tab-'+key).click();assert(await page.locator('#daytime-section-'+key+' .daytime-awaiting').isVisible());assert.equal(await page.locator('#daytime-section-'+key+' .daytime-fixture').count(),0)}
await page.locator('#tab-coffee-time').click();await page.locator('.coffee-title-box').waitFor({state:'visible'});
await page.locator('#tab-final-whistle').click();await page.locator('#prev').click();await page.locator('#prev').click();await page.locator('#postmatch-opening').waitFor({state:'visible'});
assert.deepEqual(errors,[]);await page.locator('#tab-daytime').click();await page.locator('#next').click();await page.locator('#next').click();await page.locator('#daytime-tab-mercato').click();await page.locator('.daytime-market-edition').scrollIntoViewIfNeeded();await page.locator('#market-player-108663').screenshot({path:'/tmp/market-iphone.png'});
console.log('PASS: WebKit iPhone emulation 390/375px; 10 cards, exact amounts, seven reporters, decoded photos/logos, roster analysis; date isolation; four tabs; other programmes; no JS errors.');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});

