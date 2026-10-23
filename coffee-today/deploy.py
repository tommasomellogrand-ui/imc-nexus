import io,os,ssl,urllib.request
from pathlib import Path
from ftplib import FTP_TLS
p=Path(__file__).parent
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
remote=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor'
ctx=ssl.create_default_context();ctx.check_hostname=False
ftp=FTP_TLS(context=ctx);ftp.connect(host,21,timeout=30);ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);ftp.prot_p();ftp.cwd(remote)
def read(n):
 b=io.BytesIO();ftp.retrbinary('RETR '+n,b.write);return b.getvalue()
def put(n,b):
 ftp.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b,n
old=read('index.html');marker=b'<script src="coffee-day-after.js?v=20261023" defer></script>'
assert old.count(b'</body>')==1
new=old if marker in old else old.replace(b'</body>',marker+b'</body>')
files={'2026-10-23-coffee-editorial.json':(p/'edition.json').read_bytes(),'coffee-day-after.js':(p/'coffee-day-after.js').read_bytes()}
for n,b in files.items():put(n,b)
assert read('index.html')==old,'Concurrent production edit'
put('index.html.pre-coffee-day-after-'+os.environ['GITHUB_SHA'][:12],old)
put('index.html',new);ftp.quit();files['index.html']=new
for n,b in files.items():
 req=urllib.request.Request('https://www.italianmastersclub.it/nexus/alltoplayfor/'+n+'?verify='+os.environ['GITHUB_SHA'],headers={'Cache-Control':'no-cache'})
 assert urllib.request.urlopen(req,timeout=30).read()==b,'Public verification: '+n
print('PASS: Coffee Time 23 October published and verified')
