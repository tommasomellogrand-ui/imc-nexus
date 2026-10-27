<?php
declare(strict_types=1);
// Coffee Time is the edition authority; Nexus supplies fixture identities only.
function fw_key(string $s): string { return preg_replace('/\s+/u',' ',mb_strtolower(trim($s),'UTF-8')); }
function fw_class(string $c): string { return "contains(concat(' ',normalize-space(@class),' '),' $c ')"; }
function fw_coffee_html(string $html,string $date,array $rows): array {
 $dom=new DOMDocument();libxml_use_internal_errors(true);$dom->loadHTML('<?xml encoding="UTF-8">'.$html);libxml_clear_errors();$xp=new DOMXPath($dom);
 $input=$xp->query('//*[@id="date"]')->item(0);$body=$xp->query('//body')->item(0);
 if(($body->getAttribute('data-edition')?:$input?->getAttribute('value'))!==$date)throw new RuntimeException('coffee_date_mismatch');
 $embedded=$xp->query('//script[@id="coffee-fixtures"]/text()')->item(0);
 if($embedded){$data=json_decode($embedded->nodeValue,true,512,JSON_THROW_ON_ERROR);if(($data['date']??'')!==$date||($data['world']??'')!=='GW001')throw new RuntimeException('coffee_manifest_mismatch');return $data;}
 $index=[];
 foreach($rows as $r){
  if(($r['game_world_id']??'')!=='GW001')continue;
  $id=(string)($r['sm_fixture_id']??'');if(!ctype_digit($id)||$id==='0')continue;
  $key=fw_key((string)$r['home_name']).'|'.fw_key((string)$r['away_name']);
  $key=substr((string)$r['match_date'],0,10).'|'.$key;
  $index[$key][$id]=array_replace($index[$key][$id]??[],array_filter($r,fn($v)=>$v!==null&&$v!==''));
 }
 $groups=[];$seen=[];$portraits=[];
 foreach($xp->query('//*['.fw_class('coffee-fixture').']') as $card){
  $teams=$xp->query('.//*['.fw_class('coffee-match-team').']',$card);if($teams->length!==2)throw new RuntimeException('coffee_team_count');
  $names=[];foreach($teams as $t)$names[]=trim($xp->query('.//strong',$t)->item(0)->textContent);
  $pair=fw_key($names[0]).'|'.fw_key($names[1]);$matchDate=$date;$matches=$index[$date.'|'.$pair]??[];
  // Day-after Coffee editions explicitly display the previous evening's score.
  $score=trim($xp->query('.//*['.fw_class('coffee-result').']',$card)->item(0)?->textContent??'');
  if(!$matches&&preg_match('/^(\d+)\s*[–-]\s*(\d+)$/u',$score,$goals)){
   $matchDate=(new DateTimeImmutable($date))->modify('-1 day')->format('Y-m-d');
   $matches=array_filter($index[$matchDate.'|'.$pair]??[],fn($r)=>isset($r['home_score'],$r['away_score'])&&(int)$r['home_score']===(int)$goals[1]&&(int)$r['away_score']===(int)$goals[2]);
  }
  if(count($matches)!==1)throw new RuntimeException('coffee_fixture_unresolved');
  $r=array_values($matches)[0];$id=(string)$r['sm_fixture_id'];if(isset($seen[$id]))throw new RuntimeException('coffee_duplicate_fixture');$seen[$id]=true;
  $group=$xp->query('ancestor::*['.fw_class('coffee-division').'][1]',$card)->item(0);
  $name=$group?trim($xp->query('.//h2',$group)->item(0)?->textContent??''):'';$name=$name?:'Partite';
  $f=['id'=>$id,'match_date'=>$matchDate,'competition_key'=>$r['competition_key']??null,'sm_action'=>$r['sm_action']??null,'time'=>substr((string)($r['match_time']??'20:00'),0,5),'reporters'=>[]];
  foreach(['home','away'] as $i=>$side){
   $t=$teams->item($i);$club=$r[$side.'_sm_club_id']??$r[$side.'_sm_team_id']??null;if(!$club)throw new RuntimeException('coffee_club_missing');
   $f[$side]=$names[$i];$f[$side.'_table']=['id'=>$club];$f[$side.'_manager']=trim($xp->query('.//small',$t)->item(0)?->textContent??'');$f[$side.'_logo']=$xp->query('.//img',$t)->item(0)?->getAttribute('src')??'';
   $interview=$xp->query('.//*['.fw_class('coffee-interview').']',$card)->item($i);
   if($interview){$speaker=$xp->query('.//*['.fw_class('coffee-speaker').']',$interview)->item(0);if($speaker){$rep=trim($xp->query('.//strong',$speaker)->item(0)?->textContent??'');if($rep){$f['reporters'][]=['name'=>$rep,'side'=>$side,'club'=>$names[$i],'label'=>'Inviato'];$pic=$xp->query('.//img',$speaker)->item(0);if($pic)$portraits[$rep]=['image'=>$pic->getAttribute('src')];}}}
  }
  $groups[$name][]=$f;
 }
 if(!$seen)throw new RuntimeException('coffee_fixtures_missing');
 $label=trim($xp->query('//*['.fw_class('coffee-title-box').']//*['.fw_class('eyebrow').']')->item(0)?->textContent??'');
 return ['date'=>$date,'world'=>'GW001','mode'=>'automatic','label'=>$label,'title'=>trim($xp->query('//*['.fw_class('coffee-title-box').']//h2')->item(0)?->textContent??''),'reporter_portraits'=>$portraits,'divisions'=>array_map(fn($name,$fixtures)=>['name'=>$name,'fixtures'=>$fixtures],array_keys($groups),array_values($groups))];
}
