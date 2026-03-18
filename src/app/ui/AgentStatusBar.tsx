'use client';

import { useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import Link from 'next/link';
import { Bot, Users } from 'lucide-react';

type Employee = {
  _id: string;
  name: string;
  role: string;
  status: string;
  currentTask?: string;
  tasksCompleted: number;
};

function statusDotClass(status: string) {
  if (status === 'working') return 'bg-[#f0883e] animate-pulse';
  if (status === 'idle') return 'bg-[#3fb950]';
  return 'bg-[#6e7681]';
}

function statusLabel(status: string) {
  if (status === 'working') return 'working';
  if (status === 'idle') return 'idle';
  return 'offline';
}

export default function AgentStatusBar() {
  const employees = useQuery(convexApi.employees.list, {}) as Employee[] | undefined;

  if (!employees || employees.length === 0) return null;

  const working = employees.filter((e) => e.status === 'working').length;
  const idle = employees.filter((e) => e.status === 'idle').length;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#58a6ff]" />
          <span className="text-sm font-semibold text-[#e6edf3]">Agent Workforce</span>
          <span className="text-xs text-[#6e7681]">
            {working > 0 && <span className="text-[#f0883e]">{working} working</span>}
            {working > 0 && idle > 0 && <span className="mx-1">·</span>}
            {idle > 0 && <span>{idle} idle</span>}
            {working === 0 && idle === 0 && <span>all offline</span>}
          </span>
        </div>
        <Link
          href="/employees"
          className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1"
        >
          <Users className="w-3 h-3" />
          Manage
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        {employees.map((e) => (
          <div
            key={e._id}
            className="flex items-start gap-2.5 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2.5 min-w-0"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 mt-1 ${statusDotClass(e.status)}`}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-medium text-[#e6edf3]">{e.name}</span>
                <span className="text-[10px] text-[#6e7681] uppercase tracking-wide">
                  {statusLabel(e.status)}
                </span>
                <span className="text-[10px] text-[#6e7681]">·</span>
                <span className="text-[10px] text-[#6e7681]">{e.tasksCompleted} done</span>
              </div>
              {e.currentTask ? (
                <div className="text-xs text-[#8b949e] truncate max-w-[220px] mt-0.5">
                  {e.currentTask}
                </div>
              ) : (
                <div className="text-xs text-[#6e7681] mt-0.5">No active task</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
