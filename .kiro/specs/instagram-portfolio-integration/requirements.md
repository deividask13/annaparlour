# Requirements Document

## Introduction

The Anna Nails landing page currently displays portfolio images from a hardcoded array in `lib/portfolio-data.ts` with images stored locally in `/public/portfolio/`. The salon owner must manually add new work by saving images and updating code. This feature replaces that manual workflow by fetching portfolio images directly from the salon's Instagram account using the Instagram Basic Display API (or its Graph API successor). Instagram posts are mapped to the existing portfolio category system via hashtags, and the site continues to fall back to the local hardcoded gallery when the API is unavailable. A server-side caching layer keeps page loads fast and avoids hitting API rate limits.

## Glossary

- **Instagram_API_Client**: The server-side module responsible for authenticating with and fetching media from the Instagram Graph API using a long-lived access token.
- **Portfolio_Cache**: A server-side time-based cache that stores fetched Instagram media data to reduce API calls and improve page load performance.
- **Category_Mapper**: The module that reads hashtags from an Instagram post caption and maps the post to one of the defined portfolio categories (Gel, Acrylics, Nail Art, Press-Ons).
- **Portfolio_Data_Provider**: The data layer that merges Instagram-sourced portfolio items with the local fallback data and exposes a unified list of PortfolioItem objects to the front end.
- **Portfolio_Section**: The existing front-end React component that renders the masonry grid gallery with category filter tabs.
- **Long_Lived_Token**: An Instagram Graph API access token with an extended expiry (approximately 60 days) stored as a server-side environment variable.
- **Fallback_Data**: The existing hardcoded portfolio items in `lib/portfolio-data.ts` used when Instagram data is unavailable.

## Requirements

### Requirement 1: Fetch Instagram Media

**User Story:** As the salon owner, I want the website to automatically pull my latest Instagram posts, so that my portfolio stays up to date without manual uploads.

#### Acceptance Criteria

1. WHEN the Portfolio_Data_Provider is invoked, THE Instagram_API_Client SHALL request the most recent media items (up to a configurable limit, default 30) from the configured Instagram account using the Instagram Graph API.
2. THE Instagram_API_Client SHALL retrieve the following fields for each media item: media URL, permalink, caption, timestamp, and media type.
3. WHEN the Instagram Graph API returns media, THE Instagram_API_Client SHALL filter out any items whose media type is VIDEO, retaining only IMAGE and CAROUSEL_ALBUM types.
4. WHEN the Instagram Graph API returns a CAROUSEL_ALBUM media item, THE Instagram_API_Client SHALL use the first image of the carousel as the portfolio image source.

### Requirement 2: Server-Side Caching

**User Story:** As a site visitor, I want the portfolio page to load quickly, so that I can browse Anna's work without delay.

#### Acceptance Criteria

1. WHEN the Instagram_API_Client successfully fetches media, THE Portfolio_Cache SHALL store the response data with a configurable time-to-live (default 60 minutes).
2. WHILE the Portfolio_Cache contains non-expired data, THE Portfolio_Data_Provider SHALL serve portfolio items from the cache without calling the Instagram Graph API.
3. WHEN the cached data has expired, THE Portfolio_Data_Provider SHALL trigger a fresh fetch from the Instagram Graph API on the next request.
4. THE Portfolio_Cache SHALL be implemented using Next.js server-side data fetching with the `revalidate` option to leverage ISR (Incremental Static Regeneration).

### Requirement 3: Category Mapping via Hashtags

**User Story:** As the salon owner, I want to tag my Instagram posts with hashtags like #gel or #nailart, so that they automatically appear under the correct portfolio category on my website.

#### Acceptance Criteria

