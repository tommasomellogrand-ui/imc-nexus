const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const engine=require('./final-whistle.js');
const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'evidence/coffee.json'))).edition.divisions.flatMap(d=>d.fixtures);
(async()=>{
 let questions=0,answers=0;
 for(const f of fixtures){
  const report=JSON.parse(fs.readFileSync(path.join(__dirname,'evidence',f.id+'.json')));
  const pending=engine.buildMatch(f,'2026-10-27',null,null);assert.deepEqual(engine.commentary(pending),[]);
  const resultOnly=engine.buildMatch(f,'2026-10-27',{results:[{...report.row,result_status:'COMPLETED'}]},null);assert.deepEqual(engine.commentary(resultOnly),[]);
  const m=await engine.attachEditorial(engine.buildMatch(f,'2026-10-27',null,report));assert(engine.approvedStory(m),'Evidence fingerprint '+f.id);
  const blocks=engine.commentary(m);assert(blocks.length>=25);
  for(const side of ['home','away']){const rep=f.reporters.find(x=>x.side===side);assert.equal(blocks.filter(b=>b.kind==='question'&&b.name===rep.name).length,4);assert.equal(blocks.filter(b=>b.kind==='answer'&&b.name===f[side+'_manager']).length,4);}
  questions+=blocks.filter(b=>b.kind==='question').length;answers+=blocks.filter(b=>b.kind==='answer').length;
  const correction=await engine.attachEditorial(engine.buildMatch(f,'2026-10-27',null,{...report,row:{...report.row,home_score:99}}));assert.equal(engine.approvedStory(correction),null);assert.equal(engine.commentary(correction).filter(b=>b.kind==='answer').length,6);
  const text=blocks.map(b=>b.text).join(' ');
  if(f.id==='369328899'){assert.deepEqual(engine.approvedStory(m).penalties,[5,4]);assert(text.includes('Ruiz calcia fuori'));assert(text.includes('Atta'));}
  if(f.id==='369328900'){assert(text.includes('tripletta'));assert(text.includes('Zaccagni'));}
 }
 assert.equal(questions,32);assert.equal(answers,32);
 console.log('PASS 4 verified stories, 8 assigned reporters/managers, 32 questions, 32 answers, report gating and stale-evidence fallback');
})().catch(e=>{console.error(e);process.exit(1)});
