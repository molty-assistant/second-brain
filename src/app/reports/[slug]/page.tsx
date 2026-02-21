import Sidebar from '@/components/Sidebar';
import { getDocumentsByCategory } from '@/lib/documents';
import { getReport } from '@/lib/reports';
import Link from 'next/link';
import { ChevronLeft, FileClock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');

  const report = await getReport(slug);

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      <main className="flex-1 ml-64">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="mb-6">
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 text-sm text-[#8b949e] hover:text-[#e6edf3]"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to reports
            </Link>
          </div>

          {!report ? (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <h1 className="text-lg font-semibold text-[#e6edf3]">Report not found</h1>
              <p className="text-sm text-[#8b949e] mt-2">
                Couldn&apos;t load <code className="text-[#e6edf3]">{slug}</code>
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-[#58a6ff]/10 rounded-xl">
                  <FileClock className="w-8 h-8 text-[#58a6ff]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#e6edf3]">{report.title}</h1>
                  <p className="text-[#8b949e]">{report.date}</p>
                </div>
              </div>

              <article
                className="prose prose-invert max-w-none prose-a:text-[#58a6ff] prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-[#30363d]"
                dangerouslySetInnerHTML={{ __html: report.htmlContent }}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
