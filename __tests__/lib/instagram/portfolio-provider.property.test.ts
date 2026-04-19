// ---------------------------------------------------------------------------
// Property-based tests – Portfolio Data Provider
// ---------------------------------------------------------------------------

import fc from 'fast-check';
import {
  transformInstagramItem,
  mergePortfolioItems,
} from '@/lib/instagram/portfolio-provider';
import type { InstagramMediaItem } from '@/lib/instagram/types';
import type { PortfolioCategory, PortfolioItem } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All valid portfolio categories. */
const VALID_CATEGORIES: PortfolioCategory[] = [
  'Gel',
  'Acrylics',
  'Nail Art',
  'Press-Ons',
];

/** Arbitrary that generates a valid Instagram media type (non-VIDEO). */
const nonVideoMediaTypeArb = fc.constantFrom<InstagramMediaItem['media_type']>(
  'IMAGE',
  'CAROUSEL_ALBUM',
);

/** Arbitrary that generates a plausible Instagram media item. */
const instagramMediaItemArb: fc.Arbitrary<InstagramMediaItem> = fc.record({
  id: fc.uuid(),
  media_type: nonVideoMediaTypeArb,
  media_url: fc.webUrl(),
  caption: fc.option(fc.string({ minLength: 0, maxLength: 300 }), {
    nil: undefined,
  }),
  timestamp: fc
    .integer({ min: 1577836800000, max: 1798761600000 }) // 2020-01-01 to 2026-12-31
    .map((ms) => new Date(ms).toISOString()),
  permalink: fc.webUrl(),
});

// ---------------------------------------------------------------------------
// Property 5: Instagram-to-PortfolioItem transformation completeness
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Property 6: Alt text truncation and fallback
// ---------------------------------------------------------------------------

