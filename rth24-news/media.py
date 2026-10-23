"""Resolve authorized image URLs on the runner, then retain immutable public copies."""
import hashlib,io,json,re,urllib.request,urllib.parse
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).parent
PUBLIC='https://www.italianmastersclub.it/nexus/alltoplayfor/rth-24/'
MAX_BYTES=12*1024*1024

def checked_url(url):
 p=urllib.parse.urlsplit(url);h=p.hostname or ''
 allowed=h in {'www.italianmastersclub.it','cdn.soccerwiki.org','raw.githubusercontent.com'} or h.endswith('.oaiusercontent.com') or (h.startswith(('oaisdmntpr','oaisdsorpr')) and h.endswith('.blob.core.windows.net')) or (h.startswith('oaisdmntpr') and h.endswith('.amazonaws.com'))
 if p.scheme!='https' or not allowed or p.username or p.password or p.port not in (None,443):raise ValueError('Unsupported image download host; supply an authorized HTTPS attachment URL')
 return url
class Redirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  checked_url(newurl);return super().redirect_request(req,fp,code,msg,headers,newurl)
def download(url):
 checked_url(url)
 try:
  with urllib.request.build_opener(Redirect).open(urllib.request.Request(url,headers={'Cache-Control':'no-cache'}),timeout=45) as response:
   data=response.read(MAX_BYTES+1)
 except Exception:raise ValueError('Image download failed or URL expired; refresh the download URL') from None
 if len(data)>MAX_BYTES:raise ValueError('Image exceeds 12 MB')
 return data

def inspect(data,name):
 with Image.open(io.BytesIO(data)) as img:
  expected={'.jpg':'JPEG','.jpeg':'JPEG','.png':'PNG','.webp':'WEBP'}[Path(name).suffix]
  if img.format!=expected:raise ValueError('Image extension does not match original bytes')
  if img.width*img.height>40_000_000:raise ValueError('Image dimensions too large')
  img.verify()
 return hashlib.sha256(data).hexdigest()

def prepare(items):
 remote=None
 for item in items:
  refs=[]
  if 'image' in item:refs.append((item['image'],'file'))
  refs += [(t,'logo') for t in item.get('teams',[])]
  for obj,key in refs:
   name=obj[key]
   if not re.fullmatch(r'[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp)',name):raise ValueError('Invalid asset name')
   target=ROOT/'assets'/name
   if not target.exists():
    if remote is None:
     remote=json.loads(download(PUBLIC+'flash-news.json'))
    previous=[ref for news in remote['items'] for ref in ([news['image']] if 'image' in news else [])+news.get('teams',[]) if ref.get('file',ref.get('logo'))==name]
    if previous:
     data=download(PUBLIC+name);digest=inspect(data,name)
     if not previous[0].get('sha256') or digest!=previous[0]['sha256']:raise ValueError('Published image checksum mismatch')
    else:
     if not obj.get('source_url'):raise ValueError('Missing image download URL: '+name)
     data=download(obj['source_url']);inspect(data,name)
    target.parent.mkdir(exist_ok=True);target.write_bytes(data)
   digest=inspect(target.read_bytes(),name)
   if obj.get('sha256') and obj['sha256']!=digest:raise ValueError('Image checksum mismatch')
   obj['sha256']=digest
   obj.pop('source_url',None)
