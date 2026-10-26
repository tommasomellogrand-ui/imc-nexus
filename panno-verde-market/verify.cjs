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
await p.screenshot({path:'/tmp/panno-verde-market-mobile.png',fullPage:true});
console.log(JSON.stringify({verified:true,mode:'public',world:data.world,revision:data.revision,items:data.items.length,postMatchInterviews:posts.length,playerPhotos:posts.reduce((n,p)=>n+p.interview.filter(q=>q.player?.image).length,0),clubs:data.clubs.length,pendingClubNews:!data.items.some(i=>i.category==='club')}));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
