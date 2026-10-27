const {chromium}=require('/tmp/fwqa/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let pending=true;
  await page.route('**/competitions/match-report.php?**',r=>pending?r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,row:null})}):r.continue());
  await page.goto('https://www.italianmastersclub.it/nexus/alltoplayfor/final-whistle/?date=2026-10-27');
  await page.waitForFunction(()=>document.querySelectorAll('.fw-match').length===4,{},{timeout:90000});
  assert.equal(await page.locator('#date').inputValue(),'2026-10-27');assert.equal(await page.locator('.fw-match .fw-speech').count(),0);
  pending=false;await page.getByRole('button',{name:'Aggiorna adesso'}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.fw-match .fw-speech').length>0,{},{timeout:90000});
  assert.equal(await page.locator('.fw-match').count(),4);
  const text=await page.locator('.fw-edition').innerText();assert(text.includes('4/4 Match Report'));assert(!text.includes('conquista i tre punti'));
  assert.equal(await page.locator('.fw-match .fw-speech').count(),24);
  for(let i=0;i<4;i++){await page.locator('.fw-tabs button').nth(i).click();assert(await page.locator('.fw-division').nth(i).isVisible());}
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
  console.log('PASS published mobile: same four Coffee fixtures; waiting → four reports; eight correspondents; cup commentary; archive date; tabs; no JS errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
