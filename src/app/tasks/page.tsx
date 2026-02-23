import { getTasks } from '@/lib/hub';
import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import TaskBoard from '@/components/TaskBoard';
import { CheckSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function TasksPage() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');
  const tasks = getTasks();

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      
      <main className="flex-1 ml-64">
        <div className="max-w-6xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#3fb950]/10 rounded-xl">
              <CheckSquare className="w-8 h-8 text-[#3fb950]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Tasks</h1>
              <p className="text-[#8b949e]">To Do → In Progress → Review → Done</p>
              <p className="text-xs text-[#6e7681] mt-1">Shortcuts: <kbd className="px-1.5 py-0.5 border border-[#30363d] rounded bg-[#0d1117]">N</kbd> new task, <kbd className="px-1.5 py-0.5 border border-[#30363d] rounded bg-[#0d1117]">E</kbd> edit task, <kbd className="px-1.5 py-0.5 border border-[#30363d] rounded bg-[#0d1117]">Del</kbd> delete task, <kbd className="px-1.5 py-0.5 border border-[#30363d] rounded bg-[#0d1117]">Esc</kbd> close</p>
            </div>
          </div>

          <TaskBoard tasks={tasks} />
        </div>
      </main>
    </div>
  );
}
