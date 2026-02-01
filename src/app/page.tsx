import { getDocumentsByCategory } from '@/lib/documents';
import { getTasks, getPipelineItems, getStats } from '@/lib/hub';
import Link from 'next/link';
import { 
  Brain, 
  CheckSquare, 
  FileText, 
  Calendar, 
  Lightbulb, 
  Rocket,
  ArrowRight,
  Clock
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
    year: 'numeric'
  });
}

export default function Dashboard() {
  const stats = getStats();
  const tasksNow = getTasks().filter(t => t.status === 'now').slice(0, 5);
  const recentDocs = getDocumentsByCategory('documents').slice(0, 3);
  const recentJournal = getDocumentsByCategory('journal').slice(0, 3);
  const contentIdeas = getPipelineItems().filter(p => p.status === 'idea').slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#58a6ff]/10 rounded-lg">
              <Brain className="w-6 h-6 text-[#58a6ff]" />
            </div>
            <h1 className="text-2xl font-bold text-[#e6edf3]">Mission Control</h1>
          </div>
          <p className="text-[#8b949e] text-lg">{getGreeting()}, Tom</p>
          <p className="text-[#6e7681] text-sm">{formatDate(new Date())}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <Link href="/tasks" className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="w-4 h-4 text-[#f0883e]" />
              <span className="text-xs text-[#8b949e]">Now</span>
            </div>
            <div className="text-2xl font-bold text-[#e6edf3]">{stats.tasksNow}</div>
          </Link>
          <Link href="/tasks" className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[#a371f7]" />
              <span className="text-xs text-[#8b949e]">Next</span>
            </div>
            <div className="text-2xl font-bold text-[#e6edf3]">{stats.tasksNext}</div>
          </Link>
          <Link href="/tasks" className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-[#6e7681]" />
              <span className="text-xs text-[#8b949e]">Later</span>
            </div>
            <div className="text-2xl font-bold text-[#e6edf3]">{stats.tasksLater}</div>
          </Link>
          <Link href="/content" className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-[#58a6ff]" />
              <span className="text-xs text-[#8b949e]">Ideas</span>
            </div>
            <div className="text-2xl font-bold text-[#e6edf3]">{stats.contentIdeas}</div>
          </Link>
          <Link href="/content" className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Rocket className="w-4 h-4 text-[#3fb950]" />
              <span className="text-xs text-[#8b949e]">Drafting</span>
            </div>
            <div className="text-2xl font-bold text-[#e6edf3]">{stats.contentDrafting}</div>
          </Link>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/tasks" className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#f0883e]/50 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#f0883e]" />
                <h2 className="font-semibold text-[#e6edf3]">Tasks</h2>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-[#f0883e] transition-colors" />
            </div>
            <p className="text-sm text-[#8b949e]">Now / Next / Later board</p>
          </Link>
          
          <Link href="/content" className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#58a6ff]/50 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#58a6ff]" />
                <h2 className="font-semibold text-[#e6edf3]">Content</h2>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-[#58a6ff] transition-colors" />
            </div>
            <p className="text-sm text-[#8b949e]">Posts, articles, talks pipeline</p>
          </Link>
          
          <Link href="/projects" className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#3fb950]/50 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-[#3fb950]" />
                <h2 className="font-semibold text-[#e6edf3]">Projects</h2>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-[#3fb950] transition-colors" />
            </div>
            <p className="text-sm text-[#8b949e]">LightScout, Rest+Rise</p>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/documents" className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#a371f7]/50 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#a371f7]" />
                <h2 className="font-semibold text-[#e6edf3]">Documents</h2>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-[#a371f7] transition-colors" />
            </div>
            <p className="text-sm text-[#8b949e]">Notes, frameworks, insights</p>
          </Link>
          
          <Link href="/journal" className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#a371f7]/50 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#a371f7]" />
                <h2 className="font-semibold text-[#e6edf3]">Journal</h2>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-[#a371f7] transition-colors" />
            </div>
            <p className="text-sm text-[#8b949e]">Daily entries</p>
          </Link>
          
          <Link href="/decisions" className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#6e7681]/50 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#6e7681]" />
                <h2 className="font-semibold text-[#e6edf3]">Decisions</h2>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-[#8b949e] transition-colors" />
            </div>
            <p className="text-sm text-[#8b949e]">Decision log</p>
          </Link>
        </div>

        {/* Active Tasks */}
        {tasksNow.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#e6edf3]">Active Now</h2>
              <Link href="/tasks" className="text-sm text-[#58a6ff] hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {tasksNow.map(task => (
                <div key={task.slug} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#f0883e] rounded-full"></div>
                    <span className="text-[#e6edf3]">{task.title}</span>
                  </div>
                  {task.content && (
                    <p className="text-sm text-[#8b949e] mt-1 ml-4">{task.content.substring(0, 100)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Ideas */}
        {contentIdeas.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#e6edf3]">Content Ideas</h2>
              <Link href="/content" className="text-sm text-[#58a6ff] hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {contentIdeas.map(item => (
                <div key={item.slug} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      item.type === 'post' ? 'bg-[#58a6ff]/20 text-[#58a6ff]' :
                      item.type === 'article' ? 'bg-[#a371f7]/20 text-[#a371f7]' :
                      'bg-[#3fb950]/20 text-[#3fb950]'
                    }`}>{item.type}</span>
                    <span className="text-[#e6edf3]">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Docs */}
        {recentDocs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#e6edf3]">Recent Documents</h2>
              <Link href="/documents" className="text-sm text-[#58a6ff] hover:underline">View all</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {recentDocs.map(doc => (
                <Link 
                  key={doc.slug} 
                  href={`/doc/${doc.slug}`}
                  className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors"
                >
                  <h3 className="font-medium text-[#e6edf3] mb-1">{doc.title}</h3>
                  <p className="text-xs text-[#6e7681]">{doc.date}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
