'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { convexApi } from '@/lib/convexApi';
import { Save, Sun, Moon, Plus, X } from 'lucide-react';

type Section = {
  key: string;
  label: string;
  enabled: boolean;
};

type BriefingConfig = {
  _id: string | null;
  briefingType: string;
  sections: Section[];
  newsTopics?: string[];
  updatedAt: number;
};

export default function BriefingsClient() {
  const configs = useQuery(convexApi.briefingConfig.list, {}) as BriefingConfig[] | undefined;
  const saveMutation = useMutation(convexApi.briefingConfig.save);

  const [localConfigs, setLocalConfigs] = useState<Record<string, BriefingConfig>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [newTopics, setNewTopics] = useState<Record<string, string>>({});

  const mergedConfigs = useMemo(() => {
    if (!configs) return [];
    return configs.map((c) => ({
      ...c,
      ...(localConfigs[c.briefingType] ?? {}),
      briefingType: c.briefingType,
    }));
  }, [configs, localConfigs]);

  const updateSection = (type: string, key: string, enabled: boolean) => {
    const config = mergedConfigs.find((c) => c.briefingType === type);
    if (!config) return;

    const updatedSections = config.sections.map((s) =>
      s.key === key ? { ...s, enabled } : s
    );

    setLocalConfigs((prev) => ({
      ...prev,
      [type]: { ...config, sections: updatedSections },
    }));
  };

  const addTopic = (type: string) => {
    const topic = (newTopics[type] || '').trim();
    if (!topic) return;
    const config = mergedConfigs.find((c) => c.briefingType === type);
    if (!config) return;

    const topics = [...(config.newsTopics ?? []), topic];
    setLocalConfigs((prev) => ({
      ...prev,
      [type]: { ...config, newsTopics: topics },
    }));
    setNewTopics((prev) => ({ ...prev, [type]: '' }));
  };

  const removeTopic = (type: string, index: number) => {
    const config = mergedConfigs.find((c) => c.briefingType === type);
    if (!config) return;

    const topics = (config.newsTopics ?? []).filter((_, i) => i !== index);
    setLocalConfigs((prev) => ({
      ...prev,
      [type]: { ...config, newsTopics: topics },
    }));
  };

  const handleSave = async (type: string) => {
    const config = mergedConfigs.find((c) => c.briefingType === type);
    if (!config) return;

    setSaving(type);
    try {
      await saveMutation({
        briefingType: type,
        sections: config.sections,
        newsTopics: config.newsTopics,
      });
      setSaved(type);
      setTimeout(() => setSaved(null), 2000);
      // Clear local overrides for this type
      setLocalConfigs((prev) => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
    } finally {
      setSaving(null);
    }
  };

  if (!configs) {
    return <div className="text-sm text-[#6e7681]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {mergedConfigs.map((config) => {
        const isAM = config.briefingType === 'am';
        const hasChanges = !!localConfigs[config.briefingType];

        return (
          <div
            key={config.briefingType}
            className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
              <div className="flex items-center gap-3">
                {isAM ? (
                  <Sun className="w-5 h-5 text-[#f0883e]" />
                ) : (
                  <Moon className="w-5 h-5 text-[#a371f7]" />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-[#e6edf3]">
                    {isAM ? 'Morning Brief' : 'Evening Brief'}
                  </h2>
                  <p className="text-xs text-[#6e7681]">
                    {isAM ? 'Delivered at 7:00 AM' : 'Delivered at 6:00 PM'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSave(config.briefingType)}
                disabled={!hasChanges || saving === config.briefingType}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                  hasChanges
                    ? 'bg-[#238636] hover:bg-[#2ea043] text-white'
                    : saved === config.briefingType
                      ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30'
                      : 'bg-[#21262d] border border-[#30363d] text-[#6e7681] cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                {saving === config.briefingType
                  ? 'Saving...'
                  : saved === config.briefingType
                    ? 'Saved'
                    : 'Save'}
              </button>
            </div>

            {/* Sections */}
            <div className="px-6 py-4">
              <h3 className="text-xs font-semibold text-[#6e7681] uppercase tracking-wide mb-3">
                Sections
              </h3>
              <div className="space-y-2">
                {config.sections.map((section) => (
                  <label
                    key={section.key}
                    className="flex items-center justify-between px-3 py-2.5 rounded-md bg-[#0d1117] border border-[#30363d] hover:border-[#58a6ff]/30 transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-[#e6edf3]">{section.label}</span>
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(e) =>
                        updateSection(config.briefingType, section.key, e.target.checked)
                      }
                      className="w-4 h-4 rounded border-[#30363d] bg-[#0d1117] text-[#58a6ff] focus:ring-[#58a6ff] focus:ring-offset-0"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* News Topics */}
            <div className="px-6 py-4 border-t border-[#30363d]">
              <h3 className="text-xs font-semibold text-[#6e7681] uppercase tracking-wide mb-3">
                News Topics
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {(config.newsTopics ?? []).map((topic, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20"
                  >
                    {topic}
                    <button
                      onClick={() => removeTopic(config.briefingType, i)}
                      className="hover:text-[#f85149] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(config.newsTopics ?? []).length === 0 && (
                  <span className="text-xs text-[#6e7681]">No topics configured</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTopics[config.briefingType] || ''}
                  onChange={(e) =>
                    setNewTopics((prev) => ({ ...prev, [config.briefingType]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTopic(config.briefingType);
                    }
                  }}
                  placeholder="Add a topic (e.g., AI agents, indie hacking)..."
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
                />
                <button
                  onClick={() => addTopic(config.briefingType)}
                  disabled={!(newTopics[config.briefingType] || '').trim()}
                  className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Last updated */}
            {config.updatedAt > 0 && (
              <div className="px-6 py-3 border-t border-[#30363d] text-xs text-[#6e7681]">
                Last updated:{' '}
                {new Date(config.updatedAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
