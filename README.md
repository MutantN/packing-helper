# Nadia Schaum's Moving Day Helper

**Live site:** https://packing-helper-five.vercel.app

A single-page tool with three parts:

- **Packing tracker** — every room in the house (Upstairs, Downstairs, Kitchen, Laundry & storage, Garage & outdoor — 30 spaces in total), with tasks organised into 4 phases (sort, pack non-essentials, pack most things, last bits). Filter by phase and/or area, with an overall whole-house progress bar.
- **Timeline** — a Gantt-style chart showing the 4 phases mapped across your move countdown, with a "today" marker and on-track/behind-schedule status per phase.
- **Keep or donate** — a short yes/no decision tree for any item you're unsure about, plus a quick-rules cheat sheet.

Everything is saved automatically in the browser (localStorage), so progress, your move date, and the timeline's start-date anchor all persist between visits on the same device.

## Deploy to Vercel

**Option A — drag and drop (no account setup needed)**
1. Go to https://vercel.com/new
2. Drag this folder onto the page, or use "Deploy" and upload it.
3. Vercel will detect it as a static site — no build command needed. Click Deploy.

**Option B — Vercel CLI**
```
npm install -g vercel
cd packing-helper
vercel
```
Follow the prompts (accept the defaults — it's a static site). To push a later update to the same project, run `vercel --prod` again from this folder.

**Option C — GitHub**
1. Push this folder to a GitHub repo.
2. In Vercel, click "Add New Project" and import the repo.
3. Framework preset: "Other". No build command, output directory is the repo root. Deploy.
4. Future updates: just push to the repo (or edit the file on github.com) — Vercel redeploys automatically.

## Notes

- It's a single `index.html` file — no dependencies, no build step.
- Works fully offline once loaded.
- The Timeline tab needs a move date set (in the field above the tabs) before it shows anything. The "start date" anchor is recorded automatically the first time you set a move date.
- If you want to share progress between devices, you'd need to swap localStorage for a small backend or a service like Vercel KV — happy to help with that if needed.
