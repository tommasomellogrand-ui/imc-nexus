import os,ssl,io,json,hashlib,urllib.request
from pathlib import Path
from ftplib import FTP_TLS,error_perm
P=Path(__file__).parent
files={n:(P/n).read_bytes() for n in ['coffee-source-lib.php','coffee-source.php','final-whistle.js']}
files['final-whistle/index.html']=(P/'index.html').read_bytes()
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
root=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor'
ctx=ssl.create_default_context();ctx.check_hostname=False
ftp=FTP_TLS(context=ctx);ftp.connect(host,21,timeout=30);ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);ftp.prot_p();ftp.cwd(root)
def read(n):
 b=io.BytesIO();ftp.retrbinary('RETR '+n,b.write);return b.getvalue()
def put(n,b):
 ftp.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b,n
old={};baseline=json.loads((P/'baseline.json').read_text())
for n in files:
 try:old[n]=read(n)
 except error_perm as e:
  if not str(e).startswith('550'):raise
  old[n]=None
 if n in baseline:assert old[n]==files[n] or hashlib.sha256(old[n]).hexdigest()==baseline[n],'Concurrent change: '+n
 else:assert old[n] is None or old[n]==files[n],'Unexpected existing source: '+n
for n,b in old.items():
 if b is not None:put(n+'.backup-'+os.environ['GITHUB_SHA'][:12],b)
changed=[]
try:
 for n,b in files.items():
  if old[n] is not None:assert read(n)==old[n]
  put(n+'.tmp',b);ftp.rename(n+'.tmp',n);changed.append(n)
 for n in ['final-whistle.js','final-whistle/index.html']:
  assert urllib.request.urlopen('https://www.italianmastersclub.it/nexus/alltoplayfor/'+n+'?verify='+os.environ['GITHUB_SHA'],timeout=45).read()==files[n],n
 url='https://www.italianmastersclub.it/nexus/alltoplayfor/coffee-source.php?date=2026-10-27'
 data=json.load(urllib.request.urlopen(url,timeout=60));assert data['ok'];edition=data['edition'];fixtures=[f for d in edition['divisions'] for f in d['fixtures']]
 assert len(fixtures)==4 and {str(f['id']) for f in fixtures}=={'369328897','369328898','369328899','369328900'}
 assert all(len(f['reporters'])==2 for f in fixtures)
 print('PASS live Coffee → Final Whistle: four fixtures, eight matching correspondents')
except Exception:
 for n in reversed(changed):
  if old[n] is None:ftp.delete(n)
  else:put(n,old[n])
 raise
finally:ftp.quit()
