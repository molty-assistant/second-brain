'use client';

import { useState } from 'react';
import { createTask, updateTaskStatus, removeTask } from '@/app/actions';
import { Plus, MoreHorizontal, Trash2, ArrowRight, Clock, User, Bot, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
  slug: string;
  title: string;
  status: 'now' | 'next' | 'later' | 'done';
  assignee: 'tom' | 'molty';
  created: string;
  completed?: string;
  notes?: string;
}

interface TaskBoardProps {
  nowTasks: Task[];
  nextTasks: Task[];
  laterTasks: Task[];
  doneTasks: Task[];
}

function AssigneeBadge({ assignee }: { assignee: 'tom' | 'molty' }) {
  if (assignee === 'molty') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-[#58a6ff]/20 text-[#58a6ff]">
        <Bot className="w-3 h-3" />
        Molty
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-[#a371f7]/20 text-[#a371f7]">
      <User className="w-3 h-3" />
      Tom
    </span>
  );
}

function TaskCard({ task, onMove, onDelete }: { 
  task: Task; 
  onMove: (slug: string, newStatus: string) => void;
  onDelete: (slug: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  
  const allStatuses = ['now', 'next', 'later', 'done'];
  const statusOptions = allStatuses.filter(s => s !== task.status);
  
  return (
    <div className={`bg-[#0d1117] border border-[#30363d] rounded-lg p-3 hover:border-[#58a6ff]/30 transition-colors group ${task.status === 'done' ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-medium text-[#e6edf3] ${task.status === 'done' ? 'line-through text-[#8b949e]' : ''}`}>
              {task.title}
            </h4>
          </div>
          {task.notes && (
            <p className="text-xs text-[#8b949e] line-clamp-2 mb-2">{task.notes}</p>
          )}
          <div className="flex items-center gap-2">
            <AssigneeBadge assignee={task.assignee} />
            <span className="flex items-center gap-1 text-xs text-[#6e7681]">
              <Clock className="w-3 h-3" />
              {task.status === 'done' && task.completed ? task.completed : task.created}
            </span>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-[#6e7681] hover:text-[#e6edf3] opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-6 z-10 bg-[#161b22] border border-[#30363d] rounded-lg shadow-lg py-1 min-w-36">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => {
                    onMove(task.slug, status);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-[#e6edf3] hover:bg-[#21262d] transition-colors"
                >
                  {status === 'done' ? <Check className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                  {status === 'done' ? 'Mark done' : `Move to ${status}`}
                </button>
              ))}
              <hr className="border-[#30363d] my-1" />
              <button
                onClick={() => {
                  onDelete(task.slug);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-[#f85149] hover:bg-[#21262d] transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskColumn({ 
  title, 
  description, 
  tasks, 
  status,
  color,
  onMove,
  onDelete,
  collapsible = false,
}: { 
  title: string; 
  description: string;
  tasks: Task[];
  status: string;
  color: string;
  onMove: (slug: string, newStatus: string) => void;
  onDelete: (slug: string) => void;
  collapsible?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(collapsible);
  
  return (
    <div className="flex-1 min-w-[280px]">
      <button 
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
        className={`flex items-center gap-2 mb-4 ${collapsible ? 'cursor-pointer hover:opacity-80' : ''}`}
      >
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <h3 className="font-semibold text-[#e6edf3]">{title}</h3>
        <span className="text-sm text-[#6e7681]">{tasks.length}</span>
        {collapsible && (
          <span className="text-xs text-[#6e7681]">{isCollapsed ? '(show)' : '(hide)'}</span>
        )}
      </button>
      {!isCollapsed && (
        <>
          <p className="text-xs text-[#8b949e] mb-4">{description}</p>
          
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskCard 
                key={task.slug} 
                task={task} 
                onMove={onMove}
                onDelete={onDelete}
              />
            ))}
            {tasks.length === 0 && (
              <div className="border border-dashed border-[#30363d] rounded-lg p-4 text-center">
                <p className="text-sm text-[#6e7681]">No tasks</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function TaskBoard({ nowTasks, nextTasks, laterTasks, doneTasks }: TaskBoardProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    await createTask(formData);
    setShowForm(false);
    setIsSubmitting(false);
    router.refresh();
  };
  
  const handleMove = async (slug: string, newStatus: string) => {
    await updateTaskStatus(slug, newStatus);
    router.refresh();
  };
  
  const handleDelete = async (slug: string) => {
    await removeTask(slug);
    router.refresh();
  };

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
            <input
              type="text"
              name="notes"
              placeholder="Notes (optional)..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] mb-3"
            />
            <div className="flex flex-wrap items-center gap-3">
              <select 
                name="status" 
                defaultValue="now"
                className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="now">Now (Today)</option>
                <option value="next">Next (This Week)</option>
                <option value="later">Later (Backlog)</option>
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
        <TaskColumn
          title="Now"
          description="Doing today"
          tasks={nowTasks}
          status="now"
          color="bg-[#3fb950]"
          onMove={handleMove}
          onDelete={handleDelete}
        />
        <TaskColumn
          title="Next"
          description="This week"
          tasks={nextTasks}
          status="next"
          color="bg-[#f0883e]"
          onMove={handleMove}
          onDelete={handleDelete}
        />
        <TaskColumn
          title="Later"
          description="Backlog"
          tasks={laterTasks}
          status="later"
          color="bg-[#8b949e]"
          onMove={handleMove}
          onDelete={handleDelete}
        />
        <TaskColumn
          title="Done"
          description="Completed"
          tasks={doneTasks}
          status="done"
          color="bg-[#6e7681]"
          onMove={handleMove}
          onDelete={handleDelete}
          collapsible={true}
        />
      </div>
    </div>
  );
}
