import json,re,os
from pathlib import Path
from datetime import datetime
from media import prepare,pending_upload
R=Path(__file__).parent

def validate(item):
 assert {'id','published_at','title','text'}<=set(item)<={'id','published_at','title','text','image','teams','category','club_ids','transfer','coverage','editorial_version'},'Invalid fields'
 assert item.get('category','flash') in ('flash','club','market'),'Invalid category'
 if 'club_ids' in item:
  assert isinstance(item['club_ids'],list) and len(item['club_ids'])<=40 and all(isinstance(x,str) and x.isdigit() for x in item['club_ids']),'Invalid club IDs'
 if 'editorial_version' in item:assert item['editorial_version'] in (2,3)
 if 'transfer' in item:
  t=item['transfer'];assert isinstance(t,dict) and set(t)=={'from','to','formula','amount','date'}
  assert all(isinstance(v,str) and 0<len(v)<=1000 for v in t.values())
  datetime.strptime(t['date'],'%Y-%m-%d')
 if 'coverage' in item:
  assert item.get('category')=='club' and isinstance(item['coverage'],list) and 1<=len(item['coverage'])<=2
  for c in item['coverage']:
   assert set(c)=={'club','reporter','manager','question','answer'}
   assert all(isinstance(v,str) and 0<len(v)<=3000 for v in c.values())
 def asset(name):
  assert isinstance(name,str) and re.fullmatch(r'[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp)',name),'Invalid asset filename'
  assert (R/'assets'/name).is_file(),'Missing image: '+name
 if 'image' in item:
  assert {'file','alt'}<=set(item['image'])<={'file','alt','sha256'} and isinstance(item['image']['alt'],str) and item['image']['alt'].strip()
  asset(item['image']['file'])
 if 'teams' in item:
  assert isinstance(item['teams'],list) and len(item['teams'])<=10
  for team in item['teams']:
   assert {'name'}<=set(team)<={'name','logo','sha256'} and isinstance(team['name'],str) and team['name'].strip()
   if 'logo' in team:asset(team['logo'])
 assert re.fullmatch(r'[a-z0-9][a-z0-9-]{2,119}',item['id']),'Invalid ID'
 assert isinstance(item['title'],str) and 1<=len(item['title'].strip())<=200,'Invalid title'
 assert isinstance(item['text'],str) and 1<=len(item['text'].strip())<=20000,'Invalid text'
 d=datetime.fromisoformat(item['published_at'].replace('Z','+00:00'));assert d.tzinfo is not None,'Date must include timezone'
 return d.timestamp()

def build():
 items=[]
 for p in sorted((R/'items').glob('*.json')):
  item=json.loads(p.read_text())
  if pending_upload(item):
   print('WAITING FOR PHOTO (not published):',p.stem);continue
  prepare([item]);validate(item);assert p.stem==item['id'],'Filename must match id';items.append(item)
 assert len({x['id'] for x in items})==len(items),'Duplicate ID'
 items.sort(key=lambda x:(validate(x),x['id']),reverse=True)
 out=R/'dist';out.mkdir(exist_ok=True)
 (out/'flash-news.json').write_text(json.dumps({'version':1,'revision':os.environ.get('DEPLOY_SHA','preview'),'items':items},ensure_ascii=False,indent=2)+'\n')
 print('Validated',len(items),'Flash News')
if __name__=='__main__':build()
