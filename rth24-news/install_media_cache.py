"""Install a constrained crest cache using the already configured Aruba account."""
import io,json,os,re,ssl
from pathlib import Path
from ftplib import FTP_TLS,error_perm
R=Path(__file__).parent
ids=set()
for path in (R/'items').glob('*.json'):
 for team in json.loads(path.read_text()).get('teams',[]):
  match=re.fullmatch(r'https://cdn\.soccerwiki\.org/images/logos/clubs/([1-9][0-9]{0,7})\.png',team.get('source_url',''))
  if match:ids.add(match[1])
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
remote=(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')+'/alltoplayfor/rth-24'
ctx=ssl.create_default_context();ctx.check_hostname=False
ftp=FTP_TLS(context=ctx);ftp.connect(host,21,timeout=40);ftp.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);ftp.prot_p();ftp.cwd(remote)
def read(name):
 data=io.BytesIO()
 try:ftp.retrbinary('RETR '+name,data.write);return data.getvalue()
 except error_perm as e:
  if str(e).startswith('550'):return None
  raise
for name,data in [('crest-cache-v1.php',(R/'crest-cache-v1.php').read_bytes()),('crest-allowlist.json',json.dumps(sorted(ids)).encode())]:
 old=read(name)
 if name.endswith('.php') and old is not None:assert old==data,'Cache endpoint changed externally'
 if old!=data:
  ftp.storbinary('STOR '+name,io.BytesIO(data));assert read(name)==data,'Cache installation read-back mismatch'
ftp.quit();print('Crest cache ready for',len(ids),'approved club IDs')
