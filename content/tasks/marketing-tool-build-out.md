---
title: "Build Autonomous Marketing Company"
status: in-progress
priority: now
assignee: molty
created: '2026-02-12'
notes: "Core product — AI marketing agency with agent workforce"
---
## Vision
Molty operates as CEO of an autonomous marketing agency. First clients: our 5 apps. Future: SME clients.

## Agent Workforce
| Role | Agent | Cost |
|---|---|---|
| CEO/Strategist | Opus (Molty) | $$$ |
| Builder | Codex sub-agents | Included |
| Copywriter | Gemini API | Free |
| Researcher | Perplexity + Brave | ~$0.005/q |
| QA/Proofreader | Local LLM (LM Studio) | Free |

## Key Deliverables
- [x] Perplexity research tool (`tools/perplexity-research.js`)
- [x] Local LLM wrapper (`tools/local-llm.js`)
- [x] Marketing tool v1 deployed to Railway
- [x] Marketing briefs for all 5 apps
- [ ] Integrate AI copy generation (Gemini) into marketing tool
- [ ] Build workforce orchestration (`tools/workforce/`)
- [ ] Add competitive intelligence via Perplexity
- [ ] Full pipeline test: app → brief → copy → assets → distribution plan
- [ ] Video generation (Veo 3.1 via Gemini)
