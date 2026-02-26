---
title: Convex Setup for Mission Control v2
date: 2026-02-26
tags: [convex, setup, mission-control, deployment]
---

# Convex Setup for Mission Control v2

Mission Control v2 pages rely on Convex. If `NEXT_PUBLIC_CONVEX_URL` is missing, those pages will stay in setup mode.

## Local Development

1. Install project dependencies:
   - `npm install`
2. Start Convex dev:
   - `npx convex dev`
3. Copy the deployment URL shown by Convex (for example, `https://<your-deployment>.convex.cloud`).
4. Add the URL to `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
```

5. Restart your Next.js dev server if it was already running.

## Production

1. Create and deploy your Convex production deployment using the Convex dashboard/CLI.
2. In your hosting provider, set:
   - `NEXT_PUBLIC_CONVEX_URL` = your production Convex deployment URL
3. Redeploy your app so the client bundle picks up the new public env var.

## Notes

- Do not commit secrets to the repository.
- `NEXT_PUBLIC_CONVEX_URL` is a public client-side URL, but treat other Convex credentials as sensitive.
