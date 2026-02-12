---
title: "Build out Marketing Tool to v2.0"
status: in-progress
priority: now
assignee: molty
created: '2026-02-12'
notes: "Core product — full autonomous marketing engine"
---

## What It Is
Web app that generates complete marketing briefs from any app URL.
**Live:** https://marketing-tool-production.up.railway.app

## Current State (v1.1) ✅
- Scrapes App Store, Google Play, websites
- 5-stage marketing brief generation (Vibe Marketing methodology)
- SQLite persistence, editable config, basic auth
- Visual asset templates (OG, social card, GitHub social)
- Copy templates for Reddit, HN, Product Hunt, LinkedIn, Twitter

## Next Steps (v1.5)
- [ ] AI-generated copy via Gemini API (not just templates)
- [ ] Auto-scrape competitors
- [ ] SEO keyword research integration
- [ ] PNG export for visual assets (Playwright)

## Full roadmap in `projects/marketing-tool/ROADMAP.md`
