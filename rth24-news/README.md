# RTH 24 — pubblicazione Flash News dalla chat

Repository: `tommasomellogrand-ui/imc-nexus`, branch `main`.
Pagina: https://www.italianmastersclub.it/nexus/alltoplayfor/rth-24/

## Procedura obbligatoria per la redazione

1. Leggi queste istruzioni e il branch `main` aggiornato prima di pubblicare.
2. «Pubblica questa flash news» autorizza la pubblicazione del testo che Tom fornisce. Non inventare fatti, risultati o dichiarazioni. Mantieni il testo; se manca il titolo, ricavane uno breve e fedele. Non aggiungere notizie da altre fonti.
3. Crea UN NUOVO file `rth24-news/items/<id>.json`, con id univoco minuscolo (lettere, numeri e trattini), ad esempio data-ora-secondi e breve titolo. Non cancellare o riscrivere i file delle notizie precedenti.
4. Il file deve contenere esattamente `id`, `published_at`, `title`, `text`. `id` coincide con il nome file senza `.json`. `published_at` è data/ora effettiva di pubblicazione ISO 8601 con fuso (preferire UTC `Z`). Usa testo normale: niente HTML. Le nuove righe nel testo vanno codificate come `\n` nel JSON. Limiti: titolo 200 caratteri, testo 20.000. Non cambiare il testo per rientrare nei limiti senza Tom.
5. Crea il commit su `main`, preservando le modifiche già presenti. Se il branch cambia durante il salvataggio, rileggilo e aggiungi solo il tuo nuovo file. Non forzare il branch. Non modificare workflow, HTML, CSS, renderer o altre sezioni.
6. Il commit sul percorso indicato avvia AUTOMATICAMENTE **Publish RTH24 Flash News** (`.github/workflows/publish-rth24-news.yml`). Non serve l'avvio manuale. Il workflow compila tutte le notizie, le ordina dalla più recente, pubblica solo nella directory RTH24 e verifica testo e titolo nel browser pubblico.
7. Attendi il workflow associato al commit. Controlla lo step **Verify news visible on public RTH24**: deve riuscire. Il log contiene `verified:true`, `mode:public`, `revision`, `news_ids` e `url`; verifica che l'ID della tua notizia sia incluso. La ricevuta è anche nel riepilogo del job e nell'artifact `rth24-news-publication/receipt.json`. Una ricevuta `mode:preview` NON prova la pubblicazione.
8. Se riesci ad aprire direttamente il sito, verifica la notizia anche lì; l'archivio pubblico è https://www.italianmastersclub.it/nexus/alltoplayfor/rth-24/flash-news.json . La pagina legge l'archivio senza cache a ogni apertura.
9. Conferma: titolo, ID, commit, esito del workflow e link pubblico `https://www.italianmastersclub.it/nexus/alltoplayfor/rth-24/#news-<id>`. Se ti basi sulla verifica del workflow, dillo. Se l'esecuzione fallisce o non è controllabile, non dichiarare Online; indica il blocco. Non riscrivere la notizia con un altro ID per tentare di riavviare il workflow: creerebbe duplicati.

## Formato (esempio documentale, non pubblicare)

```json
{
  "id": "20261023-120000-titolo-breve",
  "published_at": "2026-10-23T12:00:00Z",
  "title": "Titolo fedele al testo di Tom",
  "text": "Testo esatto fornito da Tom.\nSecondo paragrafo."
}
```

## Confini

Solo la tab Flash News è alimentata da questo archivio. Risultati, Prossime partite e Mercato restano scollegati. Nessuna importazione sportiva, fonte esterna o generazione automatica di notizie. Nessuna notizia di prova va in produzione.

Il flusso è configurato su GitHub. La chat deve avere strumenti e permessi di scrittura sul repository: queste istruzioni non assegnano permessi. Se mancano, comunica l'errore preciso senza chiedere password o token in chat.

## Controlli tecnici

L'installer confronta la pagina con la produzione verificata. Le esecuzioni successive mantengono pagina e renderer identici, aggiornano solo `flash-news.json`, impediscono la cancellazione di ID già pubblicati e conservano una copia del precedente archivio. La concorrenza è serializzata con gli altri deploy Nexus; il checkout usa l'ultimo main per includere tutte le notizie disponibili.
