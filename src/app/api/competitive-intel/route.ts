import { NextRequest, NextResponse } from 'next/server';
import intelData from '@/data/competitive-intel.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const app = searchParams.get('app');

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
