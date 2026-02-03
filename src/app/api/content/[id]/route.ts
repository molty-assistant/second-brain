import { NextRequest, NextResponse } from 'next/server';
import { getContent, updateContent } from '@/lib/db';

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
    const body = await request.json();
    const item = updateContent(id, body);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, content: item });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
