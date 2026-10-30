<?php
// Render the current shared home, never a duplicated snapshot of its markup.
$root=dirname(__DIR__);
$world=strtoupper($_GET['route_world']??'');
if(!preg_match('/^GW(?:00[1-9]|01[01])$/D',$world)){http_response_code(404);exit;}
$canonical='/nexus/'.strtolower($world).'/';
if(isset($_GET['world']) || parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH)!==$canonical){$q=$_GET;unset($q['route_world'],$q['world']);header('Location: '.$canonical.($q?'?'.http_build_query($q):''),true,302);exit;}
$path=$root.'/index.html';
if(!is_file($path)){http_response_code(503);exit('Pagina temporaneamente non disponibile');}
$html=file_get_contents($path);
// Route-aware reads only; original shared assets are left untouched.
function route_reads($s){return preg_replace('/(?<![\w.])(?:window\.)?location\.(search|pathname)\b/','window.NexusWorldRoute.$1',$s);}
$html=preg_replace_callback('~<script\b([^>]*)>(.*?)</script>~is',function($m){
 if(preg_match('~\bsrc=["\x27]([^"\x27]+)["\x27]~i',$m[1],$src)){
  $p=parse_url(html_entity_decode($src[1]),PHP_URL_PATH);
  if(str_starts_with($src[1],'https:')||str_starts_with($src[1],'//'))return $m[0];
  $p=str_starts_with($p,'/nexus/')?substr($p,7):ltrim($p,'/');
  return str_replace($src[1],'/nexus/world-routes/asset.php?file='.rawurlencode($p),$m[0]);
 }
 return '<script'.$m[1].'>'.route_reads($m[2]).'</script>';
},$html);
$html=preg_replace('~<head>~i','<head><base href="/nexus/"><script src="/nexus/world-routes/context.js?v=1"></script>',$html,1);
header('Content-Type: text/html; charset=utf-8');header('Cache-Control: no-cache');echo $html;
