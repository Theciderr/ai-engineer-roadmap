import { NextResponse } from 'next/server';
import { query, Skill } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await query<Skill>('SELECT * FROM skills ORDER BY category, id');
  return NextResponse.json(result.rows);
}
