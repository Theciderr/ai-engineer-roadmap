import { NextResponse } from 'next/server';
import { query, MarketEvidence } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await query<MarketEvidence>('SELECT * FROM market_evidence ORDER BY id');
  return NextResponse.json(result.rows);
}
