'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Task } from '@/lib/db';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekFilter, setWeekFilter] = useState<number | 'all'>('all');
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch('/api/tasks')
      .then((r) => r.json())
      .then((t) => setTasks(t))
      .finally(() => setLoading(false));
  }, []);

  const weeks = useMemo(() => Array.from(new Set(tasks.map((t) => t.week))).sort((a, b) => a - b), [tasks]);
  const visible = weekFilter === 'all' ? tasks : tasks.filter((t) => t.week === weekFilter);

  async function toggle(task: Task) {
    setPendingIds((prev) => new Set(prev).add(task.id));
    const nextCompleted = task.completed ? 0 : 1;
    // Optimistic update so the checkbox feels instant.
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t))
    );
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !!nextCompleted }),
      });
      if (!res.ok) throw new Error('Save failed');
      // After successful save, fetch latest stats and broadcast an event
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const stats = await statsRes.json();
        const updatedTask = await res.json();
        try {
          window.dispatchEvent(new CustomEvent('study:progress', { detail: { stats, task: updatedTask } }));
        } catch (e) {
          // ignore in non-browser environments
        }
      }
    } catch {
      // Roll back on failure.
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
      );
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  }

  return (
    <div className="px-6 md:px-10 py-10 max-w-4xl">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan mb-2">
        Daily task list
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-bright mb-6">
        112-day checklist
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <FilterChip active={weekFilter === 'all'} onClick={() => setWeekFilter('all')}>
          All weeks
        </FilterChip>
        {weeks.map((w) => (
          <FilterChip key={w} active={weekFilter === w} onClick={() => setWeekFilter(w)}>
            W{w}
          </FilterChip>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-dim">Loading tasks…</div>
      ) : (
        <ul className="space-y-3">
          {visible.map((t) => (
            <li
              key={t.id}
              className={`bg-panel border rounded-panel p-4 shadow-panel transition-colors ${
                t.is_review ? 'border-cyan-dim' : 'border-rail'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggle(t)}
                  aria-pressed={!!t.completed}
                  aria-label={`Mark day ${t.day_number} ${t.completed ? 'incomplete' : 'complete'}`}
                  disabled={pendingIds.has(t.id)}
                  className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded-[4px] border transition-colors ${
                    t.completed
                      ? 'bg-amber border-amber'
                      : 'border-slate-dim hover:border-amber'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-amber">Day {t.day_number}</span>
                    <span className="text-xs text-slate-dim">
                      Week {t.week} · {t.phase}
                    </span>
                    {t.is_review === 1 && (
                      <span className="text-[10px] uppercase tracking-wide text-cyan border border-cyan-dim rounded px-1.5 py-0.5">
                        Review
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-sm space-y-1 ${
                      t.completed ? 'text-slate-dim line-through' : 'text-slate'
                    }`}
                  >
                    <div>
                      <span className="text-slate-dim">AI: </span>
                      {t.ai_task}
                    </div>
                    <div>
                      <span className="text-slate-dim">Build: </span>
                      {t.project_task}
                    </div>
                    <div>
                      <span className="text-slate-dim">DSA: </span>
                      {t.dsa_focus}
                      {' · '}
                      <span className="text-slate-dim">CS: </span>
                      {t.cs_revision}
                    </div>
                    <div>
                      <span className="text-slate-dim">Apps: </span>
                      {t.applications_task}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? 'bg-amber text-hull border-amber'
          : 'border-rail text-slate-dim hover:text-slate-bright hover:border-slate-dim'
      }`}
    >
      {children}
    </button>
  );
}
