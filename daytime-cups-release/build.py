from pathlib import Path
from html import escape
import json,hashlib
R=Path(__file__).resolve().parent
base='/nexus/alltoplayfor/'
cups={'champions':'RTH Champions League','europa':'RTH Europa League','conference':'RTH Conference League'}
def save(path,text):
 p=R/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
def banner(slug):
 return f'<img class="cup-banner" src="{base}assets/rth-{slug}-imc.webp" alt="{cups[slug]} · IMC" width="2048" height="683" fetchpriority="high">'
def footer():
 return '<nav class="bottom-nav" aria-label="Navigazione coppe"><a href="'+base+'daytime/">← DayTime</a>'+''.join(f'<a href="{base}daytime/{s}/">{n}</a>' for s,n in cups.items())+f'<a href="{base}">All To Play For</a></nav><footer>IMC · ALL TO PLAY FOR · ROAD TO HISTORY</footer>'
def shell(title,slug,content):
 return f'''<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} | DayTime</title><meta name="description" content="Le coppe RTH: classifiche aggiornate, risultati e calendario di Champions, Europa e Conference League."><link rel="canonical" href="https://www.italianmastersclub.it{base}daytime/{slug+'/' if slug else ''}"><link rel="stylesheet" href="https://www.italianmastersclub.it/nexus/alltoplayfor/style.css?v=12"><link rel="stylesheet" href="https://www.italianmastersclub.it/nexus/assets/navigation.css"><link rel="stylesheet" href="https://www.italianmastersclub.it/nexus/alltoplayfor/programmes.css?v=20261023-pages1"><link rel="stylesheet" href="{base}daytime-cups-v1.css?v=2"></head><body data-programme="daytime" data-cup="{slug}"><main class="atpf-pages">{content}{footer()}</main><script defer src="https://www.italianmastersclub.it/nexus/assets/navigation.js"></script>{f'<script defer src="{base}daytime-cups-v1.js"></script>' if slug else ''}</body></html>'''
for slug,title in cups.items():
 content=f'<header>{banner(slug)}<h1 class="sr-only">{title}</h1></header><div class="cup-content"><p id="load-status" role="status">Caricamento della competizione…</p><div id="cup-data" aria-busy="true"></div><div class="actions"><button id="refresh" type="button">Aggiorna</button><a id="competition-link" hidden>Apri la competizione</a></div><noscript>Attiva JavaScript per visualizzare classifica, risultati e calendario.</noscript></div>'
 save('daytime/'+slug+'/index.html',shell(title,slug,content))
cards=''.join(f'<a class="cup-card" href="{base}daytime/{s}/">{banner(s)}<span><strong>{n}</strong><span>Classifica · Risultati · Calendario <b aria-hidden="true">→</b></span></span></a>' for s,n in cups.items())
content='<header class="hub-title"><p class="eyebrow">ALL TO PLAY FOR · COPPE RTH</p><h1>DayTime</h1><p>Champions, Europa e Conference League. Le classifiche aggiornate, tutte le partite giocate e i prossimi incontri.</p></header><section class="cup-grid" aria-label="Le tre coppe">'+cards+'</section>'
save('daytime/index.html',shell('DayTime · Le coppe RTH','',content))
# Existing edition links remain useful: these pages show the current cup in full.
save('daytime/europa/2026-10-23/index.html', (R/'daytime/europa/index.html').read_text())
for path,tab in [('flash-news/','flash-news'),('mercato/','mercato'),('mercato/2026-10-22/','mercato')]:
 target=base+'rth-24/#'+tab
 save('daytime/'+path+'index.html',f'<!doctype html><html lang="it"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url={target}"><title>RTH 24</title></head><body><a href="{target}">Vai a RTH 24</a></body></html>')
# Only the DayTime catalog entry changes; other programmes are merged at deploy time.
save('daytime-catalog.json',json.dumps({'name':'DayTime','banner':'daytime-v1.webp','latest':None,'editions':[],'rubrics':{s:{'name':n,'banner':f'rth-{s}-imc.webp','latest':None,'editions':[]} for s,n in cups.items()}}))
