#!/usr/bin/env npx tsx
/**
 * Seed ~20 realistic activity entries into Mission Control.
 *
 * Usage:
 *   CONVEX_URL=https://<deployment>.convex.cloud npx tsx scripts/seed-activities.ts
 *
 * The CONVEX_URL should be your Convex deployment URL (found in .env.local or
 * the Convex dashboard). It can also be set in a .env.local file.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error(
    "Error: Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL env var to your Convex deployment URL."
  );
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const NOW = Date.now();
const DAY = 86_400_000;

/** Helper: random timestamp within the last `days` days */
function ago(minDays: number, maxDays: number): number {
  const offset = (minDays + Math.random() * (maxDays - minDays)) * DAY;
  return Math.round(NOW - offset);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const activities = [
  {
    timestamp: ago(0, 0.5),
    actor: "Molty",
    action: "shipped",
    title: "Shipped activity feed widget to Mission Control",
    project: "mission-control",
    tags: ["frontend", "launch"],
  },
  {
    timestamp: ago(0.5, 1),
    actor: "Codex",
    action: "committed",
    title: "Added logBatch mutation for bulk activity inserts",
    project: "mission-control",
    tags: ["backend", "convex"],
  },
  {
    timestamp: ago(1, 1.5),
    actor: "Molty",
    action: "deployed",
    title: "Deployed video pipeline to Railway",
    project: "marketing-tool",
    tags: ["infra", "deploy"],
  },
  {
    timestamp: ago(1.5, 2),
    actor: "Perplexity",
    action: "researched",
    title: "Researched organic social growth tactics",
    description: "Compiled 12 proven strategies for bootstrapped SaaS growth on Twitter/X and LinkedIn.",
    project: "marketing-tool",
    tags: ["research", "growth"],
  },
  {
    timestamp: ago(2, 2.5),
    actor: "Gemini",
    action: "reviewed",
    title: "Reviewed PR #3 - weekly digest email template",
    project: "mission-control",
    tags: ["review", "email"],
  },
  {
    timestamp: ago(2, 2.5),
    actor: "Warp",
    action: "committed",
    title: "Scaffolded moltbook-cli with Commander.js",
    project: "moltbook-cli",
    tags: ["cli", "scaffolding"],
  },
  {
    timestamp: ago(2.5, 3),
    actor: "Molty",
    action: "delegated",
    title: "Delegated SEO audit to Perplexity",
    description: "Asked Perplexity to research top 10 keywords for micro-apps landing page.",
    project: "marketing-tool",
    tags: ["delegation", "seo"],
  },
  {
    timestamp: ago(3, 3.5),
    actor: "Codex",
    action: "shipped",
    title: "Shipped global search across all Convex tables",
    project: "mission-control",
    tags: ["search", "backend"],
  },
  {
    timestamp: ago(3, 3.5),
    actor: "Molty",
    action: "posted",
    title: "Posted 'Building in public with AI agents' on Moltbook",
    tags: ["content", "moltbook"],
  },
  {
    timestamp: ago(3.5, 4),
    actor: "Gemini",
    action: "researched",
    title: "Analysed competitor pricing for micro-SaaS tools",
    description: "Benchmarked 8 competitors; median price point $9/mo for hobbyist tier.",
    project: "marketing-tool",
    tags: ["research", "pricing"],
  },
  {
    timestamp: ago(4, 4.5),
    actor: "Warp",
    action: "deployed",
    title: "Deployed moltbook-cli v0.1.0 to npm (dry run)",
    project: "moltbook-cli",
    tags: ["deploy", "npm"],
  },
  {
    timestamp: ago(4.5, 5),
    actor: "Codex",
    action: "committed",
    title: "Added basic auth middleware to Mission Control",
    project: "mission-control",
    tags: ["auth", "security"],
  },
  {
    timestamp: ago(5, 5.5),
    actor: "Molty",
    action: "reviewed",
    title: "Reviewed UX copy for onboarding flow",
    project: "marketing-tool",
    tags: ["review", "ux"],
  },
  {
    timestamp: ago(5, 5.5),
    actor: "Perplexity",
    action: "researched",
    title: "Researched Convex vs Supabase for real-time dashboards",
    description: "Convex wins on DX and real-time; Supabase better for Postgres ecosystem.",
    project: "mission-control",
    tags: ["research", "database"],
  },
  {
    timestamp: ago(5.5, 6),
    actor: "Molty",
    action: "shipped",
    title: "Shipped dark mode toggle across all pages",
    project: "mission-control",
    tags: ["frontend", "design"],
  },
  {
    timestamp: ago(6, 6.5),
    actor: "Warp",
    action: "committed",
    title: "Added `moltbook post` command with frontmatter support",
    project: "moltbook-cli",
    tags: ["cli", "feature"],
  },
  {
    timestamp: ago(6, 6.5),
    actor: "Gemini",
    action: "delegated",
    title: "Delegated thumbnail generation to DALL·E via API",
    project: "marketing-tool",
    tags: ["delegation", "images"],
  },
  {
    timestamp: ago(6.5, 7),
    actor: "Codex",
    action: "deployed",
    title: "Deployed scheduled-tasks table and cron handler",
    project: "mission-control",
    tags: ["backend", "cron"],
  },
  {
    timestamp: ago(6.5, 7),
    actor: "Molty",
    action: "posted",
    title: "Posted weekly retrospective on Moltbook",
    description: "Covered: Mission Control launch, marketing-tool progress, moltbook-cli scaffolding.",
    tags: ["content", "retro"],
  },
  {
    timestamp: ago(7, 7),
    actor: "Perplexity",
    action: "researched",
    title: "Compiled agent-to-agent communication protocols overview",
    description: "Surveyed MCP, AgentMail, and custom webhook patterns for multi-agent orchestration.",
    tags: ["research", "agents"],
  },
];

async function main() {
  console.log(`Seeding ${activities.length} activities to ${CONVEX_URL} ...`);
  const ids = await client.mutation(api.activities.logBatch, { activities });
  console.log(`✅ Seeded ${ids.length} activities.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
