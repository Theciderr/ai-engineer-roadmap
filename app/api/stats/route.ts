import { NextResponse } from 'next/server';
import { db, Task, Job } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY day_number ASC').all() as Task[];
  const jobs = db.prepare('SELECT * FROM jobs').all() as Job[];

  const totalDays = tasks.length;
  const completedDays = tasks.filter((t) => t.completed).length;

  // Current day = first incomplete task, or the last day if everything is done.
  const firstIncomplete = tasks.find((t) => !t.completed);
  const currentDay = firstIncomplete ?? tasks[tasks.length - 1] ?? null;

  // Streak: consecutive completed days counting back from the most recently completed day.
  let streak = 0;
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].completed) streak++;
    else if (tasks[i].day_number <= (currentDay?.day_number ?? 0)) break;
  }

  const weeks: Record<number, { total: number; completed: number }> = {};
  for (const t of tasks) {
    weeks[t.week] = weeks[t.week] ?? { total: 0, completed: 0 };
    weeks[t.week].total += 1;
    if (t.completed) weeks[t.week].completed += 1;
  }

  const stageCount: Record<string, number> = {};
  for (const j of jobs) {
    stageCount[j.stage] = (stageCount[j.stage] ?? 0) + 1;
  }

  return NextResponse.json({
    totalDays,
    completedDays,
    currentDayNumber: currentDay?.day_number ?? null,
    currentWeek: currentDay?.week ?? null,
    streak,
    weeks,
    totalApplications: jobs.length,
    stageCount,
  });
}
