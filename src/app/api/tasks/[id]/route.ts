import { NextRequest, NextResponse } from 'next/server';
import { getTask, updateTask, deleteTask } from '@/lib/db';
import { tryLogActivity } from '@/lib/convexServer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = getTask(id);
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const before = getTask(id);
    const task = updateTask(id, body);
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const statusChanged = before?.status && before.status !== task.status;
    const titleChanged = before?.title && before.title !== task.title;

    await tryLogActivity({
      actor: (task.assignee || 'molty') === 'tom' ? 'Tom' : 'Molty',
      action: 'task_updated',
      title: statusChanged
        ? `Task moved: ${task.title} (${before?.status} → ${task.status})`
        : titleChanged
          ? `Task renamed: ${before?.title} → ${task.title}`
          : `Task updated: ${task.title}`,
      description: task.notes || undefined,
      project: 'mission-control',
      metadata: { taskId: task.id, before, after: task },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const before = getTask(id);
    deleteTask(id);

    if (before) {
      await tryLogActivity({
        actor: (before.assignee || 'molty') === 'tom' ? 'Tom' : 'Molty',
        action: 'task_deleted',
        title: `Task deleted: ${before.title}`,
        description: before.notes || undefined,
        project: 'mission-control',
        metadata: { taskId: id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
