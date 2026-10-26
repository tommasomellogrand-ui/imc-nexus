const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox']});try{
const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:1});
await p.goto('https://www.italianmastersclub.it/nexus/il-panno-verde/?world=GW011&tab=market',{waitUntil:'networkidle',timeout:120000});
await p.waitForSelector('[data-feed-state="ready"]:not([hidden])',{timeout:120000});
const data=await p.evaluate(async()=>{const r=await fetch('/nexus/il-panno-verde/flash-news.json',{cache:'no-store'});return r.json()});
if(data.world!=='GW011'||data.clubs.length!==20)throw Error('Wrong world/club registry');
const market=data.items.filter(i=>i.category==='market');if(!market.length)throw Error('Market archive missing');if(new Set(market.map(i=>i.id)).size!==market.length)throw Error('Duplicate market news');
const ids=new Set(data.clubs.map(c=>c.id));for(const n of data.items){if(n.id.startsWith('gw001-')||n.club_ids.some(id=>!ids.has(id)))throw Error('Cross-world news');}
if(await p.locator('[role=tab]').count()!==5)throw Error('Missing tabs');
for(const key of ['flash-news','post-match','club','mercato','ultimora']){await p.locator('#rth-tab-'+key).click();if(await p.locator('#rth-tab-'+key).getAttribute('aria-selected')!=='true')throw Error('Tab failed');}
if(JSON.stringify(await p.locator('.rth-tabs [role=tab]').allTextContents())!==JSON.stringify(['Flash News','Post Match','Club News','Mercato']))throw Error('Wrong tab order');if(await p.locator('.pv-wall-button').innerText()!=='The Fick Wall')throw Error('Wrong wall title');
await p.locator('#rth-club-trigger').click();if(await p.locator('.rth-club-option').count()!==21)throw Error('Club picker');await p.locator('.rth-club-close').click();
if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Mobile horizontal overflow');
const missing=await p.locator('.rth-news-card img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));if(missing.length)throw Error('Missing media '+missing.length);
await p.locator('#rth-tab-post-match').click();
const posts=data.items.filter(i=>i.category==='post-match'&&i.post_match.match_date==='2026-10-25');
if(posts.length!==20||new Set(posts.map(i=>i.post_match.manager_id)).size!==20)throw Error('Expected 20 manager interviews for 25 October');
for(const item of posts){if(item.interview.length!==5)throw Error('Expected five answers');const card=p.locator('[data-news-id="'+item.id+'"]');if(await card.locator('.pv-interview-turn').count()!==5)throw Error('Interview rendering');}
if(await p.locator('.rth-news-entry:not([hidden])').count()!==data.items.filter(i=>i.category==='post-match').length)throw Error('Post Match filtering');
for(const item of posts){
 const pm=item.post_match;if(pm.round!=='1'||!['1','2'].includes(pm.division))throw Error('Wrong division/round');
 const card=p.locator('[data-news-id="'+item.id+'"]');
 if(await card.locator('.pv-score-logo').count()!==2)throw Error('Both club crests required');
 if(await card.locator('.pv-competition').innerText()!==`DIVISIONE ${pm.division} · GIORNATA 1`)throw Error('Competition heading');
 for(const [i,qa] of item.interview.entries()){if(qa.player){if(!qa.player.image)throw Error('Missing player photo '+qa.player.id);const turn=card.locator('.pv-interview-turn').nth(i);if(await turn.locator('.pv-player-photo').count()!==1)throw Error('Player photo missing from turn');const ratio=await turn.evaluate(n=>n.querySelector('.pv-player-media').getBoundingClientRect().width/n.getBoundingClientRect().width);if(Math.abs(ratio-.25)>.01)throw Error('Player column must be one quarter');}}
}
await p.waitForFunction(()=>[...document.querySelectorAll('.pv-score-logo,.pv-player-photo')].every(i=>i.complete&&i.naturalWidth>0));
if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Post Match mobile overflow');
await p.screenshot({path:'/tmp/panno-verde-postmatch-mobile.png',fullPage:true});
await p.locator('#rth-tab-ultimora').click();
if(await p.locator('.rth-news-entry:not([hidden])').count()!==data.items.length)throw Error('Wall must contain every category');
const divisionPosts=data.items.filter(i=>i.division_news?.date==='2026-10-25');
if(divisionPosts.length!==4)throw Error('Expected four division Flash News');
await p.locator('#rth-tab-flash-news').click();
for(const item of divisionPosts){
 if(item.category!=='flash'||item.published_at!=='2026-10-25T22:00:00+01:00')throw Error('Wrong Flash News time/category');
 const card=p.locator('[data-news-id="'+item.id+'"]');if(!await card.isVisible())throw Error('Flash news hidden');
 if(await card.locator('.pv-team-manager').count()!==10||await card.locator('.pv-division-logo').count()!==10)throw Error('Ten club badges and manager names required');
 if(item.division_news.kind==='results'&&await card.locator('.pv-result-row').count()!==5)throw Error('Five results required');
 if(item.division_news.kind==='standings'&&await card.locator('tbody tr').count()!==10)throw Error('Ten standings rows required');
}
await p.waitForFunction(()=>[...document.querySelectorAll('.pv-division-logo')].every(i=>i.complete&&i.naturalWidth>0));
if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Flash News mobile overflow');
await p.screenshot({path:'/tmp/panno-verde-flash-mobile.png',fullPage:true});
await p.locator('#rth-tab-ultimora').click();
await p.screenshot({path:'/tmp/panno-verde-market-mobile.png',fullPage:false});
console.log(JSON.stringify({verified:true,mode:'public',world:data.world,revision:data.revision,items:data.items.length,marketOperations:market.length,marketPhotos:market.filter(i=>i.image).length,divisionFlashNews:divisionPosts.length,postMatchInterviews:posts.length,playerPhotos:posts.reduce((n,p)=>n+p.interview.filter(q=>q.player?.image).length,0),clubs:data.clubs.length,pendingClubNews:!data.items.some(i=>i.category==='club')}));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
