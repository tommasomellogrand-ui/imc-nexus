import hashlib,io,json,os,ssl,urllib.request
from pathlib import Path
from ftplib import FTP_TLS,error_perm
R=Path(__file__).parent
expected=json.loads((R/'baseline.json').read_text())
files={'assets/home.js':(R/'home.js').read_bytes(),'index.html':(R/'index.html').read_bytes(),'alltoplayfor/home-layout-v2.css':(R.parent/'programmes-release/home-layout-v2.css').read_bytes(),'alltoplayfor/index.html':(R.parent/'programmes-release/dist/index.html').read_bytes()}
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
remote=raw if raw.startswith('/www.') else f'/www.{domain}{raw}'
ctx=ssl.create_default_context();ctx.check_hostname=False
ftp=FTP_TLS(context=ctx);ftp.connect(host,21,timeout=30);ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);ftp.prot_p();ftp.cwd(remote)
def read(n):
 b=io.BytesIO();ftp.retrbinary('RETR '+n,b.write);return b.getvalue()
def put(n,b):
 ftp.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b
original={}
for n,b in files.items():
 try:old=read(n)
 except error_perm as e:
  assert str(e).startswith('550') and n not in expected;old=None
 if old is not None:assert old==b or hashlib.sha256(old).hexdigest()==expected.get(n),'Production changed: '+n
 original[n]=old
for n,old in original.items():
 if old is not None:put(n+'.before-'+os.environ['GITHUB_SHA'][:12],old)
written=[]
try:
 for n in ['alltoplayfor/home-layout-v2.css','assets/home.js','alltoplayfor/index.html','index.html']:
  if original[n] is not None:assert read(n)==original[n],'Concurrent change: '+n
  written.append(n);put(n,files[n])
except Exception:
 for n in reversed(written):
  if original[n] is not None:put(n,original[n])
 raise
ftp.quit()
for n,b in files.items():
 req=urllib.request.Request('https://www.italianmastersclub.it/nexus/'+n+'?verify='+os.environ['GITHUB_SHA'],headers={'Cache-Control':'no-cache'})
 assert urllib.request.urlopen(req,timeout=45).read()==b,'Public mismatch: '+n
print('PASS: four scoped files published and public bytes verified')
