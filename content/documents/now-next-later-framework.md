---
title: The NOW/NEXT/LATER Framework
date: 2026-01-30
tags: [framework, productivity, focus]
---

# The NOW/NEXT/LATER Framework

A prioritisation system designed to enforce ruthless focus.

## The Core Idea

You can only do one thing at a time. Most productivity systems pretend otherwise. This framework makes the constraint explicit.

## The Buckets

### NOW (max 1)

Your single current focus. Not "what's important" — what you're actively working on **right now**.

The limit is enforced. If something is in NOW, nothing else can be. This forces a decision: either the current thing is the priority, or it isn't.

### NEXT (max 5)

Your queue. Things that are ready to become NOW when the current thing finishes.

Five items, not fifty. If your NEXT is full and something new comes up, you have to make a trade. What gets bumped to LATER?

### LATER

Everything else. Ideas, someday-maybes, things you're not saying no to but aren't committing to either.

No limit here. It's a parking lot, not a to-do list.

### DROP

Explicit no's. Not "maybe later" — **no**.

This bucket matters because decisions have weight. Actively dropping something is different from letting it rot in LATER. It's closure.

## Why It Works

1. **Forces clarity** — You can't have three things in NOW. Pick one.
2. **Limits WIP** — Five items in NEXT means real prioritisation
3. **Makes trade-offs visible** — Adding requires removing
4. **Distinguishes later from never** — DROP is explicit

## Implementation

The `nnl` CLI tool implements this framework:

```bash
nnl add now "Ship the feature"
nnl add next "Write the docs"
nnl mv abc123 later   # Demote when priorities shift
nnl done abc123       # Complete and promote from NEXT
```

## Origin

This framework emerged from Tom's operating model — the need for a Product Lead with limited time to maximise leverage. One focus at a time, a small queue, and explicit decisions about what not to do.

---

*Related: [Weekly review workflow](/doc/documents/weekly-review-workflow)*
