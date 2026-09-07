# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL (Neon) · Docker

## Users

A student executing an intensive 16-week, 112-day AI Engineer preparation sprint. They track daily progress through learning tasks, project builds, and job applications. Success means completing the daily checklist, maintaining a streak, and landing interviews by week 16.

## Product Purpose

Mission Control turns a 16-week AI Engineer job-readiness plan from a static spreadsheet into a persistent, interactive tracker. It makes the 112-day journey visible, measurable, and motivating by displaying real-time progress, streak counts, and a visual 16-week rail that reflects build days (amber) and review days (cyan). The tracker persists every action to a real PostgreSQL database, so progress is always saved and reviewable.

## Positioning

Unlike a generic to-do list or spreadsheet, Mission Control combines interactive features with a purposeful visual identity designed to keep the user engaged and motivated throughout the entire 16-week sprint. The interface reflects the rigor of the plan itself: it's a production-grade tracker with real data persistence, not a lightweight app. Streaks, completion percentages, and a distinctive progress rail give the user constant, visual proof of momentum.

## Operating Context

The user accesses Mission Control daily for ~30 seconds to check off today's task and scan the week. On Sundays, they review the week's completion and plan next week. Job applications are logged as they are sent (expected 5–25/day depending on week). Skills and market context are referenced weekly. The 16-week visual rail is the signature feature: amber indicates a build day completed; cyan indicates a review day completed.

## Capabilities and Constraints

**Capabilities:**
- Persistent checkbox toggle for each of 112 daily tasks across 16 weeks
- Real-time stats: current day, week, completion %, streak, total applications sent
- Filterable daily task view by week
- Job pipeline with stage tracking (Applied → Screen → Interview → Offer/Rejected)
- Skills matrix with P0/P1 priority reference
- 16-week curriculum view with market alignment rationale per week
- Market evidence and research sources
- Automatic database migration and seeding on first request

**Constraints:**
- Single-user by design (no authentication layer)
- PostgreSQL database must be provisioned and accessible
- No multi-device sync; data lives in the nominated Postgres instance only

## Brand Commitments

**Visual identity:** Minimalistic premium. Dark console-like aesthetic with deep navy-charcoal background (#0F1620), refined typography (IBM Plex Sans/Mono), and a restrained two-color accent system: phosphor amber (#FFB454) for primary signals and build-day progress; cyan (#4FD1C5) for secondary signals and review-day progress. No decoration, no shadows beyond subtle depth. The interface is a production tool that earns its place on the desktop.

**Voice:** Professional, precise, instrumental. Copy is concise and task-focused. UI labels use technical terminology ("Day", "Week", "Phase", "Deliverable") to reinforce that this is serious work.

## Evidence on Hand

- Existing responsive design in Tailwind CSS and React (app/page.tsx, app/tasks/page.tsx, etc.)
- Pre-seeded data in data/seed-data.json (all 112 days, weeks 1–16, skills, market research)
- Database schema in lib/db.ts with auto-migration and seeding
- API routes for tasks, jobs, skills, stats, market
- Sidebar navigation with 6 main sections
- Deployed on production stack: Next.js, PostgreSQL, Docker

## Product Principles

1. **Visibility breeds momentum.** Streaks, percentages, and the progress rail are not decoration; they are proof the user is advancing. Every screen should make progress unmissable.
2. **Precision over comfort.** The interface is a tool for serious work, not a casual app. Terminology, layout, and interaction reflect professional standards.
3. **Persistence earns trust.** Every action is saved to the database immediately. No unsaved state, no data loss, no friction. The user can walk away and return to exactly where they left off.
4. **One job, one interface.** The tracker is purpose-built for this 16-week plan. No generalization, no feature creep. Simplicity is enforced.
5. **Premium restraint.** The aesthetic is intentional and minimal. Dark, refined, monospaced. Expensive craft expressed through what is omitted, not what is added.

## Accessibility & Inclusion

- Keyboard navigation for all task toggles and pipeline moves
- High contrast text on dark backgrounds (WCAG AA minimum)
- Focus indicators on interactive elements
- Semantic HTML and ARIA labels for screen readers
- Responsive design for desktop and mobile
- No motion-based essential interactions (all toggles have static alternatives)
