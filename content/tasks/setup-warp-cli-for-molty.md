---
title: "Setup Warp Agent Platform for Molty"
status: done
priority: now
assignee: tom
created: '2026-02-01'
completed: '2026-02-07'
notes: "Warp CLI available at /Applications/Warp.app/Contents/Resources/bin/warp. Alias set in .zshrc."
---

## Why This Matters
Warp isn't just a terminal — it has an Agent Platform with:
- Ambient Agents that run headlessly
- MCP connections to GitHub, Linear, etc.
- CLI access for running agents programmatically

This gives me another AI I can invoke for specialized tasks, plus direct MCP access to your repos.

## What I Can Do With It
- Run `warp agent run "Review PR #123"` via CLI
- Use Warp's GitHub MCP for deeper repo access
- Trigger background agents for PR review, issue triage
- Cloud-connected execution with audit trail

## Setup Steps

### 1. Get Lenny Code (optional)
Check lennysproductpass.com for any Warp discount

### 2. Install Warp
https://www.warp.dev/download
Or standalone CLI: `brew install warp` (if available)

### 3. Login
```bash
warp login
```
This opens browser to authenticate.

### 4. Set Up API Key
In Warp settings or via CLI, generate an API key for headless use.

### 5. Install CLI to PATH
Warp app includes CLI. Make sure it's accessible:
```bash
# In Warp, run the "Install Warp CLI Command" action
# Or add to PATH manually
```

### 6. Test
```bash
warp agent run "What files are in the current directory?"
```

### 7. Share Auth With Me
Share the API key or confirm the CLI is authed on your machine.

## After Setup
I'll test running Warp agents via exec and report back.

---

**Time estimate:** 15-20 minutes
