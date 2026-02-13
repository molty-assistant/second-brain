'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from 'date-fns';

type ScheduledTask = {
  _id: string;
  title: string;
  description?: string;
  scheduledAt: number;
  endAt?: number;
  assignedTo: string;
  status?: string;
  project?: string;
};

function statusDotClass(statusRaw?: string) {
  const status = (statusRaw ?? 'pending').toLowerCase();
  if (status === 'done') return 'bg-green-400';
  if (status === 'pending') return 'bg-amber-400';
  if (status === 'failed') return 'bg-red-400';
  if (status === 'running') return 'bg-blue-400';
  return 'bg-slate-400';
}

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fromMs = weekStart.getTime();
  const toMs = endOfWeek(weekStart, { weekStartsOn: 1 }).getTime();

  const tasks = useQuery(api.scheduledTasks.list, {
    fromMs,
    toMs,
    limit: 200,
  }) as ScheduledTask[] | undefined;

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const grouped = useMemo(() => {
    const byDay: Record<string, ScheduledTask[]> = {};
    for (const d of days) byDay[format(d, 'yyyy-MM-dd')] = [];
    for (const t of tasks ?? []) {
      const key = format(new Date(t.scheduledAt), 'yyyy-MM-dd');
      (byDay[key] ??= []).push(t);
    }
    // keep tasks ordered within day
    for (const key of Object.keys(byDay)) {
      byDay[key].sort((a, b) => a.scheduledAt - b.scheduledAt);
    }
    return byDay;
  }, [tasks, days]);

  const today = new Date();
  const rangeLabel = `${format(weekStart, 'MMM d')}-${format(
    endOfWeek(weekStart, { weekStartsOn: 1 }),
    'd, yyyy'
  )}`;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">📅 Calendar</h1>
          <p className="text-slate-400 mt-1">Weekly view of scheduled tasks.</p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <button
            onClick={() => setWeekStart((d) => addWeeks(d, -1))}
            className="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-200 hover:bg-slate-800/70 transition-colors"
          >
            ← Previous Week
          </button>
          <div className="text-slate-200 font-medium">{rangeLabel}</div>
          <button
            onClick={() => setWeekStart((d) => addWeeks(d, 1))}
            className="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-200 hover:bg-slate-800/70 transition-colors"
          >
            Next Week →
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[980px] grid grid-cols-7 gap-2">
            {days.map((d) => {
              const key = format(d, 'yyyy-MM-dd');
              const dayTasks = grouped[key] ?? [];
              const isToday = isSameDay(d, today);

              return (
                <div
                  key={key}
                  className={
                    'bg-slate-800/30 border border-slate-700/50 rounded-xl min-h-[400px] p-3 ' +
                    (isToday ? 'border-indigo-500/40' : '')
                  }
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="text-sm font-semibold text-slate-200">
                      {format(d, 'EEE')}
                    </div>
                    <div className="text-xs text-slate-400">{format(d, 'd')}</div>
                  </div>

                  {(!tasks || tasks.length === 0) && (
                    <div className="text-sm text-slate-500">No tasks</div>
                  )}

                  {tasks && dayTasks.length === 0 && (
                    <div className="text-sm text-slate-500">No tasks</div>
                  )}

                  {tasks &&
                    dayTasks.map((t) => {
                      const expanded = expandedId === t._id;
                      return (
                        <button
                          key={t._id}
                          onClick={() =>
                            setExpandedId((cur) => (cur === t._id ? null : t._id))
                          }
                          className="w-full text-left bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 mb-2 hover:border-slate-600/60 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium text-slate-100 truncate">
                                {t.title}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {format(new Date(t.scheduledAt), 'HH:mm')}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${statusDotClass(
                                  t.status
                                )}`}
                                title={t.status ?? 'pending'}
                              />
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-950/40 border border-slate-700/40 text-slate-300">
                                {t.assignedTo}
                              </span>
                            </div>
                          </div>

                          {expanded && t.description && (
                            <div className="mt-2 text-sm text-slate-300">
                              {t.description}
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
