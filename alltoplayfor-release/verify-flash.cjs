const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  for(const width of [375,390,1440]){
   const page=await browser.newPage({viewport:{width,height:844}});
   await page.route('https://preview.test/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><input id="date" type="date" value="2026-10-23"><section id="panel-daytime"></section>'}));
   await page.goto('https://preview.test/?section=daytime');
   await page.addStyleTag({content:fs.readFileSync(__dirname+'/daytime.css','utf8')});
   await page.addScriptTag({content:fs.readFileSync(__dirname+'/daytime.js','utf8')});
   const buttons=page.locator('.daytime-tabs button');
   assert.deepEqual(await buttons.allTextContents(),['FLASH NEWS','MERCATO','CHAMPIONS','EUROPA','CONFERENCE']);
   const positions=await buttons.evaluateAll(bs=>bs.map(b=>({top:b.getBoundingClientRect().top,height:b.getBoundingClientRect().height})));
   assert.equal(positions[0].top,positions[1].top);
   assert.equal(positions[2].top,positions[3].top);
   assert.equal(positions[3].top,positions[4].top);
   assert(positions[2].top>=positions[0].top+positions[0].height);
   for(const id of ['flash-news','mercato','champions','europa','conference']){
    await page.locator('#daytime-tab-'+id).click();
    assert(await page.locator('#daytime-section-'+id).isVisible());
    assert.equal(new URL(page.url()).searchParams.get('daytime'),id);
    assert.equal(await page.locator('.daytime-tabs [aria-selected=true]').count(),1);
   }
   await page.keyboard.press('ArrowRight');
   assert.equal(await page.locator('.daytime-tabs [aria-selected=true]').textContent(),'FLASH NEWS');
   await page.locator('#date').fill('2026-10-24');
   await page.evaluate(()=>document.dispatchEvent(new Event('programme-date-change')));
   assert.equal(await buttons.count(),5);
   assert(await page.locator('#daytime-section-flash-news').isVisible());
   await page.locator('.daytime-back').click();
   assert(await page.locator('.daytime-introduction').isVisible());
   await page.locator('#date').fill('2026-10-22');
   await page.evaluate(()=>document.dispatchEvent(new Event('programme-date-change')));
   await page.locator('#daytime-tab-mercato').click();
   assert(await page.locator('.daytime-market-edition').isVisible());
   assert.equal(await page.locator('.market-player-card').count(),10);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.close();
  }
  console.log('PASS: two rows, five working tabs, keyboard, dates, unchanged ten market cards; 375/390/1440 px');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
