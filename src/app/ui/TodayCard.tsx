'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import { Calendar, CheckCircle, ArrowRight } from 'lucide-react';

// Calculate 7 days ago once (module-level constant)
const SEVEN_DAYS_AGO = Date.now() - (7 * 24 * 60 * 60 * 1000);

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
  const [expanded, setExpanded] = useState(false);

  // Get scheduled tasks for today
  const todayStart = useMemo(() => new Date().setHours(0, 0, 0, 0), []);
  const todayEnd = useMemo(() => new Date().setHours(23, 59, 59, 999), []);

  const todayTasks = useQuery(convexApi.scheduledTasks.listBetween, {
    start: todayStart,
    end: todayEnd,
    limit: 10,
  }) as ScheduledTask[] | undefined;

  // Get recent shipped/completed activities (last 7 days)
  const recentActivities = useQuery(convexApi.activities.list, {
    limit: 10,
  }) as ActivityItem[] | undefined;

  const completedActivities = useMemo(() => {
    return (recentActivities || [])
      .filter((a) => a.status === 'completed' && a.timestamp >= SEVEN_DAYS_AGO)
      .slice(0, 5);
  }, [recentActivities]);

  const upcomingTasks = useMemo(() => {
    return (todayTasks || [])
      .filter((t) => t.status !== 'done' && t.status !== 'failed')
      .slice(0, 3);
  }, [todayTasks]);

  const hasContent = upcomingTasks.length > 0 || completedActivities.length > 0;

  if (!hasContent) {
    return null;
  }

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
              {upcomingTasks.length} upcoming • {completedActivities.length} shipped this week
            </p>
          </div>
        </div>
        <ArrowRight
          className={`w-4 h-4 text-[#8b949e] transition-transform ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-[#30363d] bg-[#0d1117]/50 px-6 py-4 space-y-6">
          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#f0883e]" />
                <h3 className="text-sm font-semibold text-[#e6edf3]">Next Up Today</h3>
              </div>
              <div className="space-y-2">
                {upcomingTasks.map((t) => (
                  <div
                    key={t._id}
                    className="bg-[#161b22] border border-[#30363d] rounded-md p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#e6edf3]">{t.title}</div>
                        <div className="text-xs text-[#8b949e] mt-1">
                          {new Date(t.scheduledAt).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          • {t.assignedTo}
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-[#58a6ff] rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Shipped */}
          {completedActivities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-[#3fb950]" />
                <h3 className="text-sm font-semibold text-[#e6edf3]">Recently Shipped</h3>
              </div>
              <div className="space-y-2">
                {completedActivities.map((a) => (
                  <div
                    key={a._id}
                    className="bg-[#161b22] border border-[#30363d] rounded-md p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#e6edf3]">{a.title}</div>
                        <div className="text-xs text-[#8b949e] mt-1">
                          {new Date(a.timestamp).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-[#3fb950] rounded-full"></div>
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
