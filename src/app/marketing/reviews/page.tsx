'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Review {
  author: string;
  title: string;
  content: string;
  rating: number;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

const PRESET_APPS = [
  { name: 'Sound Mixer', id: '6741194018', icon: '🎵' },
  { name: 'Gridfinity Base Adder', id: '6740669498', icon: '🔲' },
  { name: 'Pomodoro Timer', id: '6741260916', icon: '🍅' },
  { name: 'QR Code Generator', id: '6741328422', icon: '📱' },
  { name: 'Aspect Ratio Calculator', id: '6741390498', icon: '📐' },
  { name: 'LightScout AI', id: '6748341779', icon: '💡' },
];

const SENTIMENT_STYLES = {
  positive: 'bg-green-500/20 text-green-400 border-green-500/30',
  neutral: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  negative: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function Stars({ rating }: { rating: number }) {
  return <span className="text-yellow-400">{'⭐'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

export default function ReviewsPage() {
  const [appId, setAppId] = useState('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function fetchReviews(id: string) {
    setLoading(true);
    setError(null);
    setMessage(null);
    setReviews([]);
    try {
      const res = await fetch(`/api/reviews?appId=${id}`);
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to fetch reviews');
      } else {
        setReviews(data.reviews);
        if (data.reviews.length === 0) {
          setMessage(data.message || 'No reviews found');
        }
      }
    } catch {
      setError('Network error fetching reviews');
    } finally {
      setLoading(false);
    }
  }

  function selectPreset(app: typeof PRESET_APPS[0]) {
    setAppId(app.id);
    setSelectedApp(app.name);
    fetchReviews(app.id);
  }

  function handleManualFetch() {
    if (!appId.trim()) return;
    setSelectedApp(null);
    fetchReviews(appId.trim());
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';
  const counts = { positive: 0, neutral: 0, negative: 0 };
  reviews.forEach((r) => counts[r.sentiment]++);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/marketing"
            className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            ← Marketing
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-1">📊 Review Monitor</h1>
        <p className="text-slate-400 mb-6">
          Track App Store reviews and sentiment across your apps
        </p>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_APPS.map((app) => (
            <button
              key={app.id}
              onClick={() => selectPreset(app)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                selectedApp === app.name
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              {app.icon} {app.name}
            </button>
          ))}
        </div>

        {/* Manual input */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="Enter Apple App ID..."
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            onKeyDown={(e) => e.key === 'Enter' && handleManualFetch()}
          />
          <button
            onClick={handleManualFetch}
            disabled={loading || !appId.trim()}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Fetch'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-slate-400">Fetching reviews...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* No reviews message */}
        {message && !loading && (
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
            <p className="text-4xl mb-3">📭</p>
            <p>{message}</p>
            <p className="text-sm mt-1">This app may not have any UK App Store reviews yet.</p>
          </div>
        )}

        {/* Summary stats */}
        {reviews.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">{avgRating}</p>
                <p className="text-xs text-slate-400">Avg Rating</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{counts.positive}</p>
                <p className="text-xs text-slate-400">Positive</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">{counts.neutral}</p>
                <p className="text-xs text-slate-400">Neutral</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-400">{counts.negative}</p>
                <p className="text-xs text-slate-400">Negative</p>
              </div>
            </div>

            {/* Review cards */}
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div
                  key={i}
                  className="bg-slate-800/40 border border-slate-700 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <Stars rating={r.rating} />
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${SENTIMENT_STYLES[r.sentiment]}`}
                      >
                        {r.sentiment}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(r.date).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-1">{r.title}</h3>
                  <p className="text-sm text-slate-400 mb-2">{r.content}</p>
                  <p className="text-xs text-slate-500">— {r.author}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
