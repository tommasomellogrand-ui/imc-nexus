(()=>{'use strict';
 const panel=document.getElementById('panel-daytime');if(!panel)return;
 const pending=panel.querySelector('.programme-pending');if(pending)pending.remove();
 panel.classList.add('daytime-programme');
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n};
 const sections=[
  {id:'champions',label:'CHAMPIONS',title:'La Regina d’Europa',competition:'RTH Champions League',text:'12 squadre, un campionato di andata e ritorno. Le prime 7 si qualificano alla RTH Club World Cup.'},
  {id:'europa',label:'EUROPA',title:'Notti d’Europa',competition:'RTH Europa League',text:'14 squadre, un campionato di andata e ritorno. Le prime 5 si qualificano alla RTH Club World Cup.'},
  {id:'conference',label:'CONFERENCE',title:'Tutto da Giocare',competition:'RTH Conference League',text:'14 squadre, un campionato di andata e ritorno. Le prime 4 si qualificano alla RTH Club World Cup.'},
  {id:'mercato',label:'MERCATO',title:'Il Mercato Scotta',competition:'Il mercato del GW001',text:'Trasferimenti ufficiali e trattative di Road To History. Le operazioni concluse e le offerte in corso saranno presentate separatamente.'}
 ];
 const cast=[
  ['Sara Benci','Conduzione','sara-benci','Benvenuti a DAYTIME, l’appuntamento delle 14:00 di All To Play For. Sono Sara Benci: ogni giorno ripartiremo dai risultati delle competizioni interne di Road To History, per capire che cosa è successo e che cosa ci aspetta. Champions, Europa, Conference e mercato: quattro sezioni, un unico studio.'],
  ['Luca Marchegiani','Analisi tecnica','luca-marchegiani','Io sono Luca Marchegiani. Entreremo nelle partite, nelle scelte degli allenatori e nel rendimento delle squadre. Seguiremo la corsa alla Club World Cup: sette posti dalla Champions, cinque dall’Europa League e quattro dalla Conference.'],
  ['Angelo Mangiante','Approfondimenti e collegamenti','angelo-mangiante','Sono Angelo Mangiante. Porterò in studio gli approfondimenti e i collegamenti con gli inviati: le storie dei club, le reazioni ai risultati e i temi da seguire verso la prossima giornata.'],
  ['Valerio “Fayna” Spinella','Ospite fisso · Il Mercato Scotta','fayna','Io sono Fayna e qui ci sarò ogni giorno: Il Mercato Scotta è il nostro appuntamento fisso. Con Sara e gli ospiti commenteremo le operazioni ufficiali e le trattative ancora aperte, senza confondere un’offerta con un trasferimento concluso.']
 ];
 const root=node('div',null,'daytime-root'),nav=node('nav',null,'daytime-tabs');nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Le quattro sezioni di DAYTIME');
 const introduction=node('div',null,'daytime-introduction'),title=node('header',null,'daytime-title');title.append(node('p','OGNI GIORNO · ORE 14:00 · GW001','eyebrow'),node('h2','Benvenuti a DAYTIME'),node('p','Risultati, analisi e mercato di Road To History.'));introduction.append(title);
 for(const [name,role,image,text] of cast){const card=node('article',null,'daytime-speech'),head=node('header',null,'daytime-speaker'),img=node('img'),label=node('div');img.src='assets/daytime-'+image+'.jpg';img.alt=name;img.width=88;img.height=88;img.loading='lazy';label.append(node('h3',name),node('p',role));const portrait=node('span',null,'daytime-portrait');portrait.dataset.person=image;portrait.append(img);head.append(portrait,label);card.append(head,node('p',text));introduction.append(card)}
 const detail=node('div',null,'daytime-details'),panels=new Map(),buttons=new Map();let selected=null;
 const back=node('button','Torna alla presentazione','daytime-back');back.type='button';back.addEventListener('click',()=>select(null,true));
 const edition=node('p',null,'daytime-edition-status');
 for(const s of sections){const b=node('button',s.label);b.type='button';b.id='daytime-tab-'+s.id;b.setAttribute('role','tab');b.setAttribute('aria-controls','daytime-section-'+s.id);b.dataset.competition=s.id;b.addEventListener('click',()=>select(s.id,true));nav.append(b);buttons.set(s.id,b);
 const section=node('section',null,'daytime-section');section.id='daytime-section-'+s.id;section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',b.id);section.tabIndex=0;section.dataset.competition=s.id;section.append(node('p',s.competition,'eyebrow'),node('h2',s.title),node('p',s.text),node('p','I contenuti della redazione per la giornata selezionata saranno pubblicati qui.','daytime-awaiting'));if(s.id==='europa'){const fixtureTitle=node('h3','1ª giornata · Venerdì 23 ottobre 2026');const fixtureInfo=node('p','Calcio d’inizio: ore 20:00 · 14 squadre · 7 incontri');const matches=[['Tottenham Hotspur','TSV 1860 München'],['Hertha BSC','Feyenoord'],['SSC Napoli','AS Roma'],['Fenerbahçe','Palermo FC'],['Olympique Marseille','Dynamo Kyiv'],['AEK Athens','Boca Juniors'],['Reggina','Genoa CFC']];const list=node('div',null,'daytime-fixtures');for(const [home,away] of matches){const match=node('p',home+'  ·  20:00  ·  '+away,'daytime-fixture');list.append(match)}section.querySelector('.daytime-awaiting').remove();section.append(fixtureTitle,fixtureInfo,list,node('p','Prima giornata in programma. Risultati non ancora disponibili.','daytime-awaiting'))}if(s.id==='mercato'){
 section.querySelector('.daytime-awaiting').remove();
 section.append(node('p','EDIZIONE · 22 OTTOBRE 2026 · UFFICIALI DELLE ULTIME 24 ORE','eyebrow'));
 const intro=node('article',null,'daytime-speech');
 intro.append(node('h3','Sara Benci · Il mercato scotta'),node('p','Dieci trasferimenti ufficializzati nelle ultime 24 ore. Dalla cessione di Vanderson all’Hertha al colpo Gruda della Roma, fino alle tre partenze dalla Sampdoria: oggi il mercato parla chiaro. Faina, da dove partiamo?'));
 section.append(intro);
 const scenes=[
 ['Valerio “Fayna” Spinella','Io partirei dalla Sampdoria: tre giocatori in uscita, quasi undici milioni incassati. Bertonati sta facendo cassa o sta cambiando pelle alla squadra? Angelo, qui voglio capire la strategia.'],
 ['Angelo Mangiante','I numeri del Wall sono precisi: Hugo Cuenca al Treviso per 6,24 milioni, Ilyes Housni al Nancy per 4,08 milioni e Reigan Heskey al Köln per 600 mila euro. Totale: 10,92 milioni. Il significato tecnico va valutato senza inventare altre operazioni.'],
 ['Luca Marchegiani','Tre uscite nella stessa giornata incidono sulle alternative a disposizione. Per giudicare il mercato della Sampdoria dobbiamo conoscere le sostituzioni e la composizione della rosa: i soli incassi non bastano.'],
 ['Sara Benci','La cessione più ricca arriva invece da Berlino: l’Hertha BSC di Tommaso Mello vende Oliveira Vanderson al Monaco per 12,36 milioni.'],
 ['Valerio “Fayna” Spinella','Dodici milioni e passa! Tommaso Mello incassa una cifra importante. Ma chi prenderà il suo posto? È la domanda, non una notizia di mercato.'],
 ['Luca Marchegiani','Senza il quadro completo della rosa non si può dire se l’Hertha ne esca indebolito. La certezza è la dimensione economica dell’operazione.'],
 ['Sara Benci','Andiamo a Roma: Brajan Gruda arriva dal Brighton per 7,529 milioni. Paolo Assogna, collegamento con la Roma di Pep Buitre.'],
 ['Paolo Assogna · inviato AS Roma','L’ufficialità è nel Wall: Gruda è un nuovo giocatore della Roma per 7,529 milioni. Ora la questione è come Pep Buitre intenda inserirlo nella squadra.'],
 ['Luca Marchegiani','Gruda è un profilo offensivo che può offrire soluzioni tra fascia e trequarti. Il suo utilizzo concreto dipenderà dal sistema scelto dall’allenatore.'],
 ['Valerio “Fayna” Spinella','E Madrid? Marocchi, mi dicono che l’Atlético di Giuseppe Trovato abbia salutato Rafael Quintas. Confermiamo almeno questa?'],
 ['Giancarlo Marocchi · inviato Atlético Madrid','Confermato dal Wall: Rafael Quintas è passato al Benfica per 630 mila euro. Non risultano da queste schermate ulteriori dettagli sulla strategia dell’Atlético.'],
 ['Angelo Mangiante','Al Kaiserslautern di Vardan Minasyan esce Dinis Rodrigues, destinazione Tuttocuoio per 2,828 milioni, ed entra Jeppe Kjær dal Mjällby per 1,553 milioni. Due operazioni distinte, entrambe concluse.'],
 ['Sara Benci','Completiamo il quadro: Marco Sportiello dallo Shakhtar Donetsk al Bari per 1.417.520 euro e Krisztián Lisztes dalla Dynamo Dresden al Bonner SC per 4,2 milioni.'],
 ['Valerio “Fayna” Spinella','Queste sono le ufficialità. Gli spifferi? Solo offerte marcate OfA, e senza spacciare un’offerta per un acquisto.'],
 ['Sara Benci','Appuntamento al prossimo aggiornamento del Wall. Tutti i dialoghi di questo servizio sono ricostruzioni narrative, non dichiarazioni reali.']
 ];
 for(const [who,speech] of scenes){const a=node('article',null,'daytime-speech');a.append(node('h3',who),node('p',speech));section.append(a)}
 const t=node('h3','Il tabellino delle 10 operazioni ufficiali');section.append(t);
 const deals=[['Oliveira Vanderson','Hertha BSC → AS Monaco','12.360.000 €'],['Brajan Gruda','Brighton → AS Roma','7.529.000 €'],['Hugo Cuenca','Sampdoria → FC Treviso','6.240.000 €'],['Krisztián Lisztes','Dynamo Dresden → Bonner SC','4.200.000 €'],['Ilyes Housni','Sampdoria → AS Nancy','4.080.000 €'],['Dinis Rodrigues','1. FC Kaiserslautern → Tuttocuoio','2.828.000 €'],['Jeppe Kjær','Mjällby AIF → 1. FC Kaiserslautern','1.553.000 €'],['Marco Sportiello','Shakhtar Donetsk → SSC Bari','1.417.520 €'],['Rafael Quintas','Atlético Madrid → SL Benfica','630.000 €'],['Reigan Heskey','Sampdoria → 1. FC Köln','600.000 €']];
 const list=node('div',null,'daytime-fixtures');for(const [player,move,price] of deals)list.append(node('p',player+' · '+move+' · '+price,'daytime-fixture'));section.append(list);
 section.append(node('p','Fonte esclusiva: screenshot del Wall Soccer Manager inviati alla redazione. Nessuna offerta OfA inclusa tra gli ufficiali.','daytime-awaiting'));
 }detail.append(section);panels.set(s.id,section)}
 function select(id,update){selected=panels.has(id)?id:null;introduction.hidden=selected!==null;detail.hidden=selected===null;back.hidden=selected===null;for(const [key,p] of panels){p.hidden=key!==selected;const b=buttons.get(key);b.setAttribute('aria-selected',String(key===selected));b.tabIndex=key===(selected||'champions')?0:-1}if(update){const u=new URL(location.href);if(selected)u.searchParams.set('daytime',selected);else u.searchParams.delete('daytime');u.searchParams.set('section','daytime');history.pushState(null,'',u)}}
 function renderDate(){const date=document.getElementById('date').value;const formatted=new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Rome'}).format(new Date(date+'T12:00:00Z'));edition.textContent=date==='2026-10-22'?'22 ottobre 2026 · Presentazione di DAYTIME':formatted+' · Nessuna edizione pubblicata. Scopri il programma e le sue quattro sezioni.'}
 nav.addEventListener('keydown',e=>{const keys=[...buttons.keys()];let i=keys.indexOf(selected||'champions');if(e.key==='ArrowRight')i=(i+1)%4;else if(e.key==='ArrowLeft')i=(i+3)%4;else if(e.key==='Home')i=0;else if(e.key==='End')i=3;else return;e.preventDefault();select(keys[i],true);buttons.get(keys[i]).focus()});
 root.append(nav,edition,back,introduction,detail);panel.append(root);
 document.addEventListener('programme-date-change',renderDate);window.addEventListener('popstate',()=>{select(new URL(location.href).searchParams.get('daytime'),false);renderDate()});select(new URL(location.href).searchParams.get('daytime'),false);renderDate();
})();
