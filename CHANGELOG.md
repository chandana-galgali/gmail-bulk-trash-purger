# Changelog

## v1.0.0 — 2026-11-23

- Deletes in batches of up to 500 with a single `batchDelete` call per batch (much faster than one call per message).
- Reads only the Trash label, so nothing outside Trash can be touched.
- Stops cleanly before Apps Script's 6-minute limit and, by default, schedules itself to continue until Trash is empty.
- New `countTrash()` dry run that deletes nothing.
- New `installDailyTrigger()` and `removeAllTriggers()` helpers, so you don't have to set triggers up by hand.
- Optional `EXTRA_QUERY` filter (for example `older_than:7d`).
- Falls back to deleting one by one if a batch fails, and stops if deletion is stuck instead of looping.
- Added `appsscript.json` manifest (Gmail advanced service + scopes) for clasp users.
- Repo layout: `src/` for the script, `docs/` for the GitHub Pages site.

## v0.1.0

- First version: `autoEmptyTrash()` loops over Trash threads and removes each message.
