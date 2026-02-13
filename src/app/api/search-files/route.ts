import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function shellEscapeSingleQuotes(input: string) {
  // Wrap in single quotes for shell; escape any embedded single quotes.
  return `'${input.replace(/'/g, `'"'"'`)}'`;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const term = shellEscapeSingleQuotes(q);

  const memoryPath = '/Users/moltbot/.openclaw/workspace/memory/';
  const projectsPath = '/Users/moltbot/.openclaw/workspace/projects/';

  // Per spec: use grep -r -i -l --include="*.md" -n "searchterm" <paths>
  const listCmd = `grep -r -i -l --include="*.md" -n ${term} ${memoryPath} ${projectsPath} 2>/dev/null || true`;

  const fileListRaw = execSync(listCmd, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  const files = fileListRaw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

  const results = files.map((p) => {
    let matches: Array<{ line: string; lineNumber: number; context?: string }> = [];

    try {
      const matchCmd = `grep -n -i ${term} ${shellEscapeSingleQuotes(p)} 2>/dev/null | head -n 5 || true`;
      const out = execSync(matchCmd, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });

      matches = out
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const idx = line.indexOf(':');
          const lineNumber = idx > 0 ? Number(line.slice(0, idx)) : 0;
          const content = idx > 0 ? line.slice(idx + 1) : line;
          return {
            line: content,
            lineNumber: Number.isFinite(lineNumber) ? lineNumber : 0,
            context: content,
          };
        });
    } catch {
      // ignore per-file grep failures
    }

    return {
      path: p,
      filename: path.basename(p),
      matches,
    };
  });

  return NextResponse.json({ results });
}
