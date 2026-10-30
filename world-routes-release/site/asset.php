<?php
// Read-only compatibility adapter for scripts referenced by the shared home.
$root=realpath(dirname(__DIR__));$name=$_GET['file']??'';
$allowed=['assets/player-cards.js','assets/trophy-room.js','assets/home.js','assets/the-club-links.js','assets/navigation.js','club-house/white-gloss.js','diretta-gol/home-v1.js','diretta-gol/subbuteo-v3.js','il-panno-verde/home-v1.js','admin/site-analytics.js'];
if(!in_array($name,$allowed,true)){http_response_code(404);exit;}
$path=realpath($root.'/'.$name);if(!$path||!str_starts_with($path,$root.'/')||!is_file($path)){http_response_code(404);exit;}
$s=file_get_contents($path);
$s=preg_replace('/(?<![\w.])(?:window\.)?location\.(search|pathname)\b/','window.NexusWorldRoute.$1',$s);
header('Content-Type: application/javascript; charset=utf-8');header('Cache-Control: no-cache');echo $s;
