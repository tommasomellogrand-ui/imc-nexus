import io,os,ssl,re,json,subprocess,base64
from pathlib import Path
from ftplib import FTP_TLS,error_perm
R=Path(__file__).parent
host=os.environ['ARUBA_FTP_HOST'].replace('ftp://','').replace('ftps://','');raw=os.environ['ARUBA_FTP_REMOTE_DIR'].rstrip('/');domain=host[4:] if host.startswith('ftp.') else host
ctx=ssl.create_default_context();ctx.check_hostname=False
f=FTP_TLS(context=ctx);f.connect(host,21,timeout=40);f.login(os.environ['ARUBA_FTP_USERNAME'],os.environ['ARUBA_FTP_PASSWORD']);f.prot_p();f.cwd(raw if raw.startswith('/www.') else f'/www.{domain}{raw}')
def read(n):
 b=io.BytesIO()
 try:f.retrbinary('RETR '+n,b.write)
 except error_perm as e:
  if str(e).startswith('550'):return None
  raise
 return b.getvalue()
def write(n,b):
 f.storbinary('STOR '+n,io.BytesIO(b));assert read(n)==b,n
old=read('.htaccess')
block=b'''# BEGIN NEXUS WORLD ROUTES
RewriteEngine On
RewriteCond %{THE_REQUEST} \\s/+nexus/(?:index\\.html)?(?:\\?|\\s) [NC]
RewriteCond %{QUERY_STRING} (?:^|&)world=GW(?:00[1-9]|01[01])(?:&|$) [NC]
RewriteRule ^(?:index\\.html)?$ world-routes/legacy.php [END]
RewriteRule ^(gw00[1-9]|gw01[01])/?$ world-routes/home.php?route_world=$1 [QSA,END,NC]
RewriteRule ^gw011/risingstarsleague/?$ world-routes/risingstarsleague/index.html [END,NC]
# END NEXUS WORLD ROUTES
'''
base=re.sub(br'# BEGIN NEXUS WORLD ROUTES\n.*?# END NEXUS WORLD ROUTES\n?',b'',old or b'',flags=re.S)
new=block+base
# Abort if shared home introduces unsupported scripts; never publish a broken adapter.
html=read('index.html').decode();asset=(R/'site/asset.php').read_text()
for src in re.findall(r'<script[^>]+src=[\"\x27]([^\"\x27]+)',html,re.I):
 if src.startswith(('http:','https:','//')):continue
 name=src.split('?')[0].removeprefix('/nexus/').lstrip('/')
 assert "'"+name+"'" in asset,'New home script needs adapter review: '+name
before={}
try:
 for p in sorted((R/'site').rglob('*')):
  if not p.is_file():continue
  n='world-routes/'+p.relative_to(R/'site').as_posix()
  for parent in reversed(Path(n).parents):
   if str(parent)=='.':continue
   try:f.mkd(str(parent))
   except error_perm as e:assert str(e).startswith('550')
  data=p.read_bytes()
  if n.endswith('.b64'):n=n[:-4];data=base64.b64decode(data)
  before[n]=read(n);write(n,data)
 write('.htaccess',new)
 subprocess.run(['node',str(R/'verify.cjs')],check=True)
except Exception:
 if old is None:
  if read('.htaccess') is not None:f.delete('.htaccess')
 else:write('.htaccess',old)
 for n,b in before.items():
  if b is None:f.delete(n)
  else:write(n,b)
 raise
finally:f.quit()
print('PASS: clean world routes and Rising Stars published; verification passed')
