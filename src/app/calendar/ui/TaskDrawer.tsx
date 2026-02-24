'use client';

import { X } from 'lucide-react';

type ScheduledTask = {
  _id: string;
  title: string;
  scheduledAt: number;
  assignedTo: string;
  description?: string;
  status: string;
  recurrence?: string;
};

interface TaskDrawerProps {
  task: ScheduledTask | null;
  onClose: () => void;
}

const agentColors: Record<string, string> = {
  molty: 'border-[#58a6ff]/40 bg-[#58a6ff]/10 text-[#58a6ff]',
  codex: 'border-[#f0883e]/40 bg-[#f0883e]/10 text-[#f0883e]',
  ministral: 'border-[#a371f7]/40 bg-[#a371f7]/10 text-[#a371f7]',
  perplexity: 'border-[#3fb950]/40 bg-[#3fb950]/10 text-[#3fb950]',
  gemini: 'border-[#d2a8ff]/40 bg-[#d2a8ff]/10 text-[#d2a8ff]',
};

const statusConfig = {
  'in-progress': { label: 'In Progress', color: 'bg-[#58a6ff]/20 text-[#58a6ff]' },
  'completed': { label: 'Completed', color: 'bg-[#3fb950]/20 text-[#3fb950]' },
  'failed': { label: 'Failed', color: 'bg-[#f85149]/20 text-[#f85149]' },
};

export default function TaskDrawer({ task, onClose }: TaskDrawerProps) {
  if (!task) return null;

  const colorForAgent = agentColors[task.assignedTo.toLowerCase()] || 'border-[#30363d] bg-[#21262d]/40 text-[#e6edf3]';
  const statusInfo = statusConfig[task.status as keyof typeof statusConfig] || {
    label: task.status,
    color: 'border-[#30363d] bg-[#21262d]/40 text-[#e6edf3]'
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#161b22] border-l border-[#30363d] h-full overflow-y-auto shadow-2xl z-50">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] sticky top-0 bg-[#161b22]">
        <h2 className="text-lg font-semibold text-[#e6edf3]">Task Details</h2>
        <button
          onClick={onClose}
          className="text-[#8b949e] hover:text-[#e6edf3] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">Title</label>
          <p className="text-xl font-semibold text-[#e6edf3]">{task.title}</p>
        </div>

        {/* Status & Agent Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">Status</label>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded ${statusInfo.color}`}>
              {statusInfo.label}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">Assigned to</label>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded ${colorForAgent}`}>
              {task.assignedTo}
            </div>
          </div>
        </div>

        {/* Scheduled At */}
        <div>
          <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">Scheduled for</label>
          <p className="text-[#e6edf3]">
            {new Date(task.scheduledAt).toLocaleString('en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">Description</label>
            <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4">
              <pre className="text-sm text-[#e6edf3] whitespace-pre-wrap font-sans">{task.description}</pre>
            </div>
          </div>
        )}

        {/* Recurrence */}
        {task.recurrence && (
          <div>
            <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">Recurrence</label>
            <p className="text-[#e6edf3]">{task.recurrence}</p>
          </div>
        )}

        {/* Task ID (for debugging) */}
        <div className="text-xs text-[#6e7681]">
          <span className="text-[#8b949e]/70">ID:</span> {task._id}
        </div>
      </div>
    </div>
  );
}
