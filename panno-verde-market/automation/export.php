<?php
// Installed with a single-use random name and a five-minute bearer token by export.py.
ini_set('display_errors','0');error_reporting(0);
if($_SERVER['REQUEST_METHOD']!=='POST'||time()>EXPIRES||!hash_equals('TOKENHASH',hash('sha256',$_SERVER['HTTP_X_IMC_EXPORT']??''))){http_response_code(404);exit;}

header('Content-Type: application/json');header('Cache-Control: no-store');
try{
$body=json_decode(file_get_contents('php://input'),true)?:[];
if(isset($body['image'])){
 $url=$body['image'];
 if(!is_string($url)||!preg_match('~^https://cdn\.soccerwiki\.org/images/(player|logos/clubs)/[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp)$~',$url))throw new Exception('Invalid image');
 $ch=curl_init($url);$bytes='';
 curl_setopt_array($ch,[CURLOPT_FOLLOWLOCATION=>false,CURLOPT_CONNECTTIMEOUT=>10,CURLOPT_TIMEOUT=>30,CURLOPT_USERAGENT=>'IMC-Nexus/1.0',CURLOPT_WRITEFUNCTION=>function($ch,$data)use(&$bytes){if(strlen($bytes)+strlen($data)>12582912)return 0;$bytes.=$data;return strlen($data);}]);
 $ok=curl_exec($ch);$code=curl_getinfo($ch,CURLINFO_HTTP_CODE);curl_close($ch);
 if(!$ok||$code!==200||!getimagesizefromstring($bytes))throw new Exception('Image unavailable');
 echo json_encode(['image'=>base64_encode($bytes)]);exit;
}
$c=require dirname(__DIR__).'/__imc_private_gateway/config.php';$a=$c['db'];
$p=new PDO('mysql:host='.$a['host'].';port='.($a['port']??3306).';dbname=Sql1956795_3;charset=utf8mb4',$a['user'],$a['pass'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_TIMEOUT=>20]);
$p->exec('SET TRANSACTION READ ONLY');$p->beginTransaction();
$rows=$p->query("SELECT * FROM GW011_IMC_Transfers WHERE imported_at > 'BASELINE_IMPORT' ORDER BY imported_at,imc_transfer_number")->fetchAll(PDO::FETCH_ASSOC);
$clubs=$p->query("SELECT m.`SM World Club ID` club_id,m.`Club Name` name,c.image_url,c.image_file FROM Sql1956795_1.`IMC Game World Club Mapping` m LEFT JOIN Sql1956795_1.`IMC Club Codex Global` c ON c.id=m.`SM Club ID` WHERE m.`Game World`='GW011'")->fetchAll(PDO::FETCH_ASSOC);
$managers=$p->query("SELECT manager_id,team_id,full_name,start_date,end_date FROM Sql1956795_1.`IMC Manager Assignment Global` WHERE game_world_id='GW011' AND assignment_type='club'")->fetchAll(PDO::FETCH_ASSOC);
// Resolve external club crests only by exact Codex names; active GW011 IDs remain separate.
$transferClubs=[];$names=[];
foreach($rows as $r){foreach(['club_from','club_to'] as $key){if(!empty($r[$key]))$names[$r[$key]]=true;}}
if($names){
 $stmt=$p->prepare("SELECT id,name,image_url,image_file FROM Sql1956795_1.`IMC Club Codex Global` WHERE name IN (".implode(',',array_fill(0,count($names),'?')).")");
 $stmt->execute(array_keys($names));$matches=[];
 foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $c){$matches[trim($c['name'])][]=$c;}
 foreach($matches as $name=>$cs){if(count($cs)===1)$transferClubs[$name]=$cs[0];}
}
$players=[];$ids=[];
foreach($rows as $r){$ids[(int)$r['player_id']]=true;foreach(json_decode($r['normalized_exchange_players']?:$r['exchange_players']?:'[]',true)?:[] as $x){if(isset($x['player_id']))$ids[(int)$x['player_id']]=true;}}
foreach(array_chunk(array_keys($ids),100) as $chunk){$in=implode(',',array_map('intval',$chunk));
$ps=$p->query("SELECT g.id player_id,TRIM(CONCAT_WS(' ',g.forename,g.surname)) full_name,g.image_file,g.image_url,c.rating,c.position,c.market_value,c.imported_at FROM Sql1956795_1.`IMC Player Codex Global` g LEFT JOIN GW011_IMC_Player_Codex c ON c.player_id=g.id WHERE g.id IN ($in) ORDER BY c.imported_at DESC")->fetchAll(PDO::FETCH_ASSOC);foreach($ps as $pr){if(!isset($players[$pr['player_id']]))$players[$pr['player_id']]=$pr;}}
$summary=$p->query('SELECT COUNT(*) total,MAX(imported_at) latest_import FROM GW011_IMC_Transfers')->fetch(PDO::FETCH_ASSOC);
$matches=$p->query("SELECT r.*,m.players_json,m.team_stats_json,m.events_json FROM GW011_IMC_Results r LEFT JOIN GW011_IMC_Match_Report m ON m.game_world_id=r.game_world_id AND m.sm_fixture_id=r.sm_fixture_id WHERE r.game_world_id='GW011' AND r.match_date>='2026-10-25' AND r.match_date<=CURDATE() ORDER BY r.match_date,r.sm_fixture_id")->fetchAll(PDO::FETCH_ASSOC);
$p->commit();echo json_encode(['matches'=>$matches,'world'=>'GW011','rows'=>$rows,'clubs'=>$clubs,'managers'=>$managers,'transfer_clubs'=>(object)$transferClubs,'players'=>(object)$players,'summary'=>$summary],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
}catch(Throwable $e){http_response_code(500);echo json_encode(['error'=>'transfer_export_failed','code'=>$e->getCode()]);}
