// ---------------------------------------------------------------------------
// Instagram API types – Instagram Portfolio Integration
// ---------------------------------------------------------------------------

/** A single media item returned by the Instagram Graph API. */
export interface InstagramMediaItem {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  caption?: string;
  timestamp: string;
  permalink: string;
}

/** Top-level response shape from `GET /{user-id}/media`. */
export interface InstagramApiResponse {
  data: InstagramMediaItem[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

/** Response shape from `GET /{media-id}/children`. */
export interface InstagramChildrenResponse {
  data: Array<{
    id: string;
    media_type: 'IMAGE' | 'VIDEO';
    media_url: string;
  }>;
}

/** Configuration for the Instagram API client factory. */
export interface InstagramClientConfig {
  accessToken: string;
  userId: string;
  /** Maximum number of media items to fetch. @default 30 */
  mediaLimit?: number;
  /** Timeout in milliseconds for API requests. @default 5000 */
  timeoutMs?: number;
}
