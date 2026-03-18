'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import { Calendar, CheckCircle, ChevronDown } from 'lucide-react';

// Build-time constant — NEXT_PUBLIC_ vars are inlined at compile time
const CONVEX_ENABLED = !!process.env.NEXT_PUBLIC_CONVEX_URL;
const SEVEN_DAYS_AGO = Date.now() - 7 * 24 * 60 * 60 * 1000;

type ActivityItem = {
  _id: string;
  timestamp: number;
  title: string;
  status?: string;
};

type ScheduledTask = {
  _id: string;
  title: string;
  scheduledAt: number;
  assignedTo: string;
  status: string;
};

export default function TodayCard() {
  const [expanded, setExpanded] = useState(true);

  const todayStart = useMemo(() => new Date().setHours(0, 0, 0, 0), []);
  const todayEnd = useMemo(() => new Date().setHours(23, 59, 59, 999), []);

  // Always call hooks unconditionally — pass "skip" when Convex is not configured
  const todayTasks = useQuery(
    convexApi.scheduledTasks.listBetween,
    CONVEX_ENABLED ? { start: todayStart, end: todayEnd, limit: 10 } : 'skip',
  ) as ScheduledTask[] | undefined;

  const recentActivities = useQuery(
    convexApi.activities.list,
    CONVEX_ENABLED ? { limit: 10 } : 'skip',
  ) as ActivityItem[] | undefined;

  const upcomingTasks = useMemo(
    () =>
      (todayTasks ?? [])
        .filter((t) => t.status !== 'done' && t.status !== 'failed')
        .slice(0, 3),
    [todayTasks],
  );

  const completedActivities = useMemo(
    () =>
      (recentActivities ?? [])
        .filter((a) => a.status === 'completed' && a.timestamp >= SEVEN_DAYS_AGO)
        .slice(0, 5),
    [recentActivities],
  );

  const hasContent = upcomingTasks.length > 0 || completedActivities.length > 0;

  if (!hasContent) return null;

  return (
    <div className="bg-gradient-to-br from-[#21262d] to-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#21262d]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#58a6ff]/15 rounded-lg">
            <Calendar className="w-5 h-5 text-[#58a6ff]" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-[#e6edf3]">Today</h2>
            <p className="text-xs text-[#8b949e]">
              {upcomingTasks.length} upcoming · {completedActivities.length} shipped this week
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#8b949e] transition-transform ${expanded ? '' : '-rotate-90'}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-[#30363d] bg-[#0d1117]/50 px-6 py-4 space-y-5">
          {upcomingTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-3.5 h-3.5 text-[#f0883e]" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8b949e]">Next Up Today</h3>
              </div>
              <div className="space-y-2">
                {upcomingTasks.map((t) => (
                  <div
                    key={t._id}
                    className="bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2.5 flex items-start justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#e6edf3] truncate">{t.title}</div>
                      <div className="text-xs text-[#8b949e] mt-0.5">
                        {new Date(t.scheduledAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {t.assignedTo}
                      </div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-[#58a6ff] rounded-full shrink-0 mt-1.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedActivities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-3.5 h-3.5 text-[#3fb950]" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8b949e]">Shipped This Week</h3>
              </div>
              <div className="space-y-2">
                {completedActivities.map((a) => (
                  <div
                    key={a._id}
                    className="bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2.5 flex items-start justify-between gap-2"
                  >
                    <div className="text-sm text-[#e6edf3] flex-1 truncate">{a.title}</div>
                    <div className="text-[10px] text-[#6e7681] shrink-0 mt-0.5 tabular-nums">
                      {new Date(a.timestamp).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
