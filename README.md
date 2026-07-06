# QLI Event Countdown

One shared view of the event countdown and every planning deadline. The whole thing is driven by a single file — [events.json](events.json). Edit that file, and the dashboard and everyone's iPhone widget update on their own.

**Three parts:**

| File | What it is |
|---|---|
| `events.json` | The only file you ever edit — event date + planning stages |
| `index.html` | The dashboard (pin the deployed link in WhatsApp) |
| `widget.js` | iPhone home-screen widget (Scriptable app) |

---

## 1. Editing events.json

Open `events.json` and change the values. That's the entire maintenance workflow.

```json
{
  "eventName": "Play for Good: Fitness Festival",
  "eventDate": "2026-11-14",
  "venue": "AsiaWorld-Expo",
  "stages": [
    {
      "name": "Venue contract signed",
      "deadline": "2026-06-30",
      "owner": "Ken",
      "status": "done"
    }
  ]
}
```

Rules:

- **Dates** are always `YYYY-MM-DD`.
- **status** must be exactly one of: `"done"`, `"in_progress"`, `"not_started"`.
- Add or remove stages freely — copy a whole `{ ... }` block including the comma between blocks.
- Watch the commas: every stage block ends with `,` except the last one. If the dashboard goes blank after an edit, it's almost always a missing or extra comma — paste the file into [jsonlint.com](https://jsonlint.com) to find the exact line.

What the dashboard does with it, automatically:

- A stage past its deadline that isn't `done` shows **OVERDUE** in red.
- The nearest future deadline that isn't done gets the **UP NEXT** highlight.
- The progress bar is simply `done stages ÷ total stages`.

If you edit on GitHub directly (easiest for non-developers): open the repo → click `events.json` → pencil icon → edit → **Commit changes**. The live site updates in about a minute.

---

## 2. Deploying to GitHub Pages

One-time setup, about five minutes:

1. Create a repo on [github.com](https://github.com) (e.g. `qli-event-tracker`). Public is simplest; note that a public repo means anyone with the link can see the dashboard.
2. Upload the four files in this folder (repo page → **Add file → Upload files**).
3. Go to **Settings → Pages** → under *Build and deployment*, set Source to **Deploy from a branch**, branch `main`, folder `/ (root)` → **Save**.
4. Wait ~1 minute. Your dashboard is live at:
   `https://<your-username>.github.io/qli-event-tracker/`
5. Pin that link in the WhatsApp group.

Your `events.json` URL (needed for the widget) is the same address plus the filename:
`https://<your-username>.github.io/qli-event-tracker/events.json`

**Vercel instead?** Also works: [vercel.com](https://vercel.com) → Add New Project → import the repo → Deploy. No settings needed — it's a static site.

**Testing locally** (optional): browsers block `fetch` from files opened directly, so run a tiny server from this folder first:

```
python3 -m http.server
```

then open http://localhost:8000.

---

## 3. Installing the iPhone widget (each teammate)

Takes about two minutes per person:

1. Install the free **Scriptable** app from the App Store.
2. Open Scriptable → tap **+** → paste the full contents of `widget.js` → rename the script to **QLI Countdown** (tap the name at the top).
3. In the script, replace `PASTE_DEPLOYED_URL_HERE/events.json` at the top with your real URL, e.g.
   `https://<your-username>.github.io/qli-event-tracker/events.json`
4. Go to your home screen → long-press any empty spot → **+** button → search **Scriptable** → choose the **medium** (rectangular) widget → **Add Widget**.
5. Tap the new widget while still in edit mode → set **Script** to *QLI Countdown* → tap outside to finish.

The widget shows the countdown plus the next deadline and its owner, and turns red if anything is overdue. iOS refreshes it on its own schedule (roughly every 15–30 minutes). Tapping it opens the dashboard.

**Tip:** send teammates the `widget.js` file with the URL already pasted in, so their only job is steps 1, 2, 4, 5.

---

## Troubleshooting

- **Dashboard is blank** → invalid JSON, almost always a comma. Check `events.json` at [jsonlint.com](https://jsonlint.com).
- **Widget says it can't load** → check the URL in the script opens in Safari and shows the raw JSON.
- **Changes not showing** → the dashboard re-fetches every 5 minutes; pull-to-refresh or reload the page to see edits immediately. GitHub Pages itself can take ~1 minute to publish a commit.
