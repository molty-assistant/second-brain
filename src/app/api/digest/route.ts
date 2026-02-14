import { NextRequest, NextResponse } from 'next/server';

// NOTE: Keep this in sync with /api/reviews
export interface Review {
  author: string;
  title: string;
  content: string;
  rating: number;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface ReviewSummary {
  count: number;
  avgRating: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface DigestApp {
  name: string;
  appId: string;
  reviewSummary: ReviewSummary;
  topKeywords: string[];
  recentReviews: Review[];
}

export interface MarketingDigest {
  generatedAt: string;
  apps: DigestApp[];
}

const APPS: Array<{ name: string; appId: string; slug: string }> = [
  { name: 'Sound Mixer', appId: '6741194018', slug: 'sound-mixer' },
  { name: 'Gridfinity Base Adder', appId: '6740669498', slug: 'gridfinity' },
  // competitive-intel.json uses pomodoro-timer key for keywords
  { name: 'Pomodoro Timer', appId: '6741260916', slug: 'pomodoro-timer' },
  { name: 'QR Code Generator', appId: '6741328422', slug: 'qr-code' },
  { name: 'Aspect Ratio Calculator', appId: '6741390498', slug: 'aspect-ratio' },
  { name: 'LightScout AI', appId: '6748341779', slug: 'lightscout' },
];

import { readFileSync } from 'node:fs';
import path from 'node:path';

function loadCompetitiveIntel(): any {
  try {
    const p = path.join(process.cwd(), 'src', 'data', 'competitive-intel.json');
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return { competitors: {}, keywords: {} };
  }
}

const competitiveIntel = loadCompetitiveIntel();

let cachedDigest: { value: MarketingDigest; expiresAt: number } | null = null;

function extractBoldKeywords(markdown: string): string[] {
  // Pull **bold** terms from markdown tables/lists.
  const found: string[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;

    // Split on commas/newlines in case someone bolded multiple terms.
    for (const part of raw.split(/[,\n]/g)) {
      const term = part.trim().replace(/^[-•]+\s*/, '');
      if (!term) continue;
      if (!found.includes(term)) found.push(term);
    }
  }
  return found;
}

function summarizeReviews(reviews: Review[]): ReviewSummary {
  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 } as const;
  const breakdown = { ...sentimentBreakdown };

  for (const r of reviews) breakdown[r.sentiment]++;

  const count = reviews.length;
  const avgRating = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  return {
    count,
    avgRating,
    sentimentBreakdown: breakdown,
  };
}

async function fetchReviewsWithTimeout(origin: string, appId: string): Promise<Review[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${origin}/api/reviews?appId=${appId}`, {
      signal: controller.signal,
      // Ensure this endpoint is purely in-memory cached by us.
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Reviews API returned ${res.status}`);
    const data = (await res.json()) as { success: boolean; reviews: Review[]; error?: string };
    if (!data.success) throw new Error(data.error || 'Reviews API failed');
    return Array.isArray(data.reviews) ? data.reviews : [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  const refresh = request.nextUrl.searchParams.get('refresh');
  if (!refresh && cachedDigest && Date.now() < cachedDigest.expiresAt) {
    return NextResponse.json({ success: true, digest: cachedDigest.value, cached: true });
  }

  const origin = request.nextUrl.origin;
  const keywordsBySlug = (competitiveIntel as { keywords?: Record<string, string> })?.keywords ?? {};

  const apps: DigestApp[] = [];

  for (const app of APPS) {
    try {
      const reviews = await fetchReviewsWithTimeout(origin, app.appId);

      // Ensure latest 3 (reviews feed is usually most recent first, but be safe).
      const sorted = [...reviews].sort((a, b) => {
        const ad = new Date(a.date).getTime();
        const bd = new Date(b.date).getTime();
        return bd - ad;
      });

      const keywordMarkdown = keywordsBySlug[app.slug] ?? '';
      const extracted = keywordMarkdown ? extractBoldKeywords(keywordMarkdown) : [];

      apps.push({
        name: app.name,
        appId: app.appId,
        reviewSummary: summarizeReviews(reviews),
        topKeywords: extracted.slice(0, 5),
        recentReviews: sorted.slice(0, 3),
      });
    } catch {
      // Skip apps that fail (timeouts, network, etc.)
      continue;
    }
  }

  const digest: MarketingDigest = {
    generatedAt: new Date().toISOString(),
    apps,
  };

  cachedDigest = { value: digest, expiresAt: Date.now() + 60 * 60 * 1000 };

  return NextResponse.json({ success: true, digest, cached: false });
}
