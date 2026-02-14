import { NextRequest, NextResponse } from 'next/server';

interface Review {
  author: string;
  title: string;
  content: string;
  rating: number;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appId');

  if (!appId) {
    return NextResponse.json(
      { success: false, error: 'Missing appId parameter', reviews: [] },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
      `https://itunes.apple.com/gb/rss/customerreviews/id=${appId}/sortBy=mostRecent/json`,
      { signal: controller.signal, next: { revalidate: 300 } }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `iTunes API returned ${res.status}`, reviews: [] },
        { status: 502 }
      );
    }

    const data = await res.json();
    const entries = data?.feed?.entry;

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json({
        success: true,
        reviews: [],
        message: 'No reviews found for this app',
      });
    }

    const reviews: Review[] = entries
      .filter((e: Record<string, unknown>) => e['im:rating'])
      .map((e: Record<string, Record<string, Record<string, string>>>) => {
        const rating = parseInt(e['im:rating'].label, 10);
        return {
          author: e.author?.name?.label ?? 'Unknown',
          title: e.title?.label ?? '',
          content: e.content?.label ?? '',
          rating,
          date: e.updated?.label ?? '',
          sentiment: rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative',
        } as Review;
      });

    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message, reviews: [] },
      { status: 500 }
    );
  }
}
