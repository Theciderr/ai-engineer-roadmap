import { NextResponse } from 'next/server';
import { db, Skill } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const skills = db.prepare('SELECT * FROM skills ORDER BY category, id').all() as Skill[];
  return NextResponse.json(skills);
}
