const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox']});try{
const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:1});
await p.goto('https://www.italianmastersclub.it/nexus/il-panno-verde/?world=GW011&tab=market',{waitUntil:'networkidle'});
await p.waitForSelector('[data-feed-state="ready"]:not([hidden])',{timeout:30000});
const data=await p.evaluate(async()=>{const r=await fetch('/nexus/il-panno-verde/flash-news.json',{cache:'no-store'});return r.json()});
if(data.world!=='GW011'||data.clubs.length!==20)throw Error('Wrong world/club registry');
const ids=new Set(data.clubs.map(c=>c.id));for(const n of data.items){if(n.id.startsWith('gw001-')||n.club_ids.some(id=>!ids.has(id)))throw Error('Cross-world news');}
if(await p.locator('[role=tab]').count()!==5)throw Error('Missing tabs');
for(const key of ['flash-news','post-match','club','mercato','ultimora']){await p.locator('#rth-tab-'+key).click();if(await p.locator('#rth-tab-'+key).getAttribute('aria-selected')!=='true')throw Error('Tab failed');}
if(JSON.stringify(await p.locator('.rth-tabs [role=tab]').allTextContents())!==JSON.stringify(['Flash News','Post Match','Club News','Mercato']))throw Error('Wrong tab order');if(await p.locator('.pv-wall-button').innerText()!=='The Fick Wall')throw Error('Wrong wall title');
await p.locator('#rth-club-trigger').click();if(await p.locator('.rth-club-option').count()!==21)throw Error('Club picker');await p.locator('.rth-club-close').click();
if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Mobile horizontal overflow');
const missing=await p.locator('.rth-news-card img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));if(missing.length)throw Error('Missing media '+missing.length);
await p.screenshot({path:'/tmp/panno-verde-market-mobile.png',fullPage:true});
console.log(JSON.stringify({verified:true,mode:'public',world:data.world,revision:data.revision,items:data.items.length,clubs:data.clubs.length,pendingClubNews:!data.items.some(i=>i.category==='club')}));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
