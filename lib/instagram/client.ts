// ---------------------------------------------------------------------------
// Instagram API Client – Instagram Portfolio Integration
// ---------------------------------------------------------------------------

import type {
  InstagramMediaItem,
  InstagramApiResponse,
  InstagramChildrenResponse,
  InstagramClientConfig,
} from './types';

/** Default number of media items to request from the API. */
const DEFAULT_MEDIA_LIMIT = 30;

/** Default timeout in milliseconds for API requests. */
const DEFAULT_TIMEOUT_MS = 5000;

/** Base URL for the Instagram Graph API. */
const GRAPH_API_BASE = 'https://graph.instagram.com';

/** API version to use for Instagram Graph API requests. */
const API_VERSION = 'v20.0';

/**
 * Creates an Instagram API client configured with the given credentials and
 * options.
 *
 * @param config - Client configuration including access token and user ID.
 * @returns An object with `fetchMedia` and `refreshToken` methods.
 */
export function createInstagramClient(config: InstagramClientConfig) {
  const {
    accessToken,
    userId,
    mediaLimit = DEFAULT_MEDIA_LIMIT,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = config;

  /**
   * Performs a fetch request with an `AbortController`-based timeout.
   *
   * @param url - The URL to fetch.
   * @returns The `Response` object.
   * @throws When the request exceeds `timeoutMs` or any other network error.
   */
  async function fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fetches the most recent media items from the configured Instagram account,
   * filtering out VIDEO items and resolving CAROUSEL_ALBUM cover images.
   */
  async function fetchMedia(): Promise<InstagramMediaItem[]> {
    const fields = 'id,media_type,media_url,caption,timestamp,permalink';
    const url = `${GRAPH_API_BASE}/${API_VERSION}/${userId}/media?fields=${fields}&limit=${mediaLimit}&access_token=${accessToken}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      // Detect authentication errors (HTTP 401 or token-expired) – Req 7.2
      if (response.status === 401) {
        let errorDetails = `${response.status} ${response.statusText}`;
        try {
          const errorJson = await response.json();
          errorDetails = JSON.stringify(errorJson);
        } catch {
          // Use status text if body cannot be parsed
        }
        console.warn(
          `Instagram authentication error: ${errorDetails}`,
        );
        throw new Error(`Instagram authentication error: ${errorDetails}`);
      }

      throw new Error(
        `Instagram API error: ${response.status} ${response.statusText}`,
      );
    }

    const json: InstagramApiResponse = await response.json();

    const items = json.data ?? [];

    // Filter out VIDEO items – retain only IMAGE and CAROUSEL_ALBUM (Req 1.3)
    const filtered = items.filter(
      (item) => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM',
    );

    // Resolve CAROUSEL_ALBUM items by fetching children and using the first
    // IMAGE child's media_url (Req 1.4)
    const resolved = await Promise.all(
      filtered.map(async (item) => {
        if (item.media_type !== 'CAROUSEL_ALBUM') {
          return item;
        }

        try {
          const childrenUrl = `${GRAPH_API_BASE}/${API_VERSION}/${item.id}/children?fields=id,media_type,media_url&access_token=${accessToken}`;
          const childrenResponse = await fetchWithTimeout(childrenUrl);

          if (!childrenResponse.ok) {
            return null; // Exclude on failure
          }

          const childrenJson: InstagramChildrenResponse =
            await childrenResponse.json();
          const firstImage = childrenJson.data?.find(
            (child) => child.media_type === 'IMAGE',
          );

          if (!firstImage) {
            return null; // No IMAGE child found – exclude
          }

          return { ...item, media_url: firstImage.media_url };
        } catch {
          return null; // Exclude on fetch error
        }
      }),
    );

    // Remove nulls (excluded carousel items)
    return resolved.filter((item): item is InstagramMediaItem => item !== null);
  }

  /**
   * Refreshes the long-lived access token, extending its validity by 60 days.
   *
   * Calls `GET /refresh_access_token?grant_type=ig_refresh_token&access_token=…`
   * on the Instagram Graph API.
   *
   * @returns The new access token string and its expiry (in seconds).
   * @throws When the refresh request fails or times out.
   */
  async function refreshToken(): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const url = `${GRAPH_API_BASE}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(
        `Instagram token refresh error: ${response.status} ${response.statusText}`,
      );
    }

    const json: { access_token: string; token_type: string; expires_in: number } =
      await response.json();

    return { access_token: json.access_token, expires_in: json.expires_in };
  }

  return { fetchMedia, refreshToken };
}
