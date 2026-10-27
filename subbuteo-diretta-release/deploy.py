import os,ssl,io,json,hashlib,urllib.request
from pathlib import Path
from ftplib import FTP_TLS,error_perm
R=Path(__file__).parent;baseline=json.loads((R/'baseline.json').read_text())
files={ 'diretta-gol/'+n:(R/n).read_bytes() for n in ['subbuteo-v3.js','subbuteo-v1.css','subbuteo-embed-v1.css']}
files.update({'diretta-gol/index.html':(R/'page.html').read_bytes()})
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
remote=raw if raw.startswith('/www.') else f'/www.{domain}{raw}';ctx=ssl.create_default_context();ctx.check_hostname=False
f=FTP_TLS(context=ctx);f.connect(host,21,timeout=40);f.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);f.prot_p();f.cwd(remote)
def read(n):
 b=io.BytesIO();f.retrbinary('RETR '+n,b.write);return b.getvalue()
def put(n,b):
 f.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b
engine={n:read('diretta-gol/'+n) for n in ['data.php','engine.php','identity.php','live.js']}
old={}
for n,b in files.items():
 try:old[n]=read(n)
 except error_perm as e:assert str(e).startswith('550') and n not in baseline;old[n]=None
 if old[n] is not None:assert old[n]==b or hashlib.sha256(old[n]).hexdigest()==baseline.get(n),'Production changed: '+n
for n,b in files.items():
 if old[n]==b:continue
 if n in baseline:put(n+'.before-subbuteo-'+os.environ['GITHUB_SHA'][:12],old[n]);assert read(n)==old[n]
 put(n,b)
for n,b in engine.items():assert read('diretta-gol/'+n)==b,'Engine altered'
f.quit()
for n,b in files.items():
 req=urllib.request.Request('https://www.italianmastersclub.it/nexus/'+n+'?verify='+os.environ['GITHUB_SHA'],headers={'Cache-Control':'no-cache'})
 assert urllib.request.urlopen(req,timeout=40).read()==b,'Public mismatch '+n
print('PASS: Subbuteo presentation published; all four replay engine files unchanged')
