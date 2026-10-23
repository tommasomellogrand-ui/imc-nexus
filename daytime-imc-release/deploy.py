"""Install the IMC read-only adapter against the actual production baseline."""
import io, os, ssl, urllib.request
from pathlib import Path
from ftplib import FTP_TLS,error_perm
ROOT=Path(__file__).parent
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','')
raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/')
domain=host[4:] if host.startswith('ftp.') else host
remote=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor'
ctx=ssl.create_default_context();ctx.check_hostname=False
ftp=FTP_TLS(context=ctx);ftp.connect(host,21,timeout=30)
ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);ftp.prot_p();ftp.cwd(remote)
def read(name):
    out=io.BytesIO();ftp.retrbinary('RETR '+name,out.write);return out.getvalue()
def put(name,data):
    ftp.storbinary('STOR '+name,io.BytesIO(data))
    if read(name)!=data:raise RuntimeError('Read-back failed: '+name)
for name in ['daytime.js','index.html']:
    if read(name)!=(ROOT/'baseline'/name).read_bytes():raise SystemExit('Production changed: '+name)
for name in ['daytime-imc.js','daytime-imc.css']:
    try:current=read(name)
    except error_perm as e:
        if not str(e).startswith('550'):raise
    else:
        if current!=(ROOT/name).read_bytes():raise SystemExit('Unexpected existing asset: '+name)
for name in ['daytime-imc.js','daytime-imc.css']:put(name,(ROOT/name).read_bytes())
old=(ROOT/'baseline/index.html').read_bytes()
if read('index.html')!=old:raise SystemExit('Index changed during upload')
put('index.pre-daytime-imc-'+os.environ['GITHUB_SHA'][:12]+'.html',old)
try:put('index.html',(ROOT/'index.html').read_bytes())
except Exception:
    put('index.html',old);raise
if read('daytime.js')!=(ROOT/'baseline/daytime.js').read_bytes():raise SystemExit('Existing DAYTIME changed')
ftp.quit()
for name in ['index.html','daytime-imc.js','daytime-imc.css']:
    request=urllib.request.Request('https://www.italianmastersclub.it/nexus/alltoplayfor/'+name+'?verify='+os.environ['GITHUB_SHA'],headers={'Cache-Control':'no-cache'})
    if urllib.request.urlopen(request,timeout=30).read()!=(ROOT/name).read_bytes():raise SystemExit('Public mismatch: '+name)
print('PASS public HTTPS and FTPS read-back. Existing DAYTIME JavaScript unchanged.')
