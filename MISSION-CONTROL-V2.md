# Mission Control v2 — Work Order

## Overview
Rebuild Mission Control with Convex as the database backend and 4 new pages:
1. **Activity Feed** — Every action logged, chronological history
2. **Calendar View** — Weekly view of all scheduled/upcoming tasks
3. **Global Search** — Search across all memory, docs, tasks, activities
4. **Employee Dashboard** — Real-time view of each AI agent's status, current task, recent output

## Tech Stack
- Next.js (existing framework)
- Convex (new database — replaces file-based approach)
- TypeScript
- Tailwind CSS (existing styling)

## Schema Design (convex/schema.ts)

### activities
- `_id`: auto
- `timestamp`: number (ms)
- `agent`: string (e.g. "molty", "codex", "ministral", "perplexity", "gemini")
- `action`: string (e.g. "build", "review", "research", "deploy", "post")
- `summary`: string (human-readable description)
- `detail`: optional string (longer description, diff, output)
- `taskRef`: optional string (links to a task/WO number)
- `status`: string ("completed" | "failed" | "in-progress")
- `metadata`: optional object (arbitrary JSON — tokens used, duration, etc.)

### scheduledTasks
- `_id`: auto
- `name`: string
- `scheduledAt`: number (ms timestamp)
- `recurrence`: optional string (cron expression or "once")
- `agent`: string (who will execute)
- `description`: string
- `status`: string ("pending" | "running" | "completed" | "failed")
- `lastRunAt`: optional number
- `nextRunAt`: optional number

### employees
- `_id`: auto  
- `name`: string (e.g. "Codex", "Ministral 3B", "Perplexity")
- `role`: string (e.g. "Senior Engineer", "Copy Editor", "Research Analyst")
- `model`: string (e.g. "gpt-5.2", "mistralai/ministral-3-3b")
- `status`: string ("idle" | "working" | "offline" | "error")
- `currentTask`: optional string
- `lastActiveAt`: optional number
- `tasksCompleted`: number
- `costType`: string ("free" | "subscription" | "per-token" | "per-query")

### searchIndex
- Search index on activities.summary, activities.detail
- Search index on scheduledTasks.name, scheduledTasks.description

## Pages

### /activity — Activity Feed
- Chronological list, newest first
- Filter by agent, action type, date range
- Each entry: timestamp, agent avatar/badge, summary, status pill
- Click to expand detail
- Pagination or infinite scroll

### /calendar — Calendar View  
- Weekly view (Mon-Sun), current week default
- Navigate prev/next week
- Shows scheduled cron jobs + one-off tasks
- Color-coded by agent
- Click task for detail modal

### /employees — Employee Dashboard
- Card per employee: name, role, status indicator (green/yellow/red)
- Current task (if working)
- Stats: tasks completed, last active
- Cost type badge
- Quick action: "Assign task" button (future)

### /search — Global Search
- Single search bar
- Searches: activities, scheduled tasks, employees
- Results grouped by type with relevance
- Highlight matching terms

## Convex Setup
- `npm install convex`
- `npx convex init` (will need interactive auth by Tom)
- Schema in `convex/schema.ts`
- Functions in `convex/activities.ts`, `convex/scheduledTasks.ts`, `convex/employees.ts`, `convex/search.ts`

## API for Molty to Log Activities
- Convex HTTP endpoint or mutation that Molty can call to log activities
- `logActivity({ agent, action, summary, detail?, taskRef?, status, metadata? })`
- This is how the activity feed gets populated — I call this after every action

## Acceptance Criteria
- [ ] Convex schema created with all 4 tables
- [ ] Activity Feed page with filtering
- [ ] Calendar View with weekly navigation
- [ ] Employee Dashboard with status cards
- [ ] Global Search across all tables
- [ ] Sidebar updated with new nav items
- [ ] Basic auth preserved
- [ ] Builds without errors (`npm run build`)
- [ ] Seed data for employees (all 5 agents pre-populated)