1. WHEN an Instagram post caption contains one of the recognised hashtags (#gel, #acrylics, #nailart, #pressons), THE Category_Mapper SHALL assign the post to the corresponding portfolio category (Gel, Acrylics, Nail Art, Press-Ons).
2. THE Category_Mapper SHALL perform case-insensitive matching on hashtags.
3. WHEN an Instagram post caption contains multiple recognised hashtags, THE Category_Mapper SHALL assign the post to the category of the first matching hashtag found in the caption.
4. WHEN an Instagram post caption contains no recognised hashtag, THE Category_Mapper SHALL assign the post to the "Nail Art" category as a default.

### Requirement 4: Fallback to Local Data

**User Story:** As a site visitor, I want to still see portfolio images even if Instagram is down, so that the website always has content to display.

#### Acceptance Criteria

1. IF the Instagram Graph API request fails or times out (within 5 seconds), THEN THE Portfolio_Data_Provider SHALL serve the Fallback_Data from `lib/portfolio-data.ts`.
2. IF the Long_Lived_Token environment variable is not configured, THEN THE Portfolio_Data_Provider SHALL serve the Fallback_Data without attempting an API call.
3. WHEN the Instagram Graph API returns an empty media list, THE Portfolio_Data_Provider SHALL serve the Fallback_Data.
4. IF the Instagram Graph API returns a partial response, THEN THE Portfolio_Data_Provider SHALL serve only the successfully parsed items combined with the Fallback_Data.

### Requirement 5: Unified Portfolio Item Format

**User Story:** As a developer, I want Instagram posts to be transformed into the same PortfolioItem shape used by the existing gallery, so that the front-end component requires minimal changes.

#### Acceptance Criteria

1. THE Portfolio_Data_Provider SHALL transform each Instagram media item into a PortfolioItem object with fields: id, src, alt, category, and aspectRatio.
2. WHEN transforming an Instagram media item, THE Portfolio_Data_Provider SHALL use the Instagram media ID as the PortfolioItem id.
3. WHEN transforming an Instagram media item, THE Portfolio_Data_Provider SHALL use the Instagram media URL as the PortfolioItem src.
4. WHEN transforming an Instagram media item, THE Portfolio_Data_Provider SHALL generate the alt text from the post caption, truncated to 120 characters, with a fallback of "Nail design by Anna Nails" when no caption is present.
5. THE Portfolio_Data_Provider SHALL assign a default aspectRatio of "square" to all Instagram-sourced items, since Instagram images are predominantly square.

### Requirement 6: Next.js Image Domain Configuration

**User Story:** As a developer, I want external Instagram image domains to be allowed in the Next.js config, so that the Next.js Image component can optimise and serve them.

#### Acceptance Criteria

1. THE next.config.mjs SHALL include the Instagram CDN hostnames (cdninstagram.com and fbcdn.net patterns) in the `images.remotePatterns` configuration.
2. WHEN an Instagram-sourced image is rendered, THE Portfolio_Section SHALL use the Next.js Image component with the external URL as the src.

### Requirement 7: Token Management

**User Story:** As the salon owner, I want my Instagram connection to remain active without frequent manual re-authentication, so that the portfolio stays updated automatically.

#### Acceptance Criteria

1. THE Instagram_API_Client SHALL read the Long_Lived_Token from the `INSTAGRAM_ACCESS_TOKEN` environment variable.
2. IF the Instagram Graph API returns an authentication error (HTTP 401 or token-expired error code), THEN THE Instagram_API_Client SHALL log a warning message containing the error details and fall back to the Fallback_Data.
3. THE Instagram_API_Client SHALL provide a utility function to refresh a long-lived token by calling the Instagram token refresh endpoint, extending validity by 60 days.

### Requirement 8: Portfolio Data API Route

**User Story:** As a developer, I want a dedicated server-side API route that returns portfolio data, so that the front end can fetch Instagram-sourced items through a clean internal endpoint.

#### Acceptance Criteria

1. THE application SHALL expose a Next.js API route at `/api/portfolio` that returns the unified portfolio items as a JSON array.
2. WHEN the `/api/portfolio` route is called, THE Portfolio_Data_Provider SHALL return Instagram-sourced items followed by Fallback_Data items, with duplicates removed by id.
3. THE `/api/portfolio` route SHALL set appropriate Cache-Control headers to enable CDN and browser caching (public, s-maxage=3600, stale-while-revalidate=86400).
4. WHEN the `/api/portfolio` route encounters an unhandled error, THE route handler SHALL return an HTTP 200 response containing the Fallback_Data, ensuring the portfolio always renders.

### Requirement 9: Front-End Data Fetching

**User Story:** As a site visitor, I want the portfolio gallery to display Instagram images seamlessly alongside any local images, so that I see a complete showcase of Anna's work.

#### Acceptance Criteria

1. WHEN the Portfolio_Section component mounts, THE Portfolio_Section SHALL fetch portfolio items from the `/api/portfolio` route.
2. WHILE the portfolio data is loading, THE Portfolio_Section SHALL display the Fallback_Data immediately so the page is never empty.
3. WHEN the fetch from `/api/portfolio` completes successfully, THE Portfolio_Section SHALL replace the displayed items with the fetched data.
4. IF the fetch from `/api/portfolio` fails, THEN THE Portfolio_Section SHALL continue displaying the Fallback_Data without showing an error to the visitor.
5. THE Portfolio_Section SHALL preserve the existing category filter tabs, masonry grid layout, and Framer Motion animations when rendering Instagram-sourced items.
