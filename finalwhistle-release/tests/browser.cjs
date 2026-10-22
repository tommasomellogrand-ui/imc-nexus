// Synthetic Results/MR responses exercise import transitions locally; never published.
const {webkit,devices}=require('/tmp/daytime-qa/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'), repo=path.resolve(root,'..');
(async()=>{
 const browser=await webkit.launch(), context=await browser.newContext({...devices['iPhone 13'],timezoneId:'Europe/Rome'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 let phase='pending';const coffee=JSON.parse(fs.readFileSync('/tmp/fw-coffee.json'));
 const f=coffee.divisions[0].fixtures[0];
 const row={game_world_id:'GW001',sm_fixture_id:f.id,match_date:coffee.date,home_sm_club_id:f.home_table.id,away_sm_club_id:f.away_table.id,result_status:'COMPLETED',home_score:0,away_score:0};
 await page.addInitScript(()=>{const original=window.setInterval;window.setInterval=(fn,ms,...args)=>{if(ms===120000)window.__refreshFinalWhistle=fn;return original(fn,ms,...args);};});
 await page.route('**/nexus/teams/matches.php?**',r=>r.fulfill({json:{ok:true,results:phase==='pending'?[]:[row],schedule:[]}}));
 await page.route('**/nexus/competitions/match-report.php?**',r=>{const id=new URL(r.request().url()).searchParams.get('fixture');return r.fulfill({json:{ok:true,row:phase==='report'&&id===String(f.id)?{...row,home_score:2,team_stats_json:JSON.stringify({home:{total_shots:10,shots_on_target:4,possession:55,corners:3,red_cards:0},away:{total_shots:5,shots_on_target:2,possession:45,corners:1,red_cards:0},scorers:[{player_name:'TEST PLAYER',minute:12,team_side:'home'}]}),players_json:JSON.stringify([{player_name:'TEST PLAYER',sm_player_id:108663,man_of_match:1,rating:9,goals:2}])}:null}});});
 await page.route('**/nexus/alltoplayfor/**',async route=>{
  const name=new URL(route.request().url()).pathname.split('/alltoplayfor/')[1]||'index.html';let file;
  if(['index.html','final-whistle.js','final-whistle.css'].includes(name))file=path.join(root,name);
  else if(name==='2026-10-22-coffee.json')file='/tmp/fw-coffee.json';
  else if(name==='2026-10-20-postmatch.json')file='/tmp/fw-data.json';
  else if(name==='portraits.json')file='/tmp/fw-portraits.json';
  else if(name==='2026-10-21-coffee.json')return route.fulfill({status:404,body:'Not found'});
  else if(name==='postmatch.js')file=path.join(root,'baseline',name);
  else if(['daytime.js','daytime.css'].includes(name))file=path.join(repo,'alltoplayfor-release',name);
  else if(fs.existsSync(path.join(repo,'alltoplayfor-release/baseline',name)))file=path.join(repo,'alltoplayfor-release/baseline',name);
  if(file)return route.fulfill({path:file});return route.continue();
 });
 await page.goto('https://www.italianmastersclub.it/nexus/alltoplayfor/?section=final-whistle&date=2026-10-22',{waitUntil:'domcontentloaded'});
 await page.locator('.fw-match').first().waitFor();assert.equal(await page.locator('.fw-match').count(),20);assert.equal(await page.locator('.fw-tabs button').count(),4);assert.equal(await page.locator('.fw-title').textContent().then(t=>t.includes('0/20 risultati')),true);
 for(let i=0;i<4;i++){await page.locator('#fw-tab-'+i).click();assert.equal(await page.locator('.fw-match:visible').count(),5);}
 await page.locator('#fw-tab-0').click();
 phase='result';await page.locator('.fw-update button').click();await page.waitForFunction(()=>document.querySelector('.fw-title').textContent.includes('1/20 risultati'));assert.match(await page.locator('#fw-match-'+f.id).textContent(),/0–0/);assert.equal(await page.locator('.fw-mvp').count(),0);
 phase='report';await page.evaluate(()=>window.__refreshFinalWhistle());await page.waitForFunction(()=>document.querySelector('.fw-title').textContent.includes('1/20 Match Report'));const card=page.locator('#fw-match-'+f.id);assert.match(await card.textContent(),/2–0/);assert.match(await card.textContent(),/punteggi diversi/);assert.equal(await card.locator('.fw-speech').count(),6);for(const rep of f.reporters)assert((await card.textContent()).includes(rep.name));assert.equal(await page.locator('.fw-match').count(),20);
 for(const width of [390,375]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow');for(const b of await page.locator('.fw-tabs button').all())assert((await b.boundingBox()).height>=44);}
 await page.locator('.fw-title').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/fw-preview-iphone.png'});
 await page.locator('#tab-coffee-time').click();await page.locator('.coffee-title-box').waitFor({state:'visible'});
 await page.locator('#tab-daytime').click();await page.locator('#daytime-tab-mercato').click();assert.equal(await page.locator('.market-player-card').count(),10);
 await page.locator('#tab-final-whistle').click();await page.locator('#prev').click();await page.waitForFunction(()=>document.querySelector('.fw-edition').textContent.includes('Nessuna edizione'));assert.equal(await page.locator('.fw-match').count(),0);
 await page.locator('#prev').click();await page.locator('#postmatch-opening').waitFor({state:'visible'});assert(!await page.locator('.fw-edition').isVisible());assert.equal(await page.locator('.pm-match').count(),8);
 assert.deepEqual(errors,[]);console.log('PASS: 20 Coffee fixtures, 4 divisions, Results→MR→correction via auto-refresh, reporters, date isolation, 20 October archive, Coffee/Daytime, WebKit 390/375px, no JS errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
