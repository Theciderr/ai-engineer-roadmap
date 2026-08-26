# Mission Control — AI Engineer Sprint Tracker

A production web app for executing a 16-week, 112-day plan to become job-ready
as an AI Engineer: a daily task checklist, a 16-week curriculum view, a skills
matrix, a job-application pipeline, and the market research the plan is based
on — all backed by a real database and API, not local-only state.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL
(`pg`) · Docker

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

All writes go through real API routes (`app/api/**`) into a PostgreSQL database
that's migrated and seeded from `data/seed-data.json` on first request.

## Getting started locally

```bash
npm install
npm run dev
```

Set `DATABASE_URL` to a PostgreSQL connection string, then open
http://localhost:3000. The schema is created and seeded automatically on the
first database request — no separate seed step is needed.

Example local environment variable:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mission_control
```

## Running with Docker (recommended for a real deployment)

```bash
docker compose up --build
```

This builds the app and runs it on port 3000. Set `DATABASE_URL` in the
environment used by the container; PostgreSQL owns persistence separately.

To deploy on Vercel, add `DATABASE_URL` as a production environment variable
using a hosted PostgreSQL provider such as Neon, Supabase, or Vercel
Postgres, then deploy normally. The pooled client uses SSL by default; set
`DATABASE_SSL=false` only for a trusted non-SSL local database.

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
  db.ts                  PostgreSQL pool, schema, one-time seeding
data/
  seed-data.json          Source data (exported from the original study-plan spreadsheet)
```

## Regenerating the seed data

If you revise the underlying study plan, re-export it to
`data/seed-data.json` in the same shape (see `lib/db.ts` for the expected
fields). Existing rows are preserved; use a new database or clear the
reference tables before reseeding.

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
- **Database provisioning:** the PostgreSQL database must be reachable from
  the deployment and `DATABASE_URL` must be configured before requests arrive.

## Using this for your resume

This project doubles as a portfolio piece: it's a full-stack TypeScript app
(Next.js API routes + PostgreSQL + Docker) you designed, built, and deployed
end-to-end. A reasonable resume line:

> Built and deployed a full-stack progress-tracking app (Next.js, TypeScript,
> PostgreSQL, Docker) to plan and execute a 16-week technical upskilling program,
> with a REST API, persistent state, and a live application-pipeline tracker.

Deploy it, put the live URL and this repo on your resume/LinkedIn, and you
have a concrete, verifiable example of exactly the kind of "ship a small,
real, working system" work AI Engineer interviews probe for.
