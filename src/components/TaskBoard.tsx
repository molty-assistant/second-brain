'use client';

import { useCallback, useEffect, useState } from 'react';
import { createTask, updateTask, removeTask } from '@/app/actions';
import { Plus, X, Clock, User, Bot, AlertCircle, ChevronRight, Calendar, Trash2, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'now' | 'next' | 'later';
  assignee: 'tom' | 'molty';
  created: string;
  completed?: string;
  notes?: string;
  content?: string;
}

interface TaskBoardProps {
  tasks: Task[];
}

const priorityConfig = {
  now: { label: 'Now', color: 'bg-[#f85149]/20 text-[#f85149]', icon: AlertCircle },
  next: { label: 'Next', color: 'bg-[#f0883e]/20 text-[#f0883e]', icon: ChevronRight },
  later: { label: 'Later', color: 'bg-[#6e7681]/20 text-[#8b949e]', icon: Clock },
};

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-[#8b949e]', description: 'Ready to start' },
  'in-progress': { label: 'In Progress', color: 'bg-[#58a6ff]', description: 'Being worked on' },
  review: { label: 'Review', color: 'bg-[#a371f7]', description: 'Needs review' },
  done: { label: 'Done', color: 'bg-[#3fb950]', description: 'Completed' },
};

function AssigneeBadge({ assignee, small = false }: { assignee: 'tom' | 'molty'; small?: boolean }) {
  const size = small ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';
  const iconSize = small ? 'w-3 h-3' : 'w-4 h-4';

  if (assignee === 'molty') {
    return (
      <span className={`inline-flex items-center gap-1 ${size} rounded bg-[#58a6ff]/20 text-[#58a6ff]`}>
        <Bot className={iconSize} />
        Molty
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 ${size} rounded bg-[#a371f7]/20 text-[#a371f7]`}>
      <User className={iconSize} />
      Tom
    </span>
  );
}

function PriorityBadge({ priority, small = false }: { priority: Task['priority']; small?: boolean }) {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  const size = small ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';
  const iconSize = small ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center gap-1 ${size} rounded ${config.color}`}>
      <Icon className={iconSize} />
      {config.label}
    </span>
  );
}

function TaskDetailPanel({
  task,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [newUpdate, setNewUpdate] = useState('');
  const [updateAuthor, setUpdateAuthor] = useState<'tom' | 'molty'>('tom');

  const handleSave = () => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const handleAddUpdate = () => {
    if (!newUpdate.trim()) return;

    const timestamp = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    const authorLabel = updateAuthor === 'molty' ? '🦉 Molty' : '👤 Tom';
    const updateLine = `\n\n---\n**${authorLabel}** (${timestamp}):\n${newUpdate.trim()}`;

    const updatedContent = (task.content || '') + updateLine;
    onUpdate(task.id, { content: updatedContent });
    setNewUpdate('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="w-full max-w-lg bg-[#161b22] border-l border-[#30363d] h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#30363d] sticky top-0 bg-[#161b22]">
          <h2 className="text-lg font-semibold text-[#e6edf3]">Task Details</h2>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">Title</label>
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
              />
            ) : (
              <h3 className="text-xl font-semibold text-[#e6edf3]">{task.title}</h3>
            )}
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">Status</label>
              {isEditing ? (
                <select
                  value={editedTask.status}
                  onChange={e => setEditedTask({ ...editedTask, status: e.target.value as Task['status'] })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded ${statusConfig[task.status].color}/20`}>
                  <div className={`w-2 h-2 rounded-full ${statusConfig[task.status].color}`}></div>
                  <span className="text-[#e6edf3]">{statusConfig[task.status].label}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">Priority</label>
              {isEditing ? (
                <select
                  value={editedTask.priority}
                  onChange={e => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
                >
                  <option value="now">🔴 Now</option>
                  <option value="next">🟠 Next</option>
                  <option value="later">⚪ Later</option>
                </select>
              ) : (
                <PriorityBadge priority={task.priority} />
              )}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">Assignee</label>
            {isEditing ? (
              <select
                value={editedTask.assignee}
                onChange={e => setEditedTask({ ...editedTask, assignee: e.target.value as Task['assignee'] })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="tom">👤 Tom</option>
                <option value="molty">🦉 Molty</option>
              </select>
            ) : (
              <AssigneeBadge assignee={task.assignee} />
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">Notes</label>
            {isEditing ? (
              <textarea
                value={editedTask.notes || ''}
                onChange={e => setEditedTask({ ...editedTask, notes: e.target.value })}
                rows={3}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] resize-none"
                placeholder="Brief notes..."
              />
            ) : (
              <p className="text-[#e6edf3]">{task.notes || <span className="text-[#6e7681] italic">No notes</span>}</p>
            )}
          </div>

          {/* Content/Description & Updates */}
          <div>
            <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">
              Description & Updates
            </label>
            {isEditing ? (
              <textarea
                value={editedTask.content || ''}
                onChange={e => setEditedTask({ ...editedTask, content: e.target.value })}
                rows={8}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] resize-none font-mono text-sm"
                placeholder="Detailed description (markdown supported)..."
              />
            ) : (
              <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-3 max-h-64 overflow-y-auto">
                {task.content ? (
                  <pre className="text-sm text-[#e6edf3] whitespace-pre-wrap font-sans">{task.content}</pre>
                ) : (
                  <p className="text-[#6e7681] italic">No description yet</p>
                )}
              </div>
            )}
          </div>

          {/* Add Update (quick note without full edit mode) */}
          {!isEditing && (
            <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-4">
              <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-2">
                Add Update
              </label>
              <textarea
                value={newUpdate}
                onChange={e => setNewUpdate(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUpdate();
                  }
                }}
                rows={2}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] resize-none text-sm mb-2"
                placeholder="Add a note, handoff context, or update... (Ctrl/⌘ + Enter to add)"
              />
              <div className="flex items-center gap-2">
                <select
                  value={updateAuthor}
                  onChange={e => setUpdateAuthor(e.target.value as 'tom' | 'molty')}
                  className="bg-[#0d1117] border border-[#30363d] rounded-md px-2 py-1 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
                >
                  <option value="tom">👤 Tom</option>
                  <option value="molty">🦉 Molty</option>
                </select>
                <button
                  onClick={handleAddUpdate}
                  disabled={!newUpdate.trim()}
                  className="px-3 py-1 bg-[#238636] hover:bg-[#2ea043] text-white text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex gap-4 text-sm text-[#8b949e]">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Created: {task.created}
            </div>
            {task.completed && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Completed: {task.completed}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#30363d]">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditedTask(task);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this task?')) {
                      onDelete(task.id);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 text-[#f85149] hover:bg-[#f85149]/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-[#0d1117] border border-[#30363d] rounded-lg p-3 hover:border-[#58a6ff]/50 transition-colors ${
        task.status === 'done' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className={`text-sm font-medium text-[#e6edf3] ${task.status === 'done' ? 'line-through' : ''}`}>
          {task.title}
        </h4>
        <PriorityBadge priority={task.priority} small />
      </div>

      {task.notes && (
        <p className="text-xs text-[#8b949e] line-clamp-2 mb-2">{task.notes}</p>
      )}

      <div className="flex items-center justify-between">
        <AssigneeBadge assignee={task.assignee} small />
        <span className="text-xs text-[#6e7681]">{task.created}</span>
      </div>
    </button>
  );
}

function TaskColumn({
  status,
  tasks,
  onTaskClick,
}: {
  status: Task['status'];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  const config = statusConfig[status];

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
        <h3 className="font-semibold text-[#e6edf3]">{config.label}</h3>
        <span className="text-sm text-[#6e7681]">{tasks.length}</span>
      </div>
      <p className="text-xs text-[#8b949e] mb-4">{config.description}</p>

      <div className="space-y-2">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="border border-dashed border-[#30363d] rounded-lg p-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <CheckSquare className="w-8 h-8 text-[#6e7681]" />
              <p className="text-sm text-[#8b949e] font-medium">No tasks in this column</p>
              <p className="text-xs text-[#6e7681]">Press <kbd className="px-1.5 py-0.5 border border-[#30363d] rounded bg-[#0d1117]">N</kbd> to add a task</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const reviewTasks = tasks.filter(t => t.status === 'review');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    await createTask(formData);
    setShowForm(false);
    setIsSubmitting(false);
    router.refresh();
  };

  const handleUpdate = useCallback(async (id: string, updates: Partial<Task>) => {
    await updateTask(id, updates);
    setSelectedTask(null);
    router.refresh();
  }, [router]);

  const handleDelete = useCallback(async (id: string) => {
    await removeTask(id);
    router.refresh();
  }, [router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          (target as HTMLElement).isContentEditable);

      // ESC: close panels/forms
      if (e.key === 'Escape') {
        if (selectedTask) {
          e.preventDefault();
          setSelectedTask(null);
          return;
        }
        if (showForm) {
          e.preventDefault();
          setShowForm(false);
          return;
        }
      }

      // N: open new task (when not typing)
      if (!isTyping && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setSelectedTask(null);
        setShowForm(true);
      }

      // E: edit selected task
      if (!isTyping && (e.key === 'e' || e.key === 'E') && selectedTask) {
        e.preventDefault();
        // Toggle edit mode - we'd need to track edit state in selectedTask
      }

      // Delete/Backspace: delete selected task
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTask && !isTyping) {
        e.preventDefault();
        if (confirm('Delete this task?')) {
          handleDelete(selectedTask.id);
          setSelectedTask(null);
        }
      }

      // Ctrl/Cmd+S: save if editing (handled by form submit)
      // Ctrl/Cmd+Enter: save update (handled by Ctrl+Enter in TaskDetailPanel)
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedTask, showForm, handleDelete, handleUpdate]);

  return (
    <div>
      {/* Add Task Form */}
      <div className="mb-8">
        {showForm ? (
          <form action={handleSubmit} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <input
              type="text"
              name="title"
              placeholder="Task title..."
              autoFocus
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] mb-3"
            />
            <textarea
              name="notes"
              placeholder="Notes (optional)..."
              rows={2}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] mb-3 resize-none"
            />
            <div className="flex flex-wrap items-center gap-3">
              <select
                name="status"
                defaultValue="todo"
                className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
              </select>
              <select
                name="priority"
                defaultValue="next"
                className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="now">🔴 Now</option>
                <option value="next">🟠 Next</option>
                <option value="later">⚪ Later</option>
              </select>
              <select
                name="assignee"
                defaultValue="tom"
                className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="tom">👤 Tom</option>
                <option value="molty">🦉 Molty</option>
              </select>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        <TaskColumn status="todo" tasks={todoTasks} onTaskClick={setSelectedTask} />
        <TaskColumn status="in-progress" tasks={inProgressTasks} onTaskClick={setSelectedTask} />
        <TaskColumn status="review" tasks={reviewTasks} onTaskClick={setSelectedTask} />
        <TaskColumn status="done" tasks={doneTasks} onTaskClick={setSelectedTask} />
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
