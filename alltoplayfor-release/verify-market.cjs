const {webkit,devices}=require('/tmp/daytime-qa/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await webkit.launch();const context=await browser.newContext({...devices['iPhone 13'],timezoneId:'Europe/Rome'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('https://www.italianmastersclub.it/nexus/alltoplayfor/?section=daytime&daytime=mercato',{waitUntil:'networkidle'});
await page.locator('.daytime-market-edition').waitFor({state:'visible'});assert.equal(await page.locator('#date').inputValue(),'2026-10-22');
const expected=['Oliveira Vanderson · Hertha BSC → AS Monaco · 12.360.000 €','Brajan Gruda · Brighton → AS Roma · 7.529.000 €','Hugo Cuenca · Sampdoria → FC Treviso · 6.240.000 €','Krisztián Lisztes · Dynamo Dresden → Bonner SC · 4.200.000 €','Ilyes Housni · Sampdoria → AS Nancy · 4.080.000 €','Dinis Rodrigues · 1. FC Kaiserslautern → Tuttocuoio · 2.828.000 €','Jeppe Kjær · Mjällby AIF → 1. FC Kaiserslautern · 1.553.000 €','Marco Sportiello · Shakhtar Donetsk → SSC Bari · 1.417.520 €','Rafael Quintas · Atlético Madrid → SL Benfica · 630.000 €','Reigan Heskey · Sampdoria → 1. FC Köln · 600.000 €'];
assert.deepEqual(await page.locator('.daytime-market-edition .daytime-fixture').allTextContents(),expected);
assert(await page.getByText('Paolo Assogna · inviato AS Roma',{exact:true}).isVisible());assert(await page.getByText('Giancarlo Marocchi · inviato Atlético Madrid',{exact:true}).isVisible());
assert.equal(await page.locator('#daytime-tab-mercato').getAttribute('aria-selected'),'true');
assert.equal(await page.locator('.daytime-tabs button:visible').count(),4);
for(const width of [390,375]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Horizontal overflow');for(const b of await page.locator('.daytime-tabs button').all()){const box=await b.boundingBox();assert(box.width>0&&box.height>=44)}}
await page.locator('#prev').click();assert.equal(await page.locator('#date').inputValue(),'2026-10-21');assert(!await page.locator('.daytime-market-edition').isVisible());assert(await page.locator('.daytime-market-empty').isVisible());assert.equal(await page.locator('.daytime-tabs button:visible').count(),4);
await page.locator('#next').click();assert(await page.locator('.daytime-market-edition').isVisible());
for(const key of ['champions','europa','conference']){await page.locator('#daytime-tab-'+key).click();assert(await page.locator('#daytime-section-'+key+' .daytime-awaiting').isVisible());assert.equal(await page.locator('#daytime-section-'+key+' .daytime-fixture').count(),0)}
await page.locator('#tab-coffee-time').click();await page.locator('.coffee-title-box').waitFor({state:'visible'});
await page.locator('#tab-final-whistle').click();await page.locator('#prev').click();await page.locator('#prev').click();await page.locator('#postmatch-opening').waitFor({state:'visible'});
assert.deepEqual(errors,[]);await page.locator('#tab-daytime').click();await page.locator('#next').click();await page.locator('#next').click();await page.locator('#daytime-tab-mercato').click();await page.locator('.daytime-market-edition').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/market-iphone.png',fullPage:true});
console.log('PASS: WebKit iPhone emulation 390/375px; 10 transfers with exact amounts; date isolation; four tabs; other programmes; no JS errors.');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
