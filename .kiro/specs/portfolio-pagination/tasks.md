# Implementation Plan: Portfolio Pagination

## Overview

Add client-side pagination to the `PortfolioSection` component. The implementation creates a pure pagination utility module, a presentational `PaginationControl` component, and integrates both into the existing `PortfolioSection`. All pagination math is isolated in `lib/pagination.ts` for testability, and the UI follows the project's existing design language (gold accents, Inter font, Framer Motion transitions).

## Tasks

- [-] 1. Create pagination utility module
  - [x] 1.1 Create `lib/pagination.ts` with `DEFAULT_PAGE_SIZE`, `getTotalPages`, and `getPageSlice`
    - Export `DEFAULT_PAGE_SIZE = 6`
    - Implement `getTotalPages(itemCount, pageSize)` — returns `Math.ceil(itemCount / pageSize)`, minimum 1; treats invalid pageSize as `DEFAULT_PAGE_SIZE`
    - Implement `getPageSlice<T>(items, page, pageSize)` — clamps page to `[1, totalPages]`, returns `items.slice((page - 1) * pageSize, page * pageSize)`; treats invalid pageSize as `DEFAULT_PAGE_SIZE`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.1, 8.2, 8.3_

  - [ ]* 1.2 Write unit tests for pagination utilities
    - Create `__tests__/lib/pagination.test.ts`
    - Test `DEFAULT_PAGE_SIZE` equals 6
    - Test `getTotalPages` returns 1 for empty array
    - Test `getTotalPages` returns correct count for various lengths (e.g., 7 items / 6 per page = 2)
    - Test `getPageSlice` returns correct slice for page 1, middle pages, and last page
    - Test `getPageSlice` clamps out-of-range page numbers (0, negative, beyond total)
    - Test `getPageSlice` treats invalid pageSize (0, negative) as `DEFAULT_PAGE_SIZE`
    - _Requirements: 1.2, 8.1, 8.2_

  - [ ]* 1.3 Write property test: Slice computation correctness (Property 1)
    - Create `__tests__/lib/pagination.property.test.ts`
    - **Property 1: Slice computation correctness**
    - For any array (0–50 items), any pageSize (1–20), and any valid page (1 to totalPages), `getPageSlice(items, page, pageSize)` equals `items.slice((page - 1) * pageSize, page * pageSize)`
    - Use `fast-check` with `{ numRuns: 100 }`
    - **Validates: Requirements 1.1, 1.3, 1.4, 8.1, 8.2**

  - [ ]* 1.4 Write property test: Page union completeness (Property 2)
    - Add to `__tests__/lib/pagination.property.test.ts`
    - **Property 2: Page union completeness (round-trip)**
    - For any array (0–50 items) and any pageSize (1–20), concatenating `getPageSlice` for every page from 1 to `getTotalPages` produces an array identical to the original — same elements, same order, no duplicates, no omissions
    - Use `fast-check` with `{ numRuns: 100 }`
    - **Validates: Requirements 8.3**

- [x] 2. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create PaginationControl component
  - [x] 3.1 Create `components/PaginationControl.tsx`
    - Accept props: `currentPage`, `totalPages`, `onPageChange`
    - Return `null` when `totalPages <= 1`
    - Render `<nav aria-label="Portfolio pagination">` wrapper
    - Render previous button with `aria-label="Go to previous page"`, disabled with `aria-disabled="true"` when `currentPage === 1`
    - Render next button with `aria-label="Go to next page"`, disabled with `aria-disabled="true"` when `currentPage === totalPages`
    - Render page number buttons with `aria-current="page"` on the active one
    - Style active page with gold accent (`text-gold` / `#C9A84C`), use Inter font, uppercase, `tracking-[0.2em]`
    - All interactive elements have `min-h-[44px] min-w-[44px]` touch targets
    - Compact layout (< 768 px): hide individual page numbers, show only current page between prev/next using responsive Tailwind classes
    - Full layout (≥ 768 px): show all page number buttons
    - Use native `<button>` elements for keyboard accessibility (Enter/Space activation, tab navigation)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3_

  - [ ]* 3.2 Write component tests for PaginationControl
    - Create `__tests__/components/PaginationControl.test.tsx`
    - Test returns null when `totalPages <= 1`
    - Test renders nav with `aria-label="Portfolio pagination"`
    - Test renders prev button, next button, and page indicators
    - Test active page has `aria-current="page"`
    - Test prev/next buttons have descriptive `aria-label`
    - Test prev button disabled on page 1 with `aria-disabled="true"`
    - Test next button disabled on last page with `aria-disabled="true"`
    - Test clicking page number calls `onPageChange` with that number
    - Test clicking next calls `onPageChange(currentPage + 1)`
    - Test clicking prev calls `onPageChange(currentPage - 1)`
    - Test active page styled with gold accent class
    - Test buttons have min 44×44 px touch target classes
    - Test compact layout hides page numbers below 768 px (responsive classes present)
    - Test all interactive elements are native `<button>` elements
    - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3_

- [x] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Integrate pagination into PortfolioSection
  - [x] 5.1 Update `components/PortfolioSection.tsx` to add pagination state and rendering
    - Add `currentPage` state initialized to 1
    - Add `useEffect` that resets `currentPage` to 1 when `activeFilter` changes
    - Import `getTotalPages`, `getPageSlice`, `DEFAULT_PAGE_SIZE` from `lib/pagination`
    - Compute `totalPages` and `pageSlice` from `filteredItems`
    - Pass `pageSlice` instead of `filteredItems` to the masonry grid
    - Wrap the masonry grid in a keyed container (`key={currentPage}`) inside `AnimatePresence` to trigger page transition animations
    - Respect `useReducedMotion` for page transitions (skip animation when enabled)
    - Add `scrollIntoView` on the portfolio section element when `currentPage` changes (not on initial render)
    - Render `<PaginationControl>` below the masonry grid, passing `currentPage`, `totalPages`, and an `onPageChange` handler
    - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_

  - [ ]* 5.2 Write integration tests extending existing PortfolioSection tests
    - Add tests to `__tests__/components/PortfolioSection.test.tsx`
    - Test displays at most 6 items on initial render when items > 6
    - Test pagination control appears when items exceed page size
    - Test pagination control hidden when items ≤ page size
    - Test changing category filter resets to page 1
    - Test changing to category with ≤ 6 items hides pagination
    - Test reduced motion skips page transition animations
    - _Requirements: 1.1, 1.4, 2.1, 2.2, 4.1, 4.3, 5.2_

- [x] 6. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit and component tests validate specific examples, edge cases, and accessibility
- The existing `PortfolioSection` test file already has mocks for `next/image`, `framer-motion`, and `useReducedMotion` — integration tests should reuse those
