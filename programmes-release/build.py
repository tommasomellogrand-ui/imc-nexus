"""Build permanent programme and edition pages, reusing published editorial renderers."""
import json, re, shutil
from html import escape
from pathlib import Path
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parent
OUT=ROOT/'dist'
OUT.mkdir(exist_ok=True)
BASE='/nexus/alltoplayfor/'
catalog=json.loads((ROOT/'catalog.json').read_text())
version='20261023-pages1'
def save(name,text):
    p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
def date_label(date):
    months=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre']
    y,m,d=map(int,date.split('-'));return f'{d} {months[m-1]} {y}'
def link(path,label,cls=''):
    return f'<a class="{cls}" href="{BASE}{path}">{escape(label)}</a>'
def shell(title,path,content,scripts=(),styles=(),attrs=''):
    css=['style.css?v=12','/nexus/assets/navigation.css','programme-tabs.css?v=3','banner.css?v=2','programmes.css?v='+version]+list(styles)
    head=''.join(f'<link rel="stylesheet" href="{f}">' for f in css)
    nav='<nav class="programme-links" aria-label="Programmi">'+''.join(f'<a href="{BASE}{p}/"'+(' aria-current="page"' if path.split('/')[0]==p else '')+'>'+catalog[p]['name']+'</a>' for p in ['rth-24','coffee-time','daytime','final-whistle'])+'</nav>'
    tags=''.join(f'<script defer src="{s}"></script>' for s in ['/nexus/assets/navigation.js']+list(scripts)+['programmes.js?v='+version])
    return f'<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="{BASE}"><title>{escape(title)} | ALL TO PLAY FOR</title><link rel="canonical" href="https://www.italianmastersclub.it{BASE}{path}">{head}</head><body {attrs}><main class="atpf-pages"><nav class="series-breadcrumb" aria-label="Percorso">{link("","ALL TO PLAY FOR")}<span> / </span><span>{escape(title)}</span></nav>{nav if path else ''}{content}<footer>ALL TO PLAY FOR · ROAD TO HISTORY · GW001</footer></main>{tags}</body></html>'
def banner(p):
    return f'<header class="programme-heading"><h1 class="sr-only">{catalog[p]["name"]}</h1><img class="section-banner" src="assets/{catalog[p]["banner"]}" alt="ALL TO PLAY FOR | {catalog[p]["name"]}" width="2048" height="683" fetchpriority="high"></header>'
