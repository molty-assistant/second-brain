import { getDocumentsByCategory } from '@/lib/documents';
import { getTasks, getPipelineItems, getStats } from '@/lib/hub';
import Link from 'next/link';
import TodayCard from '@/app/ui/TodayCard';
import AgentStatusBar from '@/app/ui/AgentStatusBar';
import CalendarPreview from '@/app/ui/CalendarPreview';
import ActivityFeed from '@/app/ui/ActivityFeed';
import {
  Brain,
  CheckSquare,
  FileText,
  Calendar,
  Lightbulb,
  Rocket,
  ArrowRight,
  Users,
  ClipboardList,
  BookOpen,
  Zap,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const ASSIGNEE_STYLES: Record<string, { color: string; label: string }> = {
  tom: { color: 'bg-[#a371f7]/15 text-[#a371f7]', label: '👤 Tom' },
  molty: { color: 'bg-[#58a6ff]/15 text-[#58a6ff]', label: '🦉 Molty' },
  eddy: { color: 'bg-[#f0883e]/15 text-[#f0883e]', label: '🧁 Eddy' },
  codex: { color: 'bg-[#3fb950]/15 text-[#3fb950]', label: '⚡ Codex' },
  'social-manager': { color: 'bg-[#d29922]/15 text-[#d29922]', label: '📱 Social' },
  gemini: { color: 'bg-[#da3633]/15 text-[#da3633]', label: '✨ Gemini' },
  perplexity: { color: 'bg-[#6e7681]/15 text-[#8b949e]', label: '🔍 Perplexity' },
};

function assigneeStyle(assignee: string) {
  return ASSIGNEE_STYLES[assignee] ?? ASSIGNEE_STYLES.tom;
}

export default function Dashboard() {
  const stats = getStats();
  const allTasks = getTasks();
  // Exclude in-progress tasks from urgentTasks — they're already shown in the In Progress section
  const urgentTasks = allTasks
    .filter((t) => t.status !== 'done' && t.status !== 'in-progress' && t.priority === 'now')
    .slice(0, 4);
  const inProgressTasks = allTasks.filter((t) => t.status === 'in-progress').slice(0, 5);
  const recentDocs = getDocumentsByCategory('documents').slice(0, 4);
  const contentIdeas = getPipelineItems().filter((p) => p.status === 'idea').slice(0, 3);
  const hasConvex = !!process.env.NEXT_PUBLIC_CONVEX_URL;

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#58a6ff]/10 rounded-lg">
                <Brain className="w-5 h-5 text-[#58a6ff]" />
              </div>
              <h1 className="text-xl font-bold text-[#e6edf3]">Mission Control</h1>
            </div>
            <p className="text-[#8b949e] text-sm pl-1">
              {getGreeting()}, Tom · <span className="text-[#6e7681]">{formatDate(new Date())}</span>
            </p>
          </div>

          {/* Quick stats - compact row */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/tasks" className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 hover:border-[#58a6ff]/40 transition-colors">
              <div className="w-1.5 h-1.5 bg-[#8b949e] rounded-full" />
              <span className="text-xs text-[#8b949e]">To Do</span>
              <span className="text-sm font-bold text-[#e6edf3]">{stats.tasksTodo}</span>
            </Link>
            <Link href="/tasks" className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 hover:border-[#58a6ff]/40 transition-colors">
              <div className="w-1.5 h-1.5 bg-[#58a6ff] rounded-full animate-pulse" />
              <span className="text-xs text-[#8b949e]">Active</span>
              <span className="text-sm font-bold text-[#e6edf3]">{stats.tasksInProgress}</span>
            </Link>
            <Link href="/tasks" className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 hover:border-[#a371f7]/40 transition-colors">
              <div className="w-1.5 h-1.5 bg-[#a371f7] rounded-full" />
              <span className="text-xs text-[#8b949e]">Review</span>
              <span className="text-sm font-bold text-[#e6edf3]">{stats.tasksReview}</span>
            </Link>
            <Link href="/content" className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 hover:border-[#58a6ff]/40 transition-colors">
              <Lightbulb className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span className="text-xs text-[#8b949e]">Ideas</span>
              <span className="text-sm font-bold text-[#e6edf3]">{stats.contentIdeas}</span>
            </Link>
          </div>
        </div>

        {/* Agent Status Bar — full width, prominent */}
        {hasConvex && <AgentStatusBar />}

        {/* Main command center layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* LEFT: Active work */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today card */}
            <TodayCard />

            {/* In Progress */}
            {inProgressTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#58a6ff] rounded-full animate-pulse" />
                    <h2 className="text-sm font-semibold text-[#e6edf3]">In Progress</h2>
                  </div>
                  <Link href="/tasks" className="text-xs text-[#58a6ff] hover:underline">
                    View board →
                  </Link>
                </div>
                <div className="space-y-2">
                  {inProgressTasks.map((task) => (
                    <Link
                      key={task.id}
                      href="/tasks"
                      className="flex items-center justify-between bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3 hover:border-[#58a6ff]/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-1.5 h-1.5 bg-[#58a6ff] rounded-full shrink-0" />
                        <span className="text-sm text-[#e6edf3] truncate">{task.title}</span>
                        {task.priority === 'now' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f85149]/15 text-[#f85149] shrink-0">
                            Now
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded shrink-0 ml-3 ${assigneeStyle(task.assignee).color}`}
                      >
                        {assigneeStyle(task.assignee).label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Priority: Now */}
            {urgentTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#f85149]" />
                    <h2 className="text-sm font-semibold text-[#e6edf3]">Priority: Now</h2>
                  </div>
                  <Link href="/tasks" className="text-xs text-[#58a6ff] hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="space-y-2">
                  {urgentTasks.map((task) => (
                    <Link
                      key={task.id}
                      href="/tasks"
                      className="flex items-center justify-between bg-[#161b22] border border-[#f85149]/20 rounded-lg px-4 py-3 hover:border-[#f85149]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            task.status === 'todo'
                              ? 'bg-[#8b949e]'
                              : task.status === 'in-progress'
                              ? 'bg-[#58a6ff]'
                              : 'bg-[#a371f7]'
                          }`}
                        />
                        <span className="text-sm text-[#e6edf3] truncate">{task.title}</span>
                        <span className="text-[10px] text-[#6e7681] shrink-0">({task.status})</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded shrink-0 ml-3 ${assigneeStyle(task.assignee).color}`}
                      >
                        {assigneeStyle(task.assignee).label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state when no active work */}
            {inProgressTasks.length === 0 && urgentTasks.length === 0 && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
                <CheckSquare className="w-8 h-8 text-[#3fb950] mx-auto mb-2 opacity-60" />
                <p className="text-sm text-[#8b949e]">No active work right now.</p>
                <Link href="/tasks" className="text-xs text-[#58a6ff] hover:underline mt-1 inline-block">
                  Open task board →
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: Situational awareness */}
          <div className="space-y-6">
            {/* Calendar preview */}
            {hasConvex && <CalendarPreview />}

            {/* Live activity feed */}
            {hasConvex && <ActivityFeed />}

            {/* Recent docs - quick access */}
            {recentDocs.length > 0 && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#a371f7]" />
                    <span className="text-sm font-semibold text-[#e6edf3]">Recent Docs</span>
                  </div>
                  <Link href="/documents" className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1">
                    Browse <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-[#30363d]">
                  {recentDocs.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`/doc/${doc.slug}`}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#21262d]/50 transition-colors group"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#6e7681] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#e6edf3] group-hover:text-[#a371f7] transition-colors line-clamp-1">
                          {doc.title}
                        </div>
                        <div className="text-[10px] text-[#6e7681] mt-0.5">{doc.date}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Nav quick links */}
            <div className="grid grid-cols-2 gap-2">
              <Link href="/backlog" className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2.5 hover:border-[#f0883e]/40 transition-colors group">
                <ClipboardList className="w-3.5 h-3.5 text-[#f0883e]" />
                <span className="text-xs text-[#8b949e] group-hover:text-[#e6edf3] transition-colors">Backlog</span>
              </Link>
              <Link href="/employees" className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2.5 hover:border-[#3fb950]/40 transition-colors group">
                <Users className="w-3.5 h-3.5 text-[#3fb950]" />
                <span className="text-xs text-[#8b949e] group-hover:text-[#e6edf3] transition-colors">Agents</span>
              </Link>
              <Link href="/calendar" className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2.5 hover:border-[#a371f7]/40 transition-colors group">
                <Calendar className="w-3.5 h-3.5 text-[#a371f7]" />
                <span className="text-xs text-[#8b949e] group-hover:text-[#e6edf3] transition-colors">Calendar</span>
              </Link>
              <Link href="/content" className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2.5 hover:border-[#58a6ff]/40 transition-colors group">
                <Lightbulb className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span className="text-xs text-[#8b949e] group-hover:text-[#e6edf3] transition-colors">Content</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom strip: Content pipeline + projects */}
        <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-[#30363d]">
          <Link href="/tasks" className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#f0883e]/50 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#f0883e]" />
                <span className="text-sm font-medium text-[#e6edf3]">Tasks</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#6e7681] group-hover:text-[#f0883e] transition-colors" />
            </div>
            <p className="text-xs text-[#6e7681] mt-1">Kanban board</p>
          </Link>

          <Link href="/projects" className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#3fb950]/50 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-[#3fb950]" />
                <span className="text-sm font-medium text-[#e6edf3]">Projects</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#6e7681] group-hover:text-[#3fb950] transition-colors" />
            </div>
            <p className="text-xs text-[#6e7681] mt-1">LightScout, Rest+Rise</p>
          </Link>

          <Link href="/decisions" className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#6e7681]/50 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#6e7681]" />
                <span className="text-sm font-medium text-[#e6edf3]">Decisions</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#6e7681] group-hover:text-[#8b949e] transition-colors" />
            </div>
            <p className="text-xs text-[#6e7681] mt-1">Decision log</p>
          </Link>
        </div>

        {/* Content ideas — compact bottom section */}
        {contentIdeas.length > 0 && (
          <div className="mt-4 bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#58a6ff]" />
                <span className="text-sm font-medium text-[#e6edf3]">Content Ideas</span>
              </div>
              <Link href="/content" className="text-xs text-[#58a6ff] hover:underline">
                Pipeline →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {contentIdeas.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5"
                >
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      item.type === 'post'
                        ? 'bg-[#58a6ff]/15 text-[#58a6ff]'
                        : item.type === 'article'
                        ? 'bg-[#a371f7]/15 text-[#a371f7]'
                        : 'bg-[#3fb950]/15 text-[#3fb950]'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-xs text-[#e6edf3]">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
