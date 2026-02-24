'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import { Search, Calendar, Activity, User, Loader2, X } from 'lucide-react';

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

type FilterType = 'all' | 'activities' | 'tasks' | 'employees';

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

function EmptyState({ type, onClear }: { type: FilterType; onClear: () => void }) {
  const icons = {
    all: <Search className="w-12 h-12 text-[#6e7681]" />,
    activities: <Activity className="w-12 h-12 text-[#6e7681]" />,
    tasks: <Calendar className="w-12 h-12 text-[#6e7681]" />,
    employees: <User className="w-12 h-12 text-[#6e7681]" />,
  };

  const messages = {
    all: 'No results found. Try a different search term.',
    activities: 'No activities found. Try searching for tasks or employees.',
    tasks: 'No scheduled tasks found. Try searching for activities or employees.',
    employees: 'No employees found. Try searching for activities or tasks.',
  };

  const suggestions = {
    all: 'Try searching for actor names, task titles, or activity titles.',
    activities: 'Try searching for activity titles, actor names, or dates.',
    tasks: 'Try searching for task titles, assigned persons, or dates.',
    employees: 'Try searching for employee names or roles.',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-[#8b949e] mb-4">{icons[type]}</div>
      <p className="text-sm text-[#e6edf3] mb-4">{messages[type]}</p>
      <div className="flex gap-2">
        <p className="text-xs text-[#6e7681]">{suggestions[type]}</p>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-sm rounded-md transition-colors"
        >
          Clear search
        </button>
      </div>
    </div>
  );
}

export default function SearchClient() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      // / focuses search (unless already typing)
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          (target as HTMLElement).isContentEditable);

      if (!isTyping && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const args = useMemo(() => ({ q, filter, limit: 10 }), [q, filter]);
  const res = useQuery(convexApi.search.globalSearch, args) as SearchResults | undefined;

  const totalCount = res ? (res.activities?.length || 0) + (res.scheduledTasks?.length || 0) + (res.employees?.length || 0) : 0;
  const filteredActivities = filter === 'all' || filter === 'activities' ? (res?.activities || []) : [];
  const filteredTasks = filter === 'all' || filter === 'tasks' ? (res?.scheduledTasks || []) : [];
  const filteredEmployees = filter === 'all' || filter === 'employees' ? (res?.employees || []) : [];

  const hasResults = q.trim().length > 0 && (
    (filteredActivities.length > 0 || filteredTasks.length > 0 || filteredEmployees.length > 0)
  );

  const isLoading = !res;

  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#f0883e] focus:ring-1 focus:ring-[#f0883e]"
          />
          {q.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                setFilter('all');
                inputRef.current?.focus();
              }}
              className="px-4 py-3 rounded-md border border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#f0883e]/40"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        {q.trim().length > 0 && (
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-[#238636] text-white'
                  : 'bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('activities')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === 'activities'
                  ? 'bg-[#238636] text-white'
                  : 'bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-1" />
              Activities
            </button>
            <button
              onClick={() => setFilter('tasks')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === 'tasks'
                  ? 'bg-[#238636] text-white'
                  : 'bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Tasks
            </button>
            <button
              onClick={() => setFilter('employees')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === 'employees'
                  ? 'bg-[#238636] text-white'
                  : 'bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]'
              }`}
            >
              <User className="w-4 h-4 inline mr-1" />
              Employees
            </button>
          </div>
        )}

        {/* Result Count */}
        {hasResults && !isLoading && (
          <div className="text-xs text-[#8b949e]">
            <span className="font-medium">{totalCount}</span> results found
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-[#6e7681] animate-spin" />
          <p className="text-sm text-[#8b949e] mt-4">Searching…</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasResults && (
        <EmptyState type={filter} onClear={() => setQ('')} />
      )}

      {/* Results */}
      {hasResults && (
        <div className="space-y-6">
          {filteredActivities.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[#e6edf3] mb-2">
                Activities ({filteredActivities.length})
              </h2>
              <div className="space-y-2">
                {filteredActivities.map((a) => (
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
              </div>
            </section>
          )}

          {filteredTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[#e6edf3] mb-2">
                Scheduled Tasks ({filteredTasks.length})
              </h2>
              <div className="space-y-2">
                {filteredTasks.map((t) => (
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
              </div>
            </section>
          )}

          {filteredEmployees.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[#e6edf3] mb-2">
                Employees ({filteredEmployees.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {filteredEmployees.map((e) => (
                  <div key={e._id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                    <div className="text-[#e6edf3] font-medium">{highlight(e.name, q)}</div>
                    <div className="text-sm text-[#8b949e]">{highlight(e.role, q)}</div>
                    <div className="text-xs text-[#6e7681] mt-2">{e.model} • {e.status}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
