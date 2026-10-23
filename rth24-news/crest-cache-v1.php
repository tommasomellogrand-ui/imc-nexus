<?php
// Only club IDs explicitly referenced by approved news may be retrieved.
header('X-Content-Type-Options: nosniff');
$id = $_GET['id'] ?? '';
$allowed = json_decode(@file_get_contents(__DIR__.'/crest-allowlist.json'), true) ?: [];
if (!is_string($id) || !preg_match('/^[1-9][0-9]{0,7}$/D', $id) || !in_array($id, $allowed, true)) { http_response_code(400); exit('Invalid club'); }
$cache = __DIR__.'/crest-cache-v1-'.$id.'.png';
$lock = fopen(__DIR__.'/crest-cache-v1.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX)) { http_response_code(503); exit('Cache busy'); }
if (!is_file($cache)) {
    $data = false;
    for ($attempt=0; $attempt<3; $attempt++) {
        $ch = curl_init('https://cdn.soccerwiki.org/images/logos/clubs/'.$id.'.png');
        $buffer = '';
        curl_setopt_array($ch, [CURLOPT_FOLLOWLOCATION=>false, CURLOPT_CONNECTTIMEOUT=>10, CURLOPT_TIMEOUT=>25, CURLOPT_USERAGENT=>'IMC-Nexus/1.0', CURLOPT_WRITEFUNCTION=>function($ch,$chunk) use (&$buffer) { if(strlen($buffer)+strlen($chunk)>2097152)return 0; $buffer.=$chunk; return strlen($chunk); }]);
        $ok = curl_exec($ch); $status = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        $info = @getimagesizefromstring($buffer);
        if ($ok && $status===200 && $info && $info[2]===IMAGETYPE_PNG && $info[0]*$info[1]<=4000000) { $data=$buffer; break; }
        if ($attempt<2) usleep(500000);
    }
    if ($data===false) { flock($lock,LOCK_UN);fclose($lock);http_response_code(503);exit('Club crest temporarily unavailable'); }
    $tmp = tempnam(__DIR__, 'crest-tmp-');
    if (file_put_contents($tmp,$data)!==strlen($data) || !rename($tmp,$cache)) { @unlink($tmp);http_response_code(503);exit('Cache write failed'); }
}
flock($lock,LOCK_UN);fclose($lock);
header('Content-Type: image/png');header('Cache-Control: public, max-age=86400');readfile($cache);
