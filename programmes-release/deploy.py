"""Install programme pages without overwriting the existing editorial data or renderers."""
import hashlib,io,json,os,ssl,urllib.request
from ftplib import FTP_TLS,error_perm
from pathlib import Path
ROOT=Path(__file__).parent;OUT=ROOT/'dist'
expected=json.loads((ROOT/'baseline.json').read_text())
files={str(p.relative_to(OUT)):p.read_bytes() for p in OUT.rglob('*') if p.is_file()}
assert 'index.html' in files and 'assets/rth-24-v1.webp' in files
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
remote=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor'
ctx=ssl.create_default_context();ctx.check_hostname=False
ftp=FTP_TLS(context=ctx);ftp.connect(host,21,timeout=30);ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);ftp.prot_p();ftp.cwd(remote)
def read(n):
    b=io.BytesIO();ftp.retrbinary('RETR '+n,b.write);return b.getvalue()
def put(n,b):
    ftp.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b,'Read-back: '+n
old_index=read('index.html')
assert hashlib.sha256(old_index).hexdigest()==expected['index.html'] or old_index==files['index.html'],'Homepage changed since review'
for n,digest in expected.items():
    if n!='index.html':assert hashlib.sha256(read(n)).hexdigest()==digest,'Published dependency changed: '+n
for n,b in files.items():
    if n=='index.html':continue
    try:old=read(n)
    except error_perm as e:
        if not str(e).startswith('550'):raise
    else:assert old==b,'Existing page or asset differs: '+n
for directory in sorted({str(Path(n).parent) for n in files if str(Path(n).parent)!='.'},key=lambda d:len(d.split('/'))):
    current=''
    for part in directory.split('/'):
        current=current+'/'+part if current else part
        try:ftp.mkd(current)
        except error_perm as e:
            if not str(e).startswith('550'):raise
for n,b in files.items():
    if n!='index.html':put(n,b)
put('index.html.pre-programmes-'+os.environ['GITHUB_SHA'][:12],old_index)
assert read('index.html')==old_index,'Concurrent homepage edit'
try:put('index.html',files['index.html'])
except Exception:put('index.html',old_index);raise
for n,digest in expected.items():
    if n!='index.html':assert hashlib.sha256(read(n)).hexdigest()==digest,'Dependency unexpectedly changed: '+n
ftp.quit()
for n,b in files.items():
    req=urllib.request.Request('https://www.italianmastersclub.it/nexus/alltoplayfor/'+n+'?verify='+os.environ['GITHUB_SHA'],headers={'Cache-Control':'no-cache'})
    assert urllib.request.urlopen(req,timeout=45).read()==b,'Public mismatch: '+n
print('PASS: published',len(files),'files; all public bytes verified; existing editorial dependencies unchanged')
