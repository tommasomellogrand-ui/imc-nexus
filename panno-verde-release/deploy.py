import io,os,ssl,urllib.request,json,hashlib
from pathlib import Path
from ftplib import FTP_TLS,error_perm
R=Path(__file__).parent
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
ctx=ssl.create_default_context();ctx.check_hostname=False
f=FTP_TLS(context=ctx);f.connect(host,21,timeout=40);f.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);f.prot_p();f.cwd(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')
def read(n):
 b=io.BytesIO();f.retrbinary('RETR '+n,b.write);return b.getvalue()
protected={n:read(n) for n in ['diretta-gol/index.html','diretta-gol/live.js','diretta-gol/data.php','diretta-gol/engine.php']}
try:f.mkd('il-panno-verde')
except error_perm as e:assert str(e).startswith('550')
files={p.name:p.read_bytes() for p in (R/'site').iterdir() if p.is_file()}
# Preserve the successor market page when already deployed from this repository.
successor=R.parent/'panno-verde-market/index.html'
if successor.exists() and read('il-panno-verde/index.html')==successor.read_bytes():
 files['index.html']=successor.read_bytes()
existing={}
for n,b in files.items():
 try:old=read('il-panno-verde/'+n)
 except error_perm as e:assert str(e).startswith('550');old=None
 assert old is None or old==b,'Existing file differs: '+n
 existing[n]=old
for n,b in files.items():
 if existing[n] is None:f.storbinary('STOR il-panno-verde/'+n,io.BytesIO(b))
 assert read('il-panno-verde/'+n)==b
for n,b in protected.items():assert read(n)==b,'Diretta Gol changed'
f.quit()
for n,b in files.items():assert urllib.request.urlopen('https://www.italianmastersclub.it/nexus/il-panno-verde/'+n+'?verify='+os.environ['GITHUB_SHA'],timeout=40).read()==b
print('PASS: page and banner published, home insertion only, Diretta Gol unchanged')
