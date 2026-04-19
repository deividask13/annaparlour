// ---------------------------------------------------------------------------
// Unit tests – Instagram API Client
// ---------------------------------------------------------------------------

import { createInstagramClient } from '@/lib/instagram/client';

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  global.fetch = jest.fn();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG = {
  accessToken: 'test-token-abc',
  userId: '12345',
};

// ---------------------------------------------------------------------------
// fetchMedia – correct fields and limit in request
// ---------------------------------------------------------------------------

describe('fetchMedia – request fields and limit', () => {
  it('should request the correct fields and default limit of 30', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const client = createInstagramClient(DEFAULT_CONFIG);
    await client.fetchMedia();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;

    expect(calledUrl).toContain('/v20.0/12345/media');
    expect(calledUrl).toContain('fields=id,media_type,media_url,caption,timestamp,permalink');
    expect(calledUrl).toContain('limit=30');
    expect(calledUrl).toContain('access_token=test-token-abc');
  });

  it('should use a custom limit when configured', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const client = createInstagramClient({ ...DEFAULT_CONFIG, mediaLimit: 10 });
    await client.fetchMedia();

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('limit=10');
  });
});

// ---------------------------------------------------------------------------
// fetchMedia – CAROUSEL_ALBUM child fetching
// ---------------------------------------------------------------------------

describe('fetchMedia – CAROUSEL_ALBUM child fetching', () => {
  it('should fetch children for CAROUSEL_ALBUM and use the first IMAGE child media_url', async () => {
    const carouselItem = {
      id: 'carousel-1',
      media_type: 'CAROUSEL_ALBUM' as const,
      media_url: 'https://cdn.example.com/carousel-cover.jpg',
      caption: 'My carousel',
      timestamp: '2025-01-15T12:00:00Z',
      permalink: 'https://instagram.com/p/abc',
    };

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/children')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                { id: 'child-vid', media_type: 'VIDEO', media_url: 'https://cdn.example.com/video.mp4' },
                { id: 'child-img', media_type: 'IMAGE', media_url: 'https://cdn.example.com/child-image.jpg' },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [carouselItem] }),
      });
    });

    const client = createInstagramClient(DEFAULT_CONFIG);
    const result = await client.fetchMedia();

    // Should have called the children endpoint
    const childrenCall = (global.fetch as jest.Mock).mock.calls.find(
      (call: string[]) => (call[0] as string).includes('/children'),
    );
    expect(childrenCall).toBeDefined();
    expect(childrenCall[0]).toContain(`/v20.0/carousel-1/children`);
    expect(childrenCall[0]).toContain('fields=id,media_type,media_url');

    // Result should use the first IMAGE child's media_url
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('carousel-1');
    expect(result[0].media_url).toBe('https://cdn.example.com/child-image.jpg');
  });

  it('should exclude CAROUSEL_ALBUM when children fetch fails', async () => {
    const carouselItem = {
      id: 'carousel-fail',
      media_type: 'CAROUSEL_ALBUM' as const,
      media_url: 'https://cdn.example.com/carousel.jpg',
      timestamp: '2025-01-15T12:00:00Z',
      permalink: 'https://instagram.com/p/fail',
    };

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/children')) {
        return Promise.resolve({ ok: false, status: 500, statusText: 'Server Error' });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [carouselItem] }),
      });
    });

    const client = createInstagramClient(DEFAULT_CONFIG);
    const result = await client.fetchMedia();

    expect(result).toHaveLength(0);
  });

  it('should exclude CAROUSEL_ALBUM when no IMAGE child exists', async () => {
    const carouselItem = {
      id: 'carousel-no-img',
      media_type: 'CAROUSEL_ALBUM' as const,
      media_url: 'https://cdn.example.com/carousel.jpg',
      timestamp: '2025-01-15T12:00:00Z',
      permalink: 'https://instagram.com/p/noimg',
    };

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/children')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                { id: 'child-vid-1', media_type: 'VIDEO', media_url: 'https://cdn.example.com/v1.mp4' },
                { id: 'child-vid-2', media_type: 'VIDEO', media_url: 'https://cdn.example.com/v2.mp4' },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [carouselItem] }),
      });
    });

    const client = createInstagramClient(DEFAULT_CONFIG);
    const result = await client.fetchMedia();

    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// refreshToken – correct endpoint
// ---------------------------------------------------------------------------

describe('refreshToken – endpoint and response', () => {
  it('should call the Instagram token refresh endpoint with correct parameters', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'new-token-xyz',
          token_type: 'bearer',
          expires_in: 5184000,
        }),
    });

    const client = createInstagramClient(DEFAULT_CONFIG);
    const result = await client.refreshToken();

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/refresh_access_token');
    expect(calledUrl).toContain('grant_type=ig_refresh_token');
    expect(calledUrl).toContain('access_token=test-token-abc');

    expect(result).toEqual({
      access_token: 'new-token-xyz',
      expires_in: 5184000,
    });
  });

  it('should throw when the refresh request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    });

    const client = createInstagramClient(DEFAULT_CONFIG);

    await expect(client.refreshToken()).rejects.toThrow(
      'Instagram token refresh error: 400 Bad Request',
    );
  });
});

// ---------------------------------------------------------------------------
// fetchMedia – 401 error handling
// ---------------------------------------------------------------------------

describe('fetchMedia – 401 authentication error handling', () => {
  it('should log a warning and throw on HTTP 401 with JSON error body', async () => {
    const errorBody = {
      error: {
        message: 'Invalid OAuth access token',
        type: 'OAuthException',
        code: 190,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve(errorBody),
    });

    const client = createInstagramClient(DEFAULT_CONFIG);

    await expect(client.fetchMedia()).rejects.toThrow(
      'Instagram authentication error',
    );

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Instagram authentication error'),
    );
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('OAuthException'),
    );
  });

  it('should log a warning with status text when 401 body is not valid JSON', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    const client = createInstagramClient(DEFAULT_CONFIG);

    await expect(client.fetchMedia()).rejects.toThrow(
      'Instagram authentication error',
    );

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('401 Unauthorized'),
    );
  });

  it('should throw a generic error for non-401 HTTP errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const client = createInstagramClient(DEFAULT_CONFIG);

    await expect(client.fetchMedia()).rejects.toThrow(
      'Instagram API error: 500 Internal Server Error',
    );

    // Should NOT log a console.warn for non-auth errors
    expect(console.warn).not.toHaveBeenCalled();
  });
});
