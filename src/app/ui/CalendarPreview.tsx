'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import Link from 'next/link';
import { addDays, format, isSameDay } from 'date-fns';
import { Calendar, ArrowRight } from 'lucide-react';

type ScheduledTask = {
  _id: string;
  title: string;
  scheduledAt: number;
  assignedTo: string;
  status: string;
};

const agentTextColors: Record<string, string> = {
  molty: 'text-[#58a6ff]',
  codex: 'text-[#f0883e]',
  ministral: 'text-[#a371f7]',
  perplexity: 'text-[#3fb950]',
  gemini: 'text-[#d2a8ff]',
};

function colorForAgent(agent: string) {
  return agentTextColors[agent.toLowerCase()] || 'text-[#8b949e]';
}

export default function CalendarPreview() {
  const now = useMemo(() => new Date(), []);
  const end = useMemo(() => addDays(now, 5), [now]);

  const tasks = useQuery(convexApi.scheduledTasks.listBetween, {
    start: now.getTime(),
    end: end.getTime(),
    limit: 30,
  }) as ScheduledTask[] | undefined;

  const days = useMemo(
    () => Array.from({ length: 5 }, (_, i) => addDays(now, i)),
    [now],
  );

  if (!tasks) return null;

  const hasAnyTasks = tasks.some(
    (t) => t.status !== 'done' && t.status !== 'failed',
  );
  if (!hasAnyTasks) return null;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#a371f7]" />
          <span className="text-sm font-semibold text-[#e6edf3]">Upcoming</span>
        </div>
        <Link
          href="/calendar"
          className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1"
        >
          Full calendar <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-[#30363d]">
        {days.map((day) => {
          const dayTasks = tasks
            .filter(
              (t) =>
                isSameDay(new Date(t.scheduledAt), day) &&
                t.status !== 'done' &&
                t.status !== 'failed',
            )
            .sort((a, b) => a.scheduledAt - b.scheduledAt)
            .slice(0, 4);

          if (dayTasks.length === 0) return null;

          const isToday = isSameDay(day, now);

          return (
            <div key={day.toISOString()} className="px-4 py-3">
              <div
                className={`text-xs font-semibold mb-2 ${
                  isToday ? 'text-[#58a6ff]' : 'text-[#6e7681]'
                }`}
              >
                {isToday ? 'Today' : format(day, 'EEE d MMM')}
              </div>
              <div className="space-y-1.5">
                {dayTasks.map((t) => (
                  <div key={t._id} className="flex items-center gap-2">
                    <div className="text-[10px] text-[#6e7681] w-9 shrink-0 font-mono">
                      {format(new Date(t.scheduledAt), 'HH:mm')}
                    </div>
                    <div className="text-xs text-[#e6edf3] truncate flex-1">{t.title}</div>
                    <div className={`text-[10px] shrink-0 font-medium ${colorForAgent(t.assignedTo)}`}>
                      {t.assignedTo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }).filter(Boolean)}
      </div>
    </div>
  );
}
