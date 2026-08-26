import { NextResponse } from 'next/server';
import { query, Job } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await query<Job>('SELECT * FROM jobs ORDER BY created_at DESC');
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { company, role, url, date_applied, stage, matched_skills, missing_skills, notes } = body;

  if (!company || !role) {
    return NextResponse.json({ error: 'company and role are required' }, { status: 400 });
  }

  const result = await query<Job>(
    `INSERT INTO jobs (company, role, url, date_applied, stage, matched_skills, missing_skills, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [company, role, url ?? null, date_applied ?? null, stage ?? 'Applied', matched_skills ?? null, missing_skills ?? null, notes ?? null],
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
