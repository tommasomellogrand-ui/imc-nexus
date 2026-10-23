# RTH 24 — News e News club
Repository `tommasomellogrand-ui/imc-nexus`, branch `main`.
Pagina: https://www.italianmastersclub.it/nexus/alltoplayfor/rth-24/

## Comandi di Tom
- **News** + testo, eventuale foto e ora: pubblica una Flash News generale.
- **News club** + testo, foto e ora: pubblica un contributo dal club, individuando la squadra dal testo e dal contesto. Non chiedere a Tom di compilare moduli o ripetere il club se è chiaro.
Questi comandi autorizzano la pubblicazione senza una seconda conferma. Non inventare fatti. Mantieni integralmente il testo e usa l'immagine originale. Nessun “Leggi tutto”. Foto nel terzo sinistro, testo nei due terzi destri; senza foto testo a larghezza intera.

## Immagini: non è necessario inviare binari a GitHub
Il runner può scaricare l'immagine originale dal suo URL HTTPS. Il commit della chat può essere SOLO TESTO.
1. Se l'immagine è già in `rth24-news/assets/` oppure nell'archivio pubblico, riusa il suo nome esatto.
2. Per un nuovo allegato, usa uno strumento disponibile che restituisca il suo URL di download firmato. Se disponibile OpenAI Library, individua il file esatto e usa `prepare_materialize`: negli ambienti senza workspace restituisce un URL firmato. Usa esclusivamente l'URL restituito, mai URL costruiti da file_id, link sandbox o link di download ChatGPT che richiedono login.
3. Inserisci quell'URL in `image.source_url`, con un nome file univoco. Esegui subito il commit, prima che scada. Il link concede accesso alla sola immagine destinata alla pubblicazione e sarà presente nella cronologia del repository pubblico; non usare link che espongono altri file, cartelle, credenziali o dati riservati.
4. GitHub scarica e verifica l'immagine, la pubblica stabilmente su Nexus e rimuove `source_url` dall'archivio pubblico. Memorizza il checksum. Nei deploy successivi riusa i byte verificati su Nexus: il link temporaneo non deve restare valido.
5. Alternativa se la chat può leggere i byte: `create_blob` con encoding `base64`, poi tree/commit con il file in `rth24-news/assets/` e JSON nello stesso commit. Non inviare testo Base64 a `create_file` come se fosse una fotografia.
6. Se nessuno strumento della sessione fornisce i byte o un URL scaricabile dell'allegato, il repository non può recuperarli da solo. Indica esattamente quale capacità manca; non dichiarare che il workflow non supporta immagini e non pubblicare la notizia incompleta.

URL ammessi: HTTPS Nexus, cdn.soccerwiki.org, raw.githubusercontent.com e host di trasferimento OpenAI autorizzati dal validatore. JPEG/PNG/WebP, massimo 12 MB e 40 megapixel. L'estensione deve corrispondere ai byte originali. Nomi minuscoli, numeri e trattini. Non sovrascrivere asset: usare un nuovo nome/versione.

## News club: attribuzione
Recupera il club e lo stemma dai dati GW001 Nexus, il manager dall'associazione del club alla data della notizia e l'inviato dalle assegnazioni confermate di ALL TO PLAY FOR. Non identificare persone dalla fotografia e non interpretare una firma abbreviata come verifica. Se un'associazione non è verificabile, chiedi solo il dato mancante.
Titolo: “In collegamento da [località]” se indicata; altrimenti “Dal [club]”. Non inventare la città.
Preponi al testo queste righe, seguite da una riga vuota e dal testo originale integrale:
`[Club] · In collegamento: [inviato]`
`Contributo di [nome manager]`
Per interventi narrativi attribuiti a giornalisti, chiarisci una volta nel contributo “Ricostruzione narrativa: non dichiarazioni reali.”
Usa `teams` per mostrare gli stemmi delle squadre pertinenti.

## Salvataggio unico e data
Leggi main aggiornato e cerca eventuale notizia già esistente prima di creare un ID. Non duplicare una news per aggiungere una foto o ritentare la pubblicazione.
Crea `rth24-news/items/<id>.json`. Campi obbligatori: id, published_at, title, text. Facoltativi: image, teams. Titolo max 200 caratteri, testo max 20.000; niente HTML. ID lettere minuscole, numeri e trattini, uguale al nome file.
Usa data e ora fornite da Tom, fuso Europe/Rome con offset corretto. Se manca la data usa oggi; se manca l'ora usa quella corrente. Non sostituire l'ora editoriale con quella del commit.

Esempio DOCUMENTALE, non pubblicare:
```json
{
  "id": "20261023-092500-club-notizia",
  "published_at": "2026-10-23T09:25:00+02:00",
  "title": "In collegamento da Istanbul",
  "text": "Attribuzione verificata\n\nTesto originale di Tom",
  "image": {
    "file": "20261023-092500-club-v1.jpg",
    "alt": "Descrizione della fotografia fornita",
    "source_url": "URL_HTTPS_REALE_RESTITUITO_DALLO_STRUMENTO"
  },
  "teams": [{"name": "Nome verificato", "logo": "club-stemma-v1.png", "source_url": "URL_REALE_STEMMA_VERIFICATO"}]
}
```
Se il file è già archiviato, ometti source_url. Non pubblicare segnaposto.

## Pubblicazione e verifica
Il commit su main in `rth24-news/items/*.json` avvia **Publish RTH24 Flash News**. Conserva tutte le notizie precedenti e gli altri file. Non forzare il branch, non cambiare CSS/HTML/workflow o altre sezioni.
Leggi `GET /repos/tommasomellogrand-ui/imc-nexus/actions/runs?head_sha=COMMIT` per trovare il run push; alcuni strumenti limitati alle PR non lo mostrano.
Attendi lo step **Verify news visible on public RTH24** riuscito. Il log/ricevuta deve contenere `verified:true`, `mode:public`, revision e ID della notizia. `mode:preview` non prova la pubblicazione.
Apri se possibile anche la pagina e controlla testo, foto e stemmi. Conferma il link `https://www.italianmastersclub.it/nexus/alltoplayfor/rth-24/#news-ID`, commit ed esito. Se usi la verifica browser del workflow, dichiaralo.
Se il link della foto è scaduto prima del primo deploy, aggiorna solo source_url nello STESSO file e riprova. Non creare duplicati. Non dichiarare Online per il solo commit.

## Ambito
Solo Flash News di RTH24. Nessun collegamento a feed sportivi automatici. Le tab Risultati, Prossime partite e Mercato restano scollegate. Non modificare Coffee Time, Daytime, Final Whistle o altre sezioni.
