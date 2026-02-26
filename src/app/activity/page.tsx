import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import ConvexSetupNotice from '@/components/ConvexSetupNotice';
import ActivityClient from './ui/ActivityClient';
import { Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ActivityPage() {
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
              <Activity className="w-8 h-8 text-[#58a6ff]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Activity Feed</h1>
              <p className="text-[#8b949e]">Chronological log of work across agents</p>
            </div>
          </div>

          {hasConvex ? <ActivityClient /> : <ConvexSetupNotice />}
        </div>
      </main>
    </div>
  );
}
