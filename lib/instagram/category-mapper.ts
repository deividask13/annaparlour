// ---------------------------------------------------------------------------
// Category Mapper – Instagram Portfolio Integration
// ---------------------------------------------------------------------------

import type { PortfolioCategory } from '@/lib/constants';

/**
 * Maps lowercase hashtags to their corresponding portfolio category.
 * Keys must include the leading '#' and be fully lowercase.
 */
export const HASHTAG_MAP: Record<string, PortfolioCategory> = {
  '#gel': 'Gel',
  '#acrylics': 'Acrylics',
  '#nailart': 'Nail Art',
  '#pressons': 'Press-Ons',
};

/** Category assigned when no recognised hashtag is found in a caption. */
export const DEFAULT_CATEGORY: PortfolioCategory = 'Nail Art';

/**
 * Extracts hashtags from an Instagram post caption and returns the portfolio
 * category for the first recognised hashtag. Matching is case-insensitive.
 *
 * @param caption - The Instagram post caption (may be undefined).
 * @returns The matched `PortfolioCategory`, or `'Nail Art'` when no recognised
 *          hashtag is found.
 */
export function mapCaptionToCategory(
  caption: string | undefined,
): PortfolioCategory {
  if (!caption) return DEFAULT_CATEGORY;

  // Match all hashtags in the caption (# followed by word characters)
  const hashtags = caption.match(/#\w+/g);
  if (!hashtags) return DEFAULT_CATEGORY;

  for (const tag of hashtags) {
    const category = HASHTAG_MAP[tag.toLowerCase()];
    if (category) return category;
  }

  return DEFAULT_CATEGORY;
}
