'use client';

import { useMemo } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;

  const client = useMemo(() => {
    if (!url) return null;
    return new ConvexReactClient(url);
  }, [url]);

  if (!client) {
    // Allows the app to build/run without Convex configured.
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
