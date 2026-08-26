'use client';

import { useEffect, useState } from 'react';
import { Skill } from '@/lib/db';

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skills come seeded into PostgreSQL via lib/db.ts; reuse a tiny inline
    // endpoint-free fetch by hitting a dedicated route would be cleaner,
    // but for a read-mostly reference table we keep it simple with fetch.
    fetch('/api/skills')
      .then((r) => r.json())
      .then(setSkills)
      .finally(() => setLoading(false));
  }, []);

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="px-6 md:px-10 py-10 max-w-5xl">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan mb-2">
        Reference
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-bright mb-8">
        Skills matrix
      </h1>

      {loading ? (
        <div className="text-slate-dim">Loading skills…</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="font-mono text-sm text-amber mb-3">{category}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((s) => (
                  <div key={s.id} className="bg-panel border border-rail rounded-panel p-4 shadow-panel">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-bright text-sm font-medium">{s.skill}</span>
                      {s.priority && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            s.priority === 'P0'
                              ? 'text-coral border-coral/50'
                              : 'text-cyan border-cyan-dim'
                          }`}
                        >
                          {s.priority}
                        </span>
                      )}
                    </div>
                    {s.rationale && <p className="text-xs text-slate-dim mb-2">{s.rationale}</p>}
                    {s.resource && (
                      <p className="text-xs text-slate-dim font-mono truncate">{s.resource}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
