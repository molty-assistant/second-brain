'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import { ChevronDown, ChevronRight } from 'lucide-react';

type ActivityItem = {
  _id: string;
  timestamp: number;
  actor: string;
  action: string;
  title: string;
  description?: string;
  project?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

function formatTs(ts: number) {
  return new Date(ts).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ActivityClient() {
  const [actor, setActor] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const args = useMemo(
    () => ({
      actor: actor || undefined,
      action: action || undefined,
      limit: 100,
    }),
    [actor, action],
  );

  const items = useQuery(convexApi.activities.list as any, args) as ActivityItem[] | undefined;

  const actors = useMemo(() => {
    const set = new Set((items ?? []).map((i) => i.actor));
    return Array.from(set).sort();
  }, [items]);

  const actions = useMemo(() => {
    const set = new Set((items ?? []).map((i) => i.action));
    return Array.from(set).sort();
  }, [items]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3]"
        >
          <option value="">All actors</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3]"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {(items ?? []).map((it) => {
          const isOpen = !!expanded[it._id];
          return (
            <div key={it._id} className="bg-[#161b22] border border-[#30363d] rounded-lg">
              <button
                onClick={() => setExpanded((p) => ({ ...p, [it._id]: !p[it._id] }))}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#21262d]/40 transition-colors"
              >
                <div className="mt-0.5 text-[#6e7681]">
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-[#6e7681]">{formatTs(it.timestamp)}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#58a6ff]/15 text-[#58a6ff]">
                      {it.actor}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#a371f7]/15 text-[#a371f7]">
                      {it.action}
                    </span>
                  </div>
                  <div className="text-[#e6edf3] mt-1">{it.title}</div>
                </div>
              </button>

              {isOpen && (it.description || it.project) && (
                <div className="px-4 pb-4">
                  {it.project && (
                    <div className="text-sm text-[#8b949e] mb-2">
                      <span className="text-[#6e7681]">Project:</span> {it.project}
                    </div>
                  )}
                  {it.description && (
                    <pre className="text-sm text-[#8b949e] whitespace-pre-wrap bg-[#0d1117] border border-[#30363d] rounded-md p-3 overflow-x-auto">
                      {it.description}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {items && items.length === 0 && (
          <div className="text-center py-12 text-[#6e7681]">No activity yet.</div>
        )}

        {!items && <div className="text-sm text-[#6e7681]">Loading…</div>}
      </div>
    </div>
  );
}
