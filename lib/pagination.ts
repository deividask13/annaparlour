/** Default number of items per page. */
export const DEFAULT_PAGE_SIZE = 6;

/**
 * Returns the total number of pages for the given item count and page size.
 * Always returns at least 1. Treats invalid pageSize (0, negative) as DEFAULT_PAGE_SIZE.
 */
export function getTotalPages(
  itemCount: number,
  pageSize: number = DEFAULT_PAGE_SIZE
): number {
  const effectivePageSize =
    !Number.isFinite(pageSize) || pageSize < 1 ? DEFAULT_PAGE_SIZE : pageSize;
  if (itemCount <= 0) return 1;
  return Math.max(1, Math.ceil(itemCount / effectivePageSize));
}

/**
 * Returns the slice of items for the given 1-based page number.
 * Clamps page to [1, totalPages] to prevent out-of-range access.
 * Treats invalid pageSize (0, negative) as DEFAULT_PAGE_SIZE.
 */
export function getPageSlice<T>(
  items: T[],
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE
): T[] {
  const effectivePageSize =
    !Number.isFinite(pageSize) || pageSize < 1 ? DEFAULT_PAGE_SIZE : pageSize;
  const totalPages = getTotalPages(items.length, effectivePageSize);
  const clampedPage =
    !Number.isFinite(page) || page < 1
      ? 1
      : page > totalPages
        ? totalPages
        : Math.floor(page);
  const start = (clampedPage - 1) * effectivePageSize;
  const end = clampedPage * effectivePageSize;
  return items.slice(start, end);
}
