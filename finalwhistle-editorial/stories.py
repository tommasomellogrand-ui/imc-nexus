"""Approved editorial format, 27 October. Speakers resolve from the Coffee edition.
Match facts are verified against the report snapshot during compilation.
"""
STORIES = {}
def story(fixture, title, text, penalties=None):
    blocks=[]
    for paragraph in text.strip().split('\n\n'):
        who,body=paragraph.split('|',1)
        blocks.append({'speaker':who.strip(),'text':body.strip()})
    STORIES[str(fixture)]={'title':title,'blocks':blocks,'penalties':penalties}

story(369328897,'Un minuto per spegnere la rimonta', '''
studio|L’Hertha vola in semifinale, ma dentro questo 4–1 c’è un minuto che merita di essere raccontato. Al 56′ Alajbegović riapre la partita; al 57′ Tchouaméni restituisce ai berlinesi il doppio vantaggio. Il Parma intravede la rimonta e si ritrova immediatamente a inseguire. Questa mattina, a Coffee Time, parlavamo della pazienza necessaria per affrontare un Parma passato due volte ai rigori dopo altrettanti 0–0. L’Hertha ha trovato presto il vantaggio e poi ha colpito anche sui calci piazzati. Giorgia, partiamo da te e da Tommy Mello.

home_reporter|Federica, il gol di Højbjerg al nono minuto ha cambiato subito il problema che l’Hertha doveva risolvere: niente lunga attesa davanti a una partita bloccata. E il centrocampo ha fatto molto più che accompagnare l’attacco: hanno segnato Højbjerg, Zieliński e Tchouaméni. Il 62% di possesso e i 22 tiri descrivono la pressione dei berlinesi, ma il Parma nella ripresa è riuscito a trovare spazio. È proprio da lì che voglio cominciare con il mister.

home_question|Tommy, questa mattina avevi chiesto precisione e pazienza. Sul 2–1, invece, serviva una risposta immediata: quanto pesa quel gol di Tchouaméni un minuto dopo quello del Parma?

home_manager|Pesa tantissimo, perché avevamo appena rimesso in discussione una partita che sembrava sotto controllo. Mi è piaciuto che la squadra abbia continuato a giocare, senza farsi prendere dalla paura. Però dobbiamo guardare anche quello che viene prima: all’inizio della ripresa il Parma ci aveva già impegnato con Kramarić. Quel segnale dovevamo leggerlo meglio.

home_question|Quattro gol, nessuno dei quali firmato da un attaccante. Lewandowski, però, serve il pallone del 3–1. È questa la partecipazione che cerchi nel tuo 4-3-3?

home_manager|Sì. Robert deve aiutarci a segnare anche quando non conclude lui. Sul terzo gol mette Tchouaméni nelle condizioni di fare male e per me quel contributo conta. Se diventiamo una squadra che aspetta soltanto il gol del centravanti, siamo più facili da leggere. Stasera abbiamo trovato soluzioni diverse.

home_question|Zieliński segna su punizione e poi batte il corner del gol di Saliba. Quanto hanno pesato i piazzati contro una squadra arrivata qui grazie alla solidità difensiva?

home_manager|Molto. Il suo gol ci permette di andare all’intervallo sul 2–0; il corner del quarto ci dà un margine più ampio. In una partita di coppa queste occasioni possono decidere quanto devi soffrire. Piotr ha messo qualità in entrambi gli episodi.

home_question|Ora il Celtic, ancora all’Olympiastadion. L’obiettivo è alzare la coppa?

home_manager|Sì, vogliamo alzarla. Ma per arrivare alla finale dobbiamo superare il Celtic e servirà un’altra prestazione importante. Giocare qui ci dà una spinta enorme: vogliamo regalarci un’altra serata così, correggendo anche quello che oggi non abbiamo fatto bene.

studio|Mello si prende la qualificazione, ma riconosce i segnali concessi nella ripresa. Passiamo al Parma: Marco Nosotti è con Lauro Crasti.

away_reporter|Il Parma aveva costruito le precedenti qualificazioni sulla capacità di restare dentro partite molto chiuse. Stasera il gol subito dopo nove minuti ha tolto subito quella possibilità. Nella ripresa, però, una reazione c’è stata: prima la conclusione di Kramarić, poi il gol di Alajbegović. Il rimpianto è non aver dato durata a quel momento favorevole. Il 3–1 arriva prima ancora che il Parma possa provare a mettere pressione sul risultato.

away_question|Lauro, dopo il gol di Alajbegović la partita sembra riaperta. Un minuto dopo arriva Tchouaméni: è lì che vi sfugge l’occasione di cambiare la serata?

away_manager|Sì, quello è il rimpianto più grande. Avevamo trovato il gol e potevamo costringerli a gestire una situazione diversa. Invece abbiamo concesso subito un’altra conclusione decisiva. Quando riesci a rientrare contro una squadra così, devi darle la sensazione che la partita sia davvero cambiata. Noi non ci siamo riusciti.

away_question|Avevi scelto il 4-2-3-1, con il pressing nella vostra metà campo. L’Hertha ha comunque prodotto 22 tiri: siete rimasti troppo bassi o non siete riusciti a uscire dopo aver recuperato palla?

away_manager|Non siamo riusciti a dare abbastanza continuità alle uscite. Cercavamo equilibrio, ma se il pallone torna troppo spesso agli avversari finisci per difendere sempre. E loro avevano giocatori capaci di arrivare alla conclusione da zone diverse. La ripresa ci ha fatto vedere che potevamo creare qualcosa, ma non l’abbiamo fatto con sufficiente regolarità.

away_question|Due dei quattro gol arrivano da palla inattiva. Quanto pesa questo dato nel giudizio sulla vostra prestazione difensiva?

away_manager|Pesa. La punizione di Zieliński è un gesto di qualità, ma dobbiamo analizzare anche il fallo che porta a quell’occasione. Sul corner del quarto gol dobbiamo rivedere come abbiamo difeso l’area. Non possiamo spiegare tutto con la bravura dell’Hertha: ci sono responsabilità nostre da affrontare.

away_question|Cosa salvi di questa eliminazione?

away_manager|La volontà di reagire dopo il 2–0. Non basta per essere soddisfatti, ma è il punto da cui ripartire. Alajbegović ci ha rimesso in partita; dovevamo sostenerlo con una gestione migliore dei minuti successivi. Complimenti all’Hertha, che ha meritato la qualificazione.

studio|Due letture che si incontrano sullo stesso episodio. Paolo, quanto racconta questa partita quel minuto tra il 2–1 e il 3–1?

context|Racconta la possibilità che il Parma aveva appena riaperto e la rapidità con cui l’Hertha gliel’ha tolta. Il 4–1 finale rischia di farci dimenticare che al 56′ c’era un solo gol di distanza. Il merito dei berlinesi è aver trovato subito una risposta; per il Parma resta il rimpianto di non aver potuto costruire una fase di pressione su quel risultato.

defence|Io riprenderei l’osservazione di Mello. Prima del gol di Alajbegović c’era stata l’occasione di Kramarić al 46′: quindi la ripresa aveva già dato un avvertimento all’Hertha. La vittoria non deve cancellarlo. Dall’altra parte, Crasti ha ragione a interrogarsi sulla continuità delle uscite. Difendere nella propria metà campo richiede anche la capacità di risalire: altrimenti aumentano le situazioni da gestire davanti alla porta. Otto tiri del Parma contro ventidue dell’Hertha aiutano a capire quanto sia stato diverso il peso offensivo delle due squadre.

attack|E quei quattro gol dell’Hertha mostrano modi diversi di arrivare alla conclusione. Højbjerg scambia con Tchouaméni; sul 3–1 è Lewandowski a servire Tchouaméni. Il centravanti non segna, ma partecipa all’azione che spegne la rimonta. Poi c’è Zieliński: la punizione del 2–0 e il corner per Saliba. Tchouaméni è il migliore in campo del report, con un gol, un assist e voto nove; anche Zieliński prende nove. Sono due prestazioni decisive, per ragioni diverse.

studio|L’Hertha passa con quattro marcatori diversi e una risposta immediata nel momento più delicato. Il Parma saluta la coppa con il rimpianto di una rimonta durata appena un minuto. Per Mello ora c’è il Celtic: l’Olympiastadion aspetta un’altra notte di coppa.
''')

