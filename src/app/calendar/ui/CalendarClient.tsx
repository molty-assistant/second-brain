'use client';

import { useMemo, useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import {
  addDays,
  addWeeks,
  format,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import TaskDrawer from './TaskDrawer';

type CronJob = {
  _id: string;
  jobId: string;
  name: string;
  agentId: string;
  schedule: string;
  tz?: string;
  enabled: boolean;
  lastRunAtMs?: number;
  lastStatus?: string;
  consecutiveErrors?: number;
  updatedAt: number;
};

const AGENT_LABELS: Record<string, string> = {
  main: 'Molty',
  default: 'Molty',
  'social-manager': 'Sid',
  'engineering-manager': 'Eddy',
};

function formatSchedule(expr: string) {
  const parts = expr.split(' ');
  if (parts.length !== 5) return expr;
  const [min, hour, dom, , dow] = parts;
  if (dom !== '*') return expr;
  if (dow === '*') return `Daily at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[+dow] || dow} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
}

function formatRelativeTime(ms?: number) {
  if (!ms) return 'Never';
  const ago = Date.now() - ms;
  if (ago < 60_000) return 'Just now';
  if (ago < 3600_000) return `${Math.floor(ago / 60_000)}m ago`;
  if (ago < 86400_000) return `${Math.floor(ago / 3600_000)}h ago`;
  return `${Math.floor(ago / 86400_000)}d ago`;
}

type ScheduledTask = {
  _id: string;
  title: string;
  scheduledAt: number;
  assignedTo: string;
  description?: string;
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
  return agentColors[key] || 'border-[#30363d] bg-[#21262d]/40 text-[#e6edf3]';
}

export default function CalendarClient() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
  const cronJobs = useQuery(convexApi.cronJobs.list, {}) as CronJob[] | undefined;
  const setEnabled = useMutation(convexApi.cronJobs.setEnabled);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTask) {
        e.preventDefault();
        setSelectedTask(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedTask]);

  const weekStart = useMemo(
    () => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }),
    [weekOffset],
  );
  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);

  const tasks = useQuery(convexApi.scheduledTasks.listBetween, {
    start: weekStart.getTime(),
    end: weekEnd.getTime(),
    limit: 500,
  }) as ScheduledTask[] | undefined;

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {days.map((day) => {
          const dayTasks = (tasks ?? [])
            .filter((t) => isSameDay(new Date(t.scheduledAt), day))
            .sort((a, b) => a.scheduledAt - b.scheduledAt);

          const today = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className={`bg-[#161b22] border rounded-lg overflow-hidden ${today ? 'border-[#58a6ff]/60' : 'border-[#30363d]'}`}>
              <div className={`px-3 py-2 border-b ${today ? 'border-[#58a6ff]/40 bg-[#58a6ff]/5' : 'border-[#30363d]'}`}>
                <div className="text-xs text-[#6e7681]">{format(day, 'EEE')}</div>
                <div className="text-sm font-medium text-[#e6edf3]">{format(day, 'dd MMM')}</div>
              </div>
              <div className="p-2 space-y-2 min-h-[120px]">
                {dayTasks.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTask(t)}
                    className={`border rounded-md px-2 py-1.5 w-full text-left hover:border-[#58a6ff]/60 hover:bg-[#21262d]/50 transition-colors ${colorForAgent(t.assignedTo)}`}
                    title={t.description}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-medium truncate">{t.title}</div>
                      <div className="text-[10px] opacity-80">{format(new Date(t.scheduledAt), 'HH:mm')}</div>
                    </div>
                    <div className="text-[10px] opacity-80 truncate">{t.assignedTo} • {t.status}</div>
                  </button>
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

      <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />

      {/* Cron Jobs Panel */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-[#e6edf3] mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8b949e]" />
          Cron Jobs
        </h2>
        {!cronJobs && <div className="text-xs text-[#6e7681]">Loading...</div>}
        {cronJobs && cronJobs.length === 0 && (
          <div className="text-xs text-[#6e7681]">No cron jobs synced yet. Sync daemon will populate these.</div>
        )}
        {cronJobs && cronJobs.length > 0 && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-[#6e7681] text-xs">
                  <th className="text-left px-4 py-2 font-medium">Job</th>
                  <th className="text-left px-4 py-2 font-medium">Agent</th>
                  <th className="text-left px-4 py-2 font-medium">Schedule</th>
                  <th className="text-left px-4 py-2 font-medium">Last Run</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {[...cronJobs]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((job) => {
                    const hasErrors = (job.consecutiveErrors ?? 0) > 0;
                    return (
                      <tr
                        key={job._id}
                        className={`border-b border-[#30363d] last:border-b-0 ${
                          !job.enabled ? 'opacity-50' : ''
                        }`}
                      >
                        <td className="px-4 py-2.5 text-[#e6edf3]">{job.name}</td>
                        <td className="px-4 py-2.5 text-[#8b949e]">
                          {AGENT_LABELS[job.agentId] || job.agentId}
                        </td>
                        <td className="px-4 py-2.5 text-[#8b949e] text-xs">
                          {formatSchedule(job.schedule)}
                          {job.tz && <span className="text-[#6e7681] ml-1">({job.tz})</span>}
                        </td>
                        <td className="px-4 py-2.5 text-[#8b949e] text-xs">
                          {formatRelativeTime(job.lastRunAtMs)}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                job.lastStatus === 'ok'
                                  ? 'bg-[#3fb950]'
                                  : job.lastStatus === 'error'
                                    ? 'bg-[#f85149]'
                                    : 'bg-[#6e7681]'
                              }`}
                            />
                            <span className="text-xs text-[#8b949e]">
                              {job.lastStatus || 'unknown'}
                            </span>
                            {hasErrors && (
                              <span className="flex items-center gap-0.5 text-[10px] text-[#f85149]">
                                <AlertTriangle className="w-3 h-3" />
                                {job.consecutiveErrors}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() =>
                              setEnabled({ jobId: job.jobId, enabled: !job.enabled })
                            }
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              job.enabled
                                ? 'bg-[#238636]'
                                : 'bg-[#21262d] border border-[#30363d]'
                            }`}
                            title={job.enabled ? 'Click to disable' : 'Click to enable'}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                                job.enabled ? 'translate-x-4' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
