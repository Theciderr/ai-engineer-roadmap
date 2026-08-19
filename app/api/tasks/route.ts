import { NextResponse } from 'next/server';
import { db, Task } from '@/lib/db';

// This reads live data from SQLite on every request; without this Next.js
// treats a param-less GET as static and caches the response at build time.
export const dynamic = 'force-dynamic';

export async function GET() {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY day_number ASC').all() as Task[];
  return NextResponse.json(tasks);
}
