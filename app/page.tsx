'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import WeekRail from '@/components/WeekRail';
import type { Task } from '@/lib/db';

type Stats = {
  totalDays: number;
  completedDays: number;
  currentDayNumber: number | null;
  currentWeek: number | null;
  streak: number;
  totalApplications: number;
  stageCount: Record<string, number>;
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then((r) => r.json()),
      fetch('/api/stats').then((r) => r.json()),
    ])
      .then(([t, s]) => {
        setTasks(t);
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleDay(task: Task) {
    setPendingIds((prev) => new Set(prev).add(task.id));
    const nextCompleted = task.completed ? 0 : 1;

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t)));
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !!nextCompleted }),
      });
      if (!res.ok) throw new Error('Save failed');

      // Refresh stats after successful toggle so dashboard updates immediately
      const sres = await fetch('/api/stats');
      if (sres.ok) {
        const sdata = await sres.json();
        setStats(sdata);
      }
    } catch (err) {
      // Roll back on failure.
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t)));
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  }

  const today = tasks.find((t) => t.day_number === stats?.currentDayNumber);
  const pct = stats && stats.totalDays ? Math.round((stats.completedDays / stats.totalDays) * 100) : 0;

  return (
    <div className="px-6 md:px-10 py-10 max-w-5xl">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan mb-2">
        Sprint status
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-bright mb-8">
        AI Engineer readiness sprint
      </h1>

      {loading ? (
        <div className="text-slate-dim">Loading mission data…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Day"
              value={`${stats?.currentDayNumber ?? '—'} / ${stats?.totalDays ?? 112}`}
              accent="amber"
            />
            <StatCard label="Days complete" value={`${stats?.completedDays ?? 0} (${pct}%)`} accent="cyan" />
            <StatCard label="Streak" value={`${stats?.streak ?? 0} days`} accent="amber" />
            <StatCard label="Applications sent" value={`${stats?.totalApplications ?? 0}`} accent="cyan" />
          </div>

          <div className="bg-panel border border-rail rounded-panel p-5 mb-10 shadow-panel">
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-dim">
                16-week rail
              </div>
              <div className="font-mono text-[11px] text-slate-dim">
                <span className="inline-block w-2 h-2 bg-amber rounded-[2px] mr-1" /> build day
                <span className="inline-block w-2 h-2 bg-cyan rounded-[2px] ml-3 mr-1" /> review day
              </div>
            </div>
            <WeekRail tasks={tasks} />
          </div>

          {today && (
            <div className="bg-panel border border-rail rounded-panel p-6 shadow-panel">
              <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber mb-3">
                Today — Day {today.day_number} · Week {today.week} · {today.phase}
              </div>

              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleDay(today)}
                  aria-pressed={!!today.completed}
                  aria-label={`Mark day ${today.day_number} ${today.completed ? 'incomplete' : 'complete'}`}
                  disabled={pendingIds.has(today.id)}
                  className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded-[4px] border transition-colors ${
                    today.completed ? 'bg-amber border-amber' : 'border-slate-dim hover:border-amber'
                  }`}
                />

                <ul className={`space-y-2 text-sm text-slate ${today.completed ? 'text-slate-dim line-through' : ''}`}>
                  <li>
                    <span className="text-slate-dim">AI learning: </span>
                    {today.ai_task}
                  </li>
                  <li>
                    <span className="text-slate-dim">Project build: </span>
                    {today.project_task}
                  </li>
                  <li>
                    <span className="text-slate-dim">Applications: </span>
                    {today.applications_task}
                  </li>
                </ul>
              </div>

              <Link
                href="/tasks"
                className="inline-block mt-5 text-sm font-medium text-amber hover:text-amber-dim transition-colors"
              >
                Open today’s checklist →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'amber' | 'cyan';
}) {
  return (
    <div className="bg-panel border border-rail rounded-panel p-4 shadow-panel">
      <div className="text-[11px] uppercase tracking-[0.1em] text-slate-dim mb-2">{label}</div>
      <div
        className={`font-mono text-2xl ${accent === 'amber' ? 'text-amber' : 'text-cyan'}`}
      >
        {value}
      </div>
    </div>
  );
}
