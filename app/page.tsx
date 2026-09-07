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

type Tooltip = 'day' | 'completion' | 'streak' | 'applications' | 'rail' | null;

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<Tooltip>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome on first load (when stats loads for first time)
  useEffect(() => {
    if (stats && stats.completedDays === 0) {
      const hasSeenWelcome = localStorage.getItem('mission-control-welcome');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
        localStorage.setItem('mission-control-welcome', 'true');
      }
    }
  }, [stats?.completedDays]);

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
      {showWelcome && (
        <div className="bg-gradient-to-r from-amber/10 to-cyan/10 border border-amber/30 rounded-panel p-6 mb-8 shadow-panel">
          <div className="flex items-start gap-3">
            <div className="text-2xl">→</div>
            <div>
              <h2 className="text-lg font-semibold text-slate-bright mb-2">
                Welcome to Mission Control
              </h2>
              <p className="text-sm text-slate mb-3">
                You're starting a 16-week sprint to land your AI Engineer role. Every day you complete brings you closer to readiness. Check today's task, watch your streak grow, and log applications as you send them. The 16-week rail visualizes your entire journey—amber for build days, cyan for review.
              </p>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-sm font-medium text-amber hover:text-amber-dim transition-colors"
              >
                Got it, let's go →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan mb-2">
        Sprint status
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-bright mb-8">
        AI Engineer readiness sprint
      </h1>

      {loading ? (
        <div className="text-slate-dim">Preparing your 16-week sprint…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Day"
              value={`${stats?.currentDayNumber ?? '—'} / ${stats?.totalDays ?? 112}`}
              accent="amber"
              tooltip="day"
              activeTooltip={activeTooltip}
              onTooltip={setActiveTooltip}
              tooltipText="Track which day of your 16-week sprint you're on. Day 1 starts Week 1."
            />
            <StatCard
              label="Progress"
              value={`${pct}% closer`}
              accent="cyan"
              tooltip="completion"
              activeTooltip={activeTooltip}
              onTooltip={setActiveTooltip}
              tooltipText="Every day completed brings you this much closer to AI Engineer readiness. You're on a journey."
            />
            <StatCard
              label="Streak"
              value={`${stats?.streak ?? 0} days`}
              accent="amber"
              tooltip="streak"
              activeTooltip={activeTooltip}
              onTooltip={setActiveTooltip}
              tooltipText="Unbroken days of completion. Streaks build momentum. Break it and restart—no judgment."
            />
            <StatCard
              label="Applications"
              value={`${stats?.totalApplications ?? 0}`}
              accent="cyan"
              tooltip="applications"
              activeTooltip={activeTooltip}
              onTooltip={setActiveTooltip}
              tooltipText="Jobs you've applied to. Target: 5-25/day by Week 12. Quality matters."
            />
          </div>

          <div className="bg-panel border border-rail rounded-panel p-5 mb-10 shadow-panel">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-dim">
                  16-week rail
                </div>
                <button
                  onMouseEnter={() => setActiveTooltip('rail')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-slate-dim hover:text-slate-bright transition-colors relative group"
                  title="Learn about the progress rail"
                >
                  <span className="text-xs">ⓘ</span>
                  {activeTooltip === 'rail' && (
                    <div className="absolute bottom-full left-0 mb-2 bg-hull border border-rail rounded px-3 py-2 text-xs text-slate whitespace-nowrap shadow-panel z-10 pointer-events-none">
                      Each dot = one day. Amber = build day done. Cyan = review day done.
                    </div>
                  )}
                </button>
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
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber">
                  Today — Day {today.day_number} · Week {today.week} · {today.phase}
                </div>
                <button
                  onMouseEnter={() => setActiveTooltip('day')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-slate-dim hover:text-slate-bright transition-colors text-xs"
                  title="About today's task"
                >
                  ⓘ
                </button>
              </div>
              {activeTooltip === 'day' && (
                <div className="text-xs text-slate-dim mb-4 p-3 bg-hull/50 rounded border border-rail">
                  Check off today's three areas: AI learning, project build, and applications. The phase tells you what kind of week it is (Build or Review).
                </div>
              )}

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
                Open all tasks →
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
  tooltip,
  activeTooltip,
  onTooltip,
  tooltipText,
}: {
  label: string;
  value: string;
  accent: 'amber' | 'cyan';
  tooltip?: Tooltip;
  activeTooltip?: Tooltip;
  onTooltip?: (t: Tooltip) => void;
  tooltipText?: string;
}) {
  return (
    <div className="bg-panel border border-rail rounded-panel p-4 shadow-panel relative group">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.1em] text-slate-dim mb-2">{label}</div>
        {tooltip && tooltipText && (
          <button
            onMouseEnter={() => onTooltip?.(tooltip)}
            onMouseLeave={() => onTooltip?.(null)}
            className="text-slate-dim hover:text-slate-bright transition-colors text-xs ml-1"
            title={tooltipText}
          >
            ⓘ
          </button>
        )}
      </div>
      <div
        className={`font-mono text-2xl ${accent === 'amber' ? 'text-amber' : 'text-cyan'}`}
      >
        {value}
      </div>
      {tooltip && tooltipText && activeTooltip === tooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-hull border border-rail rounded px-3 py-2 text-xs text-slate whitespace-nowrap shadow-panel z-10 pointer-events-none">
          {tooltipText}
        </div>
      )}
    </div>
  );
}
