'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';

type ActivityItem = {
  _id: string;
  timestamp: number;
  actor: string;
  action: string;
  title: string;
  status?: string;
};

type ScheduledTask = {
  _id: string;
  title: string;
  scheduledAt: number;
  assignedTo: string;
  description?: string;
  status: string;
};

type Employee = {
  _id: string;
  name: string;
  role: string;
  model: string;
  status: string;
};

type SearchResults = {
  activities: ActivityItem[];
  scheduledTasks: ScheduledTask[];
  employees: Employee[];
};

function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);
  return (
    <>
      {before}
      <mark className="bg-[#f0883e]/25 text-[#e6edf3] rounded px-0.5">{match}</mark>
      {after}
    </>
  );
}

export default function SearchClient() {
  const [q, setQ] = useState('');

  const args = useMemo(() => ({ q, limit: 10 }), [q]);
  const res = useQuery(convexApi.search.globalSearch, args) as SearchResults | undefined;

  return (
    <div>
      <div className="mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#f0883e] focus:ring-1 focus:ring-[#f0883e]"
        />
        <div className="text-xs text-[#6e7681] mt-2">
          Tip: try actor names, task titles, or activity titles.
        </div>
      </div>

      {!res && <div className="text-sm text-[#6e7681]">Type to search…</div>}

      {res && (
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-[#e6edf3] mb-2">Activities</h2>
            <div className="space-y-2">
              {res.activities.map((a) => (
                <div key={a._id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="flex flex-wrap gap-2 text-xs text-[#8b949e]">
                    <span>{new Date(a.timestamp).toLocaleString('en-GB')}</span>
                    <span className="px-2 py-0.5 rounded bg-[#58a6ff]/15 text-[#58a6ff]">{a.actor}</span>
                    <span className="px-2 py-0.5 rounded bg-[#a371f7]/15 text-[#a371f7]">{a.action}</span>
                    <span className="px-2 py-0.5 rounded border border-[#30363d]">{a.status || 'completed'}</span>
                  </div>
                  <div className="text-[#e6edf3] mt-2">{highlight(a.title, q)}</div>
                </div>
              ))}
              {res.activities.length === 0 && <div className="text-xs text-[#6e7681]">No matches.</div>}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-[#e6edf3] mb-2">Scheduled Tasks</h2>
            <div className="space-y-2">
              {res.scheduledTasks.map((t) => (
                <div key={t._id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="flex flex-wrap gap-2 text-xs text-[#8b949e]">
                    <span>{new Date(t.scheduledAt).toLocaleString('en-GB')}</span>
                    <span className="px-2 py-0.5 rounded bg-[#58a6ff]/15 text-[#58a6ff]">{t.assignedTo}</span>
                    <span className="px-2 py-0.5 rounded border border-[#30363d]">{t.status}</span>
                  </div>
                  <div className="text-[#e6edf3] mt-2">{highlight(t.title, q)}</div>
                  {t.description && (
                    <div className="text-sm text-[#8b949e] mt-1">{highlight(t.description, q)}</div>
                  )}
                </div>
              ))}
              {res.scheduledTasks.length === 0 && <div className="text-xs text-[#6e7681]">No matches.</div>}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-[#e6edf3] mb-2">Employees</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {res.employees.map((e) => (
                <div key={e._id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="text-[#e6edf3] font-medium">{highlight(e.name, q)}</div>
                  <div className="text-sm text-[#8b949e]">{highlight(e.role, q)}</div>
                  <div className="text-xs text-[#6e7681] mt-2">{e.model} • {e.status}</div>
                </div>
              ))}
              {res.employees.length === 0 && <div className="text-xs text-[#6e7681]">No matches.</div>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