disclosure='<p class="series-disclosure">Serie di finzione ispirata a persone reali e ai dati Nexus. Scene e dialoghi sono ricostruzioni narrative, non dichiarazioni o partecipazioni reali.</p>'
cards=''.join(f'<a class="programme-card card-{p}" href="{BASE}{p}/"><img src="assets/{catalog[p]["banner"]}" alt="" width="2048" height="683"><span>{catalog[p]["name"]} <b aria-hidden="true">→</b></span></a>' for p in ['rth-24','coffee-time','daytime','final-whistle'])
cards+=f'<a class="programme-card card-diretta-gol" href="{BASE}diretta-gol/"><img src="assets/diretta-gol-v1.webp" alt="" width="2048" height="683"><span>Diretta Gol <b aria-hidden="true">→</b></span></a>'
home='<header class="programme-heading"><h1 class="sr-only">ALL TO PLAY FOR</h1><img class="section-banner" src="assets/all-to-play-for-brand-v1.webp" alt="ALL TO PLAY FOR" width="2048" height="683"></header><section class="series-intro"><h2>Benvenuti in ALL TO PLAY FOR</h2><p>I programmi di approfondimento di Road To History: notizie, mercato, storie dai campi e il racconto delle partite. Scegli il tuo programma ed entra nel mondo GW001.</p></section><section class="programme-grid" aria-label="I cinque programmi">'+cards+'</section>'
home_html=shell('ALL TO PLAY FOR','',home,styles=['home-layout-v2.css?v=20261023-entry1'],attrs='data-programme="home"')
home_html=re.sub(r'<nav class="series-breadcrumb".*?</nav>','',home_html)
save('index.html',home_html)
live_content='<header class="programme-heading"><h1 class="sr-only">Diretta Gol</h1><img class="section-banner" src="assets/diretta-gol-v1.webp" alt="ALL TO PLAY FOR | Diretta Gol" width="2048" height="683"></header><p class="dg-intro">Tutte le emozioni di Road To History: segui il tabellone e rivivi gol ed eventi della giornata.</p><section class="dg-daybar"><div><span class="dg-kicker">REPLAY DELLA GIORNATA</span><h2 id="dg-day-label">Caricamento giornata…</h2></div><details id="dg-picker"><summary>Cambia giornata</summary><form class="replay-select"><label>Stagione <select id="replay-season" aria-label="Stagione"></select></label><label>Giornata <select id="replay-day" aria-label="Giornata"></select></label></form></details></section><p id="replay-status" role="status">Caricamento giornate…</p><iframe id="replay-frame" title="Diretta Gol · Replay della giornata" scrolling="no"></iframe>'
live_page=shell('Diretta Gol','diretta-gol/',live_content,scripts=['diretta-gol-v3.js'],styles=['diretta-gol-v3.css'],attrs='data-programme="diretta-gol"')
live_page=re.sub(r'<nav class="programme-links".*?</nav>','',live_page)
live_page=re.sub(r'<nav class="series-breadcrumb".*?</nav>','<a class="dg-back" href="/nexus/alltoplayfor/">← All To Play For</a>',live_page)
save('diretta-gol/index.html',live_page)
legacy='<div hidden id="legacy-support"><button id="prev"></button><button id="next"></button><button id="today"></button><div id="tabs"></div><div id="directory"></div><div id="reader"></div></div>'
def make(p,rubric=None,date=None):
    program=catalog[p];entry=program['rubrics'][rubric] if rubric else program
    prefix=p+'/'+(rubric+'/' if rubric else '')
    url=prefix+(date+'/' if date else '')
    selected=date or entry['latest'];title=entry['name']+((' · '+date_label(date)) if date else '')
    content=banner(p);scripts=[];styles=[]
    if rubric:content+='<p class="programme-return">'+link('daytime/','← Tutto Daytime')+'</p>'
    if p=='rth-24':
        content+='<section class="rth-intro"><h2>Benvenuti in Road To History 24</h2><p>Il programma di informazione e approfondimento di Road To History. Risultati, prossime partite e mercato: le flash news del mondo GW001, tutte in un unico spazio.</p></section><section class="rth-flash"><nav class="rth-tabs" role="tablist" aria-label="Flash News">'
        for key,label in [('ultimora','Ultim’ora'),('club','Club News'),('flash-news','Flash News'),('mercato','Calciomercato')]:
            content+=f'<button type="button" role="tab" id="rth-tab-{key}" aria-controls="rth-panel-{key}" aria-selected="{str(key=="ultimora").lower()}" tabindex="{0 if key=="ultimora" else -1}">{label}</button>'
        content+='</nav>'
        for key,label in [('ultimora','Ultim’ora'),('club','Club News'),('flash-news','Flash News'),('mercato','Calciomercato')]:
            content+=f'<section role="tabpanel" class="rth-panel" id="rth-panel-{key}" aria-labelledby="rth-tab-{key}" tabindex="0"'+(' hidden' if key!='ultimora' else '')+f'><h3>{label}</h3><p>Non ci sono ancora flash news in questa sezione.</p></section>'
        content+='</section>'
        scripts+=['rth-24/feed-v9.js'];styles+=['rth24.css?v=2','rth-24/feed-v9.css']
    else:
        if entry['editions']:
            content+='<div class="edition-heading"><p>'+('Edizione del ' if date else 'Ultima edizione · ')+date_label(selected)+'</p>'
            content+=link(prefix,'Torna all’ultima edizione') if date else link(prefix+selected+'/','Apri la pagina di questa edizione')
            content+='</div>'
        content+=disclosure+f'<input hidden type="date" id="date" value="{selected}">'
        if p=='coffee-time':
            content+='<section id="panel-coffee-time"><p class="programme-pending" hidden></p></section>'
            styles+=['coffee.css?v=6']
            scripts+=['coffee.js?v=6'] if selected=='2026-10-22' else ['coffee-day-after.js?v=20261023-flash-confirmations']
        elif p=='daytime':
            content+='<section id="panel-daytime"><p class="programme-pending"></p></section>'
            styles+=['daytime.css?v=20261023-flash-confirmations','daytime-imc.css?v=20261023-rounds']
            scripts+=['daytime-pages.js?v='+version,'daytime-imc.js?v=20261023-rounds']
        else:
            content+='<section id="panel-final-whistle">'
            if selected=='2026-10-20':
                content+='<p id="status"></p><div id="content"></div>'+legacy;scripts+=['postmatch.js?v=3'];styles+=['postmatch.css?v=2','postmatch-polish.css?v=1']
            else:scripts+=['final-whistle.js?v=20261022-schedule'];styles+=['final-whistle.css?v=20261022']
            content+='</section>'
        if entry['editions']:
            content+='<section class="edition-archive"><h2>Edizioni pubblicate</h2><nav aria-label="Archivio '+escape(entry['name'])+'">'+''.join(link(prefix+d+'/',date_label(d),'archive-link') for d in entry['editions'])+'</nav></section>'
    attrs=f'data-programme="{p}" data-rubric="{rubric or ""}" data-edition="{date or ""}"'
    save(url+'index.html',shell(title,url,content,scripts,styles,attrs))
for p,entry in catalog.items():
    make(p)
    for d in entry['editions']:make(p,date=d)
    for rubric,section in entry.get('rubrics',{}).items():
        make(p,rubric)
        for d in section['editions']:make(p,rubric,d)
# Adapt navigation only. All editorial text and market data stay unchanged.
s=(REPO/'alltoplayfor-release/daytime.js').read_text()
s=s.replace("new URL(location.href).searchParams.get('daytime')","document.body.dataset.rubric")
s=s.replace("initialUrl.searchParams.get('daytime')","document.body.dataset.rubric")
before="if(update){const u=new URL(location.href);if(selected)u.searchParams.set('daytime',selected);else u.searchParams.delete('daytime');u.searchParams.set('section','daytime');history.pushState(null,'',u)}"
after="if(update){location.assign('/nexus/alltoplayfor/daytime/'+(selected?selected+'/':''));return}"
assert before in s;s=s.replace(before,after)
save('daytime-pages.js',s)
for name in ['programmes.css','programmes.js','home-layout.css','home-layout-v2.css','diretta-gol.js','rth24-tabs.js','rth24.css']:shutil.copyfile(ROOT/name,OUT/name)
(OUT/'assets').mkdir(exist_ok=True)
shutil.copyfile(ROOT/'rth-24-v1.webp',OUT/'assets/rth-24-v1.webp')
save('programmes-catalog.json',json.dumps(catalog,ensure_ascii=False))
print('Built',len(list(OUT.rglob('index.html'))),'pages')

shutil.copyfile(ROOT/'diretta-gol-v1.webp',OUT/'assets/diretta-gol-v1.webp')

for name in ["diretta-gol-v3.js","diretta-gol-v3.css","diretta-embed-v3.css"]:shutil.copyfile(REPO/"diretta-release"/name,OUT/name)
