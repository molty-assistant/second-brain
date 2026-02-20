#!/usr/bin/env node

const VALID_PRIORITIES = new Set(['now', 'next', 'later']);
const VALID_STATUSES = new Set(['todo', 'in_progress', 'review', 'done', 'blocked']);
const VALID_WORKERS = new Set(['codex', 'claude', 'lmstudio', 'molty']);

function printUsage() {
  console.log(`Usage:
  node tools/workforce/create-workorder.js --title "Implement X" [options]

Options:
  --priority now|next|later                 (default: next)
  --status todo|in_progress|review|done|blocked (default: todo)
  --worker codex|claude|lmstudio|molty      (default: codex)
  --repo owner/repo
  --acceptance "item 1|item 2"              (repeatable)
  --constraints "item 1|item 2"             (repeatable)
  --links "https://...|https://..."         (repeatable)
  --id WO-CUSTOM-ID
  --help

Environment:
  CONVEX_URL or NEXT_PUBLIC_CONVEX_URL must be set.
`);
}

function parseArgs(argv) {
  const parsed = {};
  const repeatable = new Set(['acceptance', 'constraints', 'links']);

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    const next = argv[i + 1];
    const hasValue = next && !next.startsWith('--');
    const value = hasValue ? next : 'true';

    if (repeatable.has(key)) {
      if (!parsed[key]) parsed[key] = [];
      parsed[key].push(value);
    } else {
      parsed[key] = value;
    }

    if (hasValue) i += 1;
  }

  return parsed;
}

function parseList(values) {
  if (!values) return [];
  const input = Array.isArray(values) ? values : [values];
  return input
    .flatMap((item) => String(item).split(/[|\n]/g))
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeFilePart(input) {
  return String(input).replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function main() {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { ConvexHttpClient } = await import('convex/browser');
  const { makeFunctionReference } = await import('convex/server');

  const args = parseArgs(process.argv);

  if (args.help === 'true') {
    printUsage();
    return;
  }

  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error('Error: set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL.');
    process.exit(1);
  }

  const title = String(args.title || '').trim();
  if (!title) {
    console.error('Error: --title is required.');
    printUsage();
    process.exit(1);
  }

  const priority = String(args.priority || 'next');
  const status = String(args.status || 'todo');
  const worker = String(args.worker || 'codex');

  if (!VALID_PRIORITIES.has(priority)) {
    console.error(`Error: invalid --priority '${priority}'.`);
    process.exit(1);
  }
  if (!VALID_STATUSES.has(status)) {
    console.error(`Error: invalid --status '${status}'.`);
    process.exit(1);
  }
  if (!VALID_WORKERS.has(worker)) {
    console.error(`Error: invalid --worker '${worker}'.`);
    process.exit(1);
  }

  const payload = {
    id: args.id ? String(args.id).trim() : undefined,
    title,
    priority,
    status,
    worker,
    repo: args.repo ? String(args.repo).trim() : undefined,
    acceptance: parseList(args.acceptance),
    constraints: parseList(args.constraints),
    links: parseList(args.links),
  };

  const client = new ConvexHttpClient(convexUrl);
  const createWorkOrder = makeFunctionReference('workOrders:create');
  const created = await client.mutation(createWorkOrder, payload);

  if (!created) {
    console.error('Error: Convex did not return a work order.');
    process.exit(1);
  }

  const workspaceRoot = path.resolve(__dirname, '..', '..');
  const auditDir = path.join(workspaceRoot, 'tools', 'workforce', 'workorders');
  fs.mkdirSync(auditDir, { recursive: true });

  const idForFile = sanitizeFilePart(created.id || created._id || Date.now());
  const snapshotPath = path.join(auditDir, `WO-${idForFile}.md`);

  const snapshot = `# Work Order Snapshot: ${created.id || created._id}

> Mission Control (Convex) is the source of truth. This file is an audit snapshot only.

- ID: \`${created.id || ''}\`
- Convex Doc ID: \`${created._id || ''}\`
- Title: ${created.title || ''}
- Priority: ${created.priority || ''}
- Status: ${created.status || ''}
- Worker: ${created.worker || ''}
- Repo: ${created.repo || 'N/A'}
- Created At: ${created.createdAt ? new Date(created.createdAt).toISOString() : ''}
- Updated At: ${created.updatedAt ? new Date(created.updatedAt).toISOString() : ''}

## Acceptance
${(created.acceptance || []).map((item) => `- ${item}`).join('\n') || '- (none)'}

## Constraints
${(created.constraints || []).map((item) => `- ${item}`).join('\n') || '- (none)'}

## Links
${(created.links || []).map((item) => `- ${item}`).join('\n') || '- (none)'}
`;

  fs.writeFileSync(snapshotPath, snapshot, 'utf8');

  console.log(`Created Work Order ${created.id || created._id}`);
  console.log(`Convex URL: ${convexUrl}`);
  console.log(`Audit snapshot: ${snapshotPath}`);
}

main().catch((error) => {
  console.error('Failed to create work order:', error);
  process.exit(1);
});
