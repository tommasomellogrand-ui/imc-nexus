<?php
require __DIR__.'/coffee-source-lib.php';
function check($ok){if(!$ok)throw new RuntimeException('assertion_failed');}
$base=dirname(__DIR__).'/coffee-20261027/';$html=file_get_contents($base.'dist/edition.html');$rows=json_decode(file_get_contents($base.'evidence/cup-schedule.json'),true)['rows'];
$out=fw_coffee_html($html,'2026-10-27',array_merge($rows,$rows));
$fixtures=array_merge(...array_column($out['divisions'],'fixtures'));
check(count($fixtures)===4);check(count(array_unique(array_column($fixtures,'id')))===4);check(count($out['reporter_portraits'])===8);
check($fixtures[0]['id']==='369328897');check($fixtures[0]['sm_action']==='leaguecup');
foreach($fixtures as $f)check(count($f['reporters'])===2);
foreach(['wrong-date','missing','ambiguous'] as $case){
 $testRows=$rows;$date='2026-10-27';
 if($case==='wrong-date')$date='2026-10-28';
 if($case==='missing')$testRows=[];
 if($case==='ambiguous'){foreach($rows as $r)if($r['sm_fixture_id']===369328897){$r['sm_fixture_id']=999999;$testRows[]=$r;break;}}
 $failed=false;try{fw_coffee_html($html,$date,$testRows);}catch(RuntimeException $e){$failed=true;}check($failed);
}
echo "PASS Coffee edition identity, four cup fixtures, eight reporters, duplicates, ambiguity, missing rows and wrong date\n";
