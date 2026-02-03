import { NextRequest, NextResponse } from 'next/server';
import { getAllContent, createContent } from '@/lib/db';

export async function GET() {
  try {
    const content = getAllContent();
    return NextResponse.json({ success: true, content });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    
    const item = createContent(body);
    return NextResponse.json({ success: true, content: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
