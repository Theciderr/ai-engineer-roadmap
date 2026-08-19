import seedData from '@/data/seed-data.json';

type WeekRow = {
  Week: number;
  Phase: string;
  'Primary Goal': string;
  'Topics / Skills': string;
  'Build / Deliverable': string;
  'Hours/Day': string;
  '2026 Market Alignment': string;
};

export default function PlanPage() {
  const weeks = seedData.weekPlan as unknown as WeekRow[];

  return (
    <div className="px-6 md:px-10 py-10 max-w-5xl">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan mb-2">
        Curriculum
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-bright mb-8">
        16-week plan
      </h1>

      <div className="space-y-4">
        {weeks.map((w) => (
          <div key={w.Week} className="bg-panel border border-rail rounded-panel p-5 shadow-panel">
            <div className="flex items-baseline gap-3 mb-2 flex-wrap">
              <span className="font-mono text-amber text-lg">W{w.Week}</span>
              <span className="text-slate-bright font-medium">{w.Phase}</span>
              <span className="text-xs text-slate-dim">{w['Primary Goal']}</span>
            </div>
            <p className="text-sm text-slate mb-2">{w['Topics / Skills']}</p>
            <p className="text-sm text-slate-dim mb-3">
              <span className="text-slate-dim">Deliverable: </span>
              {w['Build / Deliverable']}
            </p>
            <div className="text-xs text-cyan border-t border-rail pt-3">
              {w['2026 Market Alignment']}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
