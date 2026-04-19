// ---------------------------------------------------------------------------
// Property-based tests – Instagram API Client
// ---------------------------------------------------------------------------

import fc from 'fast-check';
import { createInstagramClient } from '@/lib/instagram/client';
import type { InstagramMediaItem } from '@/lib/instagram/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Arbitrary that generates a valid Instagram media type. */
const mediaTypeArb = fc.constantFrom<InstagramMediaItem['media_type']>(
  'IMAGE',
  'VIDEO',
  'CAROUSEL_ALBUM',
);

/** Arbitrary that generates a plausible Instagram media item. */
const instagramMediaItemArb = (
  mediaType?: InstagramMediaItem['media_type'],
): fc.Arbitrary<InstagramMediaItem> =>
  fc.record({
    id: fc.uuid(),
    media_type: mediaType ? fc.constant(mediaType) : mediaTypeArb,
    media_url: fc.webUrl(),
    caption: fc.option(fc.string({ minLength: 0, maxLength: 200 }), {
      nil: undefined,
    }),
    timestamp: fc
      .integer({ min: 1577836800000, max: 1798761600000 }) // 2020-01-01 to 2026-12-31
      .map((ms) => new Date(ms).toISOString()),
    permalink: fc.webUrl(),
  });

/** Arbitrary that generates an array of mixed-type Instagram media items. */
const mixedMediaArrayArb = fc.array(instagramMediaItemArb(), {
  minLength: 0,
  maxLength: 30,
});

/**
 * Sets up `global.fetch` to return the given media items for the main media
 * endpoint, and a single IMAGE child for any CAROUSEL_ALBUM children request.
 */
function mockFetchForItems(items: InstagramMediaItem[]): void {
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    // Children endpoint for CAROUSEL_ALBUM items
    if (url.includes('/children')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: 'child-1',
                media_type: 'IMAGE' as const,
                media_url: 'https://cdn.example.com/child.jpg',
              },
            ],
          }),
      });
    }

    // Main media endpoint
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: items }),
    });
  });
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Property 1: Video media type exclusion
// ---------------------------------------------------------------------------

describe('Instagram API Client – Property 1: Video media type exclusion', () => {
  const client = createInstagramClient({
    accessToken: 'test-token',
    userId: 'test-user',
  });

  it(
    'should never return items with media_type VIDEO',
    () => {
      return fc.assert(
        fc.asyncProperty(mixedMediaArrayArb, async (items) => {
          mockFetchForItems(items);

          const result = await client.fetchMedia();

          // No VIDEO items in the output
          const videoItems = result.filter((r) => r.media_type === 'VIDEO');
          expect(videoItems).toHaveLength(0);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should retain every IMAGE item from the input',
    () => {
      return fc.assert(
        fc.asyncProperty(mixedMediaArrayArb, async (items) => {
          mockFetchForItems(items);

          const result = await client.fetchMedia();
          const resultIds = new Set(result.map((r) => r.id));

          const inputImageItems = items.filter(
            (item) => item.media_type === 'IMAGE',
          );

          for (const imageItem of inputImageItems) {
            expect(resultIds).toContain(imageItem.id);
          }
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should retain every CAROUSEL_ALBUM item from the input (resolved with child image)',
    () => {
      return fc.assert(
        fc.asyncProperty(mixedMediaArrayArb, async (items) => {
          mockFetchForItems(items);

          const result = await client.fetchMedia();
          const resultIds = new Set(result.map((r) => r.id));

          const inputCarouselItems = items.filter(
            (item) => item.media_type === 'CAROUSEL_ALBUM',
          );

          for (const carouselItem of inputCarouselItems) {
            expect(resultIds).toContain(carouselItem.id);
          }
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should return exactly the count of IMAGE + CAROUSEL_ALBUM items from the input',
    () => {
      return fc.assert(
        fc.asyncProperty(mixedMediaArrayArb, async (items) => {
          mockFetchForItems(items);

          const result = await client.fetchMedia();

          const expectedCount = items.filter(
            (item) =>
              item.media_type === 'IMAGE' ||
              item.media_type === 'CAROUSEL_ALBUM',
          ).length;

          expect(result).toHaveLength(expectedCount);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should produce an empty array when all input items are VIDEO',
    () => {
      return fc.assert(
        fc.asyncProperty(
          fc.array(instagramMediaItemArb('VIDEO'), {
            minLength: 1,
            maxLength: 20,
          }),
          async (videoOnlyItems) => {
            mockFetchForItems(videoOnlyItems);

            const result = await client.fetchMedia();

            expect(result).toHaveLength(0);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
