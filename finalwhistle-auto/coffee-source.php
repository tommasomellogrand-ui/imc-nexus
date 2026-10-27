<?php
declare(strict_types=1);
require dirname(__DIR__).'/core/bootstrap.php';
require __DIR__.'/coffee-source-lib.php';
header('Cache-Control: no-store, max-age=0');
try {
 $date=(string)($_GET['date']??'');$dt=DateTimeImmutable::createFromFormat('!Y-m-d',$date);
 if(!$dt||$dt->format('Y-m-d')!==$date)throw new InvalidArgumentException('invalid_date');
 $html=__DIR__.'/coffee-time/'.$date.'/index.html';$legacy=__DIR__.'/'.$date.'-coffee.json';
 if(is_file($legacy)){$edition=json_decode(file_get_contents($legacy),true,512,JSON_THROW_ON_ERROR);}
 elseif(is_file($html)){
  $c=nexus_config();$db=nexus_db($c,nexus_target($c,'GW001'));$rows=[];
  foreach(['Results','Schedule','Match_Report'] as $kind){$rows=array_merge($rows,nexus_rows($db,'SELECT * FROM `'.nexus_table('GW001',$kind).'` WHERE game_world_id=? AND match_date IN (?,?)',['GW001',$date,$dt->modify('-1 day')->format('Y-m-d')]));}
  $edition=fw_coffee_html(file_get_contents($html),$date,$rows);
 }
 else{nexus_out(['ok'=>true,'edition'=>null]);exit;}
 if(($edition['date']??'')!==$date||($edition['world']??'')!=='GW001')throw new RuntimeException('coffee_date_mismatch');
 $dates=[];foreach(glob(__DIR__.'/coffee-time/*/index.html')?:[] as $p){$d=basename(dirname($p));if(preg_match('/^\d{4}-\d{2}-\d{2}$/',$d))$dates[]=$d;}foreach(glob(__DIR__.'/*-coffee.json')?:[] as $p){$d=substr(basename($p),0,10);if(preg_match('/^\d{4}-\d{2}-\d{2}$/',$d))$dates[]=$d;}
 $dates=array_values(array_unique($dates));rsort($dates);$edition['editions']=$dates;
 nexus_out(['ok'=>true,'edition'=>$edition]);
}catch(InvalidArgumentException $e){nexus_out(['ok'=>false,'error'=>'invalid_date'],422);}catch(Throwable $e){error_log('Final Whistle source: '.$e->getMessage());nexus_out(['ok'=>false,'error'=>'coffee_source_unavailable'],503);}
