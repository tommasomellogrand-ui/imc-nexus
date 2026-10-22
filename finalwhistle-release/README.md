# Final Whistle — automatic Coffee Time follow-up

Implementation for GW001. Production snapshot: 22 October 2026, main 697e6b7.
Only index.html adds two new assets. Coffee Time, Daytime and the 20 October
Final Whistle archive retain their existing code and content.

## Data and editorial contract

Each selected date loads `{date}-coffee.json`. Its fixture IDs, division groups,
club IDs, managers and reporter assignments define the edition. A date without
a Coffee Time file displays an explicit empty state. Publishing future Coffee
Time editions under this existing dated filename convention enables their
Final Whistle editions without editing this script.

Results: `/nexus/teams/matches.php?world=GW001&sm_club={home_table.id}`.
Report: `/nexus/competitions/match-report.php?world=GW001&fixture={id}`.
Validate world, date, fixture and both club IDs. Completed Results enable the
score; verified MR takes precedence and supplies statistics, scorers and MVP.
Conflicting scores are disclosed. Null scores must never become 0–0.

Narrative is deterministic, data-dependent commentary, not an LLM service.
No credentials, API fees or invented interviews. Uses the established studio
and the reporters assigned in that date's Coffee Time. Only the existing global
fiction disclosure is used. Pre-match points are explicitly labelled as the
Coffee Time snapshot, not a newly calculated authoritative table.

The page reads current data on opening and every 120 seconds while Final
Whistle is visible. It also refreshes when returning to the tab/window and via
an explicit button. This is live rendering, not a background scheduled job or
immutable saved editorial archive. Previous dates are reconstructed from their
Coffee Time editions and current matching Nexus records, including corrections.
The published 20 October cup episode remains untouched.

## Verification

`node --test finalwhistle-release/tests/core.cjs` covers missing scores, real 0–0,
wrong world/date/fixture/teams, report precedence and malformed optional JSON.
`tests/browser.cjs` uses synthetic responses ONLY inside intercepted browser
requests, never on Nexus. It checks pending→Results→MR/correction, automatic
refresh, 20 cards, four divisions, reporter names, date isolation, existing
Coffee/Daytime and 20 October archive, WebKit iPhone widths 390/375.

The verify-final-whistle workflow runs on this feature branch and NEVER deploys.
Local WebKit cannot launch in this workspace because OS libraries are missing;
the workflow installs the required packages on its GitHub runner.

## Publication

Not published. Tom's initial authorization covered Daytime; Final Whistle is
prepared on its own feature branch, awaiting the explicit publication instruction
required by the project rules. Compare baseline against current production before
publishing. Upload final-whistle.js/css, then replace index.html last. Never use
the old full Nexus deployment workflow. Recheck public bytes and mobile behavior.

Preview verification completed successfully in GitHub Actions run 39803988329:
20 fixtures, four clickable divisions, pending/result/report/correction transitions,
automatic refresh callback, both reporters per tested fixture, existing programmes,
date isolation and WebKit iPhone at 390/375 pixels, with no JavaScript errors.
The iPhone screenshot was also inspected visually: centered presenter portrait,
legible cards, blue/gold styling and no horizontal overlap.
`deploy.py` is prepared for an explicitly authorized scoped FTPS deployment,
with baseline guards, verified backup and index rollback. It has not been run.
