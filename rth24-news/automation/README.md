# GW001 certified transfers → RTH24

Workflow `RTH24 Automatic Transfer News`, scheduled every five minutes (GitHub may delay scheduled starts), also manual and on automation source changes. Shared production deployment lock with the manual news workflow.

Read-only snapshot from Aruba `Sql1956795_3.GW001_IMC_Transfers`, normalized Codex and Core mappings. The temporary export is token-protected, expires in five minutes, accepts only fixed read queries or bounded SoccerWiki image downloads, and is removed in finally. Database secrets never leave the server.

Baseline inspected before activation: latest import `2026-10-22 08:06:30`; latest certified date `2026-10-21`. Imports after that baseline, including those arriving during setup, are eligible when `CERTIFIED` and with later normalized dates. Pending normalization is checked again. Historical reimports are excluded. No news is fabricated to test production.

One stable market ID per GW001/player/from/to/normalized-date, independent of importer numbering. Conflicting certified copies are reported for review. No operation is identified by its name alone. The ledger prevents repeat publication. Generated items and immutable media are committed before deploying the feed; an unsuccessful deploy is retried by the next scheduled run. Push conflicts abort before deployment.

A second `club` item qualifies at rating >=90 (including exchange players) OR explicitly recorded cash >EUR 10m. A verified cash amount above the threshold also proves an exchange exceeds the threshold. Codex market valuations are NOT substituted for transaction prices. Exchanges below the cash threshold with unknown total remain pending for the Club News decision unless rating qualifies; their ordinary market news is published. Exact EUR 10m alone does not qualify.

Only the 40 mapped active GW001 club IDs appear in `club_ids` and team badges. External club names remain in the text. When both sides are active, a single Club News has both assigned reporters and managers, including arrivals/departures in exchanges. Managers are resolved against assignment dates; reporters are recorded from the approved Coffee Time cast. Do not fabricate a missing or ambiguous assignment. Dialogue is deterministic fictional editorial copy with one disclosure, not a claim about a manager's real statements or intent.

A missing/unavailable photo or crest NEVER blocks a news item. Publish names/text immediately, keep any available original image, retry missing media in subsequent runs, and update the same item without changing its publication time. Never use a generic face. Missing essential transaction facts or ambiguous club/manager assignments are reported in the workflow summary; the Club News can wait independently of the ordinary market news.

`runtime/report.json` and the public receipt are workflow artifacts. The workflow tests rules, builds/validates, tests the mobile preview, commits generated items, publishes only the RTH24 data/assets (not other programmes or HTML), and verifies the public feed and four tabs.

## Standard editoriale v3
Le notizie automatiche conservano ID e orario originali. `transfer` espone percorso, formula, corrispettivo e data certificati; `coverage` separa i collegamenti ai club. I nomi dei giocatori non sono tutti maiuscoli. Una sola nota di finzione precede ogni Club News. Ruolo e rating vengono dal Codex; non si attribuiscono motivazioni di mercato o esuberi senza dati di rosa verificati. Il registro `editorial_version: 3` applica una sola volta il nuovo standard alle notizie automatiche esistenti. I contributi manuali non vengono riscritti.
