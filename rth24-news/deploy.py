import hashlib,io,json,os,ssl,time,urllib.request
from pathlib import Path
from ftplib import FTP_TLS,error_perm,error_temp
R=Path(__file__).parent
files={'feed-v2.js':(R/'feed.js').read_bytes(),'feed-v2.css':(R/'feed.css').read_bytes(),'flash-news.json':(R/'dist/flash-news.json').read_bytes(),'index.html':(R.parent/'programmes-release/dist/rth-24/index.html').read_bytes()}
files={**{p.name:p.read_bytes() for p in sorted((R/'assets').iterdir())},**files}
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
remote=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor/rth-24'
ctx=ssl.create_default_context();ctx.check_hostname=False
ftp=FTP_TLS(context=ctx);ftp.connect(host,21,timeout=40);ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);ftp.prot_p();ftp.cwd(remote)
def read(n):
 for attempt in range(3):
  try:
   b=io.BytesIO();ftp.retrbinary('RETR '+n,b.write);return b.getvalue()
  except error_temp:
   if attempt==2:raise
   time.sleep(1)
def put(n,b):
 for attempt in range(3):
  try:ftp.storbinary('STOR '+n,io.BytesIO(b));break
  except error_temp:
   if attempt==2:raise
   time.sleep(1)
 assert read(n)==b,'Read-back failed: '+n
original={}
for n,b in files.items():
 try:old=read(n)
 except error_perm as e:
  assert str(e).startswith('550') and n!='index.html';old=None
 original[n]=old
 if n=='index.html':assert old==b or hashlib.sha256(old).hexdigest()==json.loads((R/'baseline.json').read_text())['index.html'],'RTH24 page changed since review'
 elif n not in ['index.html','flash-news.json'] and old is not None:assert old==b,'Renderer changed: '+n
 elif n=='flash-news.json' and old is not None:
  prior=json.loads(old);new=json.loads(b)
  assert {x['id'] for x in prior['items']}<={x['id'] for x in new['items']},'Refusing to delete published news'
# Save previous payload and page before any write. All writes stay in RTH24.
for n in ['flash-news.json','index.html']:
 if original[n] is not None and original[n]!=files[n]:put(n+'.before-'+os.environ['DEPLOY_SHA'][:12],original[n])
written=[]
try:
 for n,b in files.items():
  if original[n]==b:continue
  if original[n] is not None:assert read(n)==original[n],'Concurrent edit: '+n
  written.append(n);put(n,b)
except Exception:
 for n in reversed(written):
  if original[n] is not None:put(n,original[n])
 raise
ftp.quit()
for n,b in files.items():
 req=urllib.request.Request('https://www.italianmastersclub.it/nexus/alltoplayfor/rth-24/'+n+'?verify='+os.environ['DEPLOY_SHA'],headers={'Cache-Control':'no-cache'})
 assert urllib.request.urlopen(req,timeout=45).read()==b,'Public mismatch: '+n
print('PASS: public HTTPS content matches the committed archive; page and renderer verified')
