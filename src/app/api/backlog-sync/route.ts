import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

type WorkforceBacklogTask = {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: string;
  priority?: string;
  createdBy?: string;
  createdAt?: string;
  completedAt?: string;
  output?: string;
  pr?: string;
};

export async function POST() {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_CONVEX_URL is not set' },
        { status: 500 }
      );
    }

    const backlogPath =
      process.env.BACKLOG_JSON_PATH ??
      '/Users/moltbot/.openclaw/workspace/tools/workforce/backlog.json';

    const raw = await fs.readFile(backlogPath, 'utf8');
    const parsed = JSON.parse(raw) as WorkforceBacklogTask[];

    const tasks = parsed.map((t) => ({
      taskId: t.id,
      title: t.title,
      description: t.description,
      assignedTo: t.assignedTo,
      status: t.status,
      priority: t.priority,
      createdBy: t.createdBy,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
      output: t.output,
      pr: t.pr,
    }));

    const client = new ConvexHttpClient(convexUrl);
    const res = await client.mutation(api.backlog.sync, { tasks });

    return NextResponse.json({ success: true, synced: tasks.length, ...res });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