describe('Portfolio Data Provider – Property 6: Alt text truncation and fallback', () => {
  /** Arbitrary that generates an item with a non-empty caption. */
  const itemWithCaptionArb = fc.record({
    id: fc.uuid(),
    media_type: nonVideoMediaTypeArb,
    media_url: fc.webUrl(),
    caption: fc.string({ minLength: 1, maxLength: 300 }),
    timestamp: fc
      .integer({ min: 1577836800000, max: 1798761600000 })
      .map((ms) => new Date(ms).toISOString()),
    permalink: fc.webUrl(),
  });

  /** Arbitrary that generates an item with no caption (undefined). */
  const itemWithoutCaptionArb = fc.record({
    id: fc.uuid(),
    media_type: nonVideoMediaTypeArb,
    media_url: fc.webUrl(),
    caption: fc.constant(undefined),
    timestamp: fc
      .integer({ min: 1577836800000, max: 1798761600000 })
      .map((ms) => new Date(ms).toISOString()),
    permalink: fc.webUrl(),
  });

  /** Arbitrary that generates an item with an empty or whitespace-only caption. */
  const itemWithEmptyCaptionArb = fc.record({
    id: fc.uuid(),
    media_type: nonVideoMediaTypeArb,
    media_url: fc.webUrl(),
    caption: fc
      .array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 0, maxLength: 10 })
      .map((chars) => chars.join('')),
    timestamp: fc
      .integer({ min: 1577836800000, max: 1798761600000 })
      .map((ms) => new Date(ms).toISOString()),
    permalink: fc.webUrl(),
  });

  it(
    'should produce alt text that is at most 120 characters long for any input',
    () => {
      fc.assert(
        fc.property(instagramMediaItemArb, (item) => {
          const result = transformInstagramItem(item);
          expect(result.alt.length).toBeLessThanOrEqual(120);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should truncate a non-empty caption to 120 characters when it exceeds that length',
    () => {
      // Generate items whose caption, after trimming, is still longer than 120 chars.
      // We use a printable ASCII string (no leading/trailing whitespace issues)
      // prefixed with a non-whitespace char to guarantee trim doesn't collapse it.
      const longCaptionItemArb = fc.record({
        id: fc.uuid(),
        media_type: nonVideoMediaTypeArb,
        media_url: fc.webUrl(),
        caption: fc
          .string({ minLength: 121, maxLength: 300 })
          .filter((s) => s.trim().length > 120),
        timestamp: fc
          .integer({ min: 1577836800000, max: 1798761600000 })
          .map((ms) => new Date(ms).toISOString()),
        permalink: fc.webUrl(),
      });

      fc.assert(
        fc.property(longCaptionItemArb, (item) => {
          const result = transformInstagramItem(item);
          const trimmed = item.caption!.trim();
          expect(result.alt.length).toBe(120);
          expect(result.alt).toBe(trimmed.slice(0, 120));
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should use the full caption as alt text when it is 120 characters or fewer',
    () => {
      // Generate items with a non-empty, non-whitespace caption ≤ 120 chars
      const shortCaptionItemArb = fc.record({
        id: fc.uuid(),
        media_type: nonVideoMediaTypeArb,
        media_url: fc.webUrl(),
        caption: fc.string({ minLength: 1, maxLength: 120 }).filter((s) => s.trim().length > 0),
        timestamp: fc
          .integer({ min: 1577836800000, max: 1798761600000 })
          .map((ms) => new Date(ms).toISOString()),
        permalink: fc.webUrl(),
      });

      fc.assert(
        fc.property(shortCaptionItemArb, (item) => {
          const result = transformInstagramItem(item);
          expect(result.alt).toBe(item.caption!.trim().slice(0, 120));
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should use the default fallback alt text when caption is undefined',
    () => {
      fc.assert(
        fc.property(itemWithoutCaptionArb, (item) => {
          const result = transformInstagramItem(item);
          expect(result.alt).toBe('Nail design by Anna Nails');
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should use the default fallback alt text when caption is empty or whitespace-only',
    () => {
      fc.assert(
        fc.property(itemWithEmptyCaptionArb, (item) => {
          const result = transformInstagramItem(item);
          expect(result.alt).toBe('Nail design by Anna Nails');
        }),
        { numRuns: 100 },
      );
    },
  );
});

describe('Portfolio Data Provider – Property 5: Instagram-to-PortfolioItem transformation completeness', () => {
  it(
    'should produce a PortfolioItem with id equal to the Instagram media ID',
    () => {
      fc.assert(
        fc.property(instagramMediaItemArb, (item) => {
          const result = transformInstagramItem(item);
          expect(result.id).toBe(item.id);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should produce a PortfolioItem with src equal to the Instagram media_url',
    () => {
      fc.assert(
        fc.property(instagramMediaItemArb, (item) => {
          const result = transformInstagramItem(item);
          expect(result.src).toBe(item.media_url);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should produce a PortfolioItem with a valid PortfolioCategory',
    () => {
      fc.assert(
        fc.property(instagramMediaItemArb, (item) => {
          const result = transformInstagramItem(item);
          expect(VALID_CATEGORIES).toContain(result.category);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should produce a PortfolioItem with aspectRatio equal to "square"',
    () => {
      fc.assert(
        fc.property(instagramMediaItemArb, (item) => {
          const result = transformInstagramItem(item);
          expect(result.aspectRatio).toBe('square');
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should produce a PortfolioItem with all required fields present',
    () => {
      fc.assert(
        fc.property(instagramMediaItemArb, (item) => {
          const result = transformInstagramItem(item);

          expect(result).toHaveProperty('id');
          expect(result).toHaveProperty('src');
          expect(result).toHaveProperty('alt');
          expect(result).toHaveProperty('category');
          expect(result).toHaveProperty('aspectRatio');

          // All fields should be non-empty strings
          expect(typeof result.id).toBe('string');
          expect(result.id.length).toBeGreaterThan(0);
          expect(typeof result.src).toBe('string');
          expect(result.src.length).toBeGreaterThan(0);
          expect(typeof result.alt).toBe('string');
          expect(result.alt.length).toBeGreaterThan(0);
          expect(typeof result.category).toBe('string');
          expect(typeof result.aspectRatio).toBe('string');
        }),
        { numRuns: 100 },
      );
    },
  );
});


// ---------------------------------------------------------------------------
// Property 7: Merge deduplication and ordering
// ---------------------------------------------------------------------------

describe('Portfolio Data Provider – Property 7: Merge deduplication and ordering', () => {
  /** Valid portfolio categories for generating PortfolioItem instances. */
  const portfolioCategoryArb: fc.Arbitrary<PortfolioCategory> = fc.constantFrom(
    'Gel',
    'Acrylics',
    'Nail Art',
    'Press-Ons',
  );

  /** Valid aspect ratios for PortfolioItem. */
  const aspectRatioArb = fc.constantFrom<PortfolioItem['aspectRatio']>(
    'portrait',
    'landscape',
    'square',
  );

  /** Arbitrary that generates a valid PortfolioItem. */
  const portfolioItemArb: fc.Arbitrary<PortfolioItem> = fc.record({
    id: fc.uuid(),
    src: fc.webUrl(),
    alt: fc.string({ minLength: 1, maxLength: 120 }),
    category: portfolioCategoryArb,
    aspectRatio: aspectRatioArb,
  });

  it(
    'should contain no duplicate id values in the merged result',
    () => {
      fc.assert(
        fc.property(
          fc.array(portfolioItemArb, { minLength: 0, maxLength: 20 }),
          fc.array(portfolioItemArb, { minLength: 0, maxLength: 20 }),
          (instagramItems, fallbackItems) => {
            const merged = mergePortfolioItems(instagramItems, fallbackItems);
            const ids = merged.map((item) => item.id);
            const uniqueIds = new Set(ids);
            expect(ids.length).toBe(uniqueIds.size);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should place all Instagram-sourced items before fallback items',
    () => {
      fc.assert(
        fc.property(
          fc.array(portfolioItemArb, { minLength: 1, maxLength: 20 }),
          fc.array(portfolioItemArb, { minLength: 1, maxLength: 20 }),
          (instagramItems, fallbackItems) => {
            const merged = mergePortfolioItems(instagramItems, fallbackItems);

            // All Instagram items should appear at the start, in order
            for (let i = 0; i < instagramItems.length; i++) {
              expect(merged[i].id).toBe(instagramItems[i].id);
            }

            // Remaining items should only be fallback items whose ids
            // were not already present in the Instagram set
            const instagramIds = new Set(instagramItems.map((item) => item.id));
            const remainingItems = merged.slice(instagramItems.length);
            for (const item of remainingItems) {
              expect(instagramIds.has(item.id)).toBe(false);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should retain the Instagram item when an Instagram item and a fallback item share the same id',
    () => {
      // Generate a shared id and two distinct items that use it
      fc.assert(
        fc.property(
          fc.uuid(),
          portfolioItemArb,
          portfolioItemArb,
          fc.array(portfolioItemArb, { minLength: 0, maxLength: 10 }),
          fc.array(portfolioItemArb, { minLength: 0, maxLength: 10 }),
          (sharedId, igBase, fbBase, extraIg, extraFb) => {
            const igItem: PortfolioItem = { ...igBase, id: sharedId };
            const fbItem: PortfolioItem = { ...fbBase, id: sharedId };

            const instagramItems = [igItem, ...extraIg];
            const fallbackItems = [fbItem, ...extraFb];

            const merged = mergePortfolioItems(instagramItems, fallbackItems);

            // The shared id should appear exactly once
            const matchingItems = merged.filter((item) => item.id === sharedId);
            expect(matchingItems).toHaveLength(1);

            // And it should be the Instagram version
            expect(matchingItems[0].src).toBe(igItem.src);
            expect(matchingItems[0].alt).toBe(igItem.alt);
            expect(matchingItems[0].category).toBe(igItem.category);
            expect(matchingItems[0].aspectRatio).toBe(igItem.aspectRatio);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should include all Instagram items and all non-conflicting fallback items',
    () => {
      fc.assert(
        fc.property(
          fc.array(portfolioItemArb, { minLength: 0, maxLength: 20 }),
          fc.array(portfolioItemArb, { minLength: 0, maxLength: 20 }),
          (instagramItems, fallbackItems) => {
            const merged = mergePortfolioItems(instagramItems, fallbackItems);

            const instagramIds = new Set(instagramItems.map((item) => item.id));
            const nonConflictingFallback = fallbackItems.filter(
              (item) => !instagramIds.has(item.id),
            );
            // Deduplicate non-conflicting fallback items themselves by id
            // (fallback array may contain internal duplicates)
            const seenFallbackIds = new Set<string>();
            const uniqueNonConflicting = nonConflictingFallback.filter((item) => {
              if (seenFallbackIds.has(item.id)) return false;
              seenFallbackIds.add(item.id);
              return true;
            });

            // Deduplicate Instagram items by id (first occurrence wins)
            const seenIgIds = new Set<string>();
            const uniqueIg = instagramItems.filter((item) => {
              if (seenIgIds.has(item.id)) return false;
              seenIgIds.add(item.id);
              return true;
            });

            // Merged length should equal unique Instagram items + unique non-conflicting fallback
            expect(merged.length).toBe(uniqueIg.length + uniqueNonConflicting.length);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should return only fallback items when Instagram array is empty',
    () => {
      fc.assert(
        fc.property(
          fc.array(portfolioItemArb, { minLength: 1, maxLength: 20 }),
          (fallbackItems) => {
            const merged = mergePortfolioItems([], fallbackItems);
            expect(merged).toEqual(fallbackItems);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should return only Instagram items when fallback array is empty',
    () => {
      fc.assert(
        fc.property(
          fc.array(portfolioItemArb, { minLength: 1, maxLength: 20 }),
          (instagramItems) => {
            const merged = mergePortfolioItems(instagramItems, []);
            expect(merged).toEqual(instagramItems);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
