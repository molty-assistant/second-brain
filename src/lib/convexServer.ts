type LogActivityArgs = {
  timestamp?: number;
  actor: string;
  action: string;
  title: string;
  description?: string;
  project?: string;
  tags?: string[];
  metadata?: unknown;
};

function getConvexUrl(): string | null {
  return process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || null;
}

async function postConvexMutation(path: string, args: unknown) {
  const convexUrl = getConvexUrl();
  if (!convexUrl) return null;

  const url = new URL(convexUrl);
  const endpoint = `${url.origin}/api/mutation`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Convex mutation failed (${res.status}): ${txt}`);
  }

  return await res.json();
}

export async function tryLogActivity(activity: LogActivityArgs) {
  try {
    const payload = {
      ...activity,
      timestamp: activity.timestamp ?? Date.now(),
    };
    // Fire-and-forget is fine but we await so logs show up deterministically in tests.
    return await postConvexMutation('activities:log', payload);
  } catch (err) {
    // Don't break core flows if Convex isn't reachable.
    console.warn('[mission-control] activity log failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}
