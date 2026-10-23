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
# Update only DAYTIME JavaScript. Never overwrite the page shell or other editorial files.
name='daytime.js'
current=read(name)
target=(ROOT/name).read_bytes()
baseline=(ROOT/'baseline'/name).read_bytes()
if current not in (baseline,target):
    raise SystemExit('DAYTIME production changed independently; refusing to overwrite daytime.js')
if current!=target:
    backup='daytime.pre-europa-'+os.environ['GITHUB_SHA'][:12]+'.js'
    ftp.storbinary('STOR '+backup,io.BytesIO(current))
    if read(name)!=current:raise SystemExit('Production changed during backup')
    ftp.storbinary('STOR '+name,io.BytesIO(target))
    if read(name)!=target:raise SystemExit('DAYTIME read-back mismatch')
ftp.quit()
print('DAYTIME JavaScript deployed and verified via FTPS; other production files unchanged.')
