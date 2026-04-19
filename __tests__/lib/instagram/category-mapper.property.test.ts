// ---------------------------------------------------------------------------
// Property-based tests – Category Mapper
// ---------------------------------------------------------------------------

import fc from 'fast-check';
import {
  mapCaptionToCategory,
  HASHTAG_MAP,
  DEFAULT_CATEGORY,
} from '@/lib/instagram/category-mapper';
import type { PortfolioCategory } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All recognised hashtags (lowercase) and their expected categories. */
const RECOGNISED_ENTRIES = Object.entries(HASHTAG_MAP) as [
  string,
  PortfolioCategory,
][];

/**
 * Arbitrary that produces a recognised hashtag key (e.g. '#gel') paired with
 * its expected category, chosen uniformly at random.
 */
const recognisedHashtagArb = fc.constantFrom(...RECOGNISED_ENTRIES);

/**
 * Arbitrary that randomises the case of each character in a string while
 * preserving the characters themselves.
 */
function randomCaseArb(s: string): fc.Arbitrary<string> {
  // For each character, randomly choose upper or lower case
  return fc
    .tuple(...[...s].map((ch) => fc.boolean().map((up) => (up ? ch.toUpperCase() : ch.toLowerCase()))))
    .map((chars) => chars.join(''));
}

/**
 * Arbitrary that generates a random filler string that does NOT contain any
 * recognised hashtag. Used to build captions around the target hashtag.
 */
const fillerArb = fc
  .string({ unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz 0123456789,.!?') })
  .filter((s) => {
    const lower = s.toLowerCase();
    return !RECOGNISED_ENTRIES.some(([tag]) => lower.includes(tag));
  });

// ---------------------------------------------------------------------------
// Property 2: Hashtag-to-category mapping with case insensitivity
// ---------------------------------------------------------------------------

describe('Category Mapper – Property 2: Hashtag-to-category mapping with case insensitivity', () => {
  it(
    'should map a recognised hashtag to its category regardless of case',
    () => {
      fc.assert(
        fc.property(
          recognisedHashtagArb.chain(([tag, expectedCategory]) =>
            // Randomise the case of the hashtag, then pair with expected category
            randomCaseArb(tag).map((mixedCaseTag) => ({
              mixedCaseTag,
              expectedCategory,
            })),
          ),
          fillerArb,
          fillerArb,
          ({ mixedCaseTag, expectedCategory }, prefixFiller, suffixFiller) => {
            // Build a caption with the mixed-case hashtag surrounded by filler
            const caption = `${prefixFiller} ${mixedCaseTag} ${suffixFiller}`;
            const result = mapCaptionToCategory(caption);

            expect(result).toBe(expectedCategory);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should produce the same category for any case variant of the same hashtag',
    () => {
      fc.assert(
        fc.property(
          recognisedHashtagArb.chain(([tag, _]) =>
            fc.tuple(randomCaseArb(tag), randomCaseArb(tag)).map(
              ([variant1, variant2]) => ({
                variant1,
                variant2,
                tag,
              }),
            ),
          ),
          ({ variant1, variant2 }) => {
            const result1 = mapCaptionToCategory(variant1);
            const result2 = mapCaptionToCategory(variant2);

            expect(result1).toBe(result2);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});


// ---------------------------------------------------------------------------
// Property 3: First recognised hashtag determines category
// ---------------------------------------------------------------------------

describe('Category Mapper – Property 3: First recognised hashtag determines category', () => {
  /**
   * Arbitrary that picks two *distinct* recognised hashtag entries so we can
   * verify ordering matters when both appear in the same caption.
   */
  const twoDistinctHashtagsArb = fc
    .tuple(recognisedHashtagArb, recognisedHashtagArb)
    .filter(([a, b]) => a[0] !== b[0]);

  it(
    'should return the category of the first recognised hashtag in the caption',
    () => {
      fc.assert(
        fc.property(
          twoDistinctHashtagsArb,
          fillerArb,
          fillerArb,
          fillerArb,
          (
            [firstEntry, secondEntry],
            prefixFiller,
            middleFiller,
            suffixFiller,
          ) => {
            const [firstTag, firstCategory] = firstEntry;
            const [secondTag] = secondEntry;

            // Build caption: filler + first hashtag + filler + second hashtag + filler
            const caption = `${prefixFiller} ${firstTag} ${middleFiller} ${secondTag} ${suffixFiller}`;
            const result = mapCaptionToCategory(caption);

            expect(result).toBe(firstCategory);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should change the result when the order of two recognised hashtags is swapped',
    () => {
      fc.assert(
        fc.property(
          twoDistinctHashtagsArb.filter(
            ([a, b]) => a[1] !== b[1], // categories must differ to observe a change
          ),
          fillerArb,
          ([firstEntry, secondEntry], filler) => {
            const [tagA, categoryA] = firstEntry;
            const [tagB, categoryB] = secondEntry;

            // Caption with A first → should return A's category
            const captionAFirst = `${filler} ${tagA} ${filler} ${tagB}`;
            expect(mapCaptionToCategory(captionAFirst)).toBe(categoryA);

            // Caption with B first → should return B's category
            const captionBFirst = `${filler} ${tagB} ${filler} ${tagA}`;
            expect(mapCaptionToCategory(captionBFirst)).toBe(categoryB);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Property 4: Default category for unrecognised captions
// ---------------------------------------------------------------------------

describe('Category Mapper – Property 4: Default category for unrecognised captions', () => {
  /** All recognised hashtag strings (lowercase), used to filter them out. */
  const RECOGNISED_TAGS = RECOGNISED_ENTRIES.map(([tag]) => tag);

  /**
   * Arbitrary that generates a string guaranteed NOT to contain any recognised
   * hashtag (case-insensitive). This covers plain text, random characters,
   * unrecognised hashtags like #beauty or #summer, and empty strings.
   */
  const unrecognisedCaptionArb = fc
    .string({ unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz #0123456789,.!?_') })
    .filter((s) => {
      const lower = s.toLowerCase();
      return !RECOGNISED_TAGS.some((tag) => lower.includes(tag));
    });

  it(
    'should return the default category for any caption without a recognised hashtag',
    () => {
      fc.assert(
        fc.property(unrecognisedCaptionArb, (caption) => {
          const result = mapCaptionToCategory(caption);
          expect(result).toBe(DEFAULT_CATEGORY);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should return the default category for undefined and empty captions',
    () => {
      expect(mapCaptionToCategory(undefined)).toBe(DEFAULT_CATEGORY);
      expect(mapCaptionToCategory('')).toBe(DEFAULT_CATEGORY);
    },
  );

  it(
    'should return the default category for captions with only unrecognised hashtags',
    () => {
      /**
       * Arbitrary that generates hashtags that are NOT in the recognised set.
       * Uses word characters after '#' to form valid hashtag shapes.
       */
      const unrecognisedHashtagArb = fc
        .string({
          unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789_'),
          minLength: 1,
          maxLength: 15,
        })
        .filter((word) => {
          const tag = `#${word}`.toLowerCase();
          return !RECOGNISED_TAGS.includes(tag);
        })
        .map((word) => `#${word}`);

      fc.assert(
        fc.property(
          fc.array(unrecognisedHashtagArb, { minLength: 1, maxLength: 5 }),
          fillerArb,
          (hashtags, filler) => {
            const caption = `${filler} ${hashtags.join(' ')} ${filler}`;
            const result = mapCaptionToCategory(caption);
            expect(result).toBe(DEFAULT_CATEGORY);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
