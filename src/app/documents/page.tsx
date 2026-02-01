import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { FileText, Hash } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DocumentsPage() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      
      <main className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#a371f7]/10 rounded-xl">
              <FileText className="w-8 h-8 text-[#a371f7]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Documents</h1>
              <p className="text-[#8b949e]">Notes, frameworks, and insights</p>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid gap-4">
            {documents.map(doc => (
              <Link 
                key={doc.slug} 
                href={`/doc/${doc.slug}`}
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#58a6ff]/50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-[#e6edf3]">{doc.title}</h2>
                <p className="text-xs text-[#6e7681] mt-1">{doc.date}</p>
                
                {doc.excerpt && (
                  <p className="text-sm text-[#8b949e] mt-2 line-clamp-2">{doc.excerpt}</p>
                )}
                
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {doc.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center text-xs text-[#58a6ff]">
                        <Hash className="w-3 h-3" />{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}

            {documents.length === 0 && (
              <div className="text-center py-12 text-[#6e7681]">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No documents yet</p>
                <p className="text-sm mt-1">Add markdown files to content/documents/</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
