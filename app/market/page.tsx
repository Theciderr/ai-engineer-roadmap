'use client';

import { useEffect, useState } from 'react';
import { MarketEvidence } from '@/lib/db';

export default function MarketPage() {
  const [rows, setRows] = useState<MarketEvidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/market')
      .then((r) => r.json())
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-6 md:px-10 py-10 max-w-4xl">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan mb-2">
        Why this plan
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-bright mb-8">
        Market evidence
      </h1>

      {loading ? (
        <div className="text-slate-dim">Loading evidence…</div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="bg-panel border border-rail rounded-panel p-5 shadow-panel">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className="text-slate-bright text-sm font-medium">{r.source}</span>
                {r.freshness && (
                  <span className="font-mono text-[10px] text-slate-dim">{r.freshness}</span>
                )}
              </div>
              <p className="text-sm text-slate mb-2">{r.signal}</p>
              <p className="text-sm text-cyan border-t border-rail pt-2 mb-2">{r.plan_impact}</p>
              {r.link && (
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-amber hover:text-amber-dim break-all"
                >
                  {r.link}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
