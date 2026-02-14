'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  formatDistanceToNow,
  startOfDay,
  startOfWeek,
  startOfMonth,
} from 'date-fns';

const ACTORS = [
  'All',
  'Molty',
  'Tom',
  'Codex',
  'Ministral',
  'Perplexity',
  'Gemini',
] as const;

const ACTIONS = [
  'All',
  'shipped',
  'committed',
  'deployed',
  'researched',
  'reviewed',
  'delegated',
  'posted',
  'fixed',
  'planned',
] as const;

const RANGES = ['today', 'this week', 'this month', 'all'] as const;

type Range = (typeof RANGES)[number];

type Activity = {
  _id: string;
  timestamp: number;
  actor: string;
  action: string;
  title: string;
  description?: string;
  project?: string;
  tags?: string[];
};

function actorDotClass(actorRaw: string) {
  const actor = actorRaw.toLowerCase();
  if (actor === 'molty') return 'bg-indigo-400';
  if (actor === 'tom') return 'bg-green-400';
  if (actor === 'codex') return 'bg-amber-400';
  if (actor === 'ministral') return 'bg-purple-400';
  if (actor === 'perplexity') return 'bg-blue-400';
  if (actor === 'gemini') return 'bg-red-400';
  return 'bg-slate-400';
}

function getAfterMs(range: Range) {
  const now = new Date();
  if (range === 'today') return startOfDay(now).getTime();
  if (range === 'this week')
    return startOfWeek(now, { weekStartsOn: 1 }).getTime();
  if (range === 'this month') return startOfMonth(now).getTime();
  return undefined;
}

export default function ActivityFeedPage() {
  const [actor, setActor] = useState<(typeof ACTORS)[number]>('All');
  const [action, setAction] = useState<(typeof ACTIONS)[number]>('All');
  const [range, setRange] = useState<Range>('this week');

  const afterMs = useMemo(() => getAfterMs(range), [range]);

  const activities = useQuery(api.activities.list, {
    limit: 50,
    actor: actor === 'All' ? undefined : actor,
    action: action === 'All' ? undefined : action,
    afterMs,
  }) as Activity[] | undefined;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">📋 Activity Feed</h1>
          <p className="text-slate-400 mt-1">
            A reverse-chronological feed of everything happening in Mission Control.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Actor
              </label>
              <select
                value={actor}
                onChange={(e) => setActor(e.target.value as any)}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {ACTORS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Action type
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Date range
              </label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as Range)}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          {activities && activities.length === 0 && (
            <div className="p-6 text-slate-400">
              No activities yet. Activities will appear here as work happens.
            </div>
          )}

          {!activities && (
            <div className="p-6 text-slate-400">Loading activity…</div>
          )}

          {activities && activities.length > 0 && (
            <ul>
              {activities.map((a, idx) => (
                <li
                  key={a._id}
                  className={
                    'p-4 ' +
                    (idx === activities.length - 1
                      ? ''
                      : 'border-b border-slate-700/50')
                  }
                >
                  <div className="flex gap-3">
                    <div className="pt-1">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${actorDotClass(
                          a.actor
                        )}`}
                        title={a.actor}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 truncate">
                            {a.title}
                          </div>
                          {a.description && (
                            <div className="text-sm text-slate-400 mt-0.5">
                              {a.description}
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 whitespace-nowrap">
                          {formatDistanceToNow(new Date(a.timestamp), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/40 text-slate-300">
                          {a.actor}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/40 text-slate-300">
                          {a.action}
                        </span>
                        {a.project && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-200">
                            {a.project}
                          </span>
                        )}
                        {a.tags?.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2 py-0.5 rounded-full bg-slate-900/50 border border-slate-700/40 text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
