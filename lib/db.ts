import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import seedData from '../data/seed-data.json';

const DB_PATH = path.join(process.cwd(), 'data', 'mission-control.db');

// Ensure the data directory exists (important in fresh Docker volumes).
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// A module-level singleton so we don't reopen the file on every request
// (Next.js dev mode hot-reloads modules, so we stash it on globalThis too).
declare global {
  // eslint-disable-next-line no-var
  var __missionControlDb: Database.Database | undefined;
}

function openDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  return db;
}

export const db = globalThis.__missionControlDb ?? openDb();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__missionControlDb = db;
}

function tableIsEmpty(table: string): boolean {
  const row = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as { c: number };
  return row.c === 0;
}

function migrate() {
  db.exec(`
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      url TEXT,
      date_applied TEXT,
      stage TEXT NOT NULL DEFAULT 'Applied',
      matched_skills TEXT,
      missing_skills TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
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

function seed() {
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, day_number, date, week, phase, ai_task, project_task, dsa_focus, cs_revision, applications_task, deliverable, is_review)
    VALUES (@id, @day_number, @date, @week, @phase, @ai_task, @project_task, @dsa_focus, @cs_revision, @applications_task, @deliverable, @is_review)
  `);

  if (tableIsEmpty('tasks')) {
    const insertMany = db.transaction((rows: any[]) => {
      rows.forEach((row) => insertTask.run(row));
    });
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
    insertMany(rows);
  }

  if (tableIsEmpty('skills')) {
    const insertSkill = db.prepare(`
      INSERT INTO skills (id, category, skill, priority, proficiency, rationale, resource, status)
      VALUES (@id, @category, @skill, @priority, @proficiency, @rationale, @resource, @status)
    `);
    const insertMany = db.transaction((rows: any[]) => rows.forEach((r) => insertSkill.run(r)));
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
    insertMany(rows);
  }

  if (tableIsEmpty('market_evidence')) {
    const insertEv = db.prepare(`
      INSERT INTO market_evidence (id, source, signal, plan_impact, freshness, link)
      VALUES (@id, @source, @signal, @plan_impact, @freshness, @link)
    `);
    const insertMany = db.transaction((rows: any[]) => rows.forEach((r) => insertEv.run(r)));
    const rows = (seedData.marketEvidence as any[]).map((e, i) => ({
      id: i + 1,
      source: e['Source'],
      signal: e['What It Signals'],
      plan_impact: e['How It Changes Your Plan'],
      freshness: e['Date / Freshness'],
      link: e['Link'],
    }));
    insertMany(rows);
  }
}

migrate();
seed();

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
