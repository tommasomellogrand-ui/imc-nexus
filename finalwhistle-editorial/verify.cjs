const {chromium}=require('/tmp/fwqa/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});try{
for(const width of [390,1440]){
 const p=await b.newPage({viewport:{width,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('https://www.italianmastersclub.it/nexus/alltoplayfor/final-whistle/?date=2026-10-27');
 await p.waitForFunction(()=>document.querySelectorAll('.fw-answer').length===32,{},{timeout:90000});
 assert.equal(await p.locator('.fw-question').count(),32);assert.equal(await p.locator('.fw-story-title').count(),4);assert.equal(await p.locator('.fw-report-details').count(),4);
 for(let i=0;i<4;i++){
  await p.locator('.fw-tabs button').nth(i).click();const card=p.locator('.fw-division').nth(i);assert(await card.isVisible());
  assert.equal(await card.locator('.fw-answer').count(),8);assert.equal(await card.locator('.fw-question').count(),8);
  const content=await card.innerText();assert(content.length>4000);
  await card.locator('summary').click();assert(await card.locator('.fw-mvp').isVisible());
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 assert((await p.locator('.fw-penalties').innerText()).includes('5–4'));assert.deepEqual(errors,[]);
 console.log('PASS '+width+'px: 4 complete stories, 8 manager interviews, correct penalty score, working tabs/details, no overflow or JS errors');await p.close();
}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
