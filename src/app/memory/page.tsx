import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import ConvexSetupNotice from '@/components/ConvexSetupNotice';
import MemoryClient from './ui/MemoryClient';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MemoryPage() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');
  const hasConvex = !!process.env.NEXT_PUBLIC_CONVEX_URL;

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      <main className="flex-1 ml-64">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#58a6ff]/10 rounded-xl">
              <BookOpen className="w-8 h-8 text-[#58a6ff]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Daily Memory</h1>
              <p className="text-[#8b949e]">Conversation logs, decisions, and action items by day</p>
            </div>
          </div>

          {hasConvex ? <MemoryClient /> : <ConvexSetupNotice />}
        </div>
      </main>
    </div>
  );
}
