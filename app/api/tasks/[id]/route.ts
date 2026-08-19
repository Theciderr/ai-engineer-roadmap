import { NextResponse } from 'next/server';
import { db, Task } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid task id' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const completed = body.completed ? 1 : 0;
  const completedAt = completed ? new Date().toISOString() : null;

  const result = db
    .prepare('UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ?')
    .run(completed, completedAt, id);

  if (result.changes === 0) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
  return NextResponse.json(task);
}
