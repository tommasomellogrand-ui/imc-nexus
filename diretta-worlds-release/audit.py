import os,ssl,io,hashlib,json
from pathlib import Path
from ftplib import FTP_TLS
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
remote=raw if raw.startswith('/www.') else f'/www.{domain}{raw}'
ctx=ssl.create_default_context();ctx.check_hostname=False
f=FTP_TLS(context=ctx);f.connect(host,21,timeout=40);f.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);f.prot_p();f.cwd(remote)
out=Path('/tmp/diretta-source');out.mkdir(exist_ok=True)
files=['matchday/data.php','matchday/engine.php','matchday/identity.php','matchday/live.js','matchday/live.html','index.html','assets/home.js']
manifest={}
for name in files:
 b=io.BytesIO();f.retrbinary('RETR '+name,b.write);content=b.getvalue();dest=out/name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(content);manifest[name]=hashlib.sha256(content).hexdigest()
f.quit();(out/'manifest.json').write_text(json.dumps(manifest,indent=2));print('Read production source for replay and world home. No server writes.')
