import { NextResponse } from 'next/server';
import { db, Job } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid job id' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const existing = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const merged = { ...existing, ...body };
  db.prepare(
    `UPDATE jobs SET company=?, role=?, url=?, date_applied=?, stage=?, matched_skills=?, missing_skills=?, notes=?
     WHERE id=?`
  ).run(
    merged.company,
    merged.role,
    merged.url,
    merged.date_applied,
    merged.stage,
    merged.matched_skills,
    merged.missing_skills,
    merged.notes,
    id
  );

  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job;
  return NextResponse.json(job);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const result = db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