story(369328898,'Il Celtic ritrova la coppa, il Palermo perde il suo minuto', '''
studio|Il Celtic vince 3–1 a Palermo e raggiunge l’Hertha in semifinale. Ma la notizia non è soltanto il risultato: dopo il pesante stop in campionato, Sir Simone ritrova una squadra capace di prendersi il vantaggio e di reagire appena gli avversari tornano in partita. Jackson apre, Brown raddoppia su punizione. Quando Rigg accorcia al 61′, Saibari risponde al 62′. Per il Palermo, che arrivava dalla prima vittoria in campionato, il momento della possibile rimonta dura un minuto. Bruno, come si legge questa eliminazione da bordo campo?

home_reporter|Federica, il Palermo non è rimasto senza iniziativa: ha guadagnato otto corner e trovato il gol con l’intesa fra Pulisic e Rigg. Ma non ha dato continuità a queste situazioni. Il Celtic ha avuto più possesso, più conclusioni e soprattutto ha segnato nei passaggi che hanno pesato maggiormente: il vantaggio al 14′, il raddoppio poco prima dell’intervallo e il 3–1 immediatamente dopo la rete rosanero. Con Al Zubeidi voglio partire proprio da quel momento.

home_question|Mister, Rigg segna al 61′ e Saibari risponde un minuto dopo. Avevate appena riaperto la partita: cosa vi è mancato per far durare quella spinta?

home_manager|Ci è mancata l’attenzione nell’azione successiva. Il nostro gol doveva darci fiducia, ma anche ricordarci che c’era ancora una partita da gestire. Abbiamo permesso al Celtic di tornare subito a due gol di vantaggio e così abbiamo sprecato la possibilità di mettergli davvero pressione. È il passaggio che mi lascia più amarezza.

home_question|Avevi scelto un atteggiamento offensivo, pressing alto e difesa alta. Il Celtic ha chiuso con il 57% di possesso: non siete riusciti a recuperare il pallone dove volevate?

home_manager|Volevamo essere attivi, non aspettare soltanto. Ma l’intenzione deve diventare un lavoro fatto bene da tutti. Quando loro riuscivano a giocare, noi facevamo fatica a riprendere il controllo. Non basta chiedere di andare a pressare: dobbiamo capire come accompagnare quella pressione e come restare compatti se non recuperiamo subito il pallone.

home_question|Al 60′ entrano Barrios e Jauregizar, al 61′ arriva il vostro gol. Possiamo parlare di una risposta dai cambi o sarebbe una lettura troppo semplice?

home_manager|Volevo energie nuove, ma non attribuirei automaticamente il gol alle sostituzioni. Nell’azione sono Pulisic e Rigg a trovare la giocata giusta. Quello che mi interessa è che la squadra aveva ancora la possibilità di reagire. Il problema è che non abbiamo protetto quella reazione abbastanza a lungo.

home_question|Dopo i quattro gol a Genova, questa sconfitta ridimensiona la fiducia ritrovata?

home_manager|Ci ricorda che una vittoria non cancella tutto quello che dobbiamo migliorare. La fiducia serve per lavorare, non per sentirsi arrivati. Oggi usciamo dalla coppa contro una squadra che ha sfruttato meglio le proprie occasioni. Dobbiamo accettarlo e correggere ciò che ci ha impedito di restare dentro la partita.

studio|Dall’altra parte, il Celtic ha ritrovato una risposta proprio dove Coffee Time aveva posto la domanda: quale squadra avremmo visto dopo la sconfitta in campionato? Nicola Roggero è con Sir Simone.

away_reporter|Il Celtic ha risposto con tre protagonisti diversi. Jackson conclude di prima sul passaggio di Schjelderup, Brown segna su punizione e poi partecipa allo scambio che porta al gol di Saibari. C’è anche un episodio da leggere correttamente: al 43′ Jackson trova ancora la rete, ma viene fermato per fuorigioco. Il vantaggio all’intervallo resta quindi di due gol. La squadra non ha avuto bisogno di quel terzo gol per arrivare alla pausa avanti; nella ripresa, però, ha dovuto reagire a quello del Palermo.

away_question|Sir Simone, stamattina volevi ritrovare qualità e attenzione insieme. Ti soddisfa di più il primo tempo o la risposta immediata al gol di Rigg?

away_manager|La risposta al loro gol, perché lì potevamo complicarci la serata. Il primo tempo ci aveva dato un vantaggio importante, ma sul 2–1 non potevamo vivere di quello che avevamo fatto prima. Abbiamo continuato a cercare una giocata e l’abbiamo trovata subito. È una reazione che mi piace, anche se avrei preferito non concedere la rete che l’ha resa necessaria.

away_question|Jackson è il migliore in campo, Brown chiude con un gol e un assist. Quanto è importante avere più riferimenti capaci di decidere una partita?

away_manager|Molto, perché ci permette di non aspettare sempre la stessa soluzione. Jackson ci ha dato il primo vantaggio, Brown ha segnato un gol importante prima dell’intervallo e poi ha partecipato al terzo. Saibari ha concluso quell’azione nel momento giusto. Voglio che ognuno si senta responsabile di ciò che possiamo costruire.

away_question|Sul 2–0 arriva anche il gol annullato a Jackson. Come si mantiene la lucidità quando sembra di aver già chiuso la partita e invece il margine resta più piccolo?

away_manager|Ricordandosi il risultato reale. Quel gol non vale e la partita resta sul 2–0. Non dobbiamo comportarci come se avessimo un vantaggio che non c’è. Nella ripresa il Palermo ci ha dimostrato quanto basti poco per rimettere tutto in discussione.

away_question|Adesso l’Hertha all’Olympiastadion. Che cosa porti con te da questa vittoria?

away_manager|La capacità di reagire e la partecipazione di più giocatori alle azioni decisive. Ma la semifinale richiederà un’altra prestazione. L’Hertha ha appena segnato quattro gol: sappiamo che dovremo essere precisi con il pallone e molto attenti quando lo avranno loro.

studio|Paolo, il Celtic ritrova continuità in coppa, mentre il Palermo non riesce a trasformare la fiducia del campionato in una qualificazione.

context|È il motivo per cui questa mattina tenevamo distinti i due percorsi. Il Celtic aveva già mostrato di saper essere incisivo in coppa; la sconfitta in campionato non aveva cancellato quelle qualità. Il Palermo arrivava con un risultato positivo alle spalle, ma oggi ha dovuto affrontare una partita nuova. Il suo rimpianto sta soprattutto nel non aver costruito nulla sul 2–1.

defence|Entrambe avevano scelto difesa alta e pressione in tutto il campo, ma questo non significa che abbiano difeso nello stesso modo o con la stessa efficacia. Il Celtic ha concesso il gol a Rigg e deve rivedere quell’azione. Il Palermo, invece, deve partire dalla risposta di Saibari: dopo aver segnato, non puoi considerare il lavoro finito. Devi subito ritrovare posizioni e attenzione.

attack|Jackson merita il riconoscimento del report: sul primo gol attacca la conclusione di prima sul servizio di Schjelderup. Ma Brown incide in due modi diversi, con la punizione e con lo scambio che libera Saibari. Per il Palermo, il passaggio di Pulisic a Rigg è una giocata da conservare: dimostra che la soluzione c’era. È mancata la capacità di ripeterla e di darle un seguito.

studio|Il Celtic passa e prepara la trasferta di Berlino. Il Palermo si ferma ai quarti: il gol di Rigg aveva aperto una possibilità, Saibari l’ha richiusa nell’azione successiva.
''')

