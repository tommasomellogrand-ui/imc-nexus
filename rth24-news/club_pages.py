"""Static, crawlable permanent pages for Club News only."""
import html,json,re
from pathlib import Path
BASE='https://www.italianmastersclub.it/nexus/alltoplayfor/rth-24/'
def esc(s):return html.escape(str(s),quote=True)
def asset(photo,cls='portrait'):
 if not photo:return ''
 return f'<img class="{cls}" src="{BASE}{esc(photo["file"])}" alt="{esc(photo["alt"])}">'
def build_pages(items,out):
 root=Path(out)/'club-news';root.mkdir(parents=True,exist_ok=True)
 for item in items:
  if item.get('category')!='club':continue
  slug=item['id'];assert re.fullmatch(r'[a-z0-9][a-z0-9-]{2,119}',slug)
  url=BASE+'club-news/'+slug+'/'
  paragraphs=item['text'].split('\n\n')
  summary=next((p for p in paragraphs[1:] if len(p)>100),paragraphs[-1])
  description=' '.join(summary.split())
  if len(description)>220:description=description[:217].rsplit(' ',1)[0]+'…'
  title=esc(item['title']);photo=item.get('image');meta=''
  if photo:meta=f'<meta property="og:image" content="{BASE}{esc(photo["file"])}"><meta property="og:image:alt" content="{esc(photo["alt"])}"><meta name="twitter:image" content="{BASE}{esc(photo["file"])}">'
  body=''.join('<p>'+esc(p).replace('\n','<br>')+'</p>' for p in item['text'].split('\n\n'))
  if item.get('coverage'):
   body=''.join('<p>'+esc(p).replace('\n','<br>')+'</p>' for p in item['text'].split('\n\n')[:2])
   for c in item['coverage']:
    body+='<section class="connection"><h2>'+esc(c['club'])+'</h2>'
    for name,key,words in [(c['reporter'],'reporter_image',c['question']),(c['manager'],'manager_image',c['answer'])]:
     body+='<div class="turn">'+asset(c.get(key),'avatar')+'<h3>'+esc(name)+'</h3><p>«'+esc(words)+'»</p></div>'
    body+='</section>'
  teams=' · '.join(esc(t['name']) for t in item.get('teams',[]))
  page=f'''<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} | Club News · Nexus</title><meta name="description" content="{esc(description)}"><link rel="canonical" href="{url}"><meta property="og:type" content="article"><meta property="og:locale" content="it_IT"><meta property="og:site_name" content="Nexus · RTH24"><meta property="og:title" content="{title}"><meta property="og:description" content="{esc(description)}"><meta property="og:url" content="{url}"><meta property="article:published_time" content="{esc(item['published_at'])}"><meta name="twitter:card" content="{'summary_large_image' if photo else 'summary'}"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{esc(description)}">{meta}<link rel="stylesheet" href="{BASE}club-pages-v1.css"><script defer src="{BASE}share-v1.js"></script></head><body><header class="masthead"><a href="/nexus/">NEXUS</a><a href="{BASE}">RTH24</a></header><main><nav><a href="{BASE}#news-{slug}">← Tutte le Club News</a></nav><article><div class="eyebrow">ROAD TO HISTORY · CLUB NEWS</div><div class="teams">{teams}</div><h1>{title}</h1><time datetime="{esc(item['published_at'])}">{esc(item['published_at'][:10].split('-')[2]+ '/' +item['published_at'][5:7]+'/'+item['published_at'][:4])} · {esc(item['published_at'][11:16])}</time>{asset(photo,'cover')}<div class="rth-news-actions" data-share-url="{url}" data-share-title="{title}"><button type="button" data-share="native">Condividi</button><button type="button" data-share="copy">Copia link</button><span role="status" aria-live="polite"></span><input hidden readonly aria-label="Link da copiare"></div><div class="article-text">{body}</div></article><footer><a href="{BASE}">Torna a RTH24</a></footer></main></body></html>'''
  folder=root/slug;folder.mkdir(exist_ok=True);(folder/'index.html').write_text(page)
 print('Club News permanent pages:',sum(i.get('category')=='club' for i in items))
if __name__=='__main__':
 p=Path(__file__).parent/'dist';build_pages(json.loads((p/'flash-news.json').read_text())['items'],p)
