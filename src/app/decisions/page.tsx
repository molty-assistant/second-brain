import { getDecisions } from '@/lib/hub';
import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import { Brain } from 'lucide-react';

export const dynamic = 'force-dynamic';

const statusColors = {
  proposed: 'bg-[#a371f7]/20 text-[#a371f7]',
  decided: 'bg-[#3fb950]/20 text-[#3fb950]',
  superseded: 'bg-[#6e7681]/20 text-[#8b949e]',
};

export default async function DecisionsPage() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');
  const decisions = await getDecisions();

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      
      <main className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#6e7681]/10 rounded-xl">
              <Brain className="w-8 h-8 text-[#6e7681]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Decisions</h1>
              <p className="text-[#8b949e]">Architecture Decision Records</p>
            </div>
          </div>

          {/* Decisions List */}
          <div className="space-y-4">
            {decisions.map(decision => (
              <div 
                key={decision.slug} 
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-semibold text-[#e6edf3]">{decision.title}</h2>
                    <p className="text-xs text-[#6e7681] mt-1">{decision.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[decision.status]}`}>
                    {decision.status}
                  </span>
                </div>

                {decision.context && (
                  <div className="mt-3">
                    <h3 className="text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-1">Context</h3>
                    <p className="text-sm text-[#e6edf3]">{decision.context}</p>
                  </div>
                )}

                {decision.decision && (
                  <div className="mt-3">
                    <h3 className="text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-1">Decision</h3>
                    <p className="text-sm text-[#e6edf3]">{decision.decision}</p>
                  </div>
                )}

                {decision.htmlContent && (
                  <div 
                    className="prose prose-invert prose-sm max-w-none mt-4 pt-4 border-t border-[#30363d]"
                    dangerouslySetInnerHTML={{ __html: decision.htmlContent }}
                  />
                )}
              </div>
            ))}

            {decisions.length === 0 && (
              <div className="text-center py-12 text-[#6e7681]">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No decisions logged yet</p>
                <p className="text-sm mt-1">Add markdown files to content/decisions/</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
