import { NextRequest, NextResponse } from 'next/server';
import { getContent, updateContent } from '@/lib/db';
import { tryLogActivity } from '@/lib/convexServer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = getContent(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, content: item });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const before = getContent(id);
    const body = await request.json();
    const item = updateContent(id, body);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 });
    }

    await tryLogActivity({
      actor: 'Molty',
      action: 'content_updated',
      title: before && before.status !== item.status
        ? `Content moved: ${item.title} (${before.status} → ${item.status})`
        : `Content updated: ${item.title}`,
      description: item.notes || undefined,
      project: 'mission-control',
      metadata: { contentId: item.id, before, after: item },
    });

    return NextResponse.json({ success: true, content: item });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
