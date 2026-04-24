/**
 * Component tests for PortfolioSection.
 *
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */
import { render, screen, waitFor } from "@testing-library/react";
import PortfolioSection from "@/components/PortfolioSection";
import { portfolioItems } from "@/lib/portfolio-data";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import type { PortfolioItem } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/image to render a plain <img>
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
    const { fill, priority, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />;
  },
}));

// Mock framer-motion to render plain elements (avoids animation side-effects in tests)
jest.mock("framer-motion", () => {
  const React = require("react");

  const motionComponent = (tag: string) =>
    React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
      const {
        initial, animate, exit, transition, whileInView, viewport,
        drag, dragConstraints, dragElastic, dragTransition,
        layout, layoutId, style, children, ...rest
      } = props;
      return React.createElement(tag, { ...rest, style, ref }, children);
    });

  return {
    __esModule: true,
    motion: new Proxy(
      {},
      { get: (_target: object, prop: string) => motionComponent(prop) },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock useReducedMotion hook
jest.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sample Instagram-sourced portfolio items returned by the API. */
const instagramItems: PortfolioItem[] = [
  {
    id: "ig-001",
    src: "https://scontent.cdninstagram.com/image1.jpg",
    alt: "Beautiful gel nails #gel",
    category: "Gel",
    aspectRatio: "square",
  },
  {
    id: "ig-002",
    src: "https://scontent.cdninstagram.com/image2.jpg",
    alt: "Acrylic set with glitter #acrylics",
    category: "Acrylics",
    aspectRatio: "square",
  },
  {
    id: "ig-003",
    src: "https://scontent.cdninstagram.com/image3.jpg",
    alt: "Nail art with hand-painted florals #nailart",
    category: "Nail Art",
    aspectRatio: "square",
  },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PortfolioSection", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  // ── 1. Renders fallback data on mount before fetch completes ─────────

  it("renders fallback portfolio items immediately on mount", () => {
    // Fetch that never resolves — simulates a pending request
    global.fetch = jest.fn(
      () => new Promise<Response>(() => {}),
    );

    render(<PortfolioSection />);

    // First page of fallback items should be in the document
    const firstPage = portfolioItems.slice(0, DEFAULT_PAGE_SIZE);
    for (const item of firstPage) {
      expect(screen.getByAltText(item.alt)).toBeInTheDocument();
    }

    // Items beyond the first page should NOT be visible
    const beyondFirstPage = portfolioItems.slice(DEFAULT_PAGE_SIZE);
    for (const item of beyondFirstPage) {
      expect(screen.queryByAltText(item.alt)).not.toBeInTheDocument();
    }
  });

  // ── 2. Replaces items after successful fetch ────────────────────────

  it("replaces displayed items with API response data after fetch", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => instagramItems,
    });

    render(<PortfolioSection />);

    // Wait for the Instagram items to appear
    await waitFor(() => {
      expect(screen.getByAltText(instagramItems[0].alt)).toBeInTheDocument();
    });

    // All Instagram items should be rendered
    for (const item of instagramItems) {
      expect(screen.getByAltText(item.alt)).toBeInTheDocument();
    }

    // Fallback items should no longer be rendered (replaced by API data)
    for (const item of portfolioItems) {
      expect(screen.queryByAltText(item.alt)).not.toBeInTheDocument();
    }
  });

  // ── 3. Keeps fallback data on fetch failure, no error UI ────────────

  it("keeps displaying fallback data when fetch fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    render(<PortfolioSection />);

    // Wait for the effect to settle
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/portfolio");
    });

    // First page of fallback items should still be displayed
    const firstPage = portfolioItems.slice(0, DEFAULT_PAGE_SIZE);
    for (const item of firstPage) {
      expect(screen.getByAltText(item.alt)).toBeInTheDocument();
    }

    // No error message should be visible
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // ── 4. Fetches from /api/portfolio on mount ─────────────────────────

  it("fetches from /api/portfolio on mount", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => instagramItems,
    });

    render(<PortfolioSection />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith("/api/portfolio");
    });
  });

  // ── 5. Filter tabs are present with Instagram items ─────────────────

  it("renders all category filter tabs with Instagram-sourced items", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => instagramItems,
    });

    render(<PortfolioSection />);

    // Wait for API data to load
    await waitFor(() => {
      expect(screen.getByAltText(instagramItems[0].alt)).toBeInTheDocument();
    });

    // All filter tabs should be present
    const expectedTabs = ["All", "Gel", "Acrylics", "Nail Art"];
    for (const tab of expectedTabs) {
      expect(screen.getByRole("tab", { name: tab })).toBeInTheDocument();
    }

    // The tablist should be present with the correct aria-label
    expect(
      screen.getByRole("tablist", { name: /portfolio filter categories/i }),
    ).toBeInTheDocument();
  });

  // ── 6. Keeps fallback data when API returns empty array ─────────────

  it("keeps fallback data when API returns an empty array", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<PortfolioSection />);

    // Wait for the effect to settle
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/portfolio");
    });

    // First page of fallback items should still be displayed (component guards against empty arrays)
    const firstPage = portfolioItems.slice(0, DEFAULT_PAGE_SIZE);
    for (const item of firstPage) {
      expect(screen.getByAltText(item.alt)).toBeInTheDocument();
    }
  });

  // ── 7. "All" filter tab is active by default ────────────────────────

  it("has the 'All' filter tab selected by default", () => {
    global.fetch = jest.fn(
      () => new Promise<Response>(() => {}),
    );

    render(<PortfolioSection />);

    const allTab = screen.getByRole("tab", { name: "All" });
    expect(allTab).toHaveAttribute("aria-selected", "true");
  });
});
