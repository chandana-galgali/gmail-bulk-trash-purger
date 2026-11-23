# Gmail Bulk Trash Purger

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-V8-4285F4?logo=google&logoColor=white)

**Permanently delete thousands of emails from your Gmail Trash in minutes, without the "An error occurred" timeout.**

A small Google Apps Script that runs inside your own Google account. You don't need to install anything, there's no server, and no third party ever sees your mail.

**Website:** https://chandana-galgali.github.io/gmail-bulk-trash-purger/

---

## The problem

Once Gmail Trash holds thousands of messages, **Select all conversations in Trash → Delete forever** usually fails with a generic *"An error occurred"*. That leaves you deleting 50–100 emails a page, by hand, for hours.

## What this does

- Reads **only the Trash label** and permanently deletes what it finds, 500 messages per API call.
- Runs a **dry run** (`countTrash`) so you can see how much is there before deleting anything.
- Stops cleanly before Google's **6-minute** script limit, then **schedules itself to continue** until Trash is empty. You click Run once.
- Can run **every day** automatically so Trash never builds up again.
- Can optionally keep recent trash (for example, only delete items older than 7 days).

> ⚠️ **Deletion is permanent.** Anything removed by this script cannot be recovered from Trash. Check `countTrash()` first and make sure there's nothing in Trash you want back.

---

## Quick start (about 3 minutes)

### 1. Create the project
1. Go to **[script.google.com](https://script.google.com/home)** and click **New project**.
2. Rename it from *Untitled project* to `Gmail Bulk Trash Purger`.

### 2. Paste the code
1. Delete the placeholder code in `Code.gs`.
2. Copy everything from [`src/Code.gs`](./src/Code.gs) and paste it in.
3. Click **Save** (💾).

### 3. Turn on the Gmail API service
1. In the left sidebar, click **+** next to **Services**.
2. Choose **Gmail API**, leave the identifier as `Gmail`, and click **Add**.

### 4. Dry run
1. In the function dropdown at the top, select **`countTrash`** and click **Run**.
2. Approve the permissions prompt (see [Permissions](#permissions-and-privacy) below). Google warns that the app is unverified because it's your own private script. Click **Advanced → Go to Gmail Bulk Trash Purger (unsafe) → Allow**.
3. Open **Execution log** to see how many messages are in Trash. Nothing has been deleted yet.

### 5. Empty the Trash
1. Select **`autoEmptyTrash`** and click **Run**.
2. Watch the log. If your Trash is too large to clear in one go, the script schedules itself to carry on about a minute later, and keeps doing so until Trash is empty. You can close the tab.

That's it.

---

## Optional: keep Trash empty automatically

Select **`installDailyTrigger`** and click **Run**. From then on the script empties Trash once a day (by default around 02:00 in the project's time zone; set the time zone under ⚙️ **Project Settings**).

To stop it, run **`removeAllTriggers`**.

> Tip: if you like having a few days to undo deletions, set `EXTRA_QUERY: 'older_than:7d'` in the settings before installing the daily trigger. Note that Gmail's `older_than` looks at the email's date, not the date you trashed it.

## Settings

At the top of `Code.gs`:

| Setting | Default | What it does |
|---|---|---|
| `EXTRA_QUERY` | `''` | Gmail search filter applied *within* Trash, e.g. `older_than:30d`, `from:newsletter@example.com`. Empty means everything. |
| `MAX_RUNTIME_MS` | 5 min | When to stop a run, safely under Google's 6-minute limit. |
| `AUTO_CONTINUE` | `true` | Automatically schedule another run if Trash isn't empty yet. Set `false` to just click Run again yourself. |
| `DAILY_HOUR` | `2` | Hour (0–23) used by `installDailyTrigger`. |
| `PAGE_SIZE` | `500` | Messages per request (500 is Gmail's maximum). |

## Functions

| Function | Deletes mail? | Purpose |
|---|---|---|
| `countTrash` | No | Dry run: counts what would be deleted. |
| `autoEmptyTrash` | **Yes** | Permanently empties Trash (respecting `EXTRA_QUERY`). |
| `installDailyTrigger` | No (schedules it) | Runs `autoEmptyTrash` daily. |
| `removeAllTriggers` | No | Removes every scheduled run created by this project. |

---

## Permissions and privacy

The script asks for two permissions:

- **Read, compose, send and permanently delete all your email** (`https://mail.google.com/`). Google only offers *permanent* deletion under this full-access scope; there's no narrower one. The code only ever lists and deletes messages carrying the **Trash** label. You can read every line of it in [`src/Code.gs`](./src/Code.gs). It's about 150 lines, half of them comments.
- **Manage triggers** (`script.scriptapp`), used only to schedule continuation runs and the optional daily run.

The script runs **as you, inside your Google account**. Nothing is sent anywhere else. The "unverified app" warning appears because the project is yours and hasn't been through Google's review; it isn't a sign of anything wrong. To revoke access later, go to [Google Account → Third-party connections](https://myaccount.google.com/connections), or just delete the project.

## FAQ

**Doesn't Gmail empty Trash by itself?**
Yes, after 30 days. This is for when you need the storage back *now*, or when you want Trash cleared on your own schedule.

**Is it safe to run repeatedly?**
Yes. If Trash is already empty it logs "Done" and exits.

**It said "Deletion appears stuck".**
The same messages kept coming back after a delete. Wait a few minutes (Gmail can briefly rate-limit) and run again. If it persists, please open an issue with the execution log.

**Does it touch Spam?**
No. Only the Trash label.

**I hit "Service invoked too many times" / a quota error.**
Free Gmail accounts have a daily Gmail API quota. Leave it until tomorrow; the next run picks up where it stopped.

---

## For developers

The `src/` folder is a ready-made [clasp](https://github.com/google/clasp) project (`appsscript.json` already enables the Gmail service and declares scopes):

```bash
npm install -g @google/clasp
clasp login
clasp create --type standalone --title "Gmail Bulk Trash Purger" --rootDir src
clasp push
```

## Project layout

```
.
├── src/
│   ├── Code.gs            # the script (this is all most people need)
│   └── appsscript.json    # manifest: Gmail advanced service + scopes
├── docs/
│   └── index.html         # GitHub Pages site
├── CHANGELOG.md
├── LICENSE
└── README.md
```

## License

[MIT](./LICENSE) © 2026 Chandana Galgali
