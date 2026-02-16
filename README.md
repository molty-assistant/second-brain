# Second Brain

A personal knowledge base for capturing and connecting ideas — built with Next.js 14 and styled like a mix of Obsidian and Linear.

## Features

- 📁 **Document viewer** — Clean markdown rendering with syntax highlighting
- 📅 **Journal entries** — Daily summaries and reflections
- 🔍 **Search** — Find documents and entries quickly
- 🏷️ **Tags** — Organize with flexible tagging
- 🌙 **Dark mode** — Easy on the eyes, always

## How It Works

Documents live in the `content/` folder:

```
content/
├── documents/     # Concept notes, ideas, insights
│   ├── welcome.md
│   └── some-concept.md
└── journal/       # Daily entries
    ├── 2026-01-30.md
    └── 2026-01-31.md
```

Each markdown file can have frontmatter:

```markdown
---
title: My Document Title
date: 2026-01-30
tags: [concept, important]
---

# Content goes here...
```

## Authentication

The app supports optional Basic Auth protection via environment variables:

```bash
BASIC_AUTH_USER=your-username
BASIC_AUTH_PASS=your-password
```

If these are not set, the app runs without authentication (useful for local development).

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view.

## Design Philosophy

This isn't a note-taking app — it's a **knowledge base**. The difference:

- Notes are captured; knowledge is connected
- Notes accumulate; knowledge compounds
- Notes are written; knowledge is curated

The system is designed to grow organically from daily conversations, with important concepts extracted and documented over time.

## Tech Stack

- **Next.js 14** — React framework with App Router
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **gray-matter** — Frontmatter parsing
- **remark** — Markdown processing
- **Lucide** — Icons

## Folder Structure

```
src/
├── app/
│   ├── page.tsx           # Home/dashboard
│   ├── doc/[...slug]/     # Document viewer
│   └── globals.css        # Styles
├── components/
│   └── Sidebar.tsx        # Navigation sidebar
└── lib/
    └── documents.ts       # Document utilities
```

## Scripts

### Seed Activities

Populate the activities table with realistic sample data (20 entries spanning 7 days):

```bash
CONVEX_URL=https://<your-deployment>.convex.cloud npx tsx scripts/seed-activities.ts
```

Set `CONVEX_URL` (or `NEXT_PUBLIC_CONVEX_URL`) to your Convex deployment URL. You can find it in the Convex dashboard or in `.env.local`.

## License

MIT
