# Il Panno Verde — mercato GW011

Replica del generatore e renderer RTH24 GW001, isolata su GW011, 20 club e `/nexus/il-panno-verde/`.
Controllo ogni cinque minuti con il blocco di pubblicazione condiviso. Fonte: trasferimenti CERTIFIED, Codex e assegnazioni manager GW011 alla data dell'operazione. Parte dall'edizione del 26 ottobre 2026; nessun annuncio dei reimport storici. Stesse soglie Club News: rating >=90 o denaro esplicito >10 milioni. Foto mancanti non bloccanti; nessun volto generico. ID stabili e registro impediscono duplicati.

`automation/reporters.json` contiene solo abbinamenti verificati GW011. Attualmente vuoto: le notizie mercato escono, le Club News qualificate attendono gli inviati e vengono ritentate automaticamente. Non copiare gli abbinamenti GW001. I ritratti manager condivisi sono verificati per ID e nome, le assegnazioni provengono solo da GW011.

Notizie manuali: `items/<id>.json`, stesso contratto RTH24, sempre con club_ids GW011. La pubblicazione conserva tutte le notizie già presenti. Il vecchio feed di lancio non deve essere usato dopo l'attivazione. Banner e shell Panno Verde conservati; il nuovo deploy modifica solo file dentro la pagina del Panno Verde.

## Post Match automatico
Dal 25 ottobre 2026, il controllo ogni cinque minuti legge Results e Match Report completi GW011 e genera un articolo per partita + manager + club. Le assegnazioni sono risolte alla data della gara; assenze o ambiguità vengono segnalate senza inventare un allenatore. Due domande fisse, tre sui fatti del report, cinque risposte simulate con nota esplicita. Correzioni rigenerano lo stesso ID mantenendo l'ora di pubblicazione. Report incompleti (formazioni, statistiche, gol) restano in attesa. Le foto vengono usate solo se associate a identità verificate. La verifica pubblica controlla le venti interviste iniziali del 25 ottobre, i cinque scambi per articolo e la presenza in The Fick Wall.

## Archivio mercato completo
Dal 26 ottobre, su richiesta di Tom, il Mercato include tutte le operazioni certificate del repository GW011, anche precedenti al lancio. Rimangono le date certificate della conclusione e gli ID stabili. Lo stesso evento reimportato non crea una nuova notizia. I record non certificati o incompleti vengono segnalati per verifica; non sono trasformati in fatti inventati. Il download parallelo riusa foto originali e stemmi verificati.
