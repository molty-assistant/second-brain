import { getDocument, getDocumentsByCategory, getAllDocuments } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import { notFound } from 'next/navigation';
import { Calendar, FileText, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const docs = getAllDocuments();
  return docs.map((doc) => ({
    slug: doc.slug.split('/'),
  }));
}

export default async function DocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const fullSlug = slug.join('/');
  const document = await getDocument(fullSlug);
  
  if (!document) {
    notFound();
  }

  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      
      <main className="flex-1 ml-64">
        <div className="max-w-3xl mx-auto px-8 py-12">
          {/* Back link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-[#8b949e] hover:text-[#e6edf3] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Document Header */}
          <header className="mb-8 pb-6 border-b border-[#30363d]">
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                document.category === 'journal'
                  ? 'bg-[#a371f7]/10 text-[#a371f7]'
                  : 'bg-[#58a6ff]/10 text-[#58a6ff]'
              }`}>
                {document.category === 'journal' ? (
                  <Calendar className="w-3.5 h-3.5" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                {document.category === 'journal' ? 'Journal' : 'Document'}
              </span>
              <span className="text-[#6e7681] text-sm">{document.date}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-[#e6edf3] mb-4">
              {document.title}
            </h1>
            
            {document.tags && document.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-[#6e7681]" />
                {document.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-0.5 bg-[#21262d] text-[#8b949e] text-sm rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Document Content */}
          <article 
            className="prose animate-fadeIn"
            dangerouslySetInnerHTML={{ __html: document.htmlContent || '' }}
          />
        </div>
      </main>
    </div>
  );
}
