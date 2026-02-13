'use client';

import { useState } from 'react';
import { Copy, Sparkles, RefreshCw, Check } from 'lucide-react';

const TEMPLATES = {
  'app-store-description': {
    label: 'App Store Description',
    template: `{{name}} — {{tagline}}

{{description}}

KEY FEATURES:
{{#features}}
• {{.}}
{{/features}}

Download {{name}} today. {{cta}}`,
  },
  'social-post': {
    label: 'Social Media Post',
    template: `🚀 Introducing {{name}}!

{{tagline}}

{{highlight}}

Try it free → {{url}}

{{#hashtags}}#{{.}} {{/hashtags}}`,
  },
  'email-subject': {
    label: 'Email Subject Lines',
    template: `Option 1: {{name}}: {{benefit1}}
Option 2: Stop {{pain_point}} — Try {{name}}
Option 3: {{social_proof}} love {{name}}. Here's why.`,
  },
  'landing-hero': {
    label: 'Landing Page Hero',
    template: `# {{headline}}

{{subheadline}}

[{{cta_button}}]

✓ {{trust1}}  ✓ {{trust2}}  ✓ {{trust3}}`,
  },
  'product-hunt': {
    label: 'Product Hunt Tagline',
    template: `{{name}} — {{one_liner}}

{{description}}

🔑 {{differentiator}}

Made with ❤️ by {{maker}}`,
  },
};

type Tone = 'professional' | 'casual' | 'bold' | 'minimal';

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('app-store-description');
  const [editedContent, setEditedContent] = useState(TEMPLATES['app-store-description'].template);
  const [tone, setTone] = useState<Tone>('professional');
  const [enhancing, setEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);

  function selectTemplate(key: string) {
    setSelectedTemplate(key);
    setEditedContent(TEMPLATES[key as keyof typeof TEMPLATES].template);
  }

  async function enhanceContent() {
    setEnhancing(true);
    try {
      const res = await fetch('/api/enhance-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editedContent, tone }),
      });
      const data = await res.json();
      if (data.success) {
        setEditedContent(data.enhanced);
      }
    } catch (err) {
      console.error('Enhance failed:', err);
    } finally {
      setEnhancing(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetTemplate() {
    setEditedContent(TEMPLATES[selectedTemplate as keyof typeof TEMPLATES].template);
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#e6edf3] mb-1">Copy Templates</h1>
          <p className="text-[#8b949e]">
            Edit templates, enhance with AI, and copy to clipboard
          </p>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          {/* Template List */}
          <div className="space-y-2">
            {Object.entries(TEMPLATES).map(([key, tmpl]) => (
              <button
                key={key}
                onClick={() => selectTemplate(key)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  selectedTemplate === key
                    ? 'bg-[#58a6ff]/10 border-[#58a6ff]/50 text-[#e6edf3]'
                    : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]/30'
                }`}
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div>
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-3">
              <select
                value={tone}
                onChange={e => setTone(e.target.value as Tone)}
                className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#58a6ff] focus:outline-none"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="bold">Bold</option>
                <option value="minimal">Minimal</option>
              </select>

              <button
                onClick={enhanceContent}
                disabled={enhancing}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#58a6ff]/10 text-[#58a6ff] rounded-lg text-sm hover:bg-[#58a6ff]/20 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {enhancing ? 'Enhancing...' : 'Enhance with AI'}
              </button>

              <button
                onClick={resetTemplate}
                className="flex items-center gap-1.5 px-3 py-2 text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>

              <div className="flex-1" />

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#3fb950]/10 text-[#3fb950] rounded-lg text-sm hover:bg-[#3fb950]/20 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Text Editor */}
            <textarea
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
              className="w-full h-[500px] bg-[#161b22] border border-[#30363d] rounded-xl p-5 text-[#e6edf3] font-mono text-sm leading-relaxed resize-none focus:border-[#58a6ff] focus:outline-none"
              placeholder="Edit your template here..."
            />

            {/* Help */}
            <p className="mt-3 text-xs text-[#6e7681]">
              Use {'{{variable}}'} placeholders. Click &quot;Enhance with AI&quot; to rewrite with Gemini. Edit freely, then copy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
