import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import ConvexSetupNotice from '@/components/ConvexSetupNotice';
import CalendarClient from './ui/CalendarClient';
import { Calendar as CalendarIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');
  const hasConvex = !!process.env.NEXT_PUBLIC_CONVEX_URL;

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      <main className="flex-1 ml-64">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#a371f7]/10 rounded-xl">
              <CalendarIcon className="w-8 h-8 text-[#a371f7]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Calendar</h1>
              <p className="text-[#8b949e]">Weekly view of scheduled tasks</p>
            </div>
          </div>

          {hasConvex ? <CalendarClient /> : <ConvexSetupNotice />}
        </div>
      </main>
    </div>
  );
}
