import os,ssl,io,json,hashlib,urllib.request
from pathlib import Path
from ftplib import FTP_TLS
R=Path(__file__).parent
files={'final-whistle/index.html':(R/'index.html').read_bytes(),'final-whistle.js':(R/'final-whistle.js').read_bytes(),'final-whistle.css':(R/'final-whistle.css').read_bytes()}
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
root=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor'
ctx=ssl.create_default_context();ctx.check_hostname=False
f=FTP_TLS(context=ctx);f.connect(host,21,timeout=30);f.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);f.prot_p();f.cwd(root)
def read(n):
 b=io.BytesIO();f.retrbinary('RETR '+n,b.write);return b.getvalue()
def put(n,b):
 f.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b
old={n:read(n) for n in files};baseline=json.loads((R/'baseline.json').read_text())
for n,b in old.items():assert b==files[n] or hashlib.sha256(b).hexdigest()==baseline[n],n
for n,b in old.items():put(n+'.backup-'+os.environ['GITHUB_SHA'][:12],b)
changed=[]
try:
 for n,b in files.items():
  assert read(n)==old[n];put(n+'.tmp',b);f.rename(n+'.tmp',n);changed.append(n)
except Exception:
 for n in changed:put(n,old[n])
 raise
f.quit()
for n,b in files.items():assert urllib.request.urlopen('https://www.italianmastersclub.it/nexus/alltoplayfor/'+n+'?v='+os.environ['GITHUB_SHA'],timeout=40).read()==b,n
print('Final Whistle published and verified')
