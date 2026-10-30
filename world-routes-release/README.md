# Nexus world routes

Adds `/nexus/gw001/` through `/nexus/gw011/` and the GW011 U21 presentation at `/nexus/gw011/risingstarsleague/`.

World homes render the current shared `index.html` with a base URL and read-only script adapter. Existing data endpoints and section URLs stay shared. Legacy `?world=GWxxx` home links redirect to the corresponding clean route and preserve other query parameters. The path owns the selected world.

Rising Stars currently presents Premier Pool and Challenger Pool (10 teams each), U21 eligibility from 15 October 2004 inclusive, and the approved illustration. Team assignments, fixtures and standings are not yet configured.

The deploy preserves unrelated .htaccess rules and shared files, verifies all 11 worlds and mobile/desktop competition layout with Playwright, and restores changed files and routing on verification failure. New shared home script dependencies require explicit adapter review.
