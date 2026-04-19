// ---------------------------------------------------------------------------
// Unit tests – Portfolio API Route Handler
// ---------------------------------------------------------------------------

import { portfolioItems as fallbackItems } from '@/lib/portfolio-data';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/server to avoid the missing Request global in jsdom.
// We provide a minimal NextResponse.json implementation that mirrors the
// real behaviour closely enough for unit-testing the route handler.
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => {
      const headers = new Headers(init?.headers);
      return {
        status: init?.status ?? 200,
        headers,
        json: () => Promise.resolve(body),
      };
    },
  },
}));

// Mock the portfolio provider so we can control getPortfolioItems behaviour
jest.mock('@/lib/instagram/portfolio-provider', () => ({
  getPortfolioItems: jest.fn(),
}));

import { getPortfolioItems } from '@/lib/instagram/portfolio-provider';
import { GET } from '@/app/api/portfolio/route';

const mockGetPortfolioItems = getPortfolioItems as jest.MockedFunction<
  typeof getPortfolioItems
>;

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// JSON response format
// ---------------------------------------------------------------------------

describe('GET /api/portfolio – JSON response format', () => {
  it('should return a JSON array of portfolio items with status 200', async () => {
    const mockItems = [
      {
        id: 'ig-001',
        src: 'https://cdn.example.com/image1.jpg',
        alt: 'Beautiful nails',
        category: 'Gel' as const,
        aspectRatio: 'square' as const,
      },
      {
        id: 'ig-002',
        src: 'https://cdn.example.com/image2.jpg',
        alt: 'Acrylic set',
        category: 'Acrylics' as const,
        aspectRatio: 'square' as const,
      },
    ];

    mockGetPortfolioItems.mockResolvedValue(mockItems);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body).toEqual(mockItems);
  });

  it('should return fallback items when getPortfolioItems returns them', async () => {
    mockGetPortfolioItems.mockResolvedValue([...fallbackItems]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(fallbackItems);
  });

  it('should return an empty array when getPortfolioItems returns one', async () => {
    mockGetPortfolioItems.mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Cache-Control header
// ---------------------------------------------------------------------------

describe('GET /api/portfolio – Cache-Control header', () => {
  it('should set Cache-Control with s-maxage=3600 and stale-while-revalidate=86400', async () => {
    mockGetPortfolioItems.mockResolvedValue([]);

    const response = await GET();

    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toBe(
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
  });

  it('should set Cache-Control header even when returning error fallback', async () => {
    mockGetPortfolioItems.mockRejectedValue(new Error('Unexpected failure'));

    const response = await GET();

    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toBe(
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
  });
});

// ---------------------------------------------------------------------------
// Error fallback – always returns HTTP 200 with fallback data
// ---------------------------------------------------------------------------

describe('GET /api/portfolio – error fallback', () => {
  it('should return fallback data with status 200 when getPortfolioItems throws', async () => {
    mockGetPortfolioItems.mockRejectedValue(new Error('Database connection lost'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(fallbackItems);
  });

  it('should return fallback data when getPortfolioItems rejects with a non-Error value', async () => {
    mockGetPortfolioItems.mockRejectedValue('string error');

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(fallbackItems);
  });

  it('should never return a non-200 status code', async () => {
    // Success case
    mockGetPortfolioItems.mockResolvedValue([]);
    const successResponse = await GET();
    expect(successResponse.status).toBe(200);

    // Error case
    mockGetPortfolioItems.mockRejectedValue(new Error('fail'));
    const errorResponse = await GET();
    expect(errorResponse.status).toBe(200);
  });
});
