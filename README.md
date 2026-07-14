# 🗓️ Picture Calendar

A **picture-based, accessible calendar** for children and adults with
disabilities — Down syndrome, dementia, autism and others — who don't read or
write and have little or no concept of time.

Instead of text, every event is a **picture** with a **color** and a simple,
visual sense of **how long until / how much is left**. It's modeled on Google
Calendar, but built for people who understand pictures, not words.

> **Private by design.** Everything is stored locally in the browser
> (IndexedDB). No account, no server, no data ever leaves the device — which
> matters for a tool used by vulnerable people.

---

## ✨ What it does

### Two modes

| Mode | For | What it shows |
| --- | --- | --- |
| **🧑 Viewer** | The person using the calendar | One big picture for what's happening **now**, its timing as a **color bar / countdown / clock**, and a **Today** strip of upcoming pictures. No reading needed. |
| **🛠 Caregiver** | The parent / carer / teacher | A Google-Calendar-style **Day (hourly)**, **Week** and **Month** view to add and arrange picture-events. |

### Every event is a picture
- **Built-in picture bank** of ~40 common daily tasks — go to school, brush
  teeth, take medication, get dressed, shower, bath, meals, bedtime, and more,
  grouped by category (Hygiene, Meals, Health, School & work, …).
- **Upload your own photos** — real, familiar photos of the person, places and
  objects often work best. Uploads are auto-resized so storage stays small.
- Optional text **label** on each event — only to help caregivers; the viewer
  never needs it.

### Three ways to show time (chosen per event)
- **🟩 Color bar** — a bar that drains from full to empty as the event runs.
- **⏳ Countdown** — big "Starts in 20 min" / "15 min left" text.
- **🕐 Clock** — a simple analog clock with the start time marked.

### Color everywhere
Color is a first-class property of every event, using a **12-color
accessible palette**. There's also a **high-contrast theme** (black
background, bold colors, thick borders) for low-vision users.

### Built for accessibility
- Large touch targets (56px+), big type, works great on a **tablet**.
- Full keyboard focus rings, ARIA labels/roles, `role="img"` pictures.
- Respects `prefers-reduced-motion`.
- Tap any picture in the Today strip to mark it **done**.
- Repeating events (daily, weekdays, weekly) for routines.

---

## 🚀 Getting started

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
```

Other scripts:

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
npm run typecheck # type-check only
```

Open the app, switch to **🛠 Caregiver**, tap **＋** (or an empty time slot) to
add a picture-event, then switch to **🧑 Viewer** to see it the way the person
using the calendar will.

---

## 🧱 Tech & structure

- **React + TypeScript + Vite**, no UI framework — plain, dependency-light,
  fast to load.
- **idb-keyval** for local IndexedDB persistence.

```
src/
  types.ts                  # data model (Event, Picture, Settings, palette)
  store.ts                  # IndexedDB persistence
  context/AppContext.tsx    # global state (events, pictures, settings)
  data/builtinPictures.ts   # the starter picture bank
  utils/                    # date, event-query, image-resize, useNow helpers
  components/
    ViewerToday.tsx         # the big "what's now / next" viewer screen
    MonthView.tsx           # month grid
    Timeline.tsx            # shared hourly timeline (Day + Week)
    EventEditor.tsx         # create/edit a picture-event
    PicturePicker.tsx       # pick from the bank or upload
    PictureBankModal.tsx    # manage / upload / hide pictures
    SettingsModal.tsx       # display mode, contrast, clock, day range
    TimingDisplays.tsx      # ColorBar / Countdown / MiniClock
```

---

## 🗺️ Ideas for next steps

- Sound / spoken labels when a task starts (audio cue alongside the picture).
- "First–Then" board mode (a common special-education pattern).
- Printable daily picture schedule.
- Optional cloud sync / multi-device sharing between caregivers.
- Drag-to-move and drag-to-resize events on the timeline.
