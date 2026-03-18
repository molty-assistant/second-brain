'use client';

import { useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import Link from 'next/link';
import { Bot, Users, AlertCircle } from 'lucide-react';

const CONVEX_ENABLED = !!process.env.NEXT_PUBLIC_CONVEX_URL;

type Employee = {
  _id: string;
  name: string;
  role: string;
  status: string; // idle | working | offline | error
  currentTask?: string;
  tasksCompleted: number;
  lastActiveAt?: number;
};

function statusDotClass(status: string) {
  if (status === 'working') return 'bg-[#f0883e] animate-pulse';
  if (status === 'idle') return 'bg-[#3fb950]';
  if (status === 'error') return 'bg-[#f85149]';
  return 'bg-[#6e7681]';
}

function statusLabel(status: string) {
  if (status === 'working') return 'working';
  if (status === 'idle') return 'idle';
  if (status === 'error') return 'error';
  return 'offline';
}

/** Returns a short human-readable staleness string, e.g. "3m ago", "2h ago" */
function timeAgo(ms?: number): string | null {
  if (!ms) return null;
  const diff = Date.now() - ms;
  if (diff < 90_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

/** Agents inactive for >1h are considered stale while marked idle/working */
function isStale(employee: Employee): boolean {
  if (!employee.lastActiveAt) return false;
  if (employee.status === 'offline') return false;
  return Date.now() - employee.lastActiveAt > 3_600_000;
}

export default function AgentStatusBar() {
  const employees = useQuery(
    convexApi.employees.list,
    CONVEX_ENABLED ? {} : 'skip',
  ) as Employee[] | undefined;

  if (!employees || employees.length === 0) return null;

  const working = employees.filter((e) => e.status === 'working').length;
  const idle = employees.filter((e) => e.status === 'idle').length;
  const errors = employees.filter((e) => e.status === 'error').length;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#58a6ff]" />
          <span className="text-sm font-semibold text-[#e6edf3]">Agent Workforce</span>
          <span className="text-xs text-[#6e7681]">
            {working > 0 && <span className="text-[#f0883e]">{working} working</span>}
            {working > 0 && (idle > 0 || errors > 0) && <span className="mx-1">·</span>}
            {idle > 0 && <span>{idle} idle</span>}
            {errors > 0 && (
              <>
                {(working > 0 || idle > 0) && <span className="mx-1">·</span>}
                <span className="text-[#f85149]">{errors} error</span>
              </>
            )}
            {working === 0 && idle === 0 && errors === 0 && <span>all offline</span>}
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
        {employees.map((e) => {
          const stale = isStale(e);
          const ago = timeAgo(e.lastActiveAt);

          return (
            <div
              key={e._id}
              className={`flex items-start gap-2.5 bg-[#0d1117] border rounded-md px-3 py-2.5 min-w-0 transition-colors ${
                e.status === 'error'
                  ? 'border-[#f85149]/30'
                  : stale
                  ? 'border-[#6e7681]/40'
                  : 'border-[#30363d]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 mt-1 ${statusDotClass(e.status)}`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium text-[#e6edf3]">{e.name}</span>
                  <span
                    className={`text-[10px] uppercase tracking-wide ${
                      e.status === 'error'
                        ? 'text-[#f85149]'
                        : e.status === 'working'
                        ? 'text-[#f0883e]'
                        : 'text-[#6e7681]'
                    }`}
                  >
                    {statusLabel(e.status)}
                  </span>
                  {e.status === 'error' && (
                    <AlertCircle className="w-3 h-3 text-[#f85149]" />
                  )}
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

                {/* Staleness signal — show for non-working agents or stale working agents */}
                {ago && (e.status !== 'working' || stale) && (
                  <div
                    className={`text-[10px] mt-0.5 ${
                      stale ? 'text-[#f0883e]/70' : 'text-[#6e7681]'
                    }`}
                  >
                    {stale ? '⚠ ' : ''}last seen {ago}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
