# Upcoming Coffee Time calendar editions

Ten GW001 season 2 league editions, rounds 9–18, 2026-10-25 through 2026-11-26.
Each contains 20 fixtures across four divisions. `build.py` checks each fixture's ID,
date, home/away IDs and time against BOTH club schedules before generating data.
Sources are the existing Nexus matchday and teams/matches endpoints. Portraits,
cast and confirmed/trial reporter assignments are retained from the October 22 edition.

These are calendar previews, not future match-day analyses. They deliberately omit
future standings, line-ups, results and manager assignments that might change.
The 22:00 override in the October 22 edition is NOT applied to other dates.
International/cup fixtures are outside this first league-only batch.
This release does not install a recurrent content-generation task.

`coffee-upcoming.js` renders only dates in the manifest; the original Coffee script
and October 22 JSON are unchanged. The only existing files deployed are index.html
(versioned new assets) and programme-tabs.js (extend the date selector range).
The new dated JSON also satisfies Final Whistle's existing fixture contract.

Deployment uses configured Aruba FTPS secrets, production baseline checks,
integration-file backups, FTPS and public HTTPS read-back. The scoped workflow tests
all dates and division tabs with mobile Chrome before deployment and again on the
public site, including October 22 and Final Whistle integration. It does not claim
Safari/WebKit validation. No changes to Daytime or existing editions are deployed.
