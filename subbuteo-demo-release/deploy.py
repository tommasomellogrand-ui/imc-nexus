import io,os,ssl,urllib.request
from pathlib import Path
from ftplib import FTP_TLS,error_perm
R=Path(__file__).parent;files={n:(R/n).read_bytes() for n in ['demo-gw011.html','demo-programme-v1.js']}
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
ctx=ssl.create_default_context();ctx.check_hostname=False
f=FTP_TLS(context=ctx);f.connect(host,21,timeout=40);f.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);f.prot_p();f.cwd((raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/diretta-gol')
def read(n):
 b=io.BytesIO();f.retrbinary('RETR '+n,b.write);return b.getvalue()
original={n:read(n) for n in ['data.php','live.js','engine.php','index.html']}
for n,b in files.items():
 try:old=read(n)
 except error_perm as e:assert str(e).startswith('550');old=None
 assert old is None or old==b,'Existing demo differs'
 if old is None:f.storbinary('STOR '+n,io.BytesIO(b))
 assert read(n)==b
for n,b in original.items():assert read(n)==b,'Official engine changed'
f.quit()
for n,b in files.items():assert urllib.request.urlopen('https://www.italianmastersclub.it/nexus/diretta-gol/'+n+'?verify='+os.environ['GITHUB_SHA'],timeout=40).read()==b
print('PASS: demo only published. Official page, data and engine unchanged.')
