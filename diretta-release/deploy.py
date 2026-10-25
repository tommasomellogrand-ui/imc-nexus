import hashlib,io,json,os,ssl,urllib.request
from pathlib import Path
from ftplib import FTP_TLS,error_perm
R=Path(__file__).parent; baseline=json.loads((R/'baseline.json').read_text())
files={n:(R/n).read_bytes() for n in ['diretta-gol-v2.js','diretta-gol-v2.css','diretta-embed-v2.css']}
files['diretta-gol/index.html']=(R.parent/'programmes-release/dist/diretta-gol/index.html').read_bytes()
base='https://www.italianmastersclub.it/nexus/'
def public(p):return urllib.request.urlopen(base+p+'?verify='+os.environ['GITHUB_SHA'],timeout=45).read()
assert hashlib.sha256(public('matchday/live.js')).hexdigest()==baseline['engine'],'Engine changed since review'
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
remote=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor'
ctx=ssl.create_default_context();ctx.check_hostname=False
ftp=FTP_TLS(context=ctx);ftp.connect(host,21,timeout=40);ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);ftp.prot_p();ftp.cwd(remote)
def read(n):
 b=io.BytesIO();ftp.retrbinary('RETR '+n,b.write);return b.getvalue()
def put(n,b):
 ftp.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b
old={}
for n,b in files.items():
 try:old[n]=read(n)
 except error_perm as e:
  assert str(e).startswith('550') and n!='diretta-gol/index.html';old[n]=None
 if n=='diretta-gol/index.html':assert old[n]==b or hashlib.sha256(old[n]).hexdigest()==baseline['index.html'],'Page changed since review'
 elif old[n] is not None:assert old[n]==b,'Versioned asset changed'
page='diretta-gol/index.html'
if old[page]!=files[page]:put(page+'.before-'+os.environ['GITHUB_SHA'][:12],old[page])
for n,b in files.items():
 if old[n]==b:continue
 if old[n] is not None:assert read(n)==old[n],'Concurrent edit'
 put(n,b)
ftp.quit()
for n,b in files.items():assert public('alltoplayfor/'+n)==b,'Public mismatch '+n
assert hashlib.sha256(public('matchday/live.js')).hexdigest()==baseline['engine'],'Engine unexpectedly changed'
print('PASS: four presentation files published, public bytes verified, replay engine unchanged')
