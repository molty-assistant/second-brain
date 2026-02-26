import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import ConvexSetupNotice from '@/components/ConvexSetupNotice';
import EmployeesClient from './ui/EmployeesClient';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function EmployeesPage() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');
  const hasConvex = !!process.env.NEXT_PUBLIC_CONVEX_URL;

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      <main className="flex-1 ml-64">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#3fb950]/10 rounded-xl">
              <Users className="w-8 h-8 text-[#3fb950]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Employees</h1>
              <p className="text-[#8b949e]">Real-time agent status & output</p>
            </div>
          </div>

          {hasConvex ? <EmployeesClient /> : <ConvexSetupNotice />}
        </div>
      </main>
    </div>
  );
}
