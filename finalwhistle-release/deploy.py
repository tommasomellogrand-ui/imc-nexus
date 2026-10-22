"""Explicitly invoked scoped deployment. Never run as a side effect of preview tests."""
import io, os, ssl
from pathlib import Path
from ftplib import FTP_TLS, error_perm
ROOT = Path(__file__).parent
host = os.environ['ARUBA_FTP_HOST'].replace('ftp://', '').replace('ftps://', '')
raw = os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/')
domain = host[4:] if host.startswith('ftp.') else host
remote = (raw if raw.startswith('/www.') else f'/www.{domain}{raw}') + '/alltoplayfor'
ctx = ssl.create_default_context()
ctx.check_hostname = False  # Existing Aruba FTPS host alias; chain validation remains enabled.
ftp = FTP_TLS(context=ctx)
ftp.connect(host, 21, timeout=30)
ftp.login(os.environ['ARUBA_FTP_USERNAME'], os.environ['ARUBA_FTP_PASSWORD'])
ftp.prot_p()
ftp.cwd(remote)
def read(name):
    stream = io.BytesIO()
    ftp.retrbinary('RETR '+name, stream.write)
    return stream.getvalue()
# Abort before writing if any captured integration point has changed.
for item in (ROOT/'baseline').iterdir():
    if read(item.name) != item.read_bytes():
        raise SystemExit('Production changed: '+item.name)
for name in ['final-whistle.js', 'final-whistle.css']:
    try:
        existing = read(name)
    except error_perm as err:
        if not str(err).startswith('550'): raise
    else:
        if existing != (ROOT/name).read_bytes():
            raise SystemExit('Unexpected existing file: '+name)
for name in ['final-whistle.js', 'final-whistle.css']:
    data = (ROOT/name).read_bytes()
    ftp.storbinary('STOR '+name, io.BytesIO(data))
    if read(name) != data: raise SystemExit('Read-back mismatch: '+name)
old = (ROOT/'baseline/index.html').read_bytes()
if read('index.html') != old: raise SystemExit('Production index changed during upload')
backup = 'index.pre-final-whistle-'+os.environ['GITHUB_SHA'][:12]+'.html'
ftp.storbinary('STOR '+backup, io.BytesIO(old))
if read(backup) != old: raise SystemExit('Backup verification failed')
try:
    data = (ROOT/'index.html').read_bytes()
    ftp.storbinary('STOR index.html', io.BytesIO(data))
    if read('index.html') != data: raise RuntimeError('Index read-back mismatch')
except Exception:
    ftp.storbinary('STOR index.html', io.BytesIO(old))
    raise
ftp.quit()
print('Final Whistle files verified by FTPS. Public-page verification is still required.')
