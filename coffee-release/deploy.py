"""Publish only scheduled Coffee editions and their two integration points."""
import io, os, ssl, json, urllib.request
from pathlib import Path
from ftplib import FTP_TLS, error_perm
ROOT=Path(__file__).parent
names=['coffee-upcoming.js','coffee-upcoming.css','coffee-editions.json']+[e['file'] for e in json.loads((ROOT/'coffee-editions.json').read_text())['editions']]
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','')
raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/')
domain=host[4:] if host.startswith('ftp.') else host
remote=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor'
ctx=ssl.create_default_context();ctx.check_hostname=False # Aruba alias: certificate chain still verified.
ftp=FTP_TLS(context=ctx);ftp.connect(host,21,timeout=30)
ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);ftp.prot_p();ftp.cwd(remote)
def read(name):
    out=io.BytesIO();ftp.retrbinary('RETR '+name,out.write);return out.getvalue()
def put(name,data):
    ftp.storbinary('STOR '+name,io.BytesIO(data))
    if read(name)!=data:raise RuntimeError('FTPS verification failed: '+name)
for name in ['index.html','programme-tabs.js','final-whistle.js']:
    if read(name)!=(ROOT/'baseline'/name).read_bytes():raise SystemExit('Production changed: '+name)
if read('2026-10-22-coffee.json')!=(ROOT/'evidence/2026-10-22-coffee.json').read_bytes():raise SystemExit('Current Coffee edition changed')
for name in names:
    try:old=read(name)
    except error_perm as error:
        if not str(error).startswith('550'):raise
    else:
        if old!=(ROOT/name).read_bytes():raise SystemExit('Existing file differs: '+name)
for name in names:put(name,(ROOT/name).read_bytes())
for name in ['final-whistle.js','programme-tabs.js','index.html']:
    if read(name)!=(ROOT/'baseline'/name).read_bytes():raise SystemExit('Integration changed during upload: '+name)
    put(name+'.pre-coffee-'+os.environ['GITHUB_SHA'][:12],(ROOT/'baseline'/name).read_bytes())
try:
    for name in ['final-whistle.js','programme-tabs.js','index.html']:put(name,(ROOT/name).read_bytes())
except Exception:
    for name in ['final-whistle.js','programme-tabs.js','index.html']:put(name,(ROOT/'baseline'/name).read_bytes())
    raise
ftp.quit()
for name in names+['final-whistle.js','programme-tabs.js','index.html']:
    req=urllib.request.Request('https://www.italianmastersclub.it/nexus/alltoplayfor/'+name+'?verify='+os.environ['GITHUB_SHA'],headers={'Cache-Control':'no-cache'})
    if urllib.request.urlopen(req,timeout=30).read()!=(ROOT/name).read_bytes():raise SystemExit('Public mismatch: '+name)
print('PASS: all published files verified over FTPS and public HTTPS, cache bypassed.')
