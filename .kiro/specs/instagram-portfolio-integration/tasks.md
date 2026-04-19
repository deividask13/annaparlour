# Tasks: Instagram Portfolio Integration

## Task 1: Set up Instagram module structure and types
- [x] 1.1 Create `lib/instagram/types.ts` with `InstagramMediaItem`, `InstagramApiResponse`, `InstagramChildrenResponse`, and `InstagramClientConfig` interfaces
- [x] 1.2 Export `InstagramMediaItem` and related types from `lib/instagram/types.ts` for use across the module
- [x] 1.3 Install `fast-check` as a dev dependency for property-based testing

## Task 2: Implement Category Mapper
- [x] 2.1 Create `lib/instagram/category-mapper.ts` with `HASHTAG_MAP` constant mapping lowercase hashtags to `PortfolioCategory` values
- [x] 2.2 Implement `mapCaptionToCategory(caption: string | undefined): PortfolioCategory` that extracts hashtags via regex, normalises to lowercase, returns the category for the first recognised hashtag, and defaults to `'Nail Art'`
- [x] 2.3 Write property-based test: Hashtag-to-category mapping with case insensitivity (Property 2) in `__tests__/lib/instagram/category-mapper.property.test.ts`
  - [x] 🧪 2.3.pbt Property 2: Hashtag-to-category mapping with case insensitivity
- [x] 2.4 Write property-based test: First recognised hashtag determines category (Property 3) in `__tests__/lib/instagram/category-mapper.property.test.ts`
  - [x] 🧪 2.4.pbt Property 3: First recognised hashtag determines category
- [x] 2.5 Write property-based test: Default category for unrecognised captions (Property 4) in `__tests__/lib/instagram/category-mapper.property.test.ts`
  - [x] 🧪 2.5.pbt Property 4: Default category for unrecognised captions

## Task 3: Implement Instagram API Client

- [x] 3.1 Create `lib/instagram/client.ts` with `createInstagramClient(config)` factory function
- [x] 3.2 Implement `fetchMedia()` method that calls `GET /v20.0/{userId}/media` with fields `id,media_type,media_url,caption,timestamp,permalink` and configurable limit (default 30)
- [x] 3.3 Implement VIDEO media type filtering in `fetchMedia()` to retain only IMAGE and CAROUSEL_ALBUM items
- [x] 3.4 Implement CAROUSEL_ALBUM handling: fetch `/{media-id}/children?fields=id,media_type,media_url` and use the first IMAGE child's `media_url`
- [x] 3.5 Implement 5-second timeout using `AbortController` on all fetch calls
- [x] 3.6 Implement `refreshToken()` method that calls the Instagram token refresh endpoint
- [x] 3.7 Add authentication error detection (HTTP 401 / token-expired) with console warning logging
- [x] 3.8 Write property-based test: Video media type exclusion (Property 1) in `__tests__/lib/instagram/client.property.test.ts`
  - [x] 🧪 3.8.pbt Property 1: Video media type exclusion
- [x] 3.9 Write unit tests for Instagram API Client in `__tests__/lib/instagram/client.test.ts` covering: correct fields/limit in request, CAROUSEL_ALBUM child fetching, token refresh endpoint, 401 error handling

## Task 4: Implement Portfolio Data Provider

- [x] 4.1 Create `lib/instagram/portfolio-provider.ts` with `transformInstagramItem(item): PortfolioItem` function
- [x] 4.2 Implement alt text generation: truncate caption to 120 chars, fallback to `"Nail design by Anna Nails"` when caption is absent/empty
- [x] 4.3 Implement `mergePortfolioItems(instagramItems, fallbackItems): PortfolioItem[]` that places Instagram items first, deduplicates by id, and retains Instagram items on conflict
- [x] 4.4 Implement `getPortfolioItems(): Promise<PortfolioItem[]>` that orchestrates fetching, transforming, merging, and fallback logic
- [x] 4.5 Add env var check: if `INSTAGRAM_ACCESS_TOKEN` or `INSTAGRAM_USER_ID` is missing, return fallback data without API call
- [x] 4.6 Add error handling: catch API failures/timeouts, log warnings, return fallback data
- [x] 4.7 Add partial response handling: skip malformed items, merge valid items with fallback data
- [x] 4.8 Write property-based test: Instagram-to-PortfolioItem transformation completeness (Property 5) in `__tests__/lib/instagram/portfolio-provider.property.test.ts`
  - [x] 🧪 4.8.pbt Property 5: Instagram-to-PortfolioItem transformation completeness
- [x] 4.9 Write property-based test: Alt text truncation and fallback (Property 6) in `__tests__/lib/instagram/portfolio-provider.property.test.ts`
  - [ ] 🧪 4.9.pbt Property 6: Alt text truncation and fallback
- [x] 4.10 Write property-based test: Merge deduplication and ordering (Property 7) in `__tests__/lib/instagram/portfolio-provider.property.test.ts`
  - [x] 🧪 4.10.pbt Property 7: Merge deduplication and ordering
- [x] 4.11 Write unit tests for Portfolio Data Provider in `__tests__/lib/instagram/portfolio-provider.test.ts` covering: missing env vars, empty API response, API timeout, partial response handling

## Task 5: Create API Route Handler

- [x] 5.1 Create `app/api/portfolio/route.ts` with `GET` handler that calls `getPortfolioItems()` and returns JSON
- [x] 5.2 Set `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` header on the response
- [x] 5.3 Wrap handler in try/catch: on error, return fallback data with HTTP 200
- [x] 5.4 Write unit tests for the route handler in `__tests__/app/api/portfolio/route.test.ts` covering: JSON response format, Cache-Control header, error fallback

## Task 6: Update Next.js configuration

- [x] 6.1 Add Instagram CDN hostnames (`**.cdninstagram.com`, `**.fbcdn.net`) to `images.remotePatterns` in `next.config.mjs`

## Task 7: Update PortfolioSection component

- [x] 7.1 Add `useState` initialised with `portfolioItems` from `lib/portfolio-data.ts` to hold the displayed items
- [x] 7.2 Add `useEffect` that fetches `/api/portfolio` on mount, parses JSON, and updates state on success
- [x] 7.3 Add try/catch in the fetch effect: on failure, silently keep fallback data (no error UI)
- [x] 7.4 Update the component to render from the state variable instead of the imported `portfolioItems` directly
- [x] 7.5 Write component tests in `__tests__/components/PortfolioSection.test.tsx` covering: fallback render on mount, data replacement after fetch, fallback on fetch failure, filter tabs present with Instagram items
