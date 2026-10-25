"""Deploy only DayTime pages/assets; preserve other programmes and competition data."""
import hashlib,io,json,os,ssl,urllib.request
from pathlib import Path
from ftplib import FTP_TLS,error_perm
R=Path(__file__).resolve().parent
files={str(p.relative_to(R)):p.read_bytes() for p in R.rglob('*') if p.is_file() and (p.suffix in ['.html','.webp','.css'] or p.name=='daytime-cups-v1.js')}
baseline=json.loads((R/'baseline.json').read_text())
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
root=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor'
ctx=ssl.create_default_context();ctx.check_hostname=False
f=FTP_TLS(context=ctx);f.connect(host,21,timeout=30);f.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);f.prot_p();f.cwd(root)
def read(n):
 b=io.BytesIO();f.retrbinary('RETR '+n,b.write);return b.getvalue()
def optional(n):
 try:return read(n)
 except error_perm as e:
  if not str(e).startswith('550'):raise
  return None
def put(n,b):
 f.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b,n
old={n:optional(n) for n in files}
for n,b in old.items():
 if b is not None:assert b==files[n] or hashlib.sha256(b).hexdigest()==baseline.get(n),'Concurrent change: '+n
catalog_old=read('programmes-catalog.json');catalog=json.loads(catalog_old);original_daytime=catalog['daytime'];replacement=json.loads((R/'daytime-catalog.json').read_text())
assert original_daytime==json.loads((R/'baseline-daytime-catalog.json').read_text()) or original_daytime==replacement,'DayTime catalog changed'
catalog['daytime']=replacement;files['programmes-catalog.json']=json.dumps(catalog,ensure_ascii=False).encode();old['programmes-catalog.json']=catalog_old
suffix='.backup-cups-'+os.environ['GITHUB_SHA'][:12]
for n,b in old.items():
 if b is not None:put(n+suffix,b)
changed=[]
try:
 # Assets first, then pages, then navigation metadata.
 for n,b in files.items():
  assert optional(n)==old[n],'Concurrent edit: '+n
  put(n+'.tmp-cups',b);f.rename(n+'.tmp-cups',n);changed.append(n);assert read(n)==b,n
except Exception:
 for n in reversed(changed):
  if old[n] is not None:put(n,old[n])
  else:f.delete(n)
 raise
f.quit()
# Public verification of entry points and all banners.
for n in ['daytime/index.html','daytime/champions/index.html','daytime/europa/index.html','daytime/conference/index.html','daytime-cups-v1.js','daytime-cups-v1.css']+[n for n in files if n.endswith('.webp')]:
 assert urllib.request.urlopen('https://www.italianmastersclub.it/nexus/alltoplayfor/'+n+'?verify='+os.environ['GITHUB_SHA'],timeout=45).read()==files[n],n
print('Published and verified DayTime, three cup pages and three approved banners. Competition data unchanged.')
