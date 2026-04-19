"use client";

export interface PaginationControlProps {
  /** Current 1-based page number. */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Callback when the user selects a page. */
  onPageChange: (page: number) => void;
}

/**
 * PaginationControl – Presentational pagination nav for the portfolio gallery.
 *
 * Returns null when totalPages <= 1 (no pagination needed).
 * Compact layout (< 768 px): prev / current page / next.
 * Full layout (≥ 768 px): prev / all page numbers / next.
 *
 * Requirements: 2.1–2.5, 3.1–3.5, 6.1–6.5, 7.1–7.3
 */
export default function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlProps) {
  if (totalPages <= 1) return null;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      aria-label="Portfolio pagination"
      className="mt-12 flex items-center justify-center gap-1 md:gap-2"
    >
      {/* Previous button */}
      <button
        aria-label="Go to previous page"
        aria-disabled={isFirstPage}
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        className={`min-h-[44px] min-w-[44px] rounded px-3 py-2 font-inter text-xs uppercase tracking-[0.2em] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] ${
          isFirstPage
            ? "cursor-not-allowed text-white/20"
            : "text-white/50 hover:text-gold"
        }`}
      >
        ‹ Prev
      </button>

      {/* Compact layout (< 768px): show only current page */}
      <span className="flex items-center md:hidden">
        <span className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center font-inter text-xs uppercase tracking-[0.2em] text-gold">
          {currentPage} / {totalPages}
        </span>
      </span>

      {/* Full layout (≥ 768px): show all page number buttons */}
      <span className="hidden md:flex md:items-center md:gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onPageChange(page)}
              className={`min-h-[44px] min-w-[44px] rounded px-3 py-2 font-inter text-xs uppercase tracking-[0.2em] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] ${
                isActive
                  ? "text-gold"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {page}
            </button>
          );
        })}
      </span>

      {/* Next button */}
      <button
        aria-label="Go to next page"
        aria-disabled={isLastPage}
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className={`min-h-[44px] min-w-[44px] rounded px-3 py-2 font-inter text-xs uppercase tracking-[0.2em] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] ${
          isLastPage
            ? "cursor-not-allowed text-white/20"
            : "text-white/50 hover:text-gold"
        }`}
      >
        Next ›
      </button>
    </nav>
  );
}
