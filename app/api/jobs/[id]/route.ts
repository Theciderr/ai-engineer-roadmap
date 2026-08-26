import { NextResponse } from 'next/server';
import { query, Job } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid job id' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const existingResult = await query<Job>('SELECT * FROM jobs WHERE id = $1', [id]);
  const existing = existingResult.rows[0];
  if (!existing) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const merged = { ...existing, ...body };
  await query(
    `UPDATE jobs SET company=$1, role=$2, url=$3, date_applied=$4, stage=$5, matched_skills=$6, missing_skills=$7, notes=$8
     WHERE id=$9`,
    [
    merged.company,
    merged.role,
    merged.url,
    merged.date_applied,
    merged.stage,
    merged.matched_skills,
    merged.missing_skills,
    merged.notes,
    id
    ],
  );

  const job = await query<Job>('SELECT * FROM jobs WHERE id = $1', [id]);
  return NextResponse.json(job.rows[0]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const result = await query('DELETE FROM jobs WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
