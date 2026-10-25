"""Read-only Aruba export; credentials remain on the runner/server, never in the snapshot."""
import os,ssl,io,json,secrets,hashlib,time,urllib.request,base64
from pathlib import Path
from ftplib import FTP_TLS,error_perm
R=Path(__file__).parent
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','')
raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
root=raw if raw.startswith('/www.') else f'/www.{domain}{raw}'
ctx=ssl.create_default_context();ctx.check_hostname=False
f=FTP_TLS(context=ctx);f.connect(host,21,timeout=40);f.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);f.prot_p();f.cwd(root)
token=secrets.token_hex(32);name='rth24-export-'+secrets.token_hex(16)+'.php'
php=(R/'export.php').read_text().replace('TOKENHASH',hashlib.sha256(token.encode()).hexdigest()).replace('EXPIRES',str(int(time.time())+300))
try:
 f.storbinary('STOR '+name,io.BytesIO(php.encode()))
 req=urllib.request.Request('https://www.italianmastersclub.it/nexus/'+name,data=b'',headers={'X-IMC-Export':token})
 with urllib.request.urlopen(req,timeout=90) as response:data=json.load(response)
 assert data.get('world')=='GW001' and len({str(x['club_id']) for x in data['clubs']})==40,'Active clubs must be exactly 40'
 out=R/'runtime';out.mkdir(exist_ok=True);(out/'snapshot.json').write_text(json.dumps(data,ensure_ascii=False))
 print('Aruba snapshot:',data['summary'],'new-import rows:',len(data['rows']),'active clubs: 40')
 import generate
 original_download=generate.download
 def fetch_image(url):
  if url.startswith('https://cdn.soccerwiki.org/'):
   try:
    req=urllib.request.Request('https://www.italianmastersclub.it/nexus/'+name,data=json.dumps({'image':url}).encode(),headers={'X-IMC-Export':token,'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=40) as response:reply=json.load(response)
    return base64.b64decode(reply['image'],validate=True)
   except Exception:pass
  return original_download(url)
 generate.download=fetch_image
 generate.main()
finally:
 try:f.delete(name)
 except error_perm:pass
 assert name not in [x.rsplit('/',1)[-1] for x in f.nlst()],'Temporary export cleanup failed'
 f.quit()
