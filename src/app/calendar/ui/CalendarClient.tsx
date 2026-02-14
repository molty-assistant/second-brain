'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import {
  addDays,
  addWeeks,
  format,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ScheduledTask = {
  _id: string;
  name: string;
  scheduledAt: number;
  agent: string;
  description: string;
  status: string;
  recurrence?: string;
};

const agentColors: Record<string, string> = {
  molty: 'border-[#58a6ff]/40 bg-[#58a6ff]/10 text-[#58a6ff]',
  codex: 'border-[#f0883e]/40 bg-[#f0883e]/10 text-[#f0883e]',
  ministral: 'border-[#a371f7]/40 bg-[#a371f7]/10 text-[#a371f7]',
  perplexity: 'border-[#3fb950]/40 bg-[#3fb950]/10 text-[#3fb950]',
  gemini: 'border-[#d2a8ff]/40 bg-[#d2a8ff]/10 text-[#d2a8ff]',
};

function colorForAgent(agent: string) {
  const key = agent.toLowerCase();
  return (
    agentColors[key] ??
    'border-[#30363d] bg-[#21262d]/40 text-[#e6edf3]'
  );
}

export default function CalendarClient() {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(
    () => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }),
    [weekOffset],
  );
  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);

  const tasks = useQuery(convexApi.scheduledTasks.listBetween as any, {
    start: weekStart.getTime(),
    end: weekEnd.getTime(),
    limit: 500,
  }) as ScheduledTask[] | undefined;

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 rounded-md border border-[#30363d] bg-[#161b22] hover:bg-[#21262d]/50 transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4 text-[#8b949e]" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-2 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-[#e6edf3] hover:bg-[#21262d]/50 transition-colors"
          >
            This week
          </button>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-2 rounded-md border border-[#30363d] bg-[#161b22] hover:bg-[#21262d]/50 transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4 text-[#8b949e]" />
          </button>
        </div>

        <div className="text-sm text-[#8b949e]">
          {format(weekStart, 'dd MMM')} – {format(weekEnd, 'dd MMM yyyy')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {days.map((day) => {
          const dayTasks = (tasks ?? [])
            .filter((t) => isSameDay(new Date(t.scheduledAt), day))
            .sort((a, b) => a.scheduledAt - b.scheduledAt);

          return (
            <div key={day.toISOString()} className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b border-[#30363d]">
                <div className="text-xs text-[#6e7681]">{format(day, 'EEE')}</div>
                <div className="text-sm font-medium text-[#e6edf3]">{format(day, 'dd MMM')}</div>
              </div>
              <div className="p-2 space-y-2 min-h-[120px]">
                {dayTasks.map((t) => (
                  <div
                    key={t._id}
                    className={`border rounded-md px-2 py-1.5 ${colorForAgent(t.agent)}`}
                    title={t.description}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-medium truncate">{t.name}</div>
                      <div className="text-[10px] opacity-80">{format(new Date(t.scheduledAt), 'HH:mm')}</div>
                    </div>
                    <div className="text-[10px] opacity-80 truncate">{t.agent} • {t.status}</div>
                  </div>
                ))}

                {tasks && dayTasks.length === 0 && (
                  <div className="text-xs text-[#6e7681] px-1 py-2">No tasks</div>
                )}

                {!tasks && <div className="text-xs text-[#6e7681] px-1 py-2">Loading…</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
