'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  Calendar, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Brain,
  Hash
} from 'lucide-react';

interface DocumentMeta {
  slug: string;
  title: string;
  date: string;
  category: 'documents' | 'journal';
  tags?: string[];
  excerpt?: string;
}

interface SidebarProps {
  documents: DocumentMeta[];
  journalEntries: DocumentMeta[];
}

export default function Sidebar({ documents, journalEntries }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    documents: true,
    journal: true,
  });
  const pathname = usePathname();

  const toggleSection = (section: 'documents' | 'journal') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filterItems = (items: DocumentMeta[]) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  };

  const filteredDocs = filterItems(documents);
  const filteredJournal = filterItems(journalEntries);

  return (
    <aside className="w-64 h-screen bg-[#161b22] border-r border-[#30363d] flex flex-col fixed left-0 top-0">
      {/* Header */}
      <div className="p-4 border-b border-[#30363d]">
        <Link href="/" className="flex items-center gap-2 text-[#e6edf3] hover:text-white transition-colors">
          <Brain className="w-5 h-5 text-[#58a6ff]" />
          <span className="font-semibold text-lg">Second Brain</span>
        </Link>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[#30363d]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 pl-9 pr-3 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-colors"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* Documents Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('documents')}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium transition-colors"
          >
            {expandedSections.documents ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <FileText className="w-4 h-4" />
            <span>Documents</span>
            <span className="ml-auto text-xs text-[#6e7681]">{filteredDocs.length}</span>
          </button>
          
          {expandedSections.documents && (
            <div className="ml-4 mt-1 space-y-0.5">
              {filteredDocs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/doc/${doc.slug}`}
                  className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                    pathname === `/doc/${doc.slug}`
                      ? 'bg-[#21262d] text-[#e6edf3]'
                      : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/50'
                  }`}
                >
                  <div className="truncate">{doc.title}</div>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {doc.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs text-[#58a6ff] flex items-center">
                          <Hash className="w-3 h-3" />{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
              {filteredDocs.length === 0 && (
                <div className="px-3 py-2 text-sm text-[#6e7681]">No documents yet</div>
              )}
            </div>
          )}
        </div>

        {/* Journal Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('journal')}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium transition-colors"
          >
            {expandedSections.journal ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Calendar className="w-4 h-4" />
            <span>Journal</span>
            <span className="ml-auto text-xs text-[#6e7681]">{filteredJournal.length}</span>
          </button>
          
          {expandedSections.journal && (
            <div className="ml-4 mt-1 space-y-0.5">
              {filteredJournal.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/doc/${entry.slug}`}
                  className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                    pathname === `/doc/${entry.slug}`
                      ? 'bg-[#21262d] text-[#e6edf3]'
                      : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]/50'
                  }`}
                >
                  <div className="truncate">{entry.title}</div>
                  <div className="text-xs text-[#6e7681]">{entry.date}</div>
                </Link>
              ))}
              {filteredJournal.length === 0 && (
                <div className="px-3 py-2 text-sm text-[#6e7681]">No journal entries yet</div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#30363d] text-xs text-[#6e7681]">
        {documents.length + journalEntries.length} total items
      </div>
    </aside>
  );
}
