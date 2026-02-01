---
title: Consolidate tools into unified Second Brain hub
date: 2026-02-01
status: decided
---

## Context
Had multiple separate CLI tools (now-next-later, content-bank, decision-log, weekly-review) plus the Second Brain web app. Too fragmented — needed one place for everything.

## Decision
Extend Second Brain into a unified Mission Control hub with:
- Dashboard
- Tasks (Now/Next/Later)
- Content pipeline
- Projects
- Decisions
- Documents & Journal (existing)

## Consequences
- Single URL to bookmark (localhost:3000)
- All content is markdown-backed and git-versioned
- Can iterate on UI without changing data format
- CLI tools can still work as alternative interfaces
