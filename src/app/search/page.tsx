'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';

type Activity = {
  _id: string;
  timestamp: number;
  actor: string;
  title: string;
  description?: string;
};

type ScheduledTask = {
  _id: string;
  title: string;
  scheduledAt: number;
  status?: string;
  assignedTo: string;
  description?: string;
};

type FileMatch = {
  line: string;
  lineNumber: number;
  context?: string;
};

type FileResult = {
  path: string;
  filename: string;
  matches: FileMatch[];
};

function statusBadge(statusRaw?: string) {
  const status = (statusRaw ?? 'pending').toLowerCase();
  if (status === 'done') return 'bg-green-500/10 border-green-500/30 text-green-200';
  if (status === 'pending')
    return 'bg-amber-500/10 border-amber-500/30 text-amber-200';
  if (status === 'failed') return 'bg-red-500/10 border-red-500/30 text-red-200';
  if (status === 'running') return 'bg-blue-500/10 border-blue-500/30 text-blue-200';
  return 'bg-slate-500/10 border-slate-500/30 text-slate-200';
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [fileResults, setFileResults] = useState<FileResult[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const activities = useQuery(
    api.activities.search,
    debounced ? { query: debounced, limit: 10 } : ('skip' as any)
  ) as Activity[] | undefined;

  const tasks = useQuery(
    api.scheduledTasks.search,
    debounced ? { query: debounced, limit: 10 } : ('skip' as any)
  ) as ScheduledTask[] | undefined;

  const totalActivities = activities?.length ?? 0;
  const totalTasks = tasks?.length ?? 0;

  const canSearchFiles = debounced.length > 0;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!canSearchFiles) {
        setFileResults([]);
        setFileError(null);
        setFileLoading(false);
        return;
      }

      setFileLoading(true);
      setFileError(null);

      try {
        const res = await fetch(`/api/search-files?q=${encodeURIComponent(debounced)}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to search files');
        }
        const data = (await res.json()) as { results: FileResult[] };
        if (!cancelled) setFileResults(data.results ?? []);
      } catch (e) {
        if (!cancelled)
          setFileError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        if (!cancelled) setFileLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [debounced, canSearchFiles]);

  const filesCount = fileResults.length;

  const empty = useMemo(() => {
    if (!debounced) return false;
    return totalActivities === 0 && totalTasks === 0 && filesCount === 0;
  }, [debounced, totalActivities, totalTasks, filesCount]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">🔍 Search</h1>
          <p className="text-slate-400 mt-1">
            Search across activities, scheduled tasks, and workspace files.
          </p>
        </div>

        <div className="mb-8">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setDebounced(query.trim());
            }}
            placeholder="Search…"
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-5 py-4 text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {debounced && (
          <div className="grid gap-4">
            {/* Activities */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-slate-100 font-semibold">Activities</h2>
                <div className="text-xs text-slate-400">{totalActivities} results</div>
              </div>
              {!activities && (
                <div className="text-sm text-slate-500">Searching…</div>
              )}
              {activities && activities.length === 0 && (
                <div className="text-sm text-slate-500">No matching activities.</div>
              )}
              {activities && activities.length > 0 && (
                <div className="space-y-2">
                  {activities.slice(0, 10).map((a) => (
                    <div
                      key={a._id}
                      className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-slate-100 font-medium truncate">
                            {a.title}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {a.actor} ·{' '}
                            {formatDistanceToNow(new Date(a.timestamp), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </div>
                      {a.description && (
                        <div className="text-sm text-slate-400 mt-2">
                          {a.description.length > 140
                            ? a.description.slice(0, 140) + '…'
                            : a.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Scheduled Tasks */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-slate-100 font-semibold">Scheduled Tasks</h2>
                <div className="text-xs text-slate-400">{totalTasks} results</div>
              </div>
              {!tasks && <div className="text-sm text-slate-500">Searching…</div>}
              {tasks && tasks.length === 0 && (
                <div className="text-sm text-slate-500">No matching tasks.</div>
              )}
              {tasks && tasks.length > 0 && (
                <div className="space-y-2">
                  {tasks.slice(0, 10).map((t) => (
                    <div
                      key={t._id}
                      className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-slate-100 font-medium truncate">
                            {t.title}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {new Date(t.scheduledAt).toLocaleString()} · {t.assignedTo}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(
                            t.status
                          )}`}
                        >
                          {t.status ?? 'pending'}
                        </span>
                      </div>
                      {t.description && (
                        <div className="text-sm text-slate-400 mt-2">
                          {t.description.length > 140
                            ? t.description.slice(0, 140) + '…'
                            : t.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Workspace Files */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-slate-100 font-semibold">Workspace Files</h2>
                <div className="text-xs text-slate-400">{filesCount} files</div>
              </div>

              {fileLoading && (
                <div className="text-sm text-slate-500">Searching files…</div>
              )}
              {fileError && (
                <div className="text-sm text-red-300">{fileError}</div>
              )}
              {!fileLoading && !fileError && fileResults.length === 0 && (
                <div className="text-sm text-slate-500">No matching files.</div>
              )}

              {fileResults.length > 0 && (
                <div className="space-y-2">
                  {fileResults.slice(0, 10).map((f) => (
                    <div
                      key={f.path}
                      className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-slate-100 font-medium truncate">
                            {f.filename}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{f.path}</div>
                        </div>
                      </div>

                      {f.matches?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {f.matches.slice(0, 5).map((m, idx) => (
                            <div key={idx} className="text-sm text-slate-300">
                              <span className="text-xs text-slate-500 mr-2">
                                L{m.lineNumber}
                              </span>
                              <span className="font-mono">{m.line}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {empty && (
              <div className="text-slate-500">
                No results found for “{debounced}”.
              </div>
            )}
          </div>
        )}

        {!debounced && (
          <div className="text-slate-500">
            Type a query to search across everything.
          </div>
        )}
      </div>
    </div>
  );
}
