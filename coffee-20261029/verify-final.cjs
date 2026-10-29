const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs');
(async()=>{
 const expected=JSON.parse(fs.readFileSync(__dirname+'/dist/2026-10-29-coffee.json'));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN});
 const page=await browser.newPage({viewport:{width:390,height:900}});
 const response=await page.request.get('https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-source.php?date=2026-10-29');
 const actual=(await response.json()).edition;assert.deepEqual(actual.divisions,expected.divisions);assert.equal(actual.title,expected.title);
 await page.goto('https://www.italianmastersclub.it/nexus/alltoplayfor/final-whistle/?date=2026-10-29',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelectorAll('.fw-match').length===20,{},{timeout:90000});
 assert((await page.locator('.fw-title h2').innerText()).includes('La serata del sorpasso'));
 assert.equal(await page.locator('.fw-tabs button').count(),4);
 assert((await page.locator('#fw-match-368861485').innerText()).includes('Carlo Colombo'));
 assert(!(await page.locator('.fw-edition').innerText()).includes('Fabio Ferrini'));
 for(let i=0;i<4;i++){await page.locator('.fw-tabs button').nth(i).click();assert(await page.locator('#fw-division-'+i).isVisible());}
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:'/tmp/coffee-20261029-final-whistle.png',fullPage:true});
 await browser.close();console.log('PASS public Final Whistle: same 20 fixtures, 40 reporters/managers, title and mobile tabs');
})();