story(369328899,'Atta decide dal dischetto, la Roma si ferma all’ultimo rigore', '''
studio|Kaiserslautern e Roma non si separano nei novanta minuti: Uzun segna al 5′, Veiga risponde al 27′. La qualificazione si decide ai rigori, cinque a quattro per i tedeschi. Dopo otto trasformazioni consecutive, Ruiz calcia fuori e Atta segna il tiro decisivo. Ma sarebbe ingiusto raccontare questa partita cominciando soltanto dal dischetto: ci sono il vantaggio rapido della Roma, la risposta del Kaiserslautern e una parata di Martínez su Atta all’86′ che tiene tutto aperto. Giorgia Rossi, partiamo dai qualificati.

home_reporter|Il Kaiserslautern ha dovuto inseguire quasi subito. Non ha replicato il punteggio largo ottenuto contro il Celtic in campionato, e proprio questa mattina Vardan ci aveva invitato a non confondere una partita con l’altra. Ha trovato il pareggio con Veiga, servito da Isak, e nella ripresa ha cercato il vantaggio anche con i giocatori entrati dalla panchina. Atta ha avuto una grande occasione all’86′; Martínez ha mandato il pallone sul palo prima di recuperarlo. Dal dischetto, invece, il capitano non ha lasciato scampo.

home_question|Vardan, gol subito dopo cinque minuti e partita subito da rincorrere. Che cosa ti è piaciuto della risposta fino al pareggio di Veiga?

home_manager|Non ci siamo messi a cercare il gol con fretta e disordine. Dovevamo rientrare, ma senza regalare alla Roma la possibilità di allungare. L’azione fra Isak e Veiga ci ha riportato in equilibrio. Era importante arrivare al pareggio continuando a giocare, non affidandoci soltanto a un episodio casuale.

home_question|Al 60′ hai cambiato quattro uomini, fra cui Isak e Veiga, protagonisti dell’1–1. Come leggi quella scelta dopo una qualificazione arrivata ai rigori?

home_manager|La leggo per quello che cercavo in quel momento: altre energie e altre soluzioni per provare a vincere. Isak e Veiga avevano dato un contributo importante, ma la partita richiedeva ancora lavoro. Chi è entrato ci ha aiutato a continuare a cercare la porta; poi Ebnoutalib, Estêvão e Karl sono stati precisi anche dal dischetto.

home_question|Martínez nega il gol ad Atta all’86′, poi Atta si ritrova davanti allo stesso portiere con il rigore che può decidere tutto. Che valore dai a quella trasformazione?

home_manager|Il valore di una responsabilità presa fino in fondo. Aveva avuto un’occasione importante e non era entrata; sul rigore doveva concentrarsi su un’altra conclusione, senza portarsi dietro quella precedente. Ha segnato e ci ha dato la semifinale. Ma siamo arrivati al quinto tiro grazie alla precisione di tutti quelli che avevano calciato prima.

home_question|Isak è il migliore in campo del report pur essendo uscito al 60′. È la conferma che il lavoro del centravanti non si misura soltanto nei gol?

home_manager|Assolutamente. Serve Veiga per il pareggio e ci aiuta a costruire situazioni offensive. Voglio che i miei attaccanti incidano nel gioco, non che aspettino soltanto il pallone da spingere dentro. Il suo contributo è stato importante per riportare la partita dove volevamo.

studio|La Roma esce dopo essere andata in vantaggio e dopo aver tenuto aperto il confronto fino all’ultimo tiro. Paolo Assogna è con Pep Buitre.

away_reporter|Per la Roma ci sono due rimpianti distinti: non aver dato seguito al vantaggio di Uzun e non aver trovato il secondo gol prima dei rigori. Martínez ha tenuto in corsa i giallorossi anche nel finale, prima su Ebnoutalib e poi su Atta. La serie dal dischetto è stata precisissima fino al tiro di Ruiz: Šeško, Tadić, Thauvin e Uzun avevano tutti segnato. È un’eliminazione che non può essere ridotta a un solo errore.

away_question|Pep, eravate avanti dopo cinque minuti con Uzun su passaggio di Tadić. Il rimpianto maggiore è non aver sfruttato quel vantaggio o non aver trovato un’altra rete dopo il pareggio?

away_manager|Sono due momenti della stessa partita. Il gol iniziale ci aveva dato una buona opportunità, ma non potevamo pensare di gestire tutto il tempo che restava. Dopo il loro pareggio avevamo ancora spazio per cercare il secondo. Non siamo riusciti a farlo e poi, nel finale, Martínez ci ha aiutato a restare in corsa.

away_question|Hai cambiato cinque giocatori al 60′. Tre subentrati, Šeško, Thauvin e Ruiz, sono poi andati dal dischetto. L’esito dei rigori cambia il giudizio su quelle sostituzioni?

away_manager|No, i cambi andavano valutati dentro la partita. Volevo provare a darle un nuovo impulso. Non possiamo dire che una sostituzione sia giusta perché un giocatore segna il rigore e un’altra sbagliata perché lo manca. Chi entra si assume una responsabilità, esattamente come chi ha cominciato.

away_question|Cosa dici a Ruiz dopo il quinto rigore fuori?

away_manager|Che questa eliminazione appartiene a tutti. Ha avuto il coraggio di calciare, come gli altri. Non voglio che si porti addosso una responsabilità che cancella novanta minuti di calcio. Dobbiamo guardare anche alle occasioni che non abbiamo trasformato e a quelle che abbiamo concesso.

away_question|Martínez vi tiene vivi fino ai rigori. Da cosa riparti dopo una serata così?

away_manager|Dalla capacità di restare in partita, ma anche dalla consapevolezza che possiamo fare meglio prima dell’ultima conclusione. Il nostro portiere ci ha dato una possibilità importante. Dovevamo provare a sfruttarla con più continuità davanti. Complimenti al Kaiserslautern: ha calciato cinque rigori senza sbagliare.

studio|Paolo Condò, una qualificazione decisa dal quinto tiro dopo una partita in cui entrambe avevano trovato un modo per fare male.

context|La sequenza dei rigori è chiarissima: le prime quattro coppie segnano, poi arrivano l’errore di Ruiz e la trasformazione di Atta. Ma la storia della serata comprende anche la risposta al vantaggio della Roma e le occasioni della ripresa. Il Kaiserslautern supera un altro turno dal dischetto; la Roma esce senza che questo autorizzi a trasformare l’ultimo tiratore nell’unico responsabile.

defence|Mi soffermerei su Martínez. Al 71′ interviene su Ebnoutalib e all’86′ devia la conclusione di Atta sul palo, poi recupera il pallone. Sono due episodi che permettono alla Roma di arrivare ai rigori. Il Kaiserslautern, dall’altra parte, reagisce al gol preso quasi subito senza concedere un secondo vantaggio. La gestione dell’emergenza iniziale è una parte importante della sua qualificazione.

attack|Il pareggio nasce dall’intesa Isak–Veiga: chi serve il pallone conta quanto chi conclude. Isak prende nove ed è il migliore in campo del report, anche senza segnare. Poi c’è Atta, che all’86′ trova un grande intervento del portiere e ai rigori torna a calciare contro lo stesso avversario. Sono situazioni diverse, ma entrambe chiedono di assumersi la responsabilità dell’ultima giocata.

studio|Il Kaiserslautern è in semifinale: 1–1 nei tempi regolamentari, 5–4 ai rigori. Alla Roma resta una serata combattuta e il rimpianto di non averla risolta prima del dischetto. Per Vardan, la coppa continua.
''', penalties=[5,4])

