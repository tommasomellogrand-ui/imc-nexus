"""Publish GW011 only, preserving prior news and checking concurrent edits."""
import hashlib,io,json,os,ssl,urllib.request
from pathlib import Path
from ftplib import FTP_TLS,error_perm
R=Path(__file__).parent
files={p.name:p.read_bytes() for p in (R/'assets').iterdir() if p.is_file() and not p.name.startswith('.')}
files.update({'market-feed-v3.js':(R/'feed.js').read_bytes(),'market-feed-v3.css':(R/'feed.css').read_bytes(),'flash-news.json':(R/'dist/flash-news.json').read_bytes(),'index.html':(R/'index.html').read_bytes()})
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
remote=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/il-panno-verde'
ctx=ssl.create_default_context();ctx.check_hostname=False
f=FTP_TLS(context=ctx);f.connect(host,21,timeout=40);f.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);f.prot_p();f.cwd(remote)
def read(n):
 b=io.BytesIO();f.retrbinary('RETR '+n,b.write);return b.getvalue()
def put(n,b):
 f.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b,'Read-back mismatch: '+n
old={}
for n,b in files.items():
 try:old[n]=read(n)
 except error_perm as e:assert str(e).startswith('550') and n!='index.html';old[n]=None
 if n=='index.html':assert old[n] in [b,(R/'baseline.html').read_bytes()],'Panno Verde page changed since review'
 elif n=='flash-news.json' and old[n]:
  prior=json.loads(old[n]);assert prior['world']=='GW011'
  assert {i['id'] for i in prior['items']} <= {i['id'] for i in json.loads(b)['items']},'Refusing to remove news'
 elif old[n] is not None:assert old[n]==b,'Immutable file changed: '+n
# Preserve any manually published launch-feed items too.
legacy=json.loads(read('news.json'))
assert legacy['world']=='GW011'
assert {i['id'] for i in legacy['items']} <= {i['id'] for i in json.loads(files['flash-news.json'])['items']},'Import existing manual news before switching renderer'
for n in ['index.html','flash-news.json']:
 if old[n] and old[n]!=files[n]:put(n+'.before-'+os.environ['DEPLOY_SHA'][:12],old[n])
written=[]
try:
 for n,b in files.items():
  if old[n]==b:continue
  if old[n] is not None:assert read(n)==old[n],'Concurrent change: '+n
  written.append(n);put(n,b)
except Exception:
 for n in reversed(written):
  if old[n] is not None:put(n,old[n])
 raise
finally:f.quit()
for n,b in files.items():
 u='https://www.italianmastersclub.it/nexus/il-panno-verde/'+n+'?verify='+os.environ['DEPLOY_SHA']
 assert urllib.request.urlopen(u,timeout=45).read()==b,'Public mismatch: '+n
print('PASS: public GW011 page, news and media match committed source')
