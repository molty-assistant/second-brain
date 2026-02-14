'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface Review {
  author: string;
  title: string;
  content: string;
  rating: number;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface DigestApp {
  name: string;
  appId: string;
  reviewSummary: {
    count: number;
    avgRating: number;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
  };
  topKeywords: string[];
  recentReviews: Review[];
}

interface MarketingDigest {
  generatedAt: string;
  apps: DigestApp[];
}

const APP_META: Record<string, { icon: string }> = {
  '6741194018': { icon: '🎵' },
  '6740669498': { icon: '🔲' },
  '6741260916': { icon: '🍅' },
  '6741328422': { icon: '📱' },
  '6741390498': { icon: '📐' },
  '6748341779': { icon: '💡' },
};

const SENTIMENT_BADGE: Record<Review['sentiment'], string> = {
  positive: 'bg-green-500/10 text-green-300 border-green-500/30',
  neutral: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  negative: 'bg-red-500/10 text-red-300 border-red-500/30',
};

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="text-yellow-400" title={`${rating.toFixed(1)} / 5`}>
      {'⭐'.repeat(Math.min(5, Math.max(0, rounded)))}
      {'☆'.repeat(Math.max(0, 5 - rounded))}
    </span>
  );
}

function SentimentBars({ breakdown }: { breakdown: DigestApp['reviewSummary']['sentimentBreakdown'] }) {
  const total = breakdown.positive + breakdown.neutral + breakdown.negative;
  const parts = total
    ? {
        positive: (breakdown.positive / total) * 100,
        neutral: (breakdown.neutral / total) * 100,
        negative: (breakdown.negative / total) * 100,
      }
    : { positive: 0, neutral: 0, negative: 0 };

  return (
    <div className="w-full">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-[#0d1117] border border-[#30363d]">
        <div className="bg-green-500" style={{ width: `${parts.positive}%` }} />
        <div className="bg-yellow-500" style={{ width: `${parts.neutral}%` }} />
        <div className="bg-red-500" style={{ width: `${parts.negative}%` }} />
      </div>
      <div className="mt-2 flex gap-3 text-xs text-[#8b949e]">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-green-500" /> {breakdown.positive}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-yellow-500" /> {breakdown.neutral}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-red-500" /> {breakdown.negative}
        </span>
      </div>
    </div>
  );
}

export default function DigestPage() {
  const [digest, setDigest] = useState<MarketingDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDigest(opts?: { refresh?: boolean }) {
    const doRefresh = Boolean(opts?.refresh);
    doRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const url = doRefresh ? `/api/digest?refresh=1&t=${Date.now()}` : '/api/digest';
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load digest');
      setDigest(data.digest);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      setDigest(null);
    } finally {
      doRefresh ? setRefreshing(false) : setLoading(false);
    }
  }

  useEffect(() => {
    loadDigest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generatedAtLabel = useMemo(() => {
    if (!digest?.generatedAt) return '—';
    try {
      return new Date(digest.generatedAt).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return digest.generatedAt;
    }
  }, [digest?.generatedAt]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="mb-2">
              <Link href="/marketing" className="text-sm text-[#8b949e] hover:text-[#e6edf3]">
                ← Marketing
              </Link>
            </div>
            <h1 className="text-2xl font-bold">📋 Weekly Marketing Digest</h1>
            <p className="text-sm text-[#8b949e] mt-1">
              Generated: <span className="text-[#e6edf3]">{generatedAtLabel}</span>
            </p>
          </div>

          <button
            onClick={() => loadDigest({ refresh: true })}
            disabled={loading || refreshing}
            className="px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#58a6ff] hover:bg-[#1f2937] transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Refreshing…' : 'Refresh Digest'}
          </button>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[#8b949e]">Generating digest…</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && digest && digest.apps.length === 0 && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center text-[#8b949e]">
            <p className="text-4xl mb-3">📭</p>
            <p>No apps could be loaded for this digest (reviews API timed out or failed).</p>
          </div>
        )}

        {!loading && !error && digest && digest.apps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {digest.apps.map((app) => {
              const icon = APP_META[app.appId]?.icon ?? '📱';
              const avg = app.reviewSummary.avgRating;
              return (
                <div
                  key={app.appId}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl p-5"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h2 className="text-lg font-semibold">{app.name}</h2>
                        <p className="text-xs text-[#8b949e]">App ID: {app.appId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#8b949e]">Avg rating</div>
                      <div className="flex items-center gap-2 justify-end">
                        <Stars rating={avg || 0} />
                        <span className="text-sm font-medium">{avg ? avg.toFixed(1) : '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
                      <div className="text-xs text-[#8b949e]">Reviews</div>
                      <div className="text-2xl font-bold mt-1">{app.reviewSummary.count}</div>
                    </div>
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
                      <div className="text-xs text-[#8b949e]">Sentiment</div>
                      <div className="mt-2">
                        <SentimentBars breakdown={app.reviewSummary.sentimentBreakdown} />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-[#8b949e] mb-2">Top ASO keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {app.topKeywords.length ? (
                        app.topKeywords.map((k) => (
                          <span
                            key={k}
                            className="text-xs px-2 py-1 rounded-full bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20"
                          >
                            {k}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#6e7681]">No keyword data</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#8b949e] mb-2">Latest reviews</div>
                    <div className="space-y-2">
                      {app.recentReviews.length ? (
                        app.recentReviews.map((r, i) => (
                          <div
                            key={`${r.author}-${i}`}
                            className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium truncate">{r.title || 'Untitled'}</span>
                                  <span
                                    className={`text-[11px] px-2 py-0.5 rounded-full border ${SENTIMENT_BADGE[r.sentiment]}`}
                                  >
                                    {r.sentiment}
                                  </span>
                                </div>
                                <div className="text-xs text-[#8b949e] mt-1 truncate">{r.author}</div>
                              </div>
                              <div className="text-right whitespace-nowrap">
                                <div className="text-xs text-[#8b949e]">{new Date(r.date).toLocaleDateString('en-GB')}</div>
                                <div className="text-sm text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-[#6e7681]">No recent reviews</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
