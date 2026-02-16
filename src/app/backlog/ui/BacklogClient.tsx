'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

type BacklogTask = {
  _id: string;
  taskId: string;
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

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'Todo' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
  { key: 'blocked', label: 'Blocked' },
] as const;

const priorityRank: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const statusRank: Record<string, number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
  blocked: 3,
};

const agentColors = [
  { bg: 'bg-[#58a6ff]/15', text: 'text-[#58a6ff]' },
  { bg: 'bg-[#3fb950]/15', text: 'text-[#3fb950]' },
  { bg: 'bg-[#a371f7]/15', text: 'text-[#a371f7]' },
  { bg: 'bg-[#f0883e]/15', text: 'text-[#f0883e]' },
  { bg: 'bg-[#ff7b72]/15', text: 'text-[#ff7b72]' },
];

function hashToIndex(s: string, mod: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % mod;
}

function pillForStatus(status: string) {
  const s = status.toLowerCase();
  if (s === 'done') return { bg: 'bg-[#3fb950]/15', text: 'text-[#3fb950]', border: 'border-[#3fb950]/30' };
  if (s === 'blocked') return { bg: 'bg-[#ff7b72]/15', text: 'text-[#ff7b72]', border: 'border-[#ff7b72]/30' };
  if (s === 'in_progress') return { bg: 'bg-[#f0883e]/15', text: 'text-[#f0883e]', border: 'border-[#f0883e]/30' };
  return { bg: 'bg-[#58a6ff]/10', text: 'text-[#8b949e]', border: 'border-[#30363d]' };
}

function badgeForPriority(priority?: string) {
  const p = (priority ?? '').toLowerCase();
  if (p === 'critical') return { bg: 'bg-[#ff7b72]/15', text: 'text-[#ff7b72]', border: 'border-[#ff7b72]/30' };
  if (p === 'high') return { bg: 'bg-[#f0883e]/15', text: 'text-[#f0883e]', border: 'border-[#f0883e]/30' };
  if (p === 'medium') return { bg: 'bg-[#58a6ff]/15', text: 'text-[#58a6ff]', border: 'border-[#58a6ff]/30' };
  if (p === 'low') return { bg: 'bg-[#6e7681]/15', text: 'text-[#8b949e]', border: 'border-[#30363d]' };
  return { bg: 'bg-[#6e7681]/10', text: 'text-[#6e7681]', border: 'border-[#30363d]' };
}

export default function BacklogClient() {
  const [tab, setTab] = useState<(typeof statusTabs)[number]['key']>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const queryArgs = useMemo(() => {
    if (tab === 'all') return {};
    return { status: tab };
  }, [tab]);

  const tasks = useQuery(api.backlog.list as any, queryArgs) as BacklogTask[] | undefined;

  const sorted = useMemo(() => {
    const list = [...(tasks ?? [])];
    list.sort((a, b) => {
      const pa = priorityRank[(a.priority ?? '').toLowerCase()] ?? 999;
      const pb = priorityRank[(b.priority ?? '').toLowerCase()] ?? 999;
      if (pa !== pb) return pa - pb;

      const sa = statusRank[(a.status ?? '').toLowerCase()] ?? 999;
      const sb = statusRank[(b.status ?? '').toLowerCase()] ?? 999;
      if (sa !== sb) return sa - sb;

      return a.taskId.localeCompare(b.taskId);
    });
    return list;
  }, [tasks]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0, todo: 0, in_progress: 0, done: 0, blocked: 0 };
    for (const t of tasks ?? []) {
      c.all++;
      const s = (t.status ?? '').toLowerCase();
      if (s in c) c[s]++;
    }
    return c;
  }, [tasks]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
              tab === t.key
                ? 'bg-[#21262d] border-[#58a6ff]/50 text-[#e6edf3]'
                : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]'
            }`}
          >
            <span>{t.label}</span>
            <span className="ml-2 text-xs text-[#6e7681]">{counts[t.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {!tasks && <div className="text-sm text-[#6e7681]">Loading backlog…</div>}

      {tasks && (
        <div className="grid md:grid-cols-2 gap-4">
          {sorted.map((task) => {
            const agent = agentColors[hashToIndex(task.assignedTo ?? 'Unassigned', agentColors.length)];
            const statusPill = pillForStatus(task.status);
            const priorityBadge = badgeForPriority(task.priority);
            const isExpanded = !!expanded[task._id];
            const isDone = (task.status ?? '').toLowerCase() === 'done';

            return (
              <div key={task._id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-[#8b949e]">
                        {task.taskId}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${statusPill.bg} ${statusPill.text} ${statusPill.border}`}>
                        {task.status}
                      </span>
                      {task.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded border ${priorityBadge.bg} ${priorityBadge.text} ${priorityBadge.border}`}>
                          {task.priority}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded ${agent.bg} ${agent.text}`}>
                        {task.assignedTo}
                      </span>
                    </div>

                    <div className="text-[#e6edf3] font-medium mt-2 break-words">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-[#8b949e] mt-1 whitespace-pre-wrap">{task.description}</div>
                    )}

                    {isDone && (task.completedAt || task.pr) && (
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#6e7681]">
                        {task.completedAt && <span>Completed: {new Date(task.completedAt).toLocaleDateString('en-GB')}</span>}
                        {task.pr && (
                          <a
                            href={task.pr}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#58a6ff] hover:underline"
                          >
                            PR <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {task.output && (
                    <button
                      onClick={() => setExpanded((prev) => ({ ...prev, [task._id]: !prev[task._id] }))}
                      className="shrink-0 inline-flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#e6edf3]"
                      aria-label={isExpanded ? 'Collapse output' : 'Expand output'}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      Output
                    </button>
                  )}
                </div>

                {task.output && isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#30363d]">
                    <pre className="text-xs text-[#c9d1d9] whitespace-pre-wrap leading-relaxed bg-[#0d1117] border border-[#30363d] rounded-md p-3 overflow-auto">
                      {task.output}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div className="text-sm text-[#6e7681]">No tasks found for this filter.</div>
          )}
        </div>
      )}

      <div className="mt-6 text-xs text-[#6e7681]">
        Tip: call <code className="text-[#8b949e]">/api/backlog-sync</code> (POST) to refresh from workforce backlog.json.
      </div>
    </div>
  );
}
