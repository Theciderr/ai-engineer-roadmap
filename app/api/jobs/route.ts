import { NextResponse } from 'next/server';
import { db, Job } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all() as Job[];
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { company, role, url, date_applied, stage, matched_skills, missing_skills, notes } = body;

  if (!company || !role) {
    return NextResponse.json({ error: 'company and role are required' }, { status: 400 });
  }

  const result = db
    .prepare(
      `INSERT INTO jobs (company, role, url, date_applied, stage, matched_skills, missing_skills, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      company,
      role,
      url ?? null,
      date_applied ?? null,
      stage ?? 'Applied',
      matched_skills ?? null,
      missing_skills ?? null,
      notes ?? null
    );

  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid) as Job;
  return NextResponse.json(job, { status: 201 });
}
