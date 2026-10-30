<?php
$w=strtoupper($_GET['world']??'');if(!preg_match('/^GW(?:00[1-9]|01[01])$/D',$w)){http_response_code(404);exit;}
$q=$_GET;unset($q['world']);header('Location: /nexus/'.strtolower($w).'/'.($q?'?'.http_build_query($q):''),true,302);
