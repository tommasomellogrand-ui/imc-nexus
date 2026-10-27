# Linked Coffee Time / Final Whistle

Final Whistle reads the published Coffee Time edition automatically. No second
daily file, publication, scheduled task or editorial generation is required.
The existing page is the source of its fixtures, managers, groups and reporters;
Nexus resolves the exact fixture and club IDs. Legacy daily editions remain
supported. A missing or ambiguous identity fails closed, never picks a match.

It presents waiting fixtures immediately, then reads Match Reports on opening,
every two minutes while visible, and on return to the page. Verified reports
enable each match's post-match details and existing data-based commentary.
Results alone can display scores but do not unlock the match commentary.
Updates and corrected reports are reflected on the next read. Cup games never
award league points. No write to Results, Schedule or Match Report is performed.

New HTML Coffee editions keep the existing coffee-fixture, coffee-match-team,
coffee-division and coffee-interview markup. An optional embedded coffee-fixtures
JSON element supports other layouts in the same HTML page (no separate file).
Future Coffee publication must preserve this contract and verify the source
endpoint; avoid reintroducing a separate manual Final Whistle step.

Deployment is scoped to the two source PHP files, Final Whistle JS and its
landing page. Hash guards prevent overwriting concurrent changes; failures
restore previous bytes. Tests cover exact source matching and the transition
from waiting to Results to Match Report, including corrected reports.
