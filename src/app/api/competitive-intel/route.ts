import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function loadIntelData(): { competitors: Record<string, string>; keywords: Record<string, string> } {
  // Avoid Turbopack JSON import issues on Railway builds by loading at runtime.
  // If the file is missing in an environment, degrade gracefully.
  try {
    const p = path.join(process.cwd(), 'src', 'data', 'competitive-intel.json');
    const raw = readFileSync(p, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    const data = parsed as Partial<{ competitors: Record<string, string>; keywords: Record<string, string> }>;
    return {
      competitors: data.competitors ?? {},
      keywords: data.keywords ?? {},
    };
  } catch {
    return { competitors: {}, keywords: {} };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const app = searchParams.get('app');

  const intelData = loadIntelData();

  if (app) {
    const competitors = (intelData.competitors as Record<string, string>)[app] ?? null;
    const keywords = (intelData.keywords as Record<string, string>)[app] ?? null;

    if (!competitors && !keywords) {
      return NextResponse.json(
        { success: false, error: `No data for app: ${app}. Available: ${Object.keys(intelData.competitors).join(', ')}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      app,
      competitors,
      keywords,
    });
  }

  // Return list of available apps
  return NextResponse.json({
    success: true,
    apps: Object.keys(intelData.competitors),
    keywordApps: Object.keys(intelData.keywords),
  });
}
