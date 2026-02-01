import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function JournalPage() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');

  // Group by month
  const grouped = journalEntries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const key = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, typeof journalEntries>);

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      
      <main className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#a371f7]/10 rounded-xl">
              <Calendar className="w-8 h-8 text-[#a371f7]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Journal</h1>
              <p className="text-[#8b949e]">Daily entries and reflections</p>
            </div>
          </div>

          {/* Entries by Month */}
          <div className="space-y-8">
            {Object.entries(grouped).map(([month, entries]) => (
              <div key={month}>
                <h2 className="text-sm font-medium text-[#8b949e] uppercase tracking-wide mb-3">
                  {month}
                </h2>
                <div className="space-y-2">
                  {entries.map(entry => (
                    <Link 
                      key={entry.slug} 
                      href={`/doc/${entry.slug}`}
                      className="block bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[#e6edf3]">{entry.title}</h3>
                        <span className="text-xs text-[#6e7681]">{entry.date}</span>
                      </div>
                      {entry.excerpt && (
                        <p className="text-sm text-[#8b949e] mt-1 line-clamp-1">{entry.excerpt}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {journalEntries.length === 0 && (
              <div className="text-center py-12 text-[#6e7681]">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No journal entries yet</p>
                <p className="text-sm mt-1">Add markdown files to content/journal/</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
