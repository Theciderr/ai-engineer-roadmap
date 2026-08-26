import { Pool, QueryResultRow } from 'pg';
import seedData from '../data/seed-data.json';

declare global {
  // eslint-disable-next-line no-var
  var __missionControlPool: Pool | undefined;
  var __missionControlReady: Promise<void> | undefined;
}

export const db = globalThis.__missionControlPool ?? new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});
globalThis.__missionControlPool = db;

export async function ensureDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Add a PostgreSQL connection string to the environment.');
  }
  if (!globalThis.__missionControlReady) {
    globalThis.__missionControlReady = migrate().then(seed);
  }
  await globalThis.__missionControlReady;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  await ensureDatabase();
  return db.query<T>(text, values);
}

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      day_number INTEGER NOT NULL,
      date TEXT NOT NULL,
      week INTEGER NOT NULL,
      phase TEXT NOT NULL,
      ai_task TEXT NOT NULL,
      project_task TEXT NOT NULL,
      dsa_focus TEXT NOT NULL,
      cs_revision TEXT NOT NULL,
      applications_task TEXT NOT NULL,
      deliverable TEXT NOT NULL,
      is_review INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      url TEXT,
      date_applied TEXT,
      stage TEXT NOT NULL DEFAULT 'Applied',
      matched_skills TEXT,
      missing_skills TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY,
      category TEXT NOT NULL,
      skill TEXT NOT NULL,
      priority TEXT,
      proficiency TEXT,
      rationale TEXT,
      resource TEXT,
      status TEXT NOT NULL DEFAULT 'Not started'
    );

    CREATE TABLE IF NOT EXISTS market_evidence (
      id INTEGER PRIMARY KEY,
      source TEXT NOT NULL,
      signal TEXT NOT NULL,
      plan_impact TEXT NOT NULL,
      freshness TEXT,
      link TEXT
    );
  `);
}
  async function seed() {
    const taskCount = await db.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM tasks');
    if (taskCount.rows[0].count === '0') {
    const rows = (seedData.dailyTasks as any[]).map((t) => ({
      id: t['Day #'],
      day_number: t['Day #'],
      date: t['Date'],
      week: t['Week'],
      phase: t['Phase'],
      ai_task: t['AI Learning Task'],
      project_task: t['Project Build Task'],
      dsa_focus: t['DSA Focus'],
      cs_revision: t['CS Revision'],
      applications_task: t['Applications Task'],
      deliverable: t['Daily Deliverable'],
      is_review: t['AI Learning Task']?.startsWith('Weekly review') ? 1 : 0,
    }));
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      for (const row of rows) {
        await client.query(
          `INSERT INTO tasks (id, day_number, date, week, phase, ai_task, project_task, dsa_focus, cs_revision, applications_task, deliverable, is_review)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [row.id, row.day_number, row.date, row.week, row.phase, row.ai_task, row.project_task, row.dsa_focus, row.cs_revision, row.applications_task, row.deliverable, row.is_review],
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  const skillCount = await db.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM skills');
  if (skillCount.rows[0].count === '0') {
    const rows = (seedData.skills as any[]).map((s, i) => ({
      id: i + 1,
      category: s['Category'] ?? s['Skill Category'] ?? Object.values(s)[0],
      skill: s['Skill'] ?? s['Skill / Tool'] ?? Object.values(s)[1],
      priority: s['Priority'] ?? null,
      proficiency: s['Target Proficiency'] ?? s['Proficiency'] ?? null,
      rationale: s['Rationale'] ?? null,
      resource: s['Resource'] ?? s['Learning Resource'] ?? null,
      status: s['Status'] ?? 'Not started',
    }));
    for (const row of rows) {
      await db.query(
        `INSERT INTO skills (id, category, skill, priority, proficiency, rationale, resource, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [row.id, row.category, row.skill, row.priority, row.proficiency, row.rationale, row.resource, row.status],
      );
    }
  }

  const evidenceCount = await db.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM market_evidence');
  if (evidenceCount.rows[0].count === '0') {
    const rows = (seedData.marketEvidence as any[]).map((e, i) => ({
      id: i + 1,
      source: e['Source'],
      signal: e['What It Signals'],
      plan_impact: e['How It Changes Your Plan'],
      freshness: e['Date / Freshness'],
      link: e['Link'],
    }));
    for (const row of rows) {
      await db.query(
        `INSERT INTO market_evidence (id, source, signal, plan_impact, freshness, link)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [row.id, row.source, row.signal, row.plan_impact, row.freshness, row.link],
      );
    }
  }
}

export type Task = {
  id: number;
  day_number: number;
  date: string;
  week: number;
  phase: string;
  ai_task: string;
  project_task: string;
  dsa_focus: string;
  cs_revision: string;
  applications_task: string;
  deliverable: string;
  is_review: number;
  completed: number;
  completed_at: string | null;
};

export type Job = {
  id: number;
  company: string;
  role: string;
  url: string | null;
  date_applied: string | null;
  stage: string;
  matched_skills: string | null;
  missing_skills: string | null;
  notes: string | null;
  created_at: string;
};

export type Skill = {
  id: number;
  category: string;
  skill: string;
  priority: string | null;
  proficiency: string | null;
  rationale: string | null;
  resource: string | null;
  status: string;
};

export type MarketEvidence = {
  id: number;
  source: string;
  signal: string;
  plan_impact: string;
  freshness: string | null;
  link: string | null;
};
