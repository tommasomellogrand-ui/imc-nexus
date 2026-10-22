(()=>{'use strict';
 const panel=document.getElementById('panel-coffee-time'),date=document.getElementById('date');if(!panel||!date)return;
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n};
 const format=d=>new Intl.DateTimeFormat('it-IT',{dateStyle:'long',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
 const navigation=node('nav',null,'coffee-upcoming-dates');navigation.setAttribute('aria-label','Prossime edizioni Coffee Time');
 navigation.append(node('h2','Le prossime giornate'));const label=node('label','Scegli la puntata '),select=node('select');select.setAttribute('aria-label','Edizione Coffee Time');label.append(select);navigation.append(label);
 panel.querySelector('.section-banner').after(navigation);
 const root=node('div',null,'coffee-upcoming coffee-edition');panel.append(root);root.hidden=true;
 let editions=[],serial=0;const cache=new Map();
 select.addEventListener('change',()=>{if(!select.value)return;date.value=select.value;date.dispatchEvent(new Event('change',{bubbles:true}))});
 function person(name,role,image,text){const a=node('article',null,'coffee-speech'),head=node('header',null,'coffee-speaker');if(image){const img=node('img');img.src=image;img.alt=name;img.width=88;img.height=88;img.loading='lazy';head.append(img)}const names=node('div');names.append(node('strong',name),node('small',role));head.append(names);a.append(head,node('p',text));return a}
 function render(data){root.replaceChildren();const hero=node('header',null,'coffee-title-box');hero.append(node('p',format(data.date)+' · CAMPIONATO · GIORNATA '+data.day,'eyebrow'),node('h2','Coffee Time'),node('p','Anteprima calendario · GW001 · 20 partite · 4 divisioni'));root.append(hero);
 root.append(node('p','Programma verificato sulle Schedule Nexus il 22 ottobre 2026. Gli orari sono quelli riportati dalla fonte; eventuali variazioni successive non sono ancora recepite. Classifiche, formazioni e analisi aggiornate al giorno della partita non sono incluse in questa anteprima.','coffee-time-note'));
 data.opening.forEach((text,i)=>root.append(person(data.cast[i][0],data.cast[i][1],data.portraits[i].image,text)));
 const nav=node('div',null,'coffee-divisions');nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Divisioni del prossimo turno');const sections=[];
 function choose(i){[...nav.children].forEach((b,k)=>{b.setAttribute('aria-selected',String(i===k));b.tabIndex=i===k?0:-1});sections.forEach((s,k)=>s.hidden=i!==k)}
 root.append(node('h2','Il programma, divisione per divisione'),nav);
 data.divisions.forEach((d,i)=>{const b=node('button',d.name);b.type='button';b.id='upcoming-tab-'+i;b.setAttribute('role','tab');b.setAttribute('aria-controls','upcoming-div-'+i);b.addEventListener('click',()=>choose(i));nav.append(b);
 const section=node('section',null,'coffee-division');section.id='upcoming-div-'+i;section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',b.id);section.append(node('h2',d.name+' · '+format(data.date)));sections.push(section);root.append(section);
 d.fixtures.forEach(f=>{const card=node('article',null,'coffee-fixture');card.dataset.fixture=f.id;card.append(node('h3',f.home+' – '+f.away));const teams=node('div',null,'coffee-match-teams');
 ['home','away'].forEach(side=>{const t=node('div',null,'coffee-match-team'),img=node('img');img.src=f[side+'_logo'];img.alt='';img.width=48;img.height=48;img.loading='lazy';t.append(img,node('strong',f[side]),node('small',side==='home'?'In casa':'In trasferta'));teams.append(t);if(side==='home'){const time=node('div',null,'coffee-match-time');time.append(node('span','VS'),node('time',f.time));teams.append(time)}});card.append(teams);
 f.reporters.forEach(r=>card.append(person(r.name,r.club+' · '+r.label,data.reporter_portraits[r.name]?.image,'Collegamento assegnato per '+r.club+' in occasione di '+f.home+' – '+f.away+'. Le informazioni dal campo saranno da aggiornare con i dati disponibili a ridosso della partita.')));
 const a=node('a','Schedule Nexus · '+f.home);a.href=f.source;a.target='_blank';a.rel='noopener';card.append(a);section.append(card)});
 });nav.addEventListener('keydown',e=>{let i=[...nav.children].indexOf(document.activeElement);if(e.key==='ArrowRight')i=(i+1)%4;else if(e.key==='ArrowLeft')i=(i+3)%4;else if(e.key==='Home')i=0;else if(e.key==='End')i=3;else return;e.preventDefault();choose(i);nav.children[i].focus()});choose(0);
 }
 async function update(){const token=++serial,entry=editions.find(e=>e.date===date.value);select.value=entry?entry.date:'';root.hidden=!entry;panel.classList.toggle('has-upcoming-coffee',!!entry);if(!entry)return;root.replaceChildren(node('p','Caricamento Coffee Time…'));try{let data=cache.get(entry.date);if(!data){const response=await fetch(entry.file+'?v=20261022',{cache:'no-store'});if(!response.ok)throw Error();data=await response.json();if(data.date!==entry.date||data.world!=='GW001')throw Error();cache.set(entry.date,data)}if(token===serial)render(data)}catch{if(token===serial)root.replaceChildren(node('p','Edizione temporaneamente non disponibile. Ricarica la pagina.'))}}
 document.addEventListener('programme-date-change',update);
 fetch('coffee-editions.json?v=20261022',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{editions=d.editions;select.append(new Option('Seleziona una giornata',''));for(const e of editions)select.append(new Option(format(e.date)+' · Giornata '+e.day,e.date));update()}).catch(()=>{navigation.replaceChildren(node('p','Impossibile caricare l’elenco delle prossime edizioni.'))});
})();
