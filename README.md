# Arise — Solo Leveling-themed Habit Tracker

A personal habit tracker PWA. Complete daily/one-time quests, grow stats
(Strength, Intellect, Vitality, Agility), level up, rank up, and miss a
daily and face a penalty quest.

## Local development

```bash
npm install
npm run dev
```

Open the printed localhost URL. Data is stored in IndexedDB in your
browser, so it persists across reloads on the same device/browser.

## Deploying to GitHub Pages

1. Push this project to a new GitHub repo.
2. **Important:** open `vite.config.js` and set `base` to match your repo
   name exactly, e.g. `base: '/your-repo-name/'`.
3. In the repo settings on GitHub: **Settings -> Pages -> Source -> GitHub
   Actions**.
4. Push to `main` - the included workflow
   (`.github/workflows/deploy.yml`) builds and deploys automatically.
5. Your app will be live at `https://<username>.github.io/<repo-name>/`.

## Installing on iPhone (no Mac needed)

1. Open the deployed URL in **Safari** on your iPhone.
2. Tap the Share icon -> **Add to Home Screen**.
3. Open it from your home screen - it now runs full-screen, no browser
   chrome, like a native app.

## Backing up your data

- **Export**: downloads a JSON file of all stats/tasks/logs.
- **Import**: pick a previously exported file. "Replace" fully restores,
  "Merge" only adds missing items.

Back this up occasionally, especially before iOS updates or if you
haven't opened the app in a while - Safari can, in rare cases, clear
site storage after long inactivity.

## What's built so far

- Dashboard: rank badge, overall level/XP bar, stat bars, today's
  quests, streaks
- Quests tab: create/edit/delete daily tasks and one-time quests, with
  reminder time, deadline, alarm-style flag, and a custom penalty quest
  per task
- Settings tab: export/import JSON backup (replace or merge mode),
  notification permission toggle
- Task completion -> XP gain -> automatic level-up detection
- Level-up celebration animation (stat-level and overall-level)
- Automatic daily-deadline checker: while the app is open, any pending
  daily past its deadline auto-fails, applies the XP penalty, and spawns
  its penalty quest
- Daily reset: completed/failed dailies flip back to pending each new
  day
- Reminder notifications at the scheduled time - see the important
  limitation below
- IndexedDB persistence
- Offline-capable via a basic service worker
- GitHub Pages deploy workflow

## A note on notifications

This is a static site with no backend, so notifications can only fire
while the app is actually open (foreground or backgrounded but still
running) - not while fully closed for hours/days. True background push
(the kind that wakes the app up even after you haven't opened it) needs
a small push server holding VAPID keys, which is a well-documented
addition later but out of scope for a no-backend GitHub Pages app.

## Not yet built (next steps)

- Stats history / growth charts over time
- A true background push server, if you want notifications to work
  when the app isn't open
