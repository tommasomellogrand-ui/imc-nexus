import hashlib,io,json,os,ssl,sys,urllib.request
from pathlib import Path
from ftplib import FTP_TLS,error_perm
R=Path(__file__).parent;baseline=json.loads((R/'baseline.json').read_text());home=sys.argv[-1]=='home'
if home: print('Home owned by imc-website'); sys.exit(0)
files={} if home else {'diretta-gol/'+p.name:p.read_bytes() for p in (R/'site').iterdir() if p.is_file()}
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
remote=raw if raw.startswith('/www.') else f'/www.{domain}{raw}'
ctx=ssl.create_default_context();ctx.check_hostname=False
f=FTP_TLS(context=ctx);f.connect(host,21,timeout=40);f.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);f.prot_p();f.cwd(remote)
def read(n):
 b=io.BytesIO();f.retrbinary('RETR '+n,b.write);return b.getvalue()
def put(n,b):
 f.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b,'Read-back mismatch '+n
for n,digest in baseline.items():
 if n in {'index.html','assets/home.js'}:continue
 b=read(n)
 if n=='index.html' and b==(R/'home-index.html').read_bytes():continue
 assert hashlib.sha256(b).hexdigest()==digest,'Production changed since audit: '+n
try:f.mkd('diretta-gol')
except error_perm as e:assert str(e).startswith('550')
original={}
for n,b in files.items():
 try:original[n]=read(n)
 except error_perm as e:assert str(e).startswith('550') and n!='index.html';original[n]=None
 if original[n] is not None and n!='index.html':assert original[n]==b,'Unexpected existing file '+n
if home and original['index.html']!=files['index.html']:put('index.html.before-diretta-worlds-'+os.environ['GITHUB_SHA'][:12],original['index.html'])
for n,b in files.items():
 if original[n]==b:continue
 if original[n] is not None:assert read(n)==original[n],'Concurrent edit '+n
 put(n,b)
f.quit()
for n,b in files.items():
 if n.endswith('.php'):continue
 req=urllib.request.Request('https://www.italianmastersclub.it/nexus/'+n+'?verify='+os.environ['GITHUB_SHA'],headers={'Cache-Control':'no-cache'})
 assert urllib.request.urlopen(req,timeout=45).read()==b,'Public mismatch '+n
print('PASS '+('home banner installation' if home else 'isolated replay clone')+'; GW001 source unchanged')
