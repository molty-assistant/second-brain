'use client';

import { useMemo, useState, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import { ChevronDown, ChevronRight, ExternalLink, GripVertical } from 'lucide-react';

type BacklogTask = {
  _id: string;
  taskId: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: string;
  priority?: string;
  createdBy?: string;
  createdAt?: string;
  completedAt?: string;
  output?: string;
  pr?: string;
};

const COLUMNS: { key: string; label: string; color: string; border: string }[] = [
  { key: 'todo', label: 'Todo', color: 'text-[#8b949e]', border: 'border-[#30363d]' },
  { key: 'in_progress', label: 'In Progress', color: 'text-[#f0883e]', border: 'border-[#f0883e]/30' },
  { key: 'blocked', label: 'Blocked', color: 'text-[#ff7b72]', border: 'border-[#ff7b72]/30' },
  { key: 'done', label: 'Done', color: 'text-[#3fb950]', border: 'border-[#3fb950]/30' },
];

const agentColors = [
  { bg: 'bg-[#58a6ff]/15', text: 'text-[#58a6ff]' },
  { bg: 'bg-[#3fb950]/15', text: 'text-[#3fb950]' },
  { bg: 'bg-[#a371f7]/15', text: 'text-[#a371f7]' },
  { bg: 'bg-[#f0883e]/15', text: 'text-[#f0883e]' },
  { bg: 'bg-[#ff7b72]/15', text: 'text-[#ff7b72]' },
];

function hashToIndex(s: string, mod: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % mod;
}

function badgeForPriority(priority?: string) {
  const p = (priority ?? '').toLowerCase();
  if (p === 'critical')
    return { bg: 'bg-[#ff7b72]/15', text: 'text-[#ff7b72]', border: 'border-[#ff7b72]/30' };
  if (p === 'high')
    return { bg: 'bg-[#f0883e]/15', text: 'text-[#f0883e]', border: 'border-[#f0883e]/30' };
  if (p === 'medium')
    return { bg: 'bg-[#58a6ff]/15', text: 'text-[#58a6ff]', border: 'border-[#58a6ff]/30' };
  return { bg: 'bg-[#6e7681]/10', text: 'text-[#6e7681]', border: 'border-[#30363d]' };
}

const priorityRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function TaskCard({
  task,
  onDragStart,
}: {
  task: BacklogTask;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const agent = agentColors[hashToIndex(task.assignedTo ?? 'Unassigned', agentColors.length)];
  const priorityBadge = badgeForPriority(task.priority);
  const isDone = task.status.toLowerCase() === 'done';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.taskId)}
      className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[#58a6ff]/30 transition-colors group"
    >
      {/* Header row */}
      <div className="flex items-start gap-2">
        <GripVertical className="w-3.5 h-3.5 text-[#6e7681] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#8b949e]">
              {task.taskId}
            </span>
            {task.priority && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${priorityBadge.bg} ${priorityBadge.text} ${priorityBadge.border}`}
              >
                {task.priority}
              </span>
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${agent.bg} ${agent.text}`}>
              {task.assignedTo}
            </span>
          </div>

          <div className={`text-sm font-medium leading-snug ${isDone ? 'text-[#6e7681] line-through' : 'text-[#e6edf3]'}`}>
            {task.title}
          </div>

          {task.description && (
            <div className="text-xs text-[#8b949e] mt-1 line-clamp-2">{task.description}</div>
          )}

          {isDone && (task.completedAt || task.pr) && (
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-[#6e7681]">
              {task.completedAt && (
                <span>Done {new Date(task.completedAt).toLocaleDateString('en-GB')}</span>
              )}
              {task.pr && (
                <a
                  href={task.pr}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[#58a6ff] hover:underline"
                >
                  PR <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Output toggle */}
      {task.output && (
        <div className="mt-2 pt-2 border-t border-[#30363d]">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="inline-flex items-center gap-1 text-[10px] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Output
          </button>
          {expanded && (
            <pre className="mt-2 text-[10px] text-[#c9d1d9] whitespace-pre-wrap leading-relaxed bg-[#161b22] border border-[#30363d] rounded p-2 overflow-auto max-h-40">
              {task.output}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function BacklogClient() {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const tasks = useQuery(convexApi.backlog.list, {}) as BacklogTask[] | undefined;
  const updateStatus = useMutation(convexApi.backlog.updateStatus);

  const sorted = useMemo(() => {
    const list = [...(tasks ?? [])];
    list.sort((a, b) => {
      const pa = priorityRank[(a.priority ?? '').toLowerCase()] ?? 999;
      const pb = priorityRank[(b.priority ?? '').toLowerCase()] ?? 999;
      if (pa !== pb) return pa - pb;
      return a.taskId.localeCompare(b.taskId);
    });
    return list;
  }, [tasks]);

  const byStatus = useMemo(() => {
    const map: Record<string, BacklogTask[]> = {
      todo: [],
      in_progress: [],
      blocked: [],
      done: [],
    };
    for (const t of sorted) {
      const s = (t.status ?? 'todo').toLowerCase();
      if (s in map) map[s].push(t);
      else map.todo.push(t);
    }
    return map;
  }, [sorted]);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, colKey: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragOverCol !== colKey) setDragOverCol(colKey);
    },
    [dragOverCol],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, colKey: string) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('text/plain') || draggingId;
      setDragOverCol(null);
      setDraggingId(null);
      if (!taskId) return;
      const task = (tasks ?? []).find((t) => t.taskId === taskId);
      if (!task || task.status.toLowerCase() === colKey) return;
      updateStatus({ taskId, status: colKey }).catch(() => {});
    },
    [draggingId, tasks, updateStatus],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverCol(null);
  }, []);

  if (!tasks) {
    return <div className="text-sm text-[#6e7681]">Loading backlog…</div>;
  }

  return (
    <div>
      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = byStatus[col.key] ?? [];
          const isOver = dragOverCol === col.key;

          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDrop={(e) => handleDrop(e, col.key)}
              onDragLeave={() => {
                if (dragOverCol === col.key) setDragOverCol(null);
              }}
              className={`flex flex-col min-h-[200px] rounded-lg border transition-colors ${
                isOver
                  ? 'border-[#58a6ff]/60 bg-[#58a6ff]/5'
                  : 'border-[#30363d] bg-[#161b22]/50'
              }`}
            >
              {/* Column header */}
              <div className={`flex items-center justify-between px-3 py-2.5 border-b ${col.border}`}>
                <span className={`text-xs font-semibold uppercase tracking-wide ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs text-[#6e7681] bg-[#0d1117] px-1.5 py-0.5 rounded">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2">
                {colTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onDragStart={handleDragStart} />
                ))}

                {colTasks.length === 0 && (
                  <div
                    className={`flex items-center justify-center h-16 rounded-md border border-dashed text-xs transition-colors ${
                      isOver
                        ? 'border-[#58a6ff]/50 text-[#58a6ff]'
                        : 'border-[#30363d] text-[#6e7681]'
                    }`}
                  >
                    {isOver ? 'Drop here' : 'Empty'}
                  </div>
                )}

                {/* Drop target at bottom of non-empty columns */}
                {colTasks.length > 0 && isOver && (
                  <div className="h-1 rounded-full bg-[#58a6ff]/50" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-[#6e7681]">
        Drag cards between columns to update status · Call{' '}
        <code className="text-[#8b949e]">POST /api/backlog-sync</code> to refresh from workforce
        backlog.json
      </div>
    </div>
  );
}
