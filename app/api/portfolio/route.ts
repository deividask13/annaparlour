import { NextResponse } from 'next/server';

import { getPortfolioItems } from '@/lib/instagram/portfolio-provider';
import { portfolioItems as fallbackItems } from '@/lib/portfolio-data';

/**
 * GET /api/portfolio
 *
 * Returns the unified portfolio items as a JSON array. Instagram-sourced
 * items are placed first, followed by deduplicated fallback items.
 *
 * On any unhandled error the handler returns fallback data with HTTP 200
 * so the client never receives an error response.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const items = await getPortfolioItems();

    return NextResponse.json(items, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return NextResponse.json(fallbackItems, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }
}
