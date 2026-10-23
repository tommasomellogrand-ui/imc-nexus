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
names=['daytime-imc.css','daytime-imc.js','index.html']
for name in names+['daytime.js']:
    if read(name)!=(ROOT/'baseline'/name).read_bytes():raise SystemExit('Production changed: '+name)
for name in names:
    put(name+'.pre-rounds-'+os.environ['GITHUB_SHA'][:12],(ROOT/'baseline'/name).read_bytes())
try:
    for name in names:
        if read(name)!=(ROOT/'baseline'/name).read_bytes():raise RuntimeError('Production changed during upload: '+name)
        put(name,(ROOT/name).read_bytes())
except Exception:
    for name in names:put(name,(ROOT/'baseline'/name).read_bytes())
    raise
ftp.quit()
for name in ['index.html','daytime-imc.js','daytime-imc.css']:
    request=urllib.request.Request('https://www.italianmastersclub.it/nexus/alltoplayfor/'+name+'?verify='+os.environ['GITHUB_SHA'],headers={'Cache-Control':'no-cache'})
    if urllib.request.urlopen(request,timeout=30).read()!=(ROOT/name).read_bytes():raise SystemExit('Public mismatch: '+name)
print('PASS public HTTPS and FTPS read-back. Existing DAYTIME JavaScript unchanged.')
