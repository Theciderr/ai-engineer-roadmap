'use client';

import type { Task } from '@/lib/db';

type Props = {
  tasks: Task[];
};

// Groups the 112 days into 16 week-blocks of 7 day-ticks each, and renders
// the whole sprint as a single instrument rail — the page's signature visual.
export default function WeekRail({ tasks }: Props) {
  const weeks: Task[][] = [];
  for (let w = 1; w <= 16; w++) {
    weeks.push(tasks.filter((t) => t.week === w));
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 min-w-[720px]">
        {weeks.map((weekTasks, i) => {
          const completed = weekTasks.filter((t) => t.completed).length;
          const done = completed === weekTasks.length && weekTasks.length > 0;
          return (
            <div key={i} className="flex-1 flex flex-col gap-1">
              <div className="flex gap-[3px] h-6">
                {weekTasks.map((t) => (
                  <div
                    key={t.id}
                    title={`Day ${t.day_number} — ${t.completed ? 'done' : 'pending'}`}
                    className={`flex-1 rounded-[2px] transition-colors ${
                      t.completed
                        ? t.is_review
                          ? 'bg-cyan'
                          : 'bg-amber'
                        : 'bg-rail'
                    }`}
                  />
                ))}
              </div>
              <div
                className={`text-center font-mono text-[10px] ${
                  done ? 'text-amber' : 'text-slate-dim'
                }`}
              >
                W{i + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
