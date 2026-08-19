# Mission Control — AI Engineer Sprint Tracker

A production web app for executing a 16-week, 112-day plan to become job-ready
as an AI Engineer: a daily task checklist, a 16-week curriculum view, a skills
matrix, a job-application pipeline, and the market research the plan is based
on — all backed by a real database and API, not local-only state.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · SQLite
(better-sqlite3) · Docker

---

## Why this exists

The plan started as a spreadsheet. This turns it into something you actually
use every day: check off today's tasks, log applications as you send them,
and see progress roll up automatically — with data that persists on a real
backend, the same pattern you'll be building in Weeks 12–15 of the plan
itself (FastAPI/Postgres-style service behind a UI).

## Features

- **Dashboard** — current day/week, completion %, a streak counter, total
  applications sent, and a 16-week × 7-day progress rail (the signature
  visual: amber = build day complete, cyan = review day complete).
- **Daily Tasks** — all 112 days, filterable by week, with a persistent
  checkbox per day (AI learning, project build, DSA focus, CS revision,
  applications target, and the day's deliverable).
- **16-Week Plan** — the full curriculum with a "2026 Market Alignment" note
  per week explaining why it matters to current hiring.
- **Skills Matrix** — grouped, prioritized (P0/P1) skill reference with
  rationale and resources.
- **Job Pipeline** — add applications, move them through stages (Applied →
  Screen → Interview → Offer/Rejected), remove them — all persisted.
- **Market Evidence** — the sources and reasoning behind the plan's
  priorities, with links.

All writes go through real API routes (`app/api/**`) into a SQLite database
that's seeded once from `data/seed-data.json` on first run.

## Getting started locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The database (`data/mission-control.db`) is
created and seeded automatically on first request — no separate seed step
needed.

## Running with Docker (recommended for a real deployment)

```bash
docker compose up --build
```

This builds the app and runs it on port 3000, with the SQLite file stored in
a named Docker volume (`mission-control-data`) so your progress survives
container restarts and rebuilds.

To deploy on a host like Railway, Fly.io, or Render: point them at this
`Dockerfile` and attach a persistent volume mounted at `/app/data`. Plain
Docker-friendly hosts are the easiest fit because they give you a real,
always-on filesystem — which SQLite needs.

### A note on Vercel

Vercel's serverless functions have an ephemeral, read-only filesystem, so
SQLite (as configured here) will not persist between requests there. Two
options if you want to deploy to Vercel specifically:

1. Swap `lib/db.ts` for a hosted Postgres provider (e.g. Neon, Supabase, or
   Vercel Postgres) — the SQL in this project is simple enough that porting
   it is mostly a matter of swapping the `better-sqlite3` client for a
   Postgres client (`pg` or `@vercel/postgres`) and adjusting a handful of
   `?`-placeholder queries to `$1`-style ones.
2. Use a hosted SQLite service like Turso, which is API-compatible with this
   setup with minimal changes.

The Docker path above needs no code changes.

## Project structure

```
app/
  page.tsx              Dashboard
  tasks/page.tsx         Daily task checklist
  plan/page.tsx           16-week curriculum
  skills/page.tsx         Skills matrix
  jobs/page.tsx           Job pipeline
  market/page.tsx         Market evidence
  api/
    tasks/                GET all tasks
    tasks/[id]/            PATCH: toggle completion
    jobs/                  GET/POST applications
    jobs/[id]/              PATCH/DELETE an application
    skills/                 GET skills matrix
    market/                 GET market evidence
    stats/                  GET dashboard rollups
components/
  Sidebar.tsx, WeekRail.tsx
lib/
  db.ts                  SQLite connection, schema, one-time seeding
data/
  seed-data.json          Source data (exported from the original study-plan spreadsheet)
```

## Regenerating the seed data

If you revise the underlying study plan, re-export it to
`data/seed-data.json` in the same shape (see `lib/db.ts` for the expected
fields) and delete `data/mission-control.db` — it will reseed on next start.

## Known issues / before you rely on this in production

- **Dependency audit:** `npm audit` currently reports 2 high-severity
  advisories inherited from `next@14.2.35` and its `postcss` dependency.
  Next 14 is nearing end of active patching — before deploying for real use,
  upgrade to Next 15 (`npm install next@15 react@18 react-dom@18` and follow
  the App Router migration notes) and re-run `npm audit`.
- **Single-user by design:** there's no auth layer. If you deploy this
  somewhere public, put it behind basic auth or a login before sharing the
  URL, since the API routes currently accept writes from anyone who can
  reach them.
- **SQLite is single-writer:** fine for one person tracking their own sprint;
  don't reach for this pattern if you expect concurrent multi-user writes at
  scale — that's exactly the Postgres/Redis lesson in Week 12 of the plan.

## Using this for your resume

This project doubles as a portfolio piece: it's a full-stack TypeScript app
(Next.js API routes + SQLite + Docker) you designed, built, and deployed
end-to-end. A reasonable resume line:

> Built and deployed a full-stack progress-tracking app (Next.js, TypeScript,
> SQLite, Docker) to plan and execute a 16-week technical upskilling program,
> with a REST API, persistent state, and a live application-pipeline tracker.

Deploy it, put the live URL and this repo on your resume/LinkedIn, and you
have a concrete, verifiable example of exactly the kind of "ship a small,
real, working system" work AI Engineer interviews probe for.
