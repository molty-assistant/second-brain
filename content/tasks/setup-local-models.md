---
title: "Start LM Studio with local models"
status: in-progress
priority: now
assignee: tom
created: '2026-02-12'
notes: "LM Studio installed. Tom to download Qwen3 4B Thinking + Ministral 3 3B, then start server. Wrapper tool ready: tools/local-llm.js"
---
## What to do
1. Open LM Studio
2. Download **Qwen3 4B Thinking** (primary) and optionally **Ministral 3 3B** (fast/light)
3. Load Qwen3 4B Thinking
4. Go to Developer tab → Start Server (port 1234)
5. Done — Molty can call it via `http://localhost:1234`

Wrapper tool already built: `tools/local-llm.js`
