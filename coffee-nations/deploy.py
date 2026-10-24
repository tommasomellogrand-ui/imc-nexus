import io,os,ssl,urllib.request,json
from pathlib import Path
from ftplib import FTP_TLS
p=Path(__file__).parent/'dist'
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
remote=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor'
ctx=ssl.create_default_context();ctx.check_hostname=False
ftp=FTP_TLS(context=ctx);ftp.connect(host,21,timeout=30);ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);ftp.prot_p();ftp.cwd(remote)
def read(n):
 b=io.BytesIO();ftp.retrbinary('RETR '+n,b.write);return b.getvalue()
def put(n,b):
 ftp.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b,n
old=read('coffee-time/index.html');assert old==(Path(__file__).parent/'baseline.html').read_bytes(),'Coffee landing changed; review before publishing'
catold=read('programmes-catalog.json');cat=json.loads(catold);cat['coffee-time']['latest']='2026-10-24';cat['coffee-time']['editions']=list(dict.fromkeys(['2026-10-24']+cat['coffee-time']['editions']))
try:ftp.mkd('coffee-time/2026-10-24')
except Exception:
 ftp.cwd('coffee-time/2026-10-24');ftp.cwd(remote)
files={'coffee-nations-20261024.css':(p/'coffee-nations-20261024.css').read_bytes(),'coffee-nations-20261024.js':(p/'coffee-nations-20261024.js').read_bytes(),'coffee-time/2026-10-24/index.html':(p/'edition.html').read_bytes()}
for n,b in files.items():
 if n=='coffee-time/2026-10-24/index.html':put(n+'.pre-redesign-'+os.environ['GITHUB_SHA'][:12],read(n))
 put(n,b)
assert read('coffee-time/index.html')==old
assert read('programmes-catalog.json')==catold
put('coffee-time/index.html.pre-nations-'+os.environ['GITHUB_SHA'][:12],old)
put('programmes-catalog.json.pre-nations-'+os.environ['GITHUB_SHA'][:12],catold)
files['coffee-time/index.html']=(p/'latest.html').read_bytes();files['programmes-catalog.json']=json.dumps(cat,ensure_ascii=False).encode()
for n in ['programmes-catalog.json','coffee-time/index.html']:put(n,files[n])
ftp.quit()
for n,b in files.items():
 req=urllib.request.Request('https://www.italianmastersclub.it/nexus/alltoplayfor/'+n+'?verify='+os.environ['GITHUB_SHA'],headers={'Cache-Control':'no-cache'})
 assert urllib.request.urlopen(req,timeout=40).read()==b,'Public verification: '+n
print('PASS Coffee Time 24 October nationals published and verified')
