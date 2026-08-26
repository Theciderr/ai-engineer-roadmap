import { NextResponse } from 'next/server';
import { query, Task } from '@/lib/db';

// This reads live data from PostgreSQL on every request; without this Next.js
// treats a param-less GET as static and caches the response at build time.
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await query<Task>('SELECT * FROM tasks ORDER BY day_number ASC');
  return NextResponse.json(result.rows);
}
