'use client';

import { useState } from 'react';
import { Plus, X, FileText, CheckSquare, Lightbulb, Rocket, Brain } from 'lucide-react';

interface QuickAddProps {
  onCreated?: () => void;
}

type Category = 'documents' | 'tasks' | 'pipeline' | 'projects' | 'decisions';

const categories: { value: Category; label: string; icon: React.ReactNode; fields?: string[] }[] = [
  { value: 'documents', label: 'Document', icon: <FileText className="w-4 h-4" /> },
  { value: 'tasks', label: 'Task', icon: <CheckSquare className="w-4 h-4" />, fields: ['status', 'assignee'] },
  { value: 'pipeline', label: 'Content Idea', icon: <Lightbulb className="w-4 h-4" />, fields: ['type', 'status'] },
  { value: 'projects', label: 'Project', icon: <Rocket className="w-4 h-4" />, fields: ['status', 'description'] },
  { value: 'decisions', label: 'Decision', icon: <Brain className="w-4 h-4" />, fields: ['status', 'context'] },
];

export default function QuickAdd({ onCreated }: QuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<Category>('documents');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('post');
  const [assignee, setAssignee] = useState<'tom' | 'molty'>('tom');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedCategory = categories.find(c => c.value === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const frontmatter: Record<string, unknown> = {};
      
      if (status) frontmatter.status = status;
      if (type && category === 'pipeline') frontmatter.type = type;
      if (category === 'tasks') frontmatter.assignee = assignee;
      if (description) frontmatter.description = description;
      if (context) frontmatter.context = context;

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          content,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          frontmatter,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create');
      }

      // Reset form
      setTitle('');
      setContent('');
      setTags('');
      setStatus('');
      setType('post');
      setAssignee('tom');
      setDescription('');
      setContext('');
      setIsOpen(false);
      
      // Refresh page to show new content
      window.location.reload();
      onCreated?.();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#58a6ff] hover:bg-[#79b8ff] text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
        title="Quick Add"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
              <h2 className="text-lg font-semibold text-[#e6edf3]">Quick Add</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[#8b949e] hover:text-[#e6edf3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      category === cat.value
                        ? 'bg-[#58a6ff] text-white'
                        : 'bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3]'
                    }`}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
                  placeholder="Enter title..."
                  required
                />
              </div>

              {/* Category-specific fields */}
              {selectedCategory?.fields?.includes('status') && (
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
                  >
                    {category === 'tasks' && (
                      <>
                        <option value="now">Now</option>
                        <option value="next">Next</option>
                        <option value="later">Later</option>
                      </>
                    )}
                    {category === 'pipeline' && (
                      <>
                        <option value="idea">Idea</option>
                        <option value="drafting">Drafting</option>
                        <option value="review">Review</option>
                        <option value="published">Published</option>
                      </>
                    )}
                    {category === 'projects' && (
                      <>
                        <option value="idea">Idea</option>
                        <option value="building">Building</option>
                        <option value="mvp">MVP</option>
                        <option value="live">Live</option>
                        <option value="paused">Paused</option>
                      </>
                    )}
                    {category === 'decisions' && (
                      <>
                        <option value="proposed">Proposed</option>
                        <option value="decided">Decided</option>
                        <option value="superseded">Superseded</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {selectedCategory?.fields?.includes('assignee') && (
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1">Assignee</label>
                  <select
                    value={assignee}
                    onChange={e => setAssignee(e.target.value as 'tom' | 'molty')}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
                  >
                    <option value="tom">👤 Tom</option>
                    <option value="molty">🦉 Molty</option>
                  </select>
                </div>
              )}

              {selectedCategory?.fields?.includes('type') && (
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
                  >
                    <option value="post">Post</option>
                    <option value="article">Article</option>
                    <option value="talk">Talk</option>
                  </select>
                </div>
              )}

              {selectedCategory?.fields?.includes('description') && (
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
                    placeholder="Brief description..."
                  />
                </div>
              )}

              {selectedCategory?.fields?.includes('context') && (
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1">Context</label>
                  <input
                    type="text"
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
                    placeholder="What's the context?"
                  />
                </div>
              )}

              {/* Tags (for documents) */}
              {category === 'documents' && (
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] resize-none"
                  placeholder="Markdown content..."
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-[#21262d] text-[#8b949e] rounded-md hover:text-[#e6edf3] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title}
                  className="flex-1 px-4 py-2 bg-[#58a6ff] text-white rounded-md hover:bg-[#79b8ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
