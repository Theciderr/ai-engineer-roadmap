import { NextResponse } from 'next/server';
import { db, MarketEvidence } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = db.prepare('SELECT * FROM market_evidence ORDER BY id').all() as MarketEvidence[];
  return NextResponse.json(rows);
}
