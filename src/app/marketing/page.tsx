'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  BarChart3,
  Image,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

interface AppConfig {
  name: string;
  tagline: string;
  url: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  features: string[];
}

const APPS: Record<string, AppConfig> = {
  'sound-mixer': {
    name: 'Sound Mixer',
    tagline: 'Blend ambient sounds for sleep & focus',
    url: 'molty-assistant.github.io/sound-mixer-web',
    icon: '🎵',
    colors: { primary: '#a855f7', secondary: '#581c87', background: '#0c0a1a', text: '#f1f5f9' },
    features: ['Layer ambient sounds', 'Sleep timer', 'Share mixes via URL', 'Works offline (PWA)', 'Free & private'],
  },
  gridfinity: {
    name: 'Gridfinity Base Adder',
    tagline: 'Calculate Gridfinity base plate layouts',
    url: 'molty-assistant.github.io/gridfinity-base-adder',
    icon: '🔲',
    colors: { primary: '#3b82f6', secondary: '#1e40af', background: '#0f172a', text: '#f1f5f9' },
    features: ['Optimal grid calculation', 'Visual preview', 'Multiple drawer sizes', 'Metric & Imperial'],
  },
  pomodoro: {
    name: 'Pomodoro Timer',
    tagline: 'Focus timer for productive work sessions',
    url: 'molty-assistant.github.io/pomodoro-timer',
    icon: '🍅',
    colors: { primary: '#ef4444', secondary: '#991b1b', background: '#1a0a0a', text: '#f1f5f9' },
    features: ['Customisable intervals', 'Session tracking', 'Audio alerts', 'Works offline'],
  },
  'qr-code': {
    name: 'QR Code Generator',
    tagline: 'Generate QR codes instantly',
    url: 'molty-assistant.github.io/qr-code-generator',
    icon: '📱',
    colors: { primary: '#10b981', secondary: '#065f46', background: '#0a1a14', text: '#f1f5f9' },
    features: ['Instant generation', 'PNG download', 'No sign-up', 'Private'],
  },
  'aspect-ratio': {
    name: 'Aspect Ratio Calculator',
    tagline: 'Calculate aspect ratios for any dimension',
    url: 'molty-assistant.github.io/aspect-ratio-calculator',
    icon: '📐',
    colors: { primary: '#f59e0b', secondary: '#92400e', background: '#1a150a', text: '#f1f5f9' },
    features: ['Instant calculation', 'Common presets', 'Custom dimensions'],
  },
};

type Tone = 'professional' | 'casual' | 'bold' | 'minimal';

