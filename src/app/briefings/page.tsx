import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import ConvexSetupNotice from '@/components/ConvexSetupNotice';
import BriefingsClient from './ui/BriefingsClient';
import { Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function BriefingsPage() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');
  const hasConvex = !!process.env.NEXT_PUBLIC_CONVEX_URL;

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      <main className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#f0883e]/10 rounded-xl">
              <Settings className="w-8 h-8 text-[#f0883e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Briefing Config</h1>
              <p className="text-[#8b949e]">Configure what appears in your AM & PM briefs</p>
            </div>
          </div>

          {hasConvex ? <BriefingsClient /> : <ConvexSetupNotice />}
        </div>
      </main>
    </div>
  );
}
