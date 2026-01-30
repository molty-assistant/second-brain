import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import { FileText, Calendar, Brain, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');
  
  const recentItems = [...documents, ...journalEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      
      <main className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#58a6ff]/10 rounded-xl">
                <Brain className="w-8 h-8 text-[#58a6ff]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#e6edf3]">Second Brain</h1>
                <p className="text-[#8b949e]">Your personal knowledge base</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#58a6ff]" />
                <div>
                  <div className="text-2xl font-bold text-[#e6edf3]">{documents.length}</div>
                  <div className="text-sm text-[#8b949e]">Documents</div>
                </div>
              </div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#a371f7]" />
                <div>
                  <div className="text-2xl font-bold text-[#e6edf3]">{journalEntries.length}</div>
                  <div className="text-sm text-[#8b949e]">Journal Entries</div>
                </div>
              </div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#f0883e]" />
                <div>
                  <div className="text-2xl font-bold text-[#e6edf3]">{documents.length + journalEntries.length}</div>
                  <div className="text-sm text-[#8b949e]">Total Items</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Items */}
          <div>
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">Recent</h2>
            
            {recentItems.length > 0 ? (
              <div className="grid gap-3">
                {recentItems.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/doc/${item.slug}`}
                    className="block bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        item.category === 'journal' 
                          ? 'bg-[#a371f7]/10' 
                          : 'bg-[#58a6ff]/10'
                      }`}>
                        {item.category === 'journal' ? (
                          <Calendar className="w-4 h-4 text-[#a371f7]" />
                        ) : (
                          <FileText className="w-4 h-4 text-[#58a6ff]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-[#8b949e] mt-1 line-clamp-2">
                          {item.excerpt || 'No preview available'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-[#6e7681]">{item.date}</span>
                          {item.tags && item.tags.length > 0 && (
                            <>
                              <span className="text-[#30363d]">·</span>
                              {item.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs text-[#58a6ff]">#{tag}</span>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
                <Brain className="w-12 h-12 text-[#30363d] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#e6edf3] mb-2">Your brain is empty</h3>
                <p className="text-[#8b949e] text-sm">
                  Documents and journal entries will appear here as they are created.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