export default function MarketingDashboard() {
  const [search, setSearch] = useState('');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState<string | null>(null);
  const [enhancedCopy, setEnhancedCopy] = useState<Record<string, string>>({});
  const [selectedTone, setSelectedTone] = useState<Tone>('professional');

  const filteredApps = Object.entries(APPS).filter(
    ([slug, app]) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.tagline.toLowerCase().includes(search.toLowerCase()) ||
      app.features.some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  async function enhanceCopy(slug: string) {
    const app = APPS[slug];
    if (!app) return;
    setEnhancing(slug);
    try {
      const res = await fetch('/api/enhance-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${app.name}: ${app.tagline}. Features: ${app.features.join(', ')}.`,
          tone: selectedTone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnhancedCopy(prev => ({ ...prev, [slug]: data.enhanced }));
      }
    } catch (err) {
      console.error('Enhance failed:', err);
    } finally {
      setEnhancing(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#f0883e]/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-[#f0883e]" />
            </div>
            <h1 className="text-2xl font-bold text-[#e6edf3]">Marketing Dashboard</h1>
          </div>
          <p className="text-[#8b949e]">
            {Object.keys(APPS).length} apps · AI copy enhancement · Competitive intelligence · SEO keywords
          </p>
          <div className="flex gap-3 mt-3">
            <a href="/marketing/templates" className="text-sm px-3 py-1 rounded-lg bg-[#161b22] border border-[#30363d] text-[#58a6ff] hover:bg-[#1f2937] transition-colors">📝 Templates</a>
            <a href="/marketing/reviews" className="text-sm px-3 py-1 rounded-lg bg-[#161b22] border border-[#30363d] text-[#58a6ff] hover:bg-[#1f2937] transition-colors">📊 Reviews</a>
          </div>
        </div>

        {/* Search + Tone */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
            <input
              type="text"
              placeholder="Search apps, features..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-10 pr-4 py-2.5 text-[#e6edf3] placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none"
            />
          </div>
          <select
            value={selectedTone}
            onChange={e => setSelectedTone(e.target.value as Tone)}
            className="bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2.5 text-[#e6edf3] focus:border-[#58a6ff] focus:outline-none"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="bold">Bold</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        {/* App Cards */}
        <div className="space-y-4">
          {filteredApps.map(([slug, app]) => (
            <div
              key={slug}
              className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden hover:border-[#30363d] transition-all"
              style={{ borderLeftColor: app.colors.primary, borderLeftWidth: '4px' }}
            >
              {/* Card Header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedApp(expandedApp === slug ? null : slug)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{app.icon}</span>
                    <div>
                      <h2 className="text-lg font-semibold text-[#e6edf3]">{app.name}</h2>
                      <p className="text-sm text-[#8b949e]">{app.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://${app.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-2 text-[#8b949e] hover:text-[#58a6ff] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        enhanceCopy(slug);
                      }}
                      disabled={enhancing === slug}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#58a6ff]/10 text-[#58a6ff] rounded-lg text-sm hover:bg-[#58a6ff]/20 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {enhancing === slug ? 'Enhancing...' : 'Enhance Copy'}
                    </button>
                    {expandedApp === slug ? (
                      <ChevronUp className="w-5 h-5 text-[#6e7681]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#6e7681]" />
                    )}
                  </div>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {app.features.slice(0, 4).map(f => (
                    <span
                      key={f}
                      className="text-xs px-2 py-1 rounded-full border"
                      style={{
                        borderColor: app.colors.primary + '40',
                        color: app.colors.primary,
                        backgroundColor: app.colors.primary + '10',
                      }}
                    >
                      {f}
                    </span>
                  ))}
                  {app.features.length > 4 && (
                    <span className="text-xs px-2 py-1 rounded-full text-[#6e7681]">
                      +{app.features.length - 4} more
                    </span>
                  )}
                </div>

                {/* Enhanced Copy */}
                {enhancedCopy[slug] && (
                  <div className="mt-4 p-3 bg-[#0d1117] rounded-lg border border-[#30363d]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#f0883e]" />
                      <span className="text-xs font-medium text-[#f0883e]">AI Enhanced ({selectedTone})</span>
                    </div>
                    <p className="text-sm text-[#e6edf3] leading-relaxed">{enhancedCopy[slug]}</p>
                  </div>
                )}
              </div>

              {/* Expanded Detail */}
              {expandedApp === slug && (
                <div className="border-t border-[#30363d] p-5 bg-[#0d1117]/50">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-[#a371f7]" />
                        <h3 className="text-sm font-medium text-[#e6edf3]">All Features</h3>
                      </div>
                      <ul className="space-y-1">
                        {app.features.map(f => (
                          <li key={f} className="text-sm text-[#8b949e] flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: app.colors.primary }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-[#58a6ff]" />
                        <h3 className="text-sm font-medium text-[#e6edf3]">Quick Links</h3>
                      </div>
                      <div className="space-y-2">
                        <a
                          href={`/api/competitive-intel?app=${slug}`}
                          target="_blank"
                          className="block text-sm text-[#58a6ff] hover:underline"
                        >
                          → Competitor Analysis
                        </a>
                        <a
                          href={`/api/competitive-intel?app=${slug}`}
                          target="_blank"
                          className="block text-sm text-[#58a6ff] hover:underline"
                        >
                          → SEO Keywords
                        </a>
                        <a
                          href={`https://${app.url}`}
                          target="_blank"
                          className="block text-sm text-[#58a6ff] hover:underline"
                        >
                          → Live App
                        </a>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Image className="w-4 h-4 text-[#3fb950]" />
                        <h3 className="text-sm font-medium text-[#e6edf3]">Assets</h3>
                      </div>
                      <div className="space-y-2 text-sm text-[#8b949e]">
                        <p>App Store screenshots: ready</p>
                        <p>OG images: deployed</p>
                        <p>Social media pack: pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-12 text-[#6e7681]">
            No apps match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
