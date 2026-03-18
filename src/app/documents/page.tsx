import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import { FileText } from 'lucide-react';
import DocumentsClient from '@/app/ui/DocumentsClient';

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
              <p className="text-[#8b949e]">
                {documents.length} {documents.length === 1 ? 'document' : 'documents'} · notes,
                frameworks, and insights
              </p>
            </div>
          </div>

          <DocumentsClient documents={documents} />
        </div>
      </main>
    </div>
  );
}
