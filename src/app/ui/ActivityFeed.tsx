'use client';

import { useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import Link from 'next/link';
import { Activity, ArrowRight } from 'lucide-react';

const CONVEX_ENABLED = !!process.env.NEXT_PUBLIC_CONVEX_URL;

type ActivityItem = {
  _id: string;
  timestamp: number;
  actor: string;
  action: string;
  title: string;
  status?: string;
  project?: string;
};

const ACTOR_COLORS: Record<string, string> = {
  molty: 'text-[#58a6ff]',
  tom: 'text-[#a371f7]',
  codex: 'text-[#f0883e]',
  ministral: 'text-[#3fb950]',
  'ministral 3b': 'text-[#3fb950]',
  perplexity: 'text-[#39d353]',
  gemini: 'text-[#d2a8ff]',
};

const ACTION_STYLES: Record<string, string> = {
  shipped: 'bg-[#3fb950]/15 text-[#3fb950]',
  deployed: 'bg-[#3fb950]/15 text-[#3fb950]',
  committed: 'bg-[#58a6ff]/15 text-[#58a6ff]',
  fixed: 'bg-[#58a6ff]/15 text-[#58a6ff]',
  researched: 'bg-[#a371f7]/15 text-[#a371f7]',
  planned: 'bg-[#6e7681]/15 text-[#8b949e]',
  reviewed: 'bg-[#6e7681]/15 text-[#8b949e]',
  delegated: 'bg-[#f0883e]/15 text-[#f0883e]',
  posted: 'bg-[#d2a8ff]/15 text-[#d2a8ff]',
  ops: 'bg-[#6e7681]/15 text-[#8b949e]',
  searched: 'bg-[#6e7681]/15 text-[#8b949e]',
};

function actorColor(actor: string) {
  return ACTOR_COLORS[actor.toLowerCase()] ?? 'text-[#8b949e]';
}

function actionStyle(action: string) {
  return ACTION_STYLES[action.toLowerCase()] ?? 'bg-[#6e7681]/10 text-[#6e7681]';
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 90_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

export default function ActivityFeed() {
  const activities = useQuery(
    convexApi.activities.list,
    CONVEX_ENABLED ? { limit: 8 } : 'skip',
  ) as ActivityItem[] | undefined;

  if (!activities || activities.length === 0) return null;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#58a6ff]" />
          <span className="text-sm font-semibold text-[#e6edf3]">Activity</span>
        </div>
        <Link
          href="/employees"
          className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1"
        >
          All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-[#30363d]">
        {activities.map((a) => (
          <div key={a._id} className="px-4 py-2.5 flex items-start gap-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs font-semibold ${actorColor(a.actor)}`}>{a.actor}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${actionStyle(a.action)}`}
                >
                  {a.action}
                </span>
                {a.project && (
                  <span className="text-[10px] text-[#6e7681]">{a.project}</span>
                )}
              </div>
              <div className="text-xs text-[#8b949e] truncate mt-0.5">{a.title}</div>
            </div>
            <span className="text-[10px] text-[#6e7681] shrink-0 mt-0.5 tabular-nums font-mono">
              {timeAgo(a.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