story(369328900,'Schick firma la semifinale, il Legia si ferma davanti alla porta', '''
studio|Tre gol, voto dieci e il premio di migliore in campo: Patrik Schick si prende Tottenham–Legia e manda gli Spurs in semifinale. Segna al 36′, al 58′ e all’88′. Ma dietro la tripletta ci sono due passaggi decisivi di Zaccagni, il contributo di Højlund dalla panchina e una partita che il Legia aveva avuto la possibilità di indirizzare prima del vantaggio inglese. Massimo Marianella, cominciamo dal protagonista e dal lavoro che gli ha permesso di incidere.

home_reporter|Federica, Schick conclude tutte e tre le azioni dei gol, ma non arriva da solo davanti alla porta. Zaccagni lo serve sia sull’1–0 sia sul 2–0; nel finale è Højlund a dargli il pallone della tripletta. Il Tottenham chiude con quindici tiri contro undici, quindi non parliamo di un avversario che non abbia mai provato ad attaccare. La differenza è stata soprattutto nella capacità di rendere decisive le occasioni. Prima del vantaggio, Grifo aveva colpito l’esterno del palo per il Legia.

home_question|Max, Schick segna tre volte e prende dieci. Quanto della sua serata nasce dal modo in cui siete riusciti a servirlo?

home_manager|Molto. Lui è stato bravissimo a concludere, ma dobbiamo riconoscere il lavoro di chi lo ha messo nelle condizioni di farlo. Zaccagni trova due palloni importanti, Højlund entra e partecipa al terzo gol. È quello che chiedo: chi arriva alla conclusione deve sentire il sostegno della squadra, non dover inventare tutto da solo.

home_question|Il Legia colpisce l’esterno del palo con Grifo al 19′. Quanto sarebbe sbagliato leggere il 3–0 come una partita senza difficoltà?

home_manager|Sarebbe sbagliato. Sullo 0–0 loro hanno avuto quell’occasione e nella ripresa Chevalier ha dovuto intervenire su Berchiche. Il risultato ci premia, ma non cancella ciò che abbiamo concesso. Mi interessa che i ragazzi riconoscano questi momenti, perché in un’altra partita possono pesare diversamente.

home_question|Al 60′ cambi cinque giocatori, due minuti dopo il raddoppio. Era importante dare energia senza perdere il controllo della gara?

home_manager|Sì, c’era ancora mezz’ora da giocare e non volevo che considerassimo il lavoro finito. Chi è entrato doveva tenere alto il livello dell’attenzione e continuare a offrirci soluzioni. Il pallone di Højlund per Schick nel finale è un contributo concreto, ma tutti i subentrati avevano il compito di accompagnare la squadra fino alla fine.

home_question|A Coffee Time avevamo ricordato i sette punti di distanza dal Legia in campionato. Questa vittoria cambia il modo in cui guardate al vostro valore?

home_manager|Ci dà fiducia, ma quei punti restano nella classifica del campionato. Oggi abbiamo meritato di passare questa partita di coppa. Per crescere dobbiamo ripetere le prestazioni, non usare una vittoria per cancellare quello che abbiamo lasciato per strada prima. Intanto ci godiamo una semifinale conquistata sul campo.

studio|Il Legia lascia la coppa con un punteggio netto, ma con episodi da analizzare prima di fermarsi al risultato. Valentina Caruso è con Luciano Catalano.

away_reporter|Il Legia non è stato lontano dal Tottenham nel possesso: 49% contro 51%. Ha anche prodotto undici tiri, ma soltanto due nello specchio. L’esterno del palo di Grifo al 19′ e la conclusione di Berchiche respinta da Chevalier al 55′ sono i due passaggi su cui soffermarsi: prima del vantaggio e prima del raddoppio degli Spurs, c’era ancora la possibilità di cambiare la partita. Poi Schick ha fatto pesare ogni apertura che gli è stata concessa.

away_question|Luciano, Grifo sfiora il vantaggio e Berchiche cerca il pareggio poco prima del 2–0. Il rimpianto è nelle occasioni mancate o nella gestione delle azioni successive?

away_manager|In entrambe le cose. Quelle occasioni potevano aiutarci, ma non possiamo fermarci a pensare a come sarebbe andata se fossero entrate. Dovevamo continuare a difendere bene e a costruire altre situazioni. Il Tottenham ha trovato tre gol e noi nessuno: dobbiamo analizzare anche perché non siamo riusciti a dare seguito alle nostre possibilità.

away_question|Zaccagni serve Schick sia per il primo sia per il secondo gol. Non siete riusciti a interrompere quella connessione?

away_manager|È una delle cose che dobbiamo rivedere. Quando una combinazione ti fa male una volta, devi riconoscerla e provare a limitarla meglio. Non basta occuparsi soltanto di chi conclude: bisogna lavorare anche sul pallone che gli arriva. Stasera non siamo stati abbastanza efficaci in questo.

away_question|Sul primo gol il report segnala un errore di Courtois. Quanto incide un episodio del genere sul giudizio della partita?

away_manager|Incide sul risultato di quel momento, ma non voglio usarlo per spiegare tutto. Courtois ha fatto anche una parata su Schick prima del raddoppio. Ci sono responsabilità collettive nelle occasioni che concediamo, e ci sono le nostre occasioni non sfruttate. Una sconfitta per tre a zero non si analizza scegliendo una sola persona.

away_question|Avevi scelto un 4-3-3 offensivo, ma avete chiuso con due tiri nello specchio. Dove cercare il miglioramento?

away_manager|Nella qualità dell’ultima parte dell’azione. Volevamo essere pericolosi e qualche situazione l’abbiamo creata, ma troppo poco è arrivato davvero a impegnare il portiere. Dobbiamo scegliere meglio quando concludere e come accompagnare chi ha il pallone. Il Tottenham è stato più concreto e ha meritato la qualificazione.

studio|Paolo, questa mattina avevamo detto che la classifica non avrebbe assegnato la semifinale. Il campo ha dato una risposta molto precisa.

context|Ha premiato il Tottenham, che ha trasformato una partita ancora aperta nei suoi momenti decisivi. Il vantaggio in campionato del Legia era un elemento di contesto, non una garanzia. Gli Spurs possono prendere fiducia da questa vittoria; il Legia deve tenere insieme l’eliminazione e il percorso che aveva costruito, senza usare l’uno per cancellare l’altro.

defence|Il primo episodio da non dimenticare è il palo esterno di Grifo sullo 0–0. Il secondo è l’intervento di Chevalier al 55′, quando bastava un gol per pareggiare. Il Tottenham ha tenuto la porta inviolata, ma ha avuto bisogno anche del proprio portiere. Sul Legia condivido l’analisi di Catalano: Zaccagni e Schick si trovano due volte per segnare, quindi bisogna rivedere sia la pressione sul passaggio sia la difesa del destinatario.

attack|Schick è il volto della serata: tre gol e voto dieci. Ma i due assist di Zaccagni spiegano perché la sua partita sia anche il risultato di un’intesa. Sul primo gol c’è l’errore del portiere, sul secondo c’è ancora il servizio di Zaccagni, sul terzo arriva il pallone di Højlund. Il Tottenham riesce a continuare ad alimentare il proprio attaccante anche dopo i cambi: è un segnale importante.

studio|Il Tottenham passa con la tripletta del suo capitano. Il Legia si ferma ai quarti, fra occasioni non sfruttate e difficoltà nel contenere l’intesa Zaccagni–Schick. Per Max Zanoni la coppa continua, con una serata da ricordare e una semifinale da preparare.
''')
