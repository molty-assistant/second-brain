import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import ConvexSetupNotice from '@/components/ConvexSetupNotice';
import SearchClient from './ui/SearchClient';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');
  const hasConvex = !!process.env.NEXT_PUBLIC_CONVEX_URL;

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      <main className="flex-1 ml-64">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#f0883e]/10 rounded-xl">
              <Search className="w-8 h-8 text-[#f0883e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Search</h1>
              <p className="text-[#8b949e]">Search across activities, tasks, and employees</p>
            </div>
          </div>

          {hasConvex ? <SearchClient /> : <ConvexSetupNotice />}
        </div>
      </main>
    </div>
  );
}
