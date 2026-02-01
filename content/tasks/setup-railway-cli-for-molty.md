---
title: "Setup Railway CLI for Molty"
status: todo
priority: now
assignee: tom
created: '2026-02-01'
notes: "Highest priority — unlocks deployment capability"
---

## Why This Matters
Railway lets me deploy apps/sites to the web. Right now I can only build things that run on your Mac (localhost). With Railway, I can deploy Mission Control, the holiday shortlist, any tools I build — accessible from anywhere.

## What I Can Do With It
- Deploy Mission Control to a public URL
- Deploy any web apps I build overnight
- Host APIs, databases, background services
- You get links instead of "run npm run dev"

## Setup Steps

### 1. Get Lenny Code
Go to lennysproductpass.com → Railway → grab the discount code

### 2. Create Railway Account
https://railway.app — sign up (can use GitHub)

### 3. Install CLI
```bash
npm install -g @railway/cli
```

### 4. Login
```bash
railway login
```

### 5. Give Me Access
Either:
- Run `railway whoami` and share the project token
- Or set up a project and share the `RAILWAY_TOKEN` env var

## After Setup
Let me know it's done and I'll deploy Mission Control as a test.

---

**Time estimate:** 10-15 minutes
