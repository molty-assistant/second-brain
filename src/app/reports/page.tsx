import Sidebar from '@/components/Sidebar';
import { getDocumentsByCategory } from '@/lib/documents';
import { getAllReports } from '@/lib/reports';
import Link from 'next/link';
import { FileClock, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

function EmptyState({ reportsDirExists }: { reportsDirExists: boolean }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
      <h2 className="text-lg font-semibold text-[#e6edf3] mb-2">No reports found</h2>
      <p className="text-sm text-[#8b949e]">
        {reportsDirExists
          ? 'There are no markdown files in the reports directory yet.'
          : 'Reports directory not found. Set MISSION_CONTROL_REPORTS_DIR to enable this page.'}
      </p>
      <p className="text-sm text-[#8b949e] mt-3">
        Expected path (default):{' '}
        <code className="text-[#e6edf3]">../memory/reports</code>
      </p>
    </div>
  );
}

export default function ReportsPage() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');

  const reports = getAllReports();
  const reportsDirExists = reports.length > 0 || !!process.env.MISSION_CONTROL_REPORTS_DIR;

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      <main className="flex-1 ml-64">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#58a6ff]/10 rounded-xl">
              <FileClock className="w-8 h-8 text-[#58a6ff]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Nightly Reports</h1>
              <p className="text-[#8b949e]">Auto-written summaries from autonomous build sessions</p>
            </div>
          </div>

          {reports.length === 0 ? (
            <EmptyState reportsDirExists={reportsDirExists} />
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <Link
                  key={r.slug}
                  href={`/reports/${encodeURIComponent(r.slug)}`}
                  className="block bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[#e6edf3] font-semibold">{r.title}</div>
                      <div className="text-xs text-[#6e7681] mt-1">{r.date}</div>
                      {r.excerpt ? (
                        <div className="text-sm text-[#8b949e] mt-2 leading-relaxed">
                          {r.excerpt}
                          {r.excerpt.length >= 220 ? '…' : ''}
                        </div>
                      ) : null}
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#6e7681] mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
