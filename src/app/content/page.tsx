import { getPipelineItems } from '@/lib/hub';
import Link from 'next/link';
import { Lightbulb, ArrowLeft, PenTool, Eye, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ContentPage() {
  const items = getPipelineItems();
  const ideas = items.filter(i => i.status === 'idea');
  const drafting = items.filter(i => i.status === 'drafting');
  const review = items.filter(i => i.status === 'review');
  const published = items.filter(i => i.status === 'published');

  const typeColors: Record<string, string> = {
    post: 'bg-[#58a6ff]/20 text-[#58a6ff]',
    article: 'bg-[#a371f7]/20 text-[#a371f7]',
    talk: 'bg-[#3fb950]/20 text-[#3fb950]',
  };

  const Column = ({ 
    title, 
    items, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    items: typeof ideas; 
    icon: React.ElementType;
    color: string;
  }) => (
    <div className="flex-1 min-w-[250px]">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${color}`} />
        <h2 className="font-semibold text-[#e6edf3]">{title}</h2>
        <span className="text-sm text-[#6e7681]">({items.length})</span>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div 
            key={item.slug} 
            className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded ${typeColors[item.type] || typeColors.post}`}>
                {item.type}
              </span>
            </div>
            <h3 className="font-medium text-[#e6edf3] mb-1">{item.title}</h3>
            {item.content && (
              <p className="text-sm text-[#8b949e] line-clamp-2">{item.content}</p>
            )}
            <span className="text-xs text-[#6e7681] mt-2 block">{item.created}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div className="border border-dashed border-[#30363d] rounded-lg p-4 text-center text-[#6e7681] text-sm">
            Empty
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#8b949e] hover:text-[#58a6ff] mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Mission Control
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#58a6ff]/10 rounded-lg">
              <Lightbulb className="w-6 h-6 text-[#58a6ff]" />
            </div>
            <h1 className="text-2xl font-bold text-[#e6edf3]">Content Pipeline</h1>
          </div>
          <p className="text-[#8b949e] mt-2">
            LinkedIn posts, articles, talks — from idea to published
          </p>
        </div>

        {/* Pipeline Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          <Column title="Ideas" items={ideas} icon={Lightbulb} color="text-[#58a6ff]" />
          <Column title="Drafting" items={drafting} icon={PenTool} color="text-[#f0883e]" />
          <Column title="Review" items={review} icon={Eye} color="text-[#a371f7]" />
          <Column title="Published" items={published} icon={CheckCircle} color="text-[#3fb950]" />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <h3 className="font-medium text-[#e6edf3] mb-2">Adding content</h3>
          <p className="text-sm text-[#8b949e] mb-2">Create a markdown file in <code className="bg-[#21262d] px-1 rounded">content/pipeline/</code>:</p>
          <pre className="bg-[#0d1117] border border-[#30363d] rounded p-3 text-sm text-[#8b949e] overflow-x-auto">
{`---
title: "Your content title"
type: post  # post | article | talk
status: idea  # idea | drafting | review | published
created: 2026-02-01
---

Notes, outline, draft content...`}
          </pre>
        </div>
      </div>
    </div>
  );
}
