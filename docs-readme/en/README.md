<div align="center">
  <span>
    <a href="../../README.md"><img alt="Tiếng Việt" src="https://img.shields.io/badge/Tiếng%20Việt-VI-green?logo=github&style=flat-square"></a>
    <a href="README.md"><img alt="English" src="https://img.shields.io/badge/English-EN-blue?logo=github&style=flat-square"></a>
  </span>

  <h1 style="margin:0.5rem 0">World Cup 2026 — Schedule & WebCal Feed</h1>
  <p style="margin:0.25rem 0"><strong>Minimal, privacy-first match schedule with an automatic iCalendar (WebCal) feed.</strong></p>

  <p style="margin-top:0.5rem">
    <img alt="modules" src="https://img.shields.io/badge/modules-4-lightgrey?style=flat-square"> 
    <img alt="lang" src="https://img.shields.io/badge/languages-TypeScript%20%7C%20JS-blue?style=flat-square"> 
    <img alt="framework" src="https://img.shields.io/badge/framework-Next.js-yellow?style=flat-square"> 
    <img alt="license" src="https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square">
  </p>
</div>

---

## Table of Contents

- [The Deep Problem / Hook](#the-deep-problem--hook)
- [Core Subsystems / Architecture](#core-subsystems--architecture)
- [Quick Start / Getting Started](#quick-start--getting-started)
- [Core Concepts / Workflow Lifecycle](#core-concepts--workflow-lifecycle)
- [Repository Structure](#repository-structure)
- [Target Audience & Prerequisites](#target-audience--prerequisites)
- [Other Projects & Star History](#other-projects--star-history)

---

## The Deep Problem / Hook

> The hard truth: calendar consumers trust a single authoritative feed — but most sports sites offer fragmented pages, inconsistent timezone handling, and no machine-friendly subscription. Without a reliable feed, users either import stale CSVs or manually copy events into calendars.

WITHOUT this project:

- Fans manually copy match times and miss schedule updates or timezone corrections.
- Developers build brittle scrapers or embed heavy analytics just to expose basic fixtures.

WITH this project:

- A single lightweight, auditable WebCal endpoint publishes canonical match data (with timezones and lineup support).
- Integrations and personal calendars stay accurate automatically — no scraping, no heavy telemetry.

This repository is intentionally minimal and production-ready: deterministic schedules, internationalization, and a small API surface so consumers can rely on it as the canonical source for World Cup 2026 fixtures.

---

## Core Subsystems / Architecture

ASCII architecture diagram (high-level):

```
     +-----------------+        +-------------------+        +----------------+
     |  Web UI (Next)  | <----> |  API Routes (Edge) | <----> |  WebCal Engine |
     |  - app/pages     |        |  /api/calendar     |        |  - generateIcs |
     +-----------------+        +-------------------+        +----------------+
             ^                          ^    ^                       |
             |                          |    |                       v
             |                          |    |                 +-------------+
             |                          |    +---------------> |  Data Layer |
             |                          |                    |  - data/schedule.ts
             |                          |                    |  - data/teams.ts
             |                          |                    +-------------+
             |                          |                            |
             |                          |                            v
             +--------------------------+----------------> +----------------+
                                                  i18n          | Public ICS URL |
                                                               | /api/calendar.ics |
                                                               +----------------+
```

Components (folders):

- `app/` — Next.js app routes, localized pages, and UI components.
- `components/` — Reusable UI: calendar grid, schedule list, add-to-calendar helper.
- `data/` — Canonical source: `schedule.ts`, `teams.ts` (squads and metadata).
- `lib/` — Utilities: `generateIcs.ts`, date helpers, URL client for feed generation.
- `api/` — Edge route that returns WebCal/iCal feed for subscriptions.

---

## Quick Start / Getting Started

Project root: key files and where to edit defaults

```
/ (repo root)
├─ app/                 # Next.js app + localized pages
├─ components/          # UI widgets (AddToCalendar, MonthCalendar)
├─ data/                # schedule.ts, teams.ts (canonical data)
├─ lib/                 # generateIcs.ts, dates utilities
├─ api/                 # calendar route (WebCal endpoint)
├─ public/              # static assets
├─ package.json
├─ README.md
└─ LICENSE
```

Install & run locally (requires `bun` or `npm`/`pnpm`):

```bash
# install
bun install

# development server
bun dev

# build for production
bun build
bun start
```

Open `http://localhost:3000` and test the WebCal subscription at `/api/calendar.ics`.

---

## Core Concepts / Workflow Lifecycle

Engine lifecycle (ASCII flow):

```
[Authoritative Data] --> [Match Serializer] --> [ICS Renderer] --> [HTTP Cache]
       |                     |                     |                 |
       v                     v                     v                 v
   data/schedule.ts       normalize()           generateIcs()     GET /api/calendar.ics
       |                     |                     |                 |
       +-------------------------------------------------------------+
                                 consumers
```

Step-by-step runtime loop:

1. Authoritative fixtures are maintained in `data/schedule.ts` and `data/teams.ts`.
2. When `/api/calendar` is requested, the route loads the schedule for the requested language/timezone.
3. `lib/generateIcs.ts` converts fixtures into a standards-compliant iCalendar feed (with proper TZ and UID values).
4. The feed is cached at the HTTP layer for short TTL; updates to `data/` invalidate and refresh the feed.

This pattern ensures small memory footprint, deterministic output, and predictable TTL semantics for consumers.

---

## Repository Structure

```
World-Cup-2026-Schedule-Calendar/
├─ app/
│  ├─ globals.css
│  └─ [locale]/
├─ components/
├─ data/
│  ├─ schedule.ts
│  └─ teams.ts
├─ lib/
│  └─ generateIcs.ts
├─ api/
│  └─ calendar/route.ts
├─ public/
├─ package.json
└─ README.md
```

---

## Target Audience & Prerequisites

| Target | Prerequisites |
|---|---|
| End users who want a simple subscription to World Cup fixtures | Any calendar client that supports WebCal (Google Calendar, Apple Calendar, Outlook) |
| Developers who want a canonical, auditable fixtures feed | Node 18+, `bun` (recommended) or `npm`/`pnpm`, basic familiarity with Next.js and TypeScript |

Recommended developer tools:

- `bun` for fastest local installs and dev server (works with `npm` too).
- A text editor with TypeScript support (VS Code).

---

## Other Projects & Star History

Star history (project):

![Star History](https://starchart.cc/Tylerx404/World-Cup-2026-Schedule-Calendar.svg)

---

## Notes and Next Steps

- To add full match lineups, extend `Match` in `data/schedule.ts` with a `lineup` field (string[] or `Player[]`).
- Consider exposing a small JSON API for programmatic consumers alongside the iCal feed.

---

## License

MIT — see LICENSE file.
