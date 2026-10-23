"""Publish the authorized Flash News layout and five reporter confirmations only."""
import io, os, re, ssl, subprocess, urllib.request
from pathlib import Path
from ftplib import FTP_TLS
ROOT = Path(__file__).resolve().parent.parent
BASE = '54fbb444c0c0f14b6c2f5d3f63ce087fa48dadba'
PUBLIC = 'https://www.italianmastersclub.it/nexus/alltoplayfor/'
files = {'daytime.js': 'alltoplayfor-release/daytime.js',
         'daytime.css': 'alltoplayfor-release/daytime.css',
         'coffee-day-after.js': 'coffee-today/coffee-day-after.js',
         '2026-10-23-coffee-editorial.json': 'coffee-today/edition.json'}
files.update({p.name: str(p.relative_to(ROOT)) for p in (ROOT/'coffee-release').glob('2026-*-coffee.json')})
new = {name: (ROOT/path).read_bytes() for name, path in files.items()}
expected = {name: subprocess.check_output(['git', 'show', BASE+':'+path], cwd=ROOT) for name, path in files.items()}
host = os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','')
raw = os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/')
domain = host[4:] if host.startswith('ftp.') else host
remote = (raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor'
ctx = ssl.create_default_context(); ctx.check_hostname = False
ftp = FTP_TLS(context=ctx); ftp.connect(host,21,timeout=30)
ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']); ftp.prot_p(); ftp.cwd(remote)
def read(name):
    out = io.BytesIO(); ftp.retrbinary('RETR '+name,out.write); return out.getvalue()
def put(name,data):
    ftp.storbinary('STOR '+name,io.BytesIO(data))
    assert read(name) == data, 'Read-back failed: '+name
old = {name: read(name) for name in files}
for name in files:
    assert old[name] in (expected[name], new[name]), 'Production differs from reviewed source: '+name
old['index.html'] = read('index.html')
index = old['index.html']
for asset in ['daytime.js', 'daytime.css', 'coffee-day-after.js']:
    pattern = rb'(?<=")'+re.escape(asset.encode())+rb'\?v=[^" ]+'
    index, count = re.subn(pattern, asset.encode()+b'?v=20261023-flash-confirmations',index)
    assert count == 1, 'Missing or duplicate asset in live page: '+asset
new['index.html'] = index
for name in old:
    put(name+'.pre-flash-'+os.environ['GITHUB_SHA'][:12],old[name])
written = []
try:
    for name,data in new.items():
        assert read(name) == old[name], 'Concurrent production change: '+name
        written.append(name); put(name,data)
except Exception:
    for name in reversed(written): put(name,old[name])
    raise
ftp.quit()
for name,data in new.items():
    request = urllib.request.Request(PUBLIC+name+'?verify='+os.environ['GITHUB_SHA'],headers={'Cache-Control':'no-cache'})
    assert urllib.request.urlopen(request,timeout=45).read() == data, 'Public mismatch: '+name
print('PASS: scoped publication, backups, FTPS read-back and public HTTPS equality for',len(new),'files')
