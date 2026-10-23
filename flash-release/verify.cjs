const {chromium,devices}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),base='https://www.italianmastersclub.it/nexus/alltoplayfor/';
const preview=process.env.PREVIEW==='1';
const targets=['Riccardo Re','Pietro Nicolodi','Matteo Barzaghi','Paolo Aghemo','Marco Nosotti'];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 try{
 const context=await browser.newContext({...devices['iPhone 13'],defaultBrowserType:undefined});
 const page=await context.newPage();page.setDefaultTimeout(45000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const files={'daytime.js':'alltoplayfor-release/daytime.js','daytime.css':'alltoplayfor-release/daytime.css','coffee-day-after.js':'coffee-today/coffee-day-after.js','2026-10-23-coffee-editorial.json':'coffee-today/edition.json'};
 for(const f of fs.readdirSync(root+'/coffee-release').filter(f=>/^2026-.*-coffee.json$/.test(f)))files[f]='coffee-release/'+f;
 if(preview)await page.route(base+'**',r=>{const name=new URL(r.request().url()).pathname.split('/').pop();return files[name]?r.fulfill({path:path.join(root,files[name]),contentType:name.endsWith('.json')?'application/json':name.endsWith('.css')?'text/css':'application/javascript'}):r.continue()});
 await page.goto(base+'?section=daytime&date=2026-10-23',{waitUntil:'domcontentloaded'});
 await page.locator('#daytime-tab-flash-news').waitFor();
 const tabs=page.locator('.daytime-tabs button');assert.deepEqual(await tabs.allTextContents(),['FLASH NEWS','MERCATO','CHAMPIONS','EUROPA','CONFERENCE']);
 for(const width of [375,390,1440]){
  await page.setViewportSize({width,height:844});
  const boxes=await tabs.evaluateAll(bs=>bs.map(b=>{const r=b.getBoundingClientRect();return {y:r.y,h:r.height}}));
  assert.equal(boxes[0].y,boxes[1].y);assert.equal(boxes[2].y,boxes[3].y);assert.equal(boxes[3].y,boxes[4].y);assert(boxes[2].y>=boxes[0].y+boxes[0].h);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow at '+width);
 }
 await page.setViewportSize({width:390,height:844});
 for(const id of ['flash-news','mercato','champions','europa','conference']){
  await page.locator('#daytime-tab-'+id).click();assert(await page.locator('#daytime-section-'+id).isVisible());assert.equal(new URL(page.url()).searchParams.get('daytime'),id);
  if(['champions','europa','conference'].includes(id))await page.locator('#daytime-section-'+id+' .daytime-imc-controls').waitFor();
 }
 await page.keyboard.press('ArrowRight');assert.equal(await page.locator('.daytime-tabs [aria-selected=true]').textContent(),'FLASH NEWS');
 await page.locator('#date').fill('2026-10-24');await page.locator('#date').dispatchEvent('change');assert(await page.locator('#daytime-section-flash-news').isVisible());assert.equal(await tabs.count(),5);
 await page.locator('.daytime-back').click();assert(await page.locator('.daytime-introduction').isVisible());await tabs.first().scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/flash-navigation-mobile.png'});
 await page.goto(base+'?section=daytime&daytime=mercato&date=2026-10-22',{waitUntil:'domcontentloaded'});await page.locator('.daytime-market-edition').waitFor();assert.equal(await page.locator('.market-player-card').count(),10);
 for(const [name,file] of Object.entries(files).filter(([n])=>n.endsWith('.json'))){
  const d=preview?JSON.parse(fs.readFileSync(path.join(root,file))):await(await context.request.get(base+name+'?verify='+Date.now())).json();
  const reporters=d.divisions.flatMap(d=>d.fixtures.flatMap(f=>f.reports||f.reporters));assert.equal(reporters.length,40);assert.equal(reporters.filter(r=>r.status==='confirmed').length,25);assert.equal(reporters.filter(r=>r.status==='trial').length,15);
  for(const name of targets){const r=reporters.find(r=>r.name===name);assert.equal(r.status,'confirmed');assert.equal(r.label,'Assegnazione confermata')}
 }
 await page.goto(base+'?section=coffee-time&date=2026-10-23',{waitUntil:'domcontentloaded'});await page.locator('.cda-tabs').waitFor();
 for(const name of targets){const heading=page.locator('.cda-reports .coffee-speaker').filter({hasText:name});assert.equal(await heading.count(),1);assert((await heading.textContent()).includes('Assegnazione confermata'))}
 await page.goto(base+'?section=final-whistle&date=2026-10-25',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelectorAll('.fw-match').length===20);
 assert.deepEqual(errors,[]);console.log('PASS '+(preview?'preview':'PUBLIC')+': two rows at 375/390/1440px, five tabs, dates, live IMC sections, ten market cards, 25/15 reporters in eleven editions, Coffee Time and Final Whistle');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
