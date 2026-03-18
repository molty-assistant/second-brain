'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, Hash, Search, X } from 'lucide-react';

type DocumentMeta = {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  excerpt?: string;
};

export default function DocumentsClient({ documents }: { documents: DocumentMeta[] }) {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const doc of documents) {
      for (const tag of doc.tags ?? []) tags.add(tag);
    }
    return Array.from(tags).sort();
  }, [documents]);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (activeTag && !(doc.tags ?? []).includes(activeTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          doc.title.toLowerCase().includes(q) ||
          (doc.excerpt ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [documents, activeTag, search]);

  return (
    <div>
      {/* Search + tag filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
          <input
            type="text"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-9 pr-9 py-2.5 text-sm text-[#e6edf3] placeholder:text-[#6e7681] focus:outline-none focus:border-[#58a6ff]/60 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7681] hover:text-[#e6edf3] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  activeTag === tag
                    ? 'bg-[#58a6ff]/20 border-[#58a6ff]/40 text-[#58a6ff]'
                    : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#58a6ff]/30'
                }`}
              >
                <Hash className="w-2.5 h-2.5" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result summary */}
      {(search || activeTag) && (
        <div className="mb-4 flex items-center gap-2 text-xs text-[#6e7681]">
          <span>
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
          </span>
          {activeTag && (
            <span>
              · tagged{' '}
              <button
                onClick={() => setActiveTag(null)}
                className="text-[#58a6ff] hover:underline"
              >
                #{activeTag} ×
              </button>
            </span>
          )}
          {search && (
            <span>
              · matching{' '}
              <span className="text-[#e6edf3]">"{search}"</span>
            </span>
          )}
        </div>
      )}

      {/* Documents grid */}
      <div className="grid gap-3">
        {filtered.map((doc) => (
          <Link
            key={doc.slug}
            href={`/doc/${doc.slug}`}
            className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#58a6ff]/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors line-clamp-1">
                  {doc.title}
                </h2>
                {doc.excerpt && (
                  <p className="text-sm text-[#8b949e] mt-1.5 line-clamp-2">{doc.excerpt}</p>
                )}
              </div>
              <span className="text-xs text-[#6e7681] shrink-0 mt-0.5">{doc.date}</span>
            </div>

            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded transition-colors ${
                      tag === activeTag
                        ? 'bg-[#58a6ff]/25 text-[#58a6ff]'
                        : 'bg-[#58a6ff]/10 text-[#58a6ff]'
                    }`}
                  >
                    <Hash className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#6e7681]">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No documents match your filters</p>
            <button
              onClick={() => {
                setSearch('');
                setActiveTag(null);
              }}
              className="text-xs text-[#58a6ff] hover:underline mt-2"
            >
              Clear filters
            </button>
          </div>
        )}

        {documents.length === 0 && !search && !activeTag && (
          <div className="text-center py-16 text-[#6e7681]">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No documents yet</p>
            <p className="text-xs mt-1">Add markdown files to content/documents/</p>
          </div>
        )}
      </div>
    </div>
  );
}
