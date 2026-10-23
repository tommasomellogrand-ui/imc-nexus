(()=>{'use strict';
 const panel=document.getElementById('panel-daytime');if(!panel)return;
 const pending=panel.querySelector('.programme-pending');if(pending)pending.remove();
 panel.classList.add('daytime-programme');
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n};
 const sections=[
  {id:'flash-news',label:'FLASH NEWS',title:'Flash News',competition:'Le notizie del GW001',text:'Gli aggiornamenti della redazione per la giornata selezionata.'},
  {id:'mercato',label:'MERCATO',title:'Il Mercato Scotta',competition:'Il mercato del GW001',text:'Trasferimenti ufficiali e trattative di Road To History. Le operazioni concluse e le offerte in corso saranno presentate separatamente.'},
  {id:'champions',label:'CHAMPIONS',title:'La Regina d’Europa',competition:'RTH Champions League',text:'12 squadre, un campionato di andata e ritorno. Le prime 7 si qualificano alla RTH Club World Cup.'},
  {id:'europa',label:'EUROPA',title:'Notti d’Europa',competition:'RTH Europa League',text:'14 squadre, un campionato di andata e ritorno. Le prime 5 si qualificano alla RTH Club World Cup.'},
  {id:'conference',label:'CONFERENCE',title:'Tutto da Giocare',competition:'RTH Conference League',text:'14 squadre, un campionato di andata e ritorno. Le prime 4 si qualificano alla RTH Club World Cup.'}
 ];
 const cast=[
  ['Sara Benci','Conduzione','sara-benci','Benvenuti a DAYTIME, l’appuntamento delle 14:00 di All To Play For. Sono Sara Benci: ogni giorno ripartiremo dai risultati delle competizioni interne di Road To History, per capire che cosa è successo e che cosa ci aspetta. Flash News, mercato, Champions, Europa e Conference: cinque sezioni, un unico studio.'],
  ['Luca Marchegiani','Analisi tecnica','luca-marchegiani','Io sono Luca Marchegiani. Entreremo nelle partite, nelle scelte degli allenatori e nel rendimento delle squadre. Seguiremo la corsa alla Club World Cup: sette posti dalla Champions, cinque dall’Europa League e quattro dalla Conference.'],
  ['Angelo Mangiante','Approfondimenti e collegamenti','angelo-mangiante','Sono Angelo Mangiante. Porterò in studio gli approfondimenti e i collegamenti con gli inviati: le storie dei club, le reazioni ai risultati e i temi da seguire verso la prossima giornata.'],
  ['Valerio “Fayna” Spinella','Ospite fisso · Il Mercato Scotta','fayna','Io sono Fayna e qui ci sarò ogni giorno: Il Mercato Scotta è il nostro appuntamento fisso. Con Sara e gli ospiti commenteremo le operazioni ufficiali e le trattative ancora aperte, senza confondere un’offerta con un trasferimento concluso.']
 ];
 const root=node('div',null,'daytime-root'),nav=node('nav',null,'daytime-tabs');nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Le cinque sezioni di DAYTIME');
 const introduction=node('div',null,'daytime-introduction'),title=node('header',null,'daytime-title');title.append(node('p','OGNI GIORNO · ORE 14:00 · GW001','eyebrow'),node('h2','Benvenuti a DAYTIME'),node('p','Risultati, analisi e mercato di Road To History.'));introduction.append(title);
 for(const [name,role,image,text] of cast){const card=node('article',null,'daytime-speech'),head=node('header',null,'daytime-speaker'),img=node('img'),label=node('div');img.src='assets/daytime-'+image+'.jpg';img.alt=name;img.width=88;img.height=88;img.loading='lazy';label.append(node('h3',name),node('p',role));const portrait=node('span',null,'daytime-portrait');portrait.dataset.person=image;portrait.append(img);head.append(portrait,label);card.append(head,node('p',text));introduction.append(card)}
 const detail=node('div',null,'daytime-details'),panels=new Map(),buttons=new Map();let selected=null;
 const back=node('button','Torna alla presentazione','daytime-back');back.type='button';back.addEventListener('click',()=>select(null,true));
 const edition=node('p',null,'daytime-edition-status');
 for(const s of sections){const b=node('button',s.label);b.type='button';b.id='daytime-tab-'+s.id;b.setAttribute('role','tab');b.setAttribute('aria-controls','daytime-section-'+s.id);b.dataset.competition=s.id;b.addEventListener('click',()=>select(s.id,true));nav.append(b);buttons.set(s.id,b);
 const section=node('section',null,'daytime-section');section.id='daytime-section-'+s.id;section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',b.id);section.tabIndex=0;section.dataset.competition=s.id;section.append(node('p',s.competition,'eyebrow'),node('h2',s.title),node('p',s.text),node('p','I contenuti della redazione per la giornata selezionata saranno pubblicati qui.','daytime-awaiting'));if(s.id==='mercato'){
 section.querySelector('.daytime-awaiting').remove();
 const marketEdition=node('div',null,'daytime-market-edition');marketEdition.dataset.date='2026-10-22';const marketEmpty=node('p','Nessuna puntata Mercato pubblicata per questa giornata.','daytime-market-empty');section.append(marketEdition,marketEmpty);
 const deals=[
  {
    "name": "Oliveira Vanderson",
    "pid": 108663,
    "fromClub": "Hertha BSC",
    "fromLogo": 404,
    "toClub": "AS Monaco",
    "toLogo": 332,
    "price": "12.360.000 €",
    "reporter": "Giorgia Cenni",
    "reporterClub": "HERTHA BSC",
    "reporterStatus": "Assegnazione confermata",
    "question": "Giorgia, partiamo dall’operazione più ricca: che cosa sappiamo della partenza di Vanderson? Che quadro emerge dalla rosa attiva e dai ruoli?",
    "answer": "L’Hertha BSC cede Vanderson al Monaco per 12,36 milioni. È la cifra più alta fra le dieci operazioni di oggi. Ho controllato il roster attivo su Nexus: con Luca e Angelo possiamo leggere il movimento dentro la composizione della squadra.",
    "technical": "Il Codex assegna a Vanderson D,CD,CC(Dx). Nell’Hertha attuale ci sono Daniel Muñoz, con gli stessi ruoli, e Trai Hume, utilizzabile anche a destra in difesa, mediana e centrocampo. La fascia destra ha quindi alternative attive: non possiamo descrivere questa cessione come un vuoto lasciato senza copertura.",
    "analysis": "Nexus registra gli arrivi di Muñoz e Hume il 21 ottobre, la stessa data della cessione di Vanderson. Questo sostiene una lettura di riorganizzazione del reparto, ma non prova la motivazione del manager né l’ordine degli affari nella giornata. Per il Monaco alcuni ruoli non sono disponibili: non possiamo confrontare in modo completo la concorrenza a destra.",
    "position": "D,CD,CC(Dx)",
    "fromId": 94079171,
    "toId": 94079099
  },
  {
    "name": "Brajan Gruda",
    "pid": 129663,
    "fromClub": "Brighton",
    "fromLogo": 12,
    "toClub": "AS Roma",
    "toLogo": 123,
    "price": "7.529.000 €",
    "reporter": "Paolo Assogna",
    "reporterClub": "AS Roma",
    "reporterStatus": "Assegnazione confermata",
    "question": "Paolo, ci colleghiamo con te per la Roma: ci riepiloghi l’arrivo di Gruda? Che quadro emerge dalla rosa attiva e dai ruoli?",
    "answer": "Gruda arriva dal Brighton per 7,529 milioni. È un’operazione conclusa: ora l’attenzione passa al suo inserimento nella Roma. Ho controllato il roster attivo su Nexus: con Luca e Angelo possiamo leggere il movimento dentro la composizione della squadra.",
    "technical": "Gruda è CO,A(DxC): offre soluzioni offensive a destra e al centro. Nella Roma sono già attivi Endrick e Gerard Moreno, entrambi CO(Dx),A(DxC), oltre a Xavi Simons, CO(DxSxC),A(DxSx). L’arrivo aggiunge scelta e concorrenza in zone già coperte: non basta la firma per attribuirgli un posto da titolare.",
    "analysis": "Sul lato Brighton risultano attivi Rutter, CO,A(DxC), Buonanotte, CC,CO(DxSxC), e Diego Gómez, CC(C),CO(DxSxC). Sono alternative con sovrapposizioni di ruolo, non una prova che Gruda fosse un esubero. Il roster contiene anche ruoli mancanti e giocatori da verificare, che escludiamo dalle conclusioni.",
    "position": "CO,A(DxC)",
    "fromId": 94078779,
    "toId": 94078890
  },
  {
    "name": "Hugo Cuenca",
    "pid": 114318,
    "fromClub": "Sampdoria",
    "fromLogo": 125,
    "toClub": "FC Treviso",
    "toLogo": 129,
    "price": "6.240.000 €",
    "reporter": "Gianluca Di Marzio",
    "reporterClub": "Sampdoria",
    "reporterStatus": "Assegnazione confermata",
    "question": "Gianluca, iniziamo da Cuenca: qual è la prima delle tre uscite della Sampdoria? Che quadro emerge dalla rosa attiva e dai ruoli?",
    "answer": "Cuenca passa al Treviso per 6,24 milioni. È la più remunerativa delle tre cessioni blucerchiate presenti nell’aggiornamento. Ho controllato il roster attivo su Nexus: con Luca e Angelo possiamo leggere il movimento dentro la composizione della squadra.",
    "technical": "Cuenca è CO(DxC),A(Dx). Nella Sampdoria restano attivi Saka, CC,CO(Dx), Andy Diouf, CC,CO(DxC), e Pagis, CO,A(DxSxC). La partenza avviene dunque in un’area dove esistono altre soluzioni, pur con caratteristiche e combinazioni di ruolo differenti.",
    "analysis": "I recenti arrivi registrati per la Sampdoria comprendono Scally, Sabbe, Setford e Targhalline: non li presentiamo come sostituti offensivi di Cuenca. Per il Treviso Nexus restituisce soltanto Cuenca nella rosa disponibile: possiamo confermarne la presenza, non misurare un reparto completo.",
    "position": "CO(DxC),A(Dx)",
    "fromId": 94078892,
    "toId": 94078896
  },
  {
    "name": "Krisztián Lisztes",
    "pid": 119987,
    "fromClub": "Dynamo Dresden",
    "fromLogo": 394,
    "toClub": "Bonner SC",
    "toLogo": 4739,
    "price": "4.200.000 €",
    "reporter": "Dario Massara",
    "reporterClub": "Dynamo Dresden",
    "reporterStatus": "Inviato in prova",
    "question": "Dario, passiamo a Dresda: ci fai il punto sul trasferimento di Lisztes? Che quadro emerge dalla rosa attiva e dai ruoli?",
    "answer": "Lisztes lascia la Dynamo Dresden e passa al Bonner SC per 4,2 milioni. Questo è il movimento ufficiale che portiamo oggi in studio. Ho controllato il roster attivo su Nexus: con Luca e Angelo possiamo leggere il movimento dentro la composizione della squadra.",
    "technical": "Lisztes è CO,A(DxSxC), quindi copre più zone offensive. A Dresda sono attivi Dybala, CO,A(DxC), Marmoush, CO,A(DxSxC), e Pedro Neto, CC,CO(DxSx),A(DxSxC). Non parte da un reparto privo di alternative: la cessione riduce la profondità, ma non elimina quelle coperture.",
    "analysis": "Il 20 ottobre, prima della cessione di Lisztes del 21, Nexus registra gli arrivi di Slory, Ta Bi e Lencina: tutti risultano attivi e hanno ruoli offensivi nel Codex. È un elemento concreto per leggere la rotazione della rosa; al Bonner il catalogo disponibile mostra solo Lisztes e non consente un confronto completo.",
    "position": "CO,A(DxSxC)",
    "fromId": 94079161,
    "toId": 94083456
  },
  {
    "name": "Ilyes Housni",
    "pid": 127815,
    "fromClub": "Sampdoria",
    "fromLogo": 125,
    "toClub": "AS Nancy",
    "toLogo": 334,
    "price": "4.080.000 €",
    "reporter": "Gianluca Di Marzio",
    "reporterClub": "Sampdoria",
    "reporterStatus": "Assegnazione confermata",
    "question": "Gianluca, restiamo sulle uscite della Samp: Housni dove va e per quanto? Che quadro emerge dalla rosa attiva e dai ruoli?",
    "answer": "Housni si trasferisce al Nancy per 4,08 milioni. Con Cuenca, queste due operazioni portano a 10,32 milioni gli incassi delle cessioni che stiamo esaminando. Ho controllato il roster attivo su Nexus: con Luca e Angelo possiamo leggere il movimento dentro la composizione della squadra.",
    "technical": "Housni è A(C). La Sampdoria mantiene attivi Ekitiké, Giroud e Gustavo Varela, tutti A(C), oltre a Ivanović, CO,A(C). Esistono quindi più alternative centrali già in rosa: il dato invita a ragionare sulla distribuzione dello spazio, senza trasformarlo automaticamente in una dichiarazione di esubero.",
    "analysis": "Housni, Cuenca e Heskey non occupano esattamente gli stessi ruoli: per questo le tre uscite non vanno trattate come tre perdite identiche. Il Nancy restituisce solo Housni nella rosa censita; non abbiamo la copertura necessaria per definirlo titolare o confrontarlo con tutti i compagni.",
    "position": "A(C)",
    "fromId": 94078892,
    "toId": 94079101
  },
  {
    "name": "Dinis Rodrigues",
    "pid": 126062,
    "fromClub": "1. FC Kaiserslautern",
    "fromLogo": 405,
    "toClub": "Tuttocuoio",
    "toLogo": 3355,
    "price": "2.828.000 €",
    "reporter": "Giorgia Rossi",
    "reporterClub": "1. FC Kaiserslautern",
    "reporterStatus": "Assegnazione confermata",
    "question": "Giorgia, il Kaiserslautern si muove in entrambe le direzioni. Partiamo dalla cessione di Rodrigues? Che quadro emerge dalla rosa attiva e dai ruoli?",
    "answer": "Rodrigues passa al Tuttocuoio per 2,828 milioni. È il movimento in uscita; fra poco vedremo separatamente l’arrivo di Kjær. Ho controllato il roster attivo su Nexus: con Luca e Angelo possiamo leggere il movimento dentro la composizione della squadra.",
    "technical": "Rodrigues è A(C). Al Kaiserslautern sono attivi Isak, CO(Sx),A(SxC), Ebnoutalib e Jacobo Ortega, entrambi A(C). La squadra conserva dunque alternative per il centro dell’attacco. Kjær, acquistato nello stesso aggiornamento, ha invece CC(C),CO(DxSxC): non è un sostituto ruolo per ruolo di Rodrigues.",
    "analysis": "Questa distinzione cambia la lettura dei due movimenti: una cessione al centro dell’attacco e un ingresso fra centrocampo e trequarti. Per il Tuttocuoio la fonte restituisce solo Rodrigues: non possiamo dedurne quanti concorrenti abbia nella nuova squadra.",
    "position": "A(C)",
    "fromId": 94079172,
    "toId": 94082072
  },
  {
    "name": "Jeppe Kjær",
    "pid": 104176,
    "fromClub": "Mjällby AIF",
    "fromLogo": 1444,
    "toClub": "1. FC Kaiserslautern",
    "toLogo": 405,
    "price": "1.553.000 €",
    "reporter": "Giorgia Rossi",
    "reporterClub": "1. FC Kaiserslautern",
    "reporterStatus": "Assegnazione confermata",
    "question": "Giorgia, torniamo da te per il movimento in entrata: confermi Kjær dal Mjällby? Che quadro emerge dalla rosa attiva e dai ruoli?",
    "answer": "Confermato: Kjær arriva dal Mjällby per 1,553 milioni. È la seconda operazione del Kaiserslautern presente nelle dieci ufficialità. Ho controllato il roster attivo su Nexus: con Luca e Angelo possiamo leggere il movimento dentro la composizione della squadra.",
    "technical": "Kjær è CC(C),CO(DxSxC). Al Kaiserslautern trova Vergara con la stessa combinazione di ruoli, oltre a Yarmolyuk, CC,CO(C), e Gabri Veiga, CC(C),CO(SxC). Aggiunge una soluzione versatile in una zona già popolata, mentre Rodrigues, A(C), appartiene a un altro profilo di impiego.",
    "analysis": "Fra i rinforzi precedenti risultano attivi Zechiël, arrivato il 19 ottobre, e Nyoni, arrivato il 18: entrambi CD,CC,CO(C). Sono elementi da considerare nella concorrenza centrale. Del Mjällby Nexus restituisce solo Kjær come ceduto: non possiamo ricostruire da questo dato la rosa che rimane.",
    "position": "CC(C),CO(DxSxC)",
    "fromId": 94080196,
    "toId": 94079172
  },
  {
    "name": "Marco Sportiello",
    "pid": 58170,
    "fromClub": "Shakhtar Donetsk",
    "fromLogo": 348,
    "toClub": "SSC Bari",
    "toLogo": 97,
    "price": "1.417.520 €",
    "reporter": "Alessandro Sugoni",
    "reporterClub": "Shakhtar Donetsk",
    "reporterStatus": "Inviato in prova",
    "question": "Alessandro, collegamento con lo Shakhtar: raccontaci l’uscita di Sportiello. Che quadro emerge dalla rosa attiva e dai ruoli?",
    "answer": "Sportiello si trasferisce al Bari per 1.417.520 euro. L’operazione è conclusa e la cifra è quella riportata nell’aggiornamento ufficiale. Ho controllato il roster attivo su Nexus: con Luca e Angelo possiamo leggere il movimento dentro la composizione della squadra.",
    "technical": "Sportiello è PT. Nella rosa attiva dello Shakhtar restano Meret e Surkis, entrambi portieri: la cessione non lascia il club senza alternative censite in porta. La gerarchia fra loro richiede però informazioni ulteriori e non si deduce dalla sola presenza nel roster.",
    "analysis": "Surkis risulta arrivato il 17 ottobre, quattro giorni prima della partenza di Sportiello: qui c’è davvero un ingresso precedente nello stesso ruolo. Questo è compatibile con una riorganizzazione dei portieri, senza provare l’intenzione del manager. Il Bari ha soltanto due giocatori nel roster disponibile, quindi il confronto della nuova porta resta incompleto.",
    "position": "PT",
    "fromId": 94079115,
    "toId": 94078864
  },
  {
    "name": "Rafael Quintas",
    "pid": 163507,
    "fromClub": "Atlético Madrid",
    "fromLogo": 139,
    "toClub": "SL Benfica",
    "toLogo": 218,
    "price": "630.000 €",
    "reporter": "Giancarlo Marocchi",
    "reporterClub": "Atlético Madrid",
    "reporterStatus": "Assegnazione confermata",
    "question": "Giancarlo, andiamo all’Atlético Madrid: Quintas passa davvero al Benfica? Che quadro emerge dalla rosa attiva e dai ruoli?",
    "answer": "Sì, il trasferimento di Rafael Quintas al Benfica è concluso per 630 mila euro. È questa l’ufficialità che possiamo confermare. Ho controllato il roster attivo su Nexus: con Luca e Angelo possiamo leggere il movimento dentro la composizione della squadra.",
    "technical": "Quintas è CD,CC(C). Nell’Atlético risultano attivi Mario Martín, Chema Andrés e Nathan De Cat, tutti CD,CC(C). Il reparto ha quindi alternative con la stessa combinazione di ruoli: la sua partenza va letta in questo contesto, senza definirlo automaticamente un giocatore in esubero.",
    "analysis": "Il Benfica registra Quintas come attivo; nella porzione di rosa disponibile compare anche Aursnes, ma i dati non descrivono l’intero organico. Possiamo verificare il trasferimento e il ruolo, non assegnare un posto nelle gerarchie della nuova squadra.",
    "position": "CD,CC(C)",
    "fromId": 94078906,
    "toId": 94078985
  },
  {
    "name": "Reigan Heskey",
    "pid": 157613,
    "fromClub": "Sampdoria",
    "fromLogo": 125,
    "toClub": "1. FC Köln",
    "toLogo": 385,
    "price": "600.000 €",
    "reporter": "Gianluca Di Marzio",
    "reporterClub": "Sampdoria",
    "reporterStatus": "Assegnazione confermata",
    "question": "Gianluca, chiudiamo con la terza uscita blucerchiata: il quadro di Heskey? Che quadro emerge dalla rosa attiva e dai ruoli?",
    "answer": "Heskey lascia la Sampdoria per il Köln: 600 mila euro. Con Cuenca e Housni, le tre cessioni sommano 10,92 milioni. Ho controllato il roster attivo su Nexus: con Luca e Angelo possiamo leggere il movimento dentro la composizione della squadra.",
    "technical": "Heskey è CO,A(DxSx). Alla Sampdoria restano attivi Chaka Traorè, CO(DxSxC),A(DxSx), e Pagis, CO,A(DxSxC); Vinícius offre inoltre una soluzione a sinistra con CO(Sx),A(SxC). Le corsie offensive mantengono dunque alternative, ma con coperture non tutte identiche.",
    "analysis": "La lettura delle tre cessioni cambia quando separiamo i ruoli: Housni è una punta centrale, Heskey lavora sulle fasce, Cuenca copre trequarti e destra. Per il Köln risulta attivo Heskey, mentre El Mala è ceduto; il campione è troppo ridotto per descrivere la concorrenza completa.",
    "position": "CO,A(DxSx)",
    "fromId": 94078892,
    "toId": 94079152
  }
]
;
 const portraits={"Sara Benci": "assets/daytime-sara-benci.jpg", "Valerio “Fayna” Spinella": "assets/daytime-fayna.jpg", "Luca Marchegiani": "assets/daytime-luca-marchegiani.jpg", "Angelo Mangiante": "assets/daytime-angelo-mangiante.jpg", "Giorgia Cenni": "assets/reporter-giorgia-cenni.webp", "Dario Massara": "assets/reporter-dario-massara.webp", "Paolo Assogna": "assets/reporter-paolo-assogna.webp", "Alessandro Sugoni": "assets/market-reporter-sugoni.jpg", "Gianluca Di Marzio": "assets/market-reporter-dimarzio.jpg", "Giancarlo Marocchi": "assets/market-reporter-marocchi.jpg", "Giorgia Rossi": "assets/market-reporter-rossi.jpg"};
 function picture(src,alt,cls){const im=node('img',null,cls);im.src=src;im.alt=alt;im.width=96;im.height=96;im.loading='lazy';return im}
 function speech(who,role,text){const a=node('article',null,'daytime-speech market-speech'),h=node('header',null,'daytime-speaker');h.append(picture(portraits[who],who,'market-person'),node('h4',who),node('p',role));a.append(h,node('p',text));return a}
 const sara=(text)=>speech('Sara Benci','Conduzione',text),fayna=(text)=>speech('Valerio “Fayna” Spinella','Il Mercato Scotta',text);
 marketEdition.append(node('p','EDIZIONE · 22 OTTOBRE 2026 · DIECI OPERAZIONI UFFICIALI','eyebrow'));
 marketEdition.append(sara('Benvenuti a Il Mercato Scotta. Allora Fayna, di cosa parliamo oggi? Quali movimenti di mercato ci sono nel nostro Road To History?'));
 marketEdition.append(fayna('Sara, oggi abbiamo dieci trasferimenti conclusi. Vanderson al Monaco, Gruda alla Roma, Cuenca al Treviso, Lisztes al Bonner SC, Housni al Nancy, Rodrigues al Tuttocuoio, Kjær al Kaiserslautern, Sportiello al Bari, Quintas al Benfica e Heskey al Köln. Ecco il riepilogo completo: poi li analizziamo uno per uno con gli inviati delle squadre.'));
 const summary=node('nav',null,'market-summary');summary.setAttribute('aria-label','Le dieci operazioni ufficiali');
 for(const [i,d] of deals.entries()){const a=node('a',null,'market-summary-item');a.href='#market-player-'+d.pid;a.append(node('strong',String(i+1).padStart(2,'0')+' · '+d.name),node('span',d.fromClub+' → '+d.toClub),node('b',d.price));summary.append(a)}
 marketEdition.append(summary,sara('Ora analizziamoli uno per uno. Fayna, apriamo i collegamenti: per ogni operazione ascoltiamo l’inviato, poi Luca Marchegiani e Angelo Mangiante.'));
 const list=node('div',null,'market-cards');
 for(const d of deals){const card=node('article',null,'market-player-card');card.id='market-player-'+d.pid;card.dataset.reporter=d.reporter;
 const h=node('header',null,'market-player-header');h.append(node('p','UFFICIALE · CONCLUSO','market-official'),picture('assets/market-player-'+d.pid+'.png',d.name,'market-player-photo'),node('h3',d.name),node('p',d.price,'market-price'),node('p','Ruoli Codex · '+d.position,'market-codex-role'));
 const route=node('div',null,'market-route');for(const side of ['from','to']){const team=node('div',null,'market-club');team.append(picture('assets/market-club-'+d[side+'Logo']+'.png','Logo '+d[side+'Club'],'market-club-logo'),node('small',side==='from'?'DA':'A'),node('strong',d[side+'Club']));route.append(team);if(side==='from'){const arrow=node('span','→','market-arrow');arrow.setAttribute('aria-hidden','true');route.append(arrow)}}h.append(route);card.append(h);
 card.append(fayna(d.question),speech(d.reporter,'Collegamento · '+d.reporterClub+' · '+d.reporterStatus,d.answer),speech('Luca Marchegiani','Analisi tecnica',d.technical),speech('Angelo Mangiante','Approfondimento',d.analysis));const links=node('nav',null,'market-sources');links.setAttribute('aria-label','Verifica rosa e ruoli di '+d.name);for(const [label,url] of [['Scheda Codex','/nexus/players/profile.html?world=GW001&player='+d.pid],[d.fromClub+' · rosa','/nexus/teams/detail.html?world=GW001&type=club&id='+d.fromId],[d.toClub+' · rosa','/nexus/teams/detail.html?world=GW001&type=club&id='+d.toId]]){const a=node('a',label);a.href=url;links.append(a)}card.append(links);list.append(card)}
 marketEdition.append(list,sara('È il quadro delle dieci operazioni ufficiali di oggi. Grazie a Fayna, ai nostri inviati, a Luca e ad Angelo: ci ritroviamo al prossimo appuntamento con Il Mercato Scotta.'));
 marketEdition.append(node('p','Fonte trasferimenti: Wall Soccer Manager fornito alla redazione · GW001 Road To History.','daytime-awaiting'));
 }detail.append(section);panels.set(s.id,section)}
 function select(id,update){selected=panels.has(id)?id:null;introduction.hidden=selected!==null;detail.hidden=selected===null;back.hidden=selected===null;for(const [key,p] of panels){p.hidden=key!==selected;const b=buttons.get(key);b.setAttribute('aria-selected',String(key===selected));b.tabIndex=key===(selected||'flash-news')?0:-1}if(update){const u=new URL(location.href);if(selected)u.searchParams.set('daytime',selected);else u.searchParams.delete('daytime');u.searchParams.set('section','daytime');history.pushState(null,'',u)}renderDate()}
 function renderDate(){const date=document.getElementById('date').value;const formatted=new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Rome'}).format(new Date(date+'T12:00:00Z'));const market=panel.querySelector('.daytime-market-edition'),empty=panel.querySelector('.daytime-market-empty');if(market)market.hidden=date!=='2026-10-22';if(empty)empty.hidden=date==='2026-10-22';if(selected==='flash-news'){edition.textContent=formatted+' · Flash News';return}edition.textContent=date==='2026-10-22'?(selected==='mercato'?'22 ottobre 2026 · Il Mercato Scotta':'22 ottobre 2026 · Presentazione di DAYTIME'):formatted+' · Nessuna edizione pubblicata. Scopri il programma e le sue cinque sezioni.'}
 nav.addEventListener('keydown',e=>{const keys=[...buttons.keys()];let i=keys.indexOf(selected||'flash-news');if(e.key==='ArrowRight')i=(i+1)%keys.length;else if(e.key==='ArrowLeft')i=(i+keys.length-1)%keys.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=keys.length-1;else return;e.preventDefault();select(keys[i],true);buttons.get(keys[i]).focus()});
 root.append(nav,edition,back,introduction,detail);panel.append(root);
 document.addEventListener('programme-date-change',renderDate);window.addEventListener('popstate',()=>{select(new URL(location.href).searchParams.get('daytime'),false);renderDate()});const initialUrl=new URL(location.href);if(initialUrl.searchParams.get('section')==='daytime'&&initialUrl.searchParams.get('daytime')==='mercato'&&!initialUrl.searchParams.has('date')){const dateInput=document.getElementById('date');dateInput.value='2026-10-22';dateInput.dispatchEvent(new Event('change'));}select(initialUrl.searchParams.get('daytime'),false);renderDate();
})();
