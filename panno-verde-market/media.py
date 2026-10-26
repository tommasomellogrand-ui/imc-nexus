"""Resolve authorized image URLs on the runner, then retain immutable public copies."""
import hashlib,io,json,re,time,urllib.request,urllib.parse,urllib.error
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).parent
PUBLIC='https://www.italianmastersclub.it/nexus/il-panno-verde/'
MAX_BYTES=12*1024*1024

def pending_upload(item):
 image=item.get('image',{})
 name=image.get('upload_name')
 if name is None:return False
 if not isinstance(name,str) or not name or Path(name).name!=name or name in {'.','..'} or '\\' in name:
  raise ValueError('Upload must be an exact filename without directories')
 return not (ROOT/'uploads'/name).is_file()

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
 for attempt in range(3):
  try:
   with urllib.request.build_opener(Redirect).open(urllib.request.Request(url,headers={'Cache-Control':'no-cache','User-Agent':'IMC-Nexus/1.0'}),timeout=30) as response:
    data=response.read(MAX_BYTES+1)
   if len(data)>MAX_BYTES:raise ValueError('Image exceeds 12 MB')
   return data
  except (urllib.error.URLError,TimeoutError,OSError) as e:
   reason='HTTP '+str(e.code) if isinstance(e,urllib.error.HTTPError) else type(e).__name__
   if attempt<2:time.sleep(attempt+1)
 raise ValueError('Download failed from '+urllib.parse.urlsplit(url).hostname+' ('+reason+', 3 attempts)') from None

def source_image(obj,name,item_id):
 url=obj.get('source_url')
 if not url:raise ValueError('News '+item_id+': missing image '+name)
 match=re.fullmatch(r'https://cdn\.soccerwiki\.org/images/logos/clubs/([1-9][0-9]{0,7})\.png',url)
 if match:
  try:
   data=download(PUBLIC+'crest-cache-v1.php?id='+match[1]);inspect(data,name)
   print('MEDIA',item_id,name,'resolved through persistent Nexus crest cache')
   return data
  except ValueError as e:print('MEDIA',item_id,name,'Nexus cache unavailable:',str(e))
 try:
  data=download(url);inspect(data,name);return data
 except Exception as e:raise ValueError('News '+item_id+'; image '+name+'; '+str(e)) from None

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
  refs += [(t,'logo') for t in item.get('teams',[]) if t.get('logo')]
  refs += [(c[key],'file') for c in item.get('coverage',[]) for key in ['reporter_image','manager_image'] if c.get(key)]
  for obj,key in refs:
   name=obj[key]
   if not re.fullmatch(r'[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp)',name):raise ValueError('Invalid asset name')
   target=ROOT/'assets'/name
   if 'upload_name' in obj:
    if pending_upload(item):raise ValueError('Original photo not uploaded yet')
    data=(ROOT/'uploads'/obj['upload_name']).read_bytes()
    if len(data)>MAX_BYTES:raise ValueError('Image exceeds 12 MB')
    inspect(data,name)
    if target.exists() and target.read_bytes()!=data:raise ValueError('Use a new image filename; existing asset differs')
    target.parent.mkdir(exist_ok=True);target.write_bytes(data)
    obj.pop('upload_name')
   if not target.exists():
    if remote is None:
     remote=json.loads(download(PUBLIC+'flash-news.json'))
    previous=[ref for news in remote['items'] for ref in ([news['image']] if 'image' in news else [])+news.get('teams',[])+[c[k] for c in news.get('coverage',[]) for k in ['reporter_image','manager_image'] if c.get(k)] if ref.get('file',ref.get('logo'))==name]
    if previous:
     data=download(PUBLIC+name);digest=inspect(data,name)
     if not previous[0].get('sha256') or digest!=previous[0]['sha256']:raise ValueError('Published image checksum mismatch')
    else:
     data=source_image(obj,name,item.get('id','unknown'))
    target.parent.mkdir(exist_ok=True);target.write_bytes(data)
   digest=inspect(target.read_bytes(),name)
   if obj.get('sha256') and obj['sha256']!=digest:raise ValueError('Image checksum mismatch')
   obj['sha256']=digest
   obj.pop('source_url',None)
