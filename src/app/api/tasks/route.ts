import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, createTask } from '@/lib/db';
import { tryLogActivity } from '@/lib/convexServer';

export async function GET() {
  try {
    const tasks = getAllTasks();
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    
    const task = createTask(body);

    await tryLogActivity({
      actor: (task.assignee || 'molty') === 'tom' ? 'Tom' : 'Molty',
      action: 'task_created',
      title: `Task created: ${task.title}`,
      description: task.notes || undefined,
      project: 'mission-control',
      metadata: { taskId: task.id, status: task.status, priority: task.priority },
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
