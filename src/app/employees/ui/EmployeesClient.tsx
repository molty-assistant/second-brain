'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';

type Employee = {
  _id: string;
  name: string;
  role: string;
  model: string;
  status: string;
  currentTask?: string;
  lastActiveAt?: number;
  tasksCompleted: number;
  costType: string;
};

function formatLastActive(ts?: number) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-GB', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusDot(status: string) {
  const cls =
    status === 'working'
      ? 'bg-[#f0883e]'
      : status === 'idle'
        ? 'bg-[#3fb950]'
        : status === 'offline'
          ? 'bg-[#6e7681]'
          : 'bg-[#f85149]';
  return <span className={`w-2 h-2 rounded-full ${cls}`} />;
}

export default function EmployeesClient() {
  const [seeded, setSeeded] = useState(false);
  const seed = useMutation(convexApi.employees.seed);
  const employees = useQuery(convexApi.employees.list, {}) as Employee[] | undefined;

  useEffect(() => {
    if (seeded) return;
    // Best-effort seeding on first view.
    seed({})
      .catch(() => {})
      .finally(() => setSeeded(true));
  }, [seed, seeded]);

  const sorted = useMemo(() => {
    return (employees ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((e) => (
          <div key={e._id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  {statusDot(e.status)}
                  <h2 className="text-lg font-semibold text-[#e6edf3]">{e.name}</h2>
                </div>
                <div className="text-sm text-[#8b949e]">{e.role}</div>
              </div>

              <span className="text-xs px-2 py-0.5 rounded border border-[#30363d] text-[#8b949e]">
                {e.costType}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#6e7681]">Model</span>
                <span className="text-[#e6edf3] truncate max-w-[60%]" title={e.model}>
                  {e.model}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6e7681]">Tasks completed</span>
                <span className="text-[#e6edf3]">{e.tasksCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6e7681]">Last active</span>
                <span className="text-[#e6edf3]">{formatLastActive(e.lastActiveAt)}</span>
              </div>
              <div>
                <div className="text-[#6e7681]">Current task</div>
                <div className="text-[#e6edf3] mt-0.5 min-h-[20px]">
                  {e.currentTask || <span className="text-[#8b949e]">None</span>}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#30363d]">
              <button
                disabled
                className="w-full text-sm px-3 py-2 rounded-md bg-[#21262d] border border-[#30363d] text-[#6e7681] cursor-not-allowed"
              >
                Assign task (coming soon)
              </button>
            </div>
          </div>
        ))}

        {employees && employees.length === 0 && (
          <div className="text-center py-12 text-[#6e7681] col-span-full">No employees found.</div>
        )}

        {!employees && <div className="text-sm text-[#6e7681]">Loading…</div>}
      </div>
    </div>
  );
}
