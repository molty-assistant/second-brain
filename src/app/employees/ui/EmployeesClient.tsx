'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import { Pause, Play, DollarSign } from 'lucide-react';

type Employee = {
  _id: string;
  name: string;
  agentId?: string; // OpenClaw agent id: "default", "social-manager", "engineering-manager"
  role: string;
  model: string;
  status: string;
  currentTask?: string;
  lastActiveAt?: number;
  tasksCompleted: number;
  costType: string;
  costToDateUSD?: number;
  tokensToDate?: number;
};

type AgentControl = {
  _id?: string;
  agentId: string;
  paused: boolean;
  pausedAt?: number;
  pausedReason?: string;
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

function formatCost(usd?: number) {
  if (!usd || usd === 0) return '$0.00';
  if (usd < 0.01) return `$${usd.toFixed(5)}`;
  return `$${usd.toFixed(2)}`;
}

function formatTokens(tokens?: number) {
  if (!tokens) return '0';
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toLocaleString();
}

function statusDot(status: string, paused: boolean) {
  if (paused) return <span className="w-2 h-2 rounded-full bg-[#d29922]" />;
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
  const agentControls = useQuery(convexApi.agentControls.list, {}) as AgentControl[] | undefined;
  const setPaused = useMutation(convexApi.agentControls.setPaused);

  useEffect(() => {
    if (seeded) return;
    seed({})
      .catch(() => {})
      .finally(() => setSeeded(true));
  }, [seed, seeded]);

  const sorted = useMemo(() => {
    return (employees ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  // agentControls.agentId stores whichever key was used to pause (agentId or name)
  const controlsMap = useMemo(() => {
    const map = new Map<string, AgentControl>();
    for (const c of agentControls ?? []) {
      map.set(c.agentId, c);
    }
    return map;
  }, [agentControls]);

  // Stable key for each employee: use agentId for OpenClaw agents, name for external tools
  const controlKey = (e: Employee) => e.agentId || e.name;

  const totalCost = useMemo(() => {
    return (employees ?? []).reduce((sum, e) => sum + (e.costToDateUSD ?? 0), 0);
  }, [employees]);

  const handleTogglePause = async (key: string) => {
    const current = controlsMap.get(key);
    const isPaused = current?.paused ?? false;

    try {
      if (!isPaused) {
        const reason = prompt('Reason for pausing (optional):') ?? undefined;
        await setPaused({ agentId: key, paused: true, reason });
      } else {
        await setPaused({ agentId: key, paused: false });
      }
    } catch (err) {
      console.error('Failed to toggle pause:', err);
    }
  };

  const pausedCount = Array.from(controlsMap.values()).filter((c) => c.paused).length;

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2">
          <DollarSign className="w-4 h-4 text-[#3fb950]" />
          <span className="text-sm text-[#8b949e]">Total spend:</span>
          <span className="text-sm font-semibold text-[#e6edf3]">{formatCost(totalCost)}</span>
        </div>
        {pausedCount > 0 && (
          <div className="flex items-center gap-2 bg-[#d29922]/10 border border-[#d29922]/30 rounded-lg px-4 py-2">
            <Pause className="w-4 h-4 text-[#d29922]" />
            <span className="text-sm text-[#d29922]">
              {pausedCount} agent{pausedCount > 1 ? 's' : ''} paused
            </span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((e) => {
          const key = controlKey(e);
          const control = controlsMap.get(key);
          const isPaused = control?.paused ?? false;

          return (
            <div
              key={e._id}
              className={`bg-[#161b22] border rounded-lg p-5 ${
                isPaused ? 'border-[#d29922]/40' : 'border-[#30363d]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {statusDot(e.status, isPaused)}
                    <h2 className="text-lg font-semibold text-[#e6edf3]">{e.name}</h2>
                    {isPaused && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d29922]/15 text-[#d29922] uppercase tracking-wide">
                        Paused
                      </span>
                    )}
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
                  <span className="text-[#6e7681]">Cost</span>
                  <span className="text-[#e6edf3]">
                    {formatCost(e.costToDateUSD)}
                    <span className="text-[#6e7681] ml-1">({formatTokens(e.tokensToDate)} tokens)</span>
                  </span>
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
                {isPaused && control?.pausedReason && (
                  <div className="text-xs text-[#d29922]/80 mt-1">
                    Reason: {control.pausedReason}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#30363d]">
                <button
                  onClick={() => handleTogglePause(key)}
                  className={`w-full text-sm px-3 py-2 rounded-md border transition-colors flex items-center justify-center gap-2 ${
                    isPaused
                      ? 'bg-[#238636]/10 border-[#238636]/30 text-[#3fb950] hover:bg-[#238636]/20'
                      : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#d29922] hover:border-[#d29922]/30'
                  }`}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      Resume Agent
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause Agent
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {employees && employees.length === 0 && (
          <div className="text-center py-12 text-[#6e7681] col-span-full">No employees found.</div>
        )}

        {!employees && <div className="text-sm text-[#6e7681]">Loading…</div>}
      </div>
    </div>
  );
}
