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
token=secrets.token_hex(32);name='panno-verde-export-'+secrets.token_hex(16)+'.php'
cfg=json.loads((R/'config.json').read_text())
php=(R/'export.php').read_text().replace('BASELINE_IMPORT',cfg['baseline_imported_at']).replace('TOKENHASH',hashlib.sha256(token.encode()).hexdigest()).replace('EXPIRES',str(int(time.time())+300))
try:
 f.storbinary('STOR '+name,io.BytesIO(php.encode()))
 req=urllib.request.Request('https://www.italianmastersclub.it/nexus/'+name,data=b'',headers={'X-IMC-Export':token})
 with urllib.request.urlopen(req,timeout=90) as response:data=json.load(response)
 assert data.get('world')=='GW011' and len({str(x['club_id']) for x in data['clubs']})==20,'Active clubs must be exactly 20'
 out=R/'runtime';out.mkdir(exist_ok=True);(out/'snapshot.json').write_text(json.dumps(data,ensure_ascii=False))
 print('Aruba snapshot:',data['summary'],'new-import rows:',len(data['rows']),'active clubs: 20')
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
 # Persist the exact GW011 club registry; unavailable media never blocks news.
 clubs=[]
 for c in data['clubs']:
  club={'id':str(c['club_id']),'name':c['name']}
  url=c.get('image_url') or ('https://www.italianmastersclub.it/nexus/assets/clubs/'+c['image_file'] if c.get('image_file') else None)
  logo=generate.optional_asset(url,'market-club-'+club['id'])
  if logo:club['logo']=logo
  clubs.append(club)
 (R/'clubs.json').write_text(json.dumps(clubs,ensure_ascii=False,indent=2)+'\n')
 from collections import Counter
 print('TRANSFER_SOURCE',json.dumps({'rows':len(data['rows']),'normalization':dict(Counter(str(r.get('normalization_status')) for r in data['rows'])),'statuses':dict(Counter(str(r.get('status')) for r in data['rows']))},ensure_ascii=False))
 import prefetch
 prefetch.run(data,cfg)
 generate.main()
 import postmatch
 postmatch.main(data)
 import division_news
 division_news.main(data)
finally:
 try:f.delete(name)
 except error_perm:pass
 assert name not in [x.rsplit('/',1)[-1] for x in f.nlst()],'Temporary export cleanup failed'
 f.quit()
