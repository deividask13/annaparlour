// ---------------------------------------------------------------------------
// Unit tests – Portfolio Data Provider
// ---------------------------------------------------------------------------

import { getPortfolioItems, isValidInstagramItem } from '@/lib/instagram/portfolio-provider';
import { portfolioItems as fallbackItems } from '@/lib/portfolio-data';
import type { InstagramMediaItem } from '@/lib/instagram/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock the Instagram client module so we can control fetchMedia behaviour
jest.mock('@/lib/instagram/client', () => ({
  createInstagramClient: jest.fn(),
}));

import { createInstagramClient } from '@/lib/instagram/client';

const mockCreateInstagramClient = createInstagramClient as jest.MockedFunction<
  typeof createInstagramClient
>;

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

const originalEnv = process.env;

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  // Reset env to a clean copy with valid credentials by default
  process.env = {
    ...originalEnv,
    INSTAGRAM_ACCESS_TOKEN: 'test-token',
    INSTAGRAM_USER_ID: 'test-user-id',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a valid Instagram media item for testing. */
function makeMediaItem(overrides: Partial<InstagramMediaItem> = {}): InstagramMediaItem {
  return {
    id: 'ig-001',
    media_type: 'IMAGE',
    media_url: 'https://cdn.example.com/image1.jpg',
    caption: 'Beautiful nails #gel',
    timestamp: '2025-06-01T12:00:00Z',
    permalink: 'https://instagram.com/p/abc',
    ...overrides,
  };
}

/** Sets up the mock client to return the given items from fetchMedia. */
function mockFetchMedia(items: InstagramMediaItem[]) {
  const mockClient = {
    fetchMedia: jest.fn().mockResolvedValue(items),
    refreshToken: jest.fn(),
  };
  mockCreateInstagramClient.mockReturnValue(mockClient);
  return mockClient;
}

/** Sets up the mock client so fetchMedia rejects with the given error. */
function mockFetchMediaError(error: Error) {
  const mockClient = {
    fetchMedia: jest.fn().mockRejectedValue(error),
    refreshToken: jest.fn(),
  };
  mockCreateInstagramClient.mockReturnValue(mockClient);
  return mockClient;
}

// ---------------------------------------------------------------------------
// Missing environment variables → return fallback without API call
// ---------------------------------------------------------------------------

describe('getPortfolioItems – missing env vars', () => {
  it('should return fallback data when INSTAGRAM_ACCESS_TOKEN is missing', async () => {
    delete process.env.INSTAGRAM_ACCESS_TOKEN;

    const result = await getPortfolioItems();

    expect(result).toEqual(fallbackItems);
    expect(mockCreateInstagramClient).not.toHaveBeenCalled();
  });

  it('should return fallback data when INSTAGRAM_USER_ID is missing', async () => {
    delete process.env.INSTAGRAM_USER_ID;

    const result = await getPortfolioItems();

    expect(result).toEqual(fallbackItems);
    expect(mockCreateInstagramClient).not.toHaveBeenCalled();
  });

  it('should return fallback data when both env vars are missing', async () => {
    delete process.env.INSTAGRAM_ACCESS_TOKEN;
    delete process.env.INSTAGRAM_USER_ID;

    const result = await getPortfolioItems();

    expect(result).toEqual(fallbackItems);
    expect(mockCreateInstagramClient).not.toHaveBeenCalled();
  });

  it('should return fallback data when INSTAGRAM_ACCESS_TOKEN is an empty string', async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = '';

    const result = await getPortfolioItems();

    expect(result).toEqual(fallbackItems);
    expect(mockCreateInstagramClient).not.toHaveBeenCalled();
  });

  it('should return fallback data when INSTAGRAM_USER_ID is an empty string', async () => {
    process.env.INSTAGRAM_USER_ID = '';

    const result = await getPortfolioItems();

    expect(result).toEqual(fallbackItems);
    expect(mockCreateInstagramClient).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Empty API response → return fallback data
// ---------------------------------------------------------------------------

describe('getPortfolioItems – empty API response', () => {
  it('should return fallback data when the API returns an empty array', async () => {
    mockFetchMedia([]);

    const result = await getPortfolioItems();

    expect(result).toEqual(fallbackItems);
  });
});

// ---------------------------------------------------------------------------
// API timeout → return fallback data
// ---------------------------------------------------------------------------

describe('getPortfolioItems – API timeout', () => {
  it('should return fallback data when fetchMedia throws a timeout error', async () => {
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    mockFetchMediaError(abortError);

    const result = await getPortfolioItems();

    expect(result).toEqual(fallbackItems);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Instagram portfolio fetch failed'),
      expect.any(DOMException),
    );
  });

  it('should return fallback data when fetchMedia throws a generic network error', async () => {
    mockFetchMediaError(new Error('Network request failed'));

    const result = await getPortfolioItems();

    expect(result).toEqual(fallbackItems);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Instagram portfolio fetch failed'),
      expect.any(Error),
    );
  });
});

// ---------------------------------------------------------------------------
// Partial response handling – malformed items skipped, valid items merged
// ---------------------------------------------------------------------------

describe('getPortfolioItems – partial response handling', () => {
  it('should skip malformed items missing required fields and merge valid ones with fallback', async () => {
    const validItem = makeMediaItem({ id: 'ig-valid', caption: 'Nice nails #acrylics' });
    // Malformed: missing media_url
    const malformedItem = { id: 'ig-bad', media_type: 'IMAGE', caption: 'Oops' } as unknown as InstagramMediaItem;

    mockFetchMedia([validItem, malformedItem]);

    const result = await getPortfolioItems();

    // The valid item should be present
    expect(result.find((item) => item.id === 'ig-valid')).toBeDefined();
    // The malformed item should NOT be present
    expect(result.find((item) => item.id === 'ig-bad')).toBeUndefined();
    // Fallback items should also be present (merged)
    for (const fb of fallbackItems) {
      expect(result.find((item) => item.id === fb.id)).toBeDefined();
    }
    // A warning should have been logged about skipped items
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('skipped 1 malformed item(s)'),
    );
  });

  it('should return fallback data when all items in the response are malformed', async () => {
    const malformed1 = { id: '', media_type: 'IMAGE', media_url: 'https://x.com/a.jpg' } as unknown as InstagramMediaItem;
    const malformed2 = { media_type: 'IMAGE', media_url: 'https://x.com/b.jpg' } as unknown as InstagramMediaItem;

    mockFetchMedia([malformed1, malformed2]);

    const result = await getPortfolioItems();

    expect(result).toEqual(fallbackItems);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('skipped 2 malformed item(s)'),
    );
  });

  it('should process all items when none are malformed', async () => {
    const item1 = makeMediaItem({ id: 'ig-a', caption: 'Gel set #gel' });
    const item2 = makeMediaItem({ id: 'ig-b', caption: 'Art piece #nailart' });

    mockFetchMedia([item1, item2]);

    const result = await getPortfolioItems();

    expect(result.find((item) => item.id === 'ig-a')).toBeDefined();
    expect(result.find((item) => item.id === 'ig-b')).toBeDefined();
    // No warning about skipped items
    expect(console.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('skipped'),
    );
  });

  it('should place Instagram items before fallback items in the merged result', async () => {
    const igItem = makeMediaItem({ id: 'ig-first', caption: 'First #pressons' });
    mockFetchMedia([igItem]);

    const result = await getPortfolioItems();

    expect(result[0].id).toBe('ig-first');
    // Fallback items follow
    expect(result.slice(1).map((i) => i.id)).toEqual(fallbackItems.map((i) => i.id));
  });
});

// ---------------------------------------------------------------------------
// isValidInstagramItem – guard function
// ---------------------------------------------------------------------------

describe('isValidInstagramItem', () => {
  it('should return true for a valid item with id and media_url', () => {
    expect(isValidInstagramItem(makeMediaItem())).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidInstagramItem(null)).toBe(false);
  });

  it('should return false for a non-object value', () => {
    expect(isValidInstagramItem('string')).toBe(false);
    expect(isValidInstagramItem(42)).toBe(false);
  });

  it('should return false when id is missing', () => {
    expect(isValidInstagramItem({ media_url: 'https://x.com/a.jpg' })).toBe(false);
  });

  it('should return false when id is an empty string', () => {
    expect(isValidInstagramItem({ id: '', media_url: 'https://x.com/a.jpg' })).toBe(false);
  });

  it('should return false when media_url is missing', () => {
    expect(isValidInstagramItem({ id: 'abc' })).toBe(false);
  });

  it('should return false when media_url is an empty string', () => {
    expect(isValidInstagramItem({ id: 'abc', media_url: '' })).toBe(false);
  });
});
