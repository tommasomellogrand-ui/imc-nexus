const assert=require('node:assert/strict'),M=require('./site/risingstarsleague/club/model.js');
assert.equal(M.eligible('2004-10-14'),false);assert.equal(M.eligible('2004-10-15'),true);assert.equal(M.eligible('2004-10-16'),true);assert.equal(M.eligible(null),false);assert.equal(M.eligible('2006-02-30'),false);
assert.equal(M.value('1.4M'),1400000);assert.equal(M.value('200k'),200000);assert.equal(M.value(null),null);
const teams=[{world_id:1}],codex=[{player_id:1,date_of_birth:'2004-10-15',rating:80,market_value:'2M'},{player_id:2,date_of_birth:'2005-01-01',rating:90,market_value:'8M'},{player_id:3,date_of_birth:'2006-01-01',rating:null,market_value:null}];
const rosters=[{rows:[{player_id:1,roster_status:'active'},{player_id:1,roster_status:'active'},{player_id:2,roster_status:'departed'},{player_id:3,roster_status:'active'}]}];
let c=M.build(teams,codex,rosters)[0];assert.equal(c.count,2);assert.equal(c.rating,80);assert.equal(c.value,2000000);assert.equal(c.valueCount,1);
codex[0].rating=85;codex[0].market_value='4M';c=M.build(teams,codex,rosters)[0];assert.equal(c.rating,85);assert.equal(c.value,4000000);
rosters[0].rows[2].roster_status='active';c=M.build(teams,codex,rosters)[0];assert.equal(c.count,3);assert.equal(c.rating,87.5);assert.equal(c.value,6000000);
console.log('PASS eligibility boundary, missing data, deduplication, transfers and Codex updates');
