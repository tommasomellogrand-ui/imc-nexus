# IMC Nexus

Repository privato di produzione per IMC Nexus.

## Struttura

- `nexus/` contiene i file pubblicati nella cartella `/nexus` dell'hosting Aruba.
- `.github/workflows/bootstrap-from-aruba.yml` importa una copia della produzione Aruba nel repository.
- `.github/workflows/deploy-aruba.yml` pubblica automaticamente su Aruba i file modificati in `nexus/` quando viene aggiornato `main`.

## Secrets GitHub richiesti

Configura una sola volta in **Settings → Secrets and variables → Actions**:

- `ARUBA_FTP_HOST`
- `ARUBA_FTP_USERNAME`
- `ARUBA_FTP_PASSWORD`
- `ARUBA_FTP_REMOTE_DIR` (normalmente la directory remota che corrisponde a `/nexus`)

Le credenziali non devono mai essere salvate nei file del repository.

## Bootstrap iniziale

Dopo aver configurato i secrets, esegui manualmente il workflow **Bootstrap Nexus from Aruba**. Il workflow scarica la versione attualmente online e la salva sotto `nexus/` con un commit automatico.

## Deploy

Dopo il bootstrap, ogni commit su `main` che modifica file dentro `nexus/` avvia **Deploy Nexus to Aruba**. Il deploy automatico carica solo i file aggiunti o modificati dal commit e non elimina automaticamente file remoti.

Il workflow può anche essere avviato manualmente per una sincronizzazione completa dei file presenti in `nexus/`.
