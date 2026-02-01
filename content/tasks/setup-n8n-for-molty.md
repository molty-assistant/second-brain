---
title: "Setup n8n for background automations"
status: todo
priority: next
assignee: tom
created: '2026-02-01'
notes: "Medium priority — enables 24/7 automated workflows"
---

## Why This Matters
n8n is a workflow automation platform. Unlike me (who needs to be invoked), n8n workflows run continuously in the background on schedules or triggers.

## What I Can Do With It
- Set up daily monitoring (LightScout reviews, LinkedIn mentions)
- Scheduled reports and alerts
- Webhook integrations between services
- Automations that run while I'm "asleep"

## Setup Options

### Option A: n8n Cloud (Easiest)
1. Sign up at https://n8n.io
2. Get API key from Settings
3. Share API key with me

### Option B: Self-Host (More Control)
1. Run locally or on Railway:
```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```
2. Access at http://localhost:5678
3. Create API key in Settings
4. Share with me

## After Setup
I'll create some initial workflows:
- Daily LightScout App Store review check
- Weekly summary of GitHub activity
- Any custom automations you want

---

**Time estimate:** 20-30 minutes (cloud) or 30-45 minutes (self-host)
**Lenny code:** Check lennysproductpass.com
