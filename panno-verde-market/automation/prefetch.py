"""Fetch distinct, verified transfer images concurrently for archive imports."""
from concurrent.futures import ThreadPoolExecutor
import generate

def run(snap,cfg):
 jobs={};clubs={str(c['club_id']):c for c in snap['clubs']};external={n.casefold():c for n,c in snap.get('transfer_clubs',{}).items()}
 for row in snap['rows']:
  if not generate.eligible(row,cfg):continue
  pid=str(row['player_id']);p=snap['players'].get(pid,{})
  jobs['market-player-'+pid]=p.get('image_url') or row.get('player_image') or ('https://cdn.soccerwiki.org/images/player/'+p['image_file'] if p.get('image_file') else None)
  for side in ['from','to']:
   cid=str(row.get(side+'_sm_world_club_id'));c=clubs.get(cid) or external.get(str(row.get('club_'+side,'')).casefold())
   if not c:continue
   prefix='market-club-'+cid if cid in clubs else 'market-global-club-'+str(c['id'])
   jobs[prefix]=c.get('image_url') or ('https://cdn.soccerwiki.org/images/logos/clubs/'+c['image_file'] if c.get('image_file') else None)
 original=generate.optional_asset
 def fetch(job):
  prefix,url=job;return prefix,original(url,prefix)
 with ThreadPoolExecutor(max_workers=8) as pool:cached=dict(pool.map(fetch,jobs.items()))
 def reuse(url,prefix):return cached[prefix] if prefix in cached else original(url,prefix)
 generate.optional_asset=reuse
 print('ARCHIVE_MEDIA',{'requested':len(jobs),'available':sum(bool(x) for x in cached.values()),'retry':sum(not x for x in cached.values())})
