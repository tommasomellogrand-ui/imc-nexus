import json,re,os
from pathlib import Path
from datetime import datetime
from media import prepare,pending_upload
R=Path(__file__).parent

def validate(item):
 assert {'id','published_at','title','text'}<=set(item)<={'id','published_at','title','text','image','teams','category','club_ids','transfer','coverage','editorial_version','interview','post_match','division_news'},'Invalid fields'
 assert item.get('category','flash') in ('flash','club','market','post-match'),'Invalid category'
 if 'club_ids' in item:
  assert isinstance(item['club_ids'],list) and len(item['club_ids'])<=40 and all(isinstance(x,str) and x.isdigit() for x in item['club_ids']),'Invalid club IDs'
 if 'editorial_version' in item:assert item['editorial_version'] in (2,3)
 if 'transfer' in item:
  t=item['transfer'];assert isinstance(t,dict) and {'from','to','formula','amount','date'}<=set(t)<={'from','to','formula','amount','date','from_logo','to_logo'}
  assert all(isinstance(v,str) and 0<len(v)<=1000 for v in t.values())
  datetime.strptime(t['date'],'%Y-%m-%d')
 if 'post_match' in item or 'interview' in item:
  assert item.get('category')=='post-match'
  pm=item['post_match'];assert pm['world']=='GW011' and pm['club_id'] in item['club_ids']
  assert {'world','fixture_id','manager_id','manager','club_id','club','opponent','match_date','result','source_hash'}<=set(pm)<={'world','fixture_id','manager_id','manager','club_id','club','opponent','match_date','result','source_hash','home','away','home_score','away_score','home_logo','away_logo','division','round','competition_label'}
  assert all(isinstance(v,str) and v for v in pm.values())
  assert re.fullmatch(r'MNG[0-9]+',pm['manager_id'])
  datetime.strptime(pm['match_date'],'%Y-%m-%d')
  assert len(item['interview'])==5 and len({q['question'] for q in item['interview']})==5
  for qa in item['interview']:
   assert {'question','answer'}<=set(qa)<={'question','answer','player'} and all(isinstance(qa[k],str) and 0<len(qa[k])<=3000 for k in ['question','answer'])
   if 'player' in qa:assert {'id','name'}<=set(qa['player'])<={'id','name','image'} and qa['player']['id'].isdigit()
 if 'coverage' in item:
  assert item.get('category')=='club' and isinstance(item['coverage'],list) and 1<=len(item['coverage'])<=2
  for c in item['coverage']:
   assert {'club','reporter','manager','question','answer'}<=set(c)<={'club','reporter','manager','question','answer','reporter_image','manager_image'}
   assert all(isinstance(v,str) and 0<len(v)<=3000 for k,v in c.items() if k not in ('reporter_image','manager_image'))
 def asset(name):
  assert isinstance(name,str) and re.fullmatch(r'[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp)',name),'Invalid asset filename'
  assert (R/'assets'/name).is_file(),'Missing image: '+name
 if 'division_news' in item:
  d=item['division_news'];assert item['category']=='flash' and d['world']=='GW011' and d['division'] in ('1','2') and isinstance(d['round'],int) and d['round']>0
  datetime.strptime(d['date'],'%Y-%m-%d')
  assert d['kind'] in ('results','standings')
  teams=[]
  if d['kind']=='results':
   assert len(d['fixtures'])==5
   for f in d['fixtures']:
    assert all(isinstance(f[k],int) and f[k]>=0 for k in ['home_score','away_score'])
    teams.extend([f['home'],f['away']])
  else:
   assert len(d['standings'])==10;teams=d['standings']
   assert [t['position'] for t in teams]==list(range(1,11))
   for t in teams:assert t['points']==3*t['won']+t['drawn'] and t['gd']==t['gf']-t['ga'] and t['played']==t['won']+t['drawn']+t['lost']
  assert {t['id'] for t in teams}==set(item['club_ids']) and len(teams)==10
  for team in teams:
   assert team['name'] and team['manager'] and re.fullmatch('MNG[0-9]+',team['manager_id']);asset(team['logo'])
 for key in ['home_logo','away_logo']:
  if item.get('post_match',{}).get(key):asset(item['post_match'][key])
 for qa in item.get('interview',[]):
  photo=qa.get('player',{}).get('image')
  if photo:
   assert photo['alt']==qa['player']['name'];asset(photo['file'])
 for logo in ['from_logo','to_logo']:
  if item.get('transfer',{}).get(logo):asset(item['transfer'][logo])
 for c in item.get('coverage',[]):
  for key in ['reporter_image','manager_image']:
   if key in c:
    photo=c[key];assert {'file','alt'}<=set(photo)<={'file','alt','sha256'}
    assert isinstance(photo['alt'],str) and photo['alt']==c[key.replace('_image','')]
    asset(photo['file'])
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
 clubs=json.loads((R/'automation/clubs.json').read_text())
 assert len(clubs)==20 and len({c['id'] for c in clubs})==20,'Expected 20 active GW011 clubs'
 names={}
 for club in clubs:
  for name in [club['name'],*club.get('aliases',[])]:
   key=name.strip().casefold();assert key not in names or names[key]==club['id'];names[key]=club['id']
  # Club logos are optional and retried by the exporter.
 active_ids={c['id'] for c in clubs}
 items=[]
 for p in sorted((R/'items').glob('*.json')):
  item=json.loads(p.read_text())
  if pending_upload(item):
   print('WAITING FOR PHOTO (not published):',p.stem);continue
  prepare([item]);validate(item)
  tagged=list(dict.fromkeys(item.get('club_ids',[])+[names[t['name'].strip().casefold()] for t in item.get('teams',[]) if t['name'].strip().casefold() in names]))
  assert set(tagged)<=active_ids,'Unknown active club ID in '+item['id']
  item['club_ids']=tagged
  assert p.stem==item['id'],'Filename must match id';items.append(item)
 assert len({x['id'] for x in items})==len(items),'Duplicate ID'
 items.sort(key=lambda x:(validate(x),x['id']),reverse=True)
 out=R/'dist';out.mkdir(exist_ok=True)
 (out/'flash-news.json').write_text(json.dumps({'world':'GW011','version':1,'revision':os.environ.get('DEPLOY_SHA','preview'),'items':items,'clubs':[{k:c[k] for k in ['id','name','logo'] if c.get(k)} for c in clubs]},ensure_ascii=False,indent=2)+'\n')
 print('Validated',len(items),'Flash News')
if __name__=='__main__':build()
