// ---------------------------------------------------------------------------
// Portfolio Data Provider – Instagram Portfolio Integration
// ---------------------------------------------------------------------------

import type { PortfolioItem } from '@/lib/constants';
import type { InstagramMediaItem } from '@/lib/instagram/types';
import { mapCaptionToCategory } from '@/lib/instagram/category-mapper';
import { createInstagramClient } from '@/lib/instagram/client';
import { portfolioItems as fallbackItems } from '@/lib/portfolio-data';

/** Fallback alt text when an Instagram post has no caption. */
const DEFAULT_ALT = 'Nail design by Anna Nails';

/** Maximum length for generated alt text. */
const ALT_MAX_LENGTH = 120;

/**
 * Type-guard that validates a raw value looks like a usable Instagram media
 * item before transformation.
 *
 * At minimum, `id` and `media_url` must be present and be non-empty strings.
 * This guards against malformed or partial API responses where required
 * fields are missing, null, or empty.
 */
export function isValidInstagramItem(
  item: unknown,
): item is InstagramMediaItem {
  if (item === null || typeof item !== 'object') {
    return false;
  }

  const record = item as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    record.id.length > 0 &&
    typeof record.media_url === 'string' &&
    record.media_url.length > 0
  );
}

/**
 * Transforms a single Instagram media item into the unified
 * `PortfolioItem` shape used by the front-end gallery.
 *
 * - `id` → Instagram media ID
 * - `src` → Instagram `media_url`
 * - `alt` → Caption truncated to 120 chars, or a default string
 * - `category` → Derived from caption hashtags via `mapCaptionToCategory`
 * - `aspectRatio` → Always `'square'` (Instagram images are predominantly square)
 */
export function transformInstagramItem(
  item: InstagramMediaItem,
): PortfolioItem {
  const caption = item.caption?.trim();
  const alt =
    caption && caption.length > 0
      ? caption.slice(0, ALT_MAX_LENGTH)
      : DEFAULT_ALT;

  return {
    id: item.id,
    src: item.media_url,
    alt,
    category: mapCaptionToCategory(item.caption),
    aspectRatio: 'square',
  };
}

/**
 * Merges Instagram-sourced portfolio items with fallback (local) items.
 *
 * - Instagram items appear first in the returned array.
 * - Fallback items are appended after, but only if their `id` does not
 *   already exist in the Instagram set (deduplication by `id`).
 * - When an Instagram item and a fallback item share the same `id`,
 *   the Instagram item is retained.
 */
export function mergePortfolioItems(
  instagramItems: PortfolioItem[],
  fallbackItems: PortfolioItem[],
): PortfolioItem[] {
  const seenIds = new Set<string>(instagramItems.map((item) => item.id));

  const uniqueFallbackItems = fallbackItems.filter(
    (item) => !seenIds.has(item.id),
  );

  return [...instagramItems, ...uniqueFallbackItems];
}

/**
 * Orchestrates the entire portfolio data pipeline:
 *
 * 1. Checks for required environment variables; returns fallback data if missing.
 * 2. Fetches media from the Instagram Graph API via the Instagram client.
 * 3. Transforms each media item into a `PortfolioItem`.
 * 4. Merges Instagram items with fallback data (deduped by id).
 * 5. On any failure, logs a warning and returns fallback data.
 * 6. Malformed items are individually skipped during transformation.
 */
export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  // Requirement 4.2 – missing env vars → return fallback without API call
  if (!accessToken || !userId) {
    return fallbackItems;
  }

  try {
    const client = createInstagramClient({ accessToken, userId });
    const mediaItems = await client.fetchMedia();

    // Requirement 4.3 – empty response → return fallback data
    if (mediaItems.length === 0) {
      return fallbackItems;
    }

    // Transform items individually, skipping malformed ones (Requirement 4.4)
    const transformedItems: PortfolioItem[] = [];
    let skippedCount = 0;

    for (const item of mediaItems) {
      if (!isValidInstagramItem(item)) {
        skippedCount += 1;
        continue;
      }

      try {
        transformedItems.push(transformInstagramItem(item));
      } catch {
        skippedCount += 1;
      }
    }

    if (skippedCount > 0) {
      console.warn(
        `Instagram portfolio: skipped ${skippedCount} malformed item(s) during transformation`,
      );
    }

    // If all items were malformed, return fallback data
    if (transformedItems.length === 0) {
      return fallbackItems;
    }

    // Merge Instagram items (first) with fallback items (deduped by id)
    return mergePortfolioItems(transformedItems, fallbackItems);
  } catch (error) {
    // Requirements 4.1, 7.2 – API failure / timeout / auth error → fallback
    console.warn('Instagram portfolio fetch failed, using fallback data:', error);
    return fallbackItems;
  }
}
