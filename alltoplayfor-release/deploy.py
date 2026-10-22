"""Deploy only the reviewed Daytime files, refusing a changed production baseline."""
import io, os, ssl, hashlib
from pathlib import Path
from ftplib import FTP_TLS
ROOT=Path(__file__).parent
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','')
raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/')
domain=host[4:] if host.startswith('ftp.') else host
remote=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor'
ctx=ssl.create_default_context();ctx.check_hostname=False
ftp=FTP_TLS(context=ctx);ftp.connect(host,21,timeout=30)
ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);ftp.prot_p();ftp.cwd(remote)
def read(name):
    b=io.BytesIO();ftp.retrbinary('RETR '+name,b.write);return b.getvalue()
for name in ['index.html','programme-tabs.js','coffee.js','coffee.css','programme-tabs.css','style.css']:
    if read(name)!=(ROOT/'baseline'/name).read_bytes():raise SystemExit('Production changed; deploy stopped before writing: '+name)
files=['daytime.css','daytime.js']+['assets/'+p.name for p in sorted((ROOT/'assets').glob('daytime-*.jpg'))]
# Refuse to overwrite a new file created by someone else since inspection.
for directory in ['', 'assets']:
    names=ftp.nlst(directory or '.')
    existing={Path(n).name for n in names}
    for name in files:
        if str(Path(name).parent) != (directory or '.'):continue
        if Path(name).name in existing and read(name)!=(ROOT/name).read_bytes():raise SystemExit('Unexpected existing file: '+name)
for name in files:
    data=(ROOT/name).read_bytes()
    ftp.storbinary('STOR '+name,io.BytesIO(data))
    if read(name)!=data:raise SystemExit('Read-back mismatch: '+name)
# The entry page is replaced last. Preserve the old entry in a unique backup.
backup='index.pre-daytime-'+os.environ['GITHUB_SHA'][:12]+'.html'
ftp.storbinary('STOR '+backup,io.BytesIO((ROOT/'baseline/index.html').read_bytes()))
if read('index.html')!=(ROOT/'baseline/index.html').read_bytes():raise SystemExit('Production index changed during deploy')
try:
    data=(ROOT/'index.html').read_bytes();ftp.storbinary('STOR index.html',io.BytesIO(data))
    if read('index.html')!=data:raise RuntimeError('Index read-back mismatch')
except Exception:
    ftp.storbinary('STOR index.html',io.BytesIO((ROOT/'baseline/index.html').read_bytes()));raise
ftp.quit()
print('DAYTIME deployed and verified via FTPS; existing programmes unchanged.')
