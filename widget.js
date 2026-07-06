// QLI Event Countdown — Scriptable widget
//
// HOW TO INSTALL (one-time, ~2 minutes):
//   1. Install the free "Scriptable" app from the App Store.
//   2. Open Scriptable, tap "+", paste this entire file, name it "QLI Countdown".
//   3. Paste the deployed events.json URL into EVENTS_JSON_URL below.
//   4. Long-press your home screen → "+" (Edit) → search "Scriptable" → pick the MEDIUM size.
//   5. Tap the new widget → Script: "QLI Countdown" → done.
//
// The widget refreshes itself periodically (iOS decides exactly when, roughly
// every 15–30 minutes). It shows the event countdown, the next stage deadline
// and its owner — and turns red if any stage is overdue.

const EVENTS_JSON_URL = "https://events-beep.github.io/qli-event-tracker/events.json";

// ---- QLI palette ----
const NAVY = new Color("#101B28");
const CARD_NAVY = new Color("#1A2B3C");
const ORANGE = new Color("#E76F3D");
const CREAM = new Color("#FAF7F2");
const MUTED = new Color("#8FA1B3");
const RED = new Color("#7A1F18");      // dark red background when overdue
const RED_BRIGHT = new Color("#FF6B5E");

const MS_DAY = 24 * 60 * 60 * 1000;

// Parse "YYYY-MM-DD" as local midnight.
function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function daysUntil(str) {
  return Math.round((parseDate(str) - startOfToday()) / MS_DAY);
}

function fmtDate(str) {
  const df = new DateFormatter();
  df.dateFormat = "EEE d MMM";
  return df.string(parseDate(str));
}

async function fetchData() {
  const req = new Request(EVENTS_JSON_URL + "?t=" + Date.now());
  return await req.loadJSON();
}

function buildWidget(data) {
  const stages = data.stages || [];
  const overdue = stages.filter(s => s.status !== "done" && daysUntil(s.deadline) < 0);

  // Next upcoming: earliest not-done stage whose deadline is today or later.
  const upcoming = stages
    .filter(s => s.status !== "done" && daysUntil(s.deadline) >= 0)
    .sort((a, b) => parseDate(a.deadline) - parseDate(b.deadline));
  const next = upcoming[0];

  const hasOverdue = overdue.length > 0;

  const w = new ListWidget();
  w.backgroundColor = hasOverdue ? RED : NAVY;
  w.setPadding(14, 16, 14, 16);
  w.url = EVENTS_JSON_URL.replace(/events\.json.*$/, ""); // tap opens the dashboard

  // --- Top row: event name + venue ---
  const title = w.addText(data.eventName.toUpperCase());
  title.font = Font.boldSystemFont(11);
  title.textColor = hasOverdue ? CREAM : ORANGE;
  title.lineLimit = 1;

  w.addSpacer(6);

  // --- Countdown ---
  const days = Math.max(0, Math.ceil((parseDate(data.eventDate) - new Date()) / MS_DAY));
  const row = w.addStack();
  row.bottomAlignContent();

  const num = row.addText(String(days));
  num.font = new Font("Didot-Bold", 42);
  num.textColor = CREAM;

  row.addSpacer(8);
  const lbl = row.addText(days === 1 ? "day to go" : "days to go");
  lbl.font = Font.mediumSystemFont(13);
  lbl.textColor = MUTED;

  row.addSpacer();
  const venue = row.addText(data.venue);
  venue.font = Font.mediumSystemFont(11);
  venue.textColor = MUTED;
  venue.lineLimit = 1;

  w.addSpacer(10);

  // --- Bottom card: overdue alert OR next deadline ---
  const card = w.addStack();
  card.backgroundColor = hasOverdue ? new Color("#5C140E") : CARD_NAVY;
  card.cornerRadius = 10;
  card.setPadding(8, 10, 8, 10);
  card.layoutVertically();

  if (hasOverdue) {
    const alert = card.addText("⚠️ " + overdue.length + " OVERDUE — " + overdue[0].name);
    alert.font = Font.boldSystemFont(12);
    alert.textColor = CREAM;
    alert.lineLimit = 1;
    const who = card.addText("Owner: " + overdue[0].owner + " · was due " + fmtDate(overdue[0].deadline));
    who.font = Font.systemFont(11);
    who.textColor = RED_BRIGHT;
    who.lineLimit = 1;
  } else if (next) {
    const head = card.addText("UP NEXT · " + daysUntil(next.deadline) + "d");
    head.font = Font.boldSystemFont(10);
    head.textColor = ORANGE;
    const nm = card.addText(next.name);
    nm.font = Font.semiboldSystemFont(12);
    nm.textColor = CREAM;
    nm.lineLimit = 1;
    const who = card.addText(next.owner + " · due " + fmtDate(next.deadline));
    who.font = Font.systemFont(11);
    who.textColor = MUTED;
    who.lineLimit = 1;
  } else {
    const doneMsg = card.addText("All stages done ✓");
    doneMsg.font = Font.semiboldSystemFont(12);
    doneMsg.textColor = CREAM;
  }

  // Ask iOS to refresh in ~15 minutes (it may wait longer).
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  return w;
}

function buildErrorWidget(message) {
  const w = new ListWidget();
  w.backgroundColor = NAVY;
  w.setPadding(16, 16, 16, 16);
  const t = w.addText("QLI Countdown");
  t.font = Font.boldSystemFont(12);
  t.textColor = ORANGE;
  w.addSpacer(6);
  const m = w.addText(message);
  m.font = Font.systemFont(11);
  m.textColor = CREAM;
  return w;
}

// ---- Main ----
let widget;
if (EVENTS_JSON_URL.startsWith("PASTE_")) {
  widget = buildErrorWidget("Edit the script and paste your deployed events.json URL into EVENTS_JSON_URL at the top.");
} else {
  try {
    widget = buildWidget(await fetchData());
  } catch (e) {
    widget = buildErrorWidget("Couldn't load events.json — check the URL and your connection.");
  }
}

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // Running inside the Scriptable app: show a preview.
  await widget.presentMedium();
}
Script.complete();
