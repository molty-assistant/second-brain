'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  CheckSquare,
  Lightbulb,
  Tag,
  FolderOpen,
} from 'lucide-react';

type DailyLog = {
  _id: string;
  date: string;
  timestamp: number;
  summary: string;
  projects?: string[];
  decisions?: string[];
  actionItems?: string[];
  tags?: string[];
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ProjectPill({ name }: { name: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-[#58a6ff]/15 text-[#58a6ff] border border-[#58a6ff]/20">
      {name}
    </span>
  );
}

function TagPill({ name }: { name: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-[#a371f7]/15 text-[#a371f7] border border-[#a371f7]/20">
      #{name}
    </span>
  );
}

// ── Add Entry Modal ────────────────────────────────────────────────────────────

function AddEntryModal({ onClose }: { onClose: () => void }) {
  const logEntry = useMutation(convexApi.dailyLogs.log);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    summary: '',
    projects: '',
    decisions: '',
    actionItems: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.summary.trim()) return;
    setSaving(true);
    try {
      await logEntry({
        date: form.date,
        summary: form.summary,
        projects: form.projects ? form.projects.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        decisions: form.decisions ? form.decisions.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
        actionItems: form.actionItems ? form.actionItems.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
        tags: form.tags ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#30363d]">
          <h2 className="text-lg font-semibold text-[#e6edf3]">Log Daily Memory</h2>
          <button onClick={onClose} className="text-[#6e7681] hover:text-[#e6edf3] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm text-[#8b949e] mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8b949e] mb-1.5">Summary *</label>
            <textarea
              required
              rows={4}
              placeholder="What was discussed today?"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8b949e] mb-1.5">
              Projects <span className="text-[#6e7681]">(comma-separated, e.g. letready, marketing-tool)</span>
            </label>
            <input
              type="text"
              placeholder="letready, marketing-tool"
              value={form.projects}
              onChange={(e) => setForm((f) => ({ ...f, projects: e.target.value }))}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8b949e] mb-1.5">
              Key Decisions <span className="text-[#6e7681]">(one per line)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Decided to use Stripe for payments&#10;Agreed to ship MVP by Friday"
              value={form.decisions}
              onChange={(e) => setForm((f) => ({ ...f, decisions: e.target.value }))}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8b949e] mb-1.5">
              Action Items <span className="text-[#6e7681]">(one per line)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Update landing page copy&#10;Deploy to Railway"
              value={form.actionItems}
              onChange={(e) => setForm((f) => ({ ...f, actionItems: e.target.value }))}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8b949e] mb-1.5">
              Tags <span className="text-[#6e7681]">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="planning, infra, outreach"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#8b949e] border border-[#30363d] rounded-md hover:text-[#e6edf3] hover:border-[#58a6ff]/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-md transition-colors"
            >
              {saving ? 'Saving…' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Log Card ──────────────────────────────────────────────────────────────────

function LogCard({ log }: { log: DailyLog }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    (log.decisions?.length ?? 0) > 0 ||
    (log.actionItems?.length ?? 0) > 0;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-[#21262d]/40 transition-colors"
      >
        <div className="mt-0.5 text-[#6e7681]">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-[#58a6ff]">{formatDate(log.date)}</span>
            {(log.projects ?? []).map((p) => (
              <ProjectPill key={p} name={p} />
            ))}
            {(log.tags ?? []).map((t) => (
              <TagPill key={t} name={t} />
            ))}
          </div>
          <p className="text-sm text-[#e6edf3] leading-relaxed line-clamp-2">{log.summary}</p>
        </div>
        <div className="flex gap-3 ml-2 shrink-0 text-xs text-[#6e7681]">
          {(log.decisions?.length ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" />
              {log.decisions!.length}
            </span>
          )}
          {(log.actionItems?.length ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" />
              {log.actionItems!.length}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-[#30363d]">
          <div className="pt-4 space-y-4">
            <div>
              <div className="text-xs font-semibold text-[#6e7681] uppercase tracking-wide mb-2">Summary</div>
              <p className="text-sm text-[#8b949e] whitespace-pre-wrap leading-relaxed">{log.summary}</p>
            </div>

            {(log.decisions?.length ?? 0) > 0 && (
              <div>
                <div className="text-xs font-semibold text-[#6e7681] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Key Decisions
                </div>
                <ul className="space-y-1.5">
                  {log.decisions!.map((d, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#e6edf3]">
                      <span className="text-[#f0883e] mt-0.5">→</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(log.actionItems?.length ?? 0) > 0 && (
              <div>
                <div className="text-xs font-semibold text-[#6e7681] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" /> Action Items
                </div>
                <ul className="space-y-1.5">
                  {log.actionItems!.map((a, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#e6edf3]">
                      <span className="text-[#3fb950] mt-0.5">☐</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!hasDetails && (
              <p className="text-sm text-[#6e7681] italic">No decisions or action items recorded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Client ───────────────────────────────────────────────────────────────

export default function MemoryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const project = searchParams.get('project') ?? '';
  const [searchText, setSearchText] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`?${next.toString()}`);
  };

  const listArgs = useMemo(
    () => ({ project: project || undefined, limit: 100 }),
    [project]
  );

  const logs = useQuery(convexApi.dailyLogs.list, listArgs) as DailyLog[] | undefined;
  const searchResults = useQuery(
    convexApi.dailyLogs.search,
    searchText.length >= 2 ? { query: searchText, limit: 20 } : 'skip'
  ) as DailyLog[] | undefined;
  const allProjects = useQuery(convexApi.dailyLogs.allProjects, {}) as string[] | undefined;

  const displayed = searchText.length >= 2
    ? (searchResults ?? [])
    : (logs ?? []);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search summaries…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6e7681] hover:text-[#e6edf3]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={project}
          onChange={(e) => updateFilter('project', e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#e6edf3]"
        >
          <option value="">All projects</option>
          {(allProjects ?? []).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {(project) && (
          <button
            onClick={() => updateFilter('project', '')}
            className="text-sm px-3 py-2 rounded-md border border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#58a6ff]/40"
          >
            Clear
          </button>
        )}

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors ml-auto"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* Stats */}
      {logs && logs.length > 0 && !searchText && (
        <div className="flex gap-4 mb-6 text-sm text-[#8b949e]">
          <span>{logs.length} entries</span>
          {project && <span>· filtered by <span className="text-[#58a6ff]">{project}</span></span>}
        </div>
      )}

      {/* Search mode indicator */}
      {searchText.length >= 2 && (
        <div className="mb-4 text-sm text-[#8b949e]">
          {searchResults === undefined
            ? 'Searching…'
            : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchText}"`}
        </div>
      )}

      {/* Log list */}
      <div className="space-y-3">
        {displayed.map((log) => (
          <LogCard key={log._id} log={log} />
        ))}

        {logs && displayed.length === 0 && !searchText && (
          <div className="text-center py-16">
            <FolderOpen className="w-12 h-12 text-[#30363d] mx-auto mb-4" />
            <p className="text-[#6e7681] mb-2">No memory entries yet.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="text-[#58a6ff] text-sm hover:underline"
            >
              Log your first entry
            </button>
          </div>
        )}

        {searchText.length >= 2 && searchResults?.length === 0 && (
          <div className="text-center py-12 text-[#6e7681]">No results found.</div>
        )}

        {!logs && <div className="text-sm text-[#6e7681]">Loading…</div>}
      </div>

      {showAdd && <AddEntryModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
