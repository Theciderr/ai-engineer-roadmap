import { NextResponse } from 'next/server';
import { query, Task } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid task id' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const completed = body.completed ? 1 : 0;
  const completedAt = completed ? new Date().toISOString() : null;

  const result = await query('UPDATE tasks SET completed = $1, completed_at = $2 WHERE id = $3', [completed, completedAt, id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const task = await query<Task>('SELECT * FROM tasks WHERE id = $1', [id]);
  return NextResponse.json(task.rows[0]);
}
