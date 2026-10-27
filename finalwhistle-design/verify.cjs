const {chromium}=require('/tmp/fwqa/node_modules/playwright');const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});try{
 for(const width of [390,375,1440]){
  const p=await b.newPage({viewport:{width,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  if(process.env.PREVIEW){
   await p.route('**/final-whistle/?date=*',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'index.html'))}));
   for(const [url,file,type]of [['final-whistle.js','final-whistle.js','application/javascript'],['final-whistle-design.js','design.js','application/javascript'],['final-whistle-design.css','design.css','text/css']])await p.route('**/'+url+'?*',r=>r.fulfill({contentType:type,body:fs.readFileSync(path.join(__dirname,file))}));
   await p.route('**/coffee-source.php?*',async r=>{const response=await r.fetch(),data=await response.json();data.edition.title='Il caffè della coppa: otto squadre, quattro posti';await r.fulfill({response,json:data});});
  }
  await p.goto('https://www.italianmastersclub.it/nexus/alltoplayfor/final-whistle/?date=2026-10-27');
  await p.waitForFunction(()=>document.querySelectorAll('.fw-interview').length===8,{},{timeout:90000});
  assert.equal(await p.locator('.fw-question').count(),32);assert.equal(await p.locator('.fw-answer').count(),32);
  assert.equal(await p.locator('.fw-title h2').innerText(),'La notte della coppa: otto squadre, quattro semifinaliste');
  assert(!/match report|dati|caric|disponibili/i.test(await p.locator('.fw-opening').innerText()));assert.equal(await p.locator('.fw-update').count(),0);
  assert((await p.locator('.fw-tabs').boundingBox()).height<105);
  for(let i=0;i<4;i++){
   await p.locator('.fw-tabs button').nth(i).click();const card=p.locator('.fw-division').nth(i);assert(await card.isVisible());
   assert.equal(await card.locator('.fw-interview').count(),2);assert.equal(await card.locator('.fw-pullquote').count(),2);
   assert.equal(await card.locator('.fw-answer .fw-person:visible').count(),0);
   assert.equal(await card.locator('.fw-answer p').first().evaluate(n=>getComputedStyle(n).textAlign),'left');
   for(const segment of await card.locator('.fw-segments button').all())await segment.click();
   await p.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth+1);
   const active=p.locator('.fw-tabs button[aria-selected=true]');assert.equal(await active.evaluate(n=>getComputedStyle(n).color),'rgb(255, 255, 255)');assert.equal(await active.evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(16, 31, 56)');
  }
  assert.deepEqual(errors,[]);
  await p.locator('.fw-tabs button').first().click();await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:'/tmp/fw-design-'+width+'.png'});
  console.log('PASS '+width+'px: compact score tabs, readable active state, 8 unified interviews, 32 Q&A, Coffee-linked headline, narrative intro, segment navigation');await p.close();
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
