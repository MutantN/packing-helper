# Alien Schaum's Moving Day Helper (synced version)

**This version syncs across devices and people** — when anyone ticks a task or updates the move date, everyone else sees it within about 8 seconds (or instantly on next page load/tab focus).

A single-page tool with three parts:

- **Packing tracker** — every room in the house (Upstairs, Downstairs, Kitchen, Laundry & storage, Garage & outdoor — 30 spaces in total), with tasks organised into 4 phases (sort, pack non-essentials, pack most things, last bits). Filter by phase and/or area, with an overall whole-house progress bar.
- **Timeline** — a Gantt-style chart showing the 4 phases mapped across your move countdown, with a "today" marker and on-track/behind-schedule status per phase.
- **Keep or donate** — a short yes/no decision tree for any item you're unsure about, plus a quick-rules cheat sheet.

There's no login — anyone with the link sees and edits the same shared checklist. A small "your name" field lets people optionally tag their updates (e.g. "last updated by Nadia"), shown in the sync badge.

## How the syncing works

- All shared data (ticked tasks, move date, start date) lives in **Vercel KV** (a managed Redis store), not in the browser.
- The page calls a small serverless function at `/api/state` to read and write that data.
- Every device polls for updates every 8 seconds, and also re-checks immediately when you switch back to the tab — so it's not instant real-time, but close enough for a shared household checklist.
- If the network is down, the app still works locally and tries to save your last change once it reconnects (a backup copy is kept in your browser's localStorage as a safety net).

## Setup (one-time)

This version needs a small amount of setup beyond a plain static site, because it has a real (tiny) backend now.

1. **Push this whole folder to GitHub** — including `index.html`, the `api` folder, `package.json`, and `vercel.json`. All of these matter; don't drop any of them.
2. **Import the repo into Vercel** (Add New Project → Import Git Repository). Leave the framework preset as "Other" — Vercel auto-detects the `api/` folder as serverless functions.
3. **Create a KV database**: in your Vercel project, go to the **Storage** tab → **Create Database** → choose **KV**. Give it any name.
4. **Connect it to this project**: Vercel will prompt you to connect the new KV store to your project — accept this. It automatically adds the required environment variables (you don't need to copy/paste any keys yourself).
5. **Redeploy**: trigger a new deployment (Vercel usually does this automatically after connecting storage; if not, go to Deployments → click the three dots on the latest one → Redeploy).

After that, the live URL works for everyone — share it with whoever's helping you move.

## Updating the code later

Same as before: push changes to GitHub, Vercel redeploys automatically. No need to touch the KV setup again unless you want to reset all the data (see below).

## Resetting all data

If you want to wipe progress and start fresh (e.g. for a future move), go to your Vercel project → Storage → your KV database → and delete the key `moving_helper_state`. The app will recreate it with blank defaults next time someone opens the page.

## Notes

- It's intentionally a *shared* checklist with no per-person accounts — simplest option for a household move. If you ever wanted private per-person tracking, that's a bigger change (happy to help if needed).
- The Timeline tab needs a move date set before it shows anything.
- Local-only fallback: if `/api/state` can't be reached (e.g. offline), the app keeps working using your last-synced data and your own local browser as backup, then re-syncs automatically once back online.
