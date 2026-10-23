# DAYTIME reads existing IMC competitions

The public PHP source is `/nexus/competitions/imc-cups.php`, with `world=GW001`,
the season resolved by date from `/nexus/core/context.php`, and `mode=results` or
`mode=schedule`. Exact keys:

- Champions: `GW001_IMC_CHAMPIONS_LEAGUE`
- Europa: `GW001_IMC_EUROPA_LEAGUE`
- Conference: `GW001_IMC_CONFERENCE_LEAGUE`

The adapter reads the same source as the live IMC Competition Hub. It never
writes, imports, creates fixtures or generates editorial commentary. No duplicate
fixture lists are stored in DAYTIME. Results replace scheduled fixtures by ID;
null scores never become 0–0. The selected DAYTIME date filters match_date.
Source errors are distinct from a genuinely empty date.

Editors update competitions under IMC through their existing screenshot-based
procedure. DAYTIME reflects those updates on opening its competition tab,
changing date, returning to the page, or clicking Aggiorna. No second commit or
DAYTIME deployment is required for data updates. No GitHub schedule/cron is used.

The initial release adds two assets and two references to the current production
index. Existing programme scripts, data, texts, and all competition sources remain
unchanged. The integration script is loaded AFTER daytime.js. Deployment refuses
to overwrite an independently changed production index or DAYTIME baseline.

The former static October 23 Europa draft in alltoplayfor-release/daytime.js is
removed from the repository to align it with production. Future editorial updates
must retain the daytime-imc.js and daytime-imc.css references in the page shell.
