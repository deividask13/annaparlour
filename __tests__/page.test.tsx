/**
 * Integration tests for page composition (app/page.tsx).
 *
 * Validates: Requirements 2.3, 5.7, 13.4
 */
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { MESSENGER_URL } from "@/lib/constants";

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

  // Factory that creates a forwardRef wrapper rendering the given HTML tag
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
    useScroll: () => ({
      scrollYProgress: { get: () => 0, on: () => () => {} },
    }),
    useTransform: (_value: unknown, _input: unknown, output: unknown) => ({
      get: () => (Array.isArray(output) ? output[0] : 0),
      on: () => () => {},
    }),
    useMotionValueEvent: () => {},
  };
});

// Mock useFrameLoader to avoid actual image loading
jest.mock("@/hooks/useFrameLoader", () => ({
  useFrameLoader: () => ({
    frames: [],
    progress: 1,
    isLoaded: true,
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Helper to create a mock MediaQueryList. */
function createMockMediaQueryList(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  return {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: jest.fn((_event: string, cb: (e: MediaQueryListEvent) => void) => {
      listeners.push(cb);
    }),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Page composition – integration tests", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    // Default: reduced motion OFF
    const mql = createMockMediaQueryList(false);
    window.matchMedia = jest.fn().mockReturnValue(mql);

    // Mock fetch so PortfolioSection's useEffect doesn't throw in jsdom
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as jest.Mock;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    jest.restoreAllMocks();
  });

  // ── 1. All sections render in the correct order ──────────────────────

  it("renders all sections in the correct order: NavBar → HeroSection → ScrollSequence → PortfolioSection → AboutSection → ServicesSection → TestimonialsSection → CTAFooterSection", () => {
    const { container } = render(<Home />);

    // Collect all section-level landmarks by their id or role
    // NavBar renders inside a <header>, sections have ids, footer is inside CTAFooterSection
    const header = container.querySelector("header");
    const hero = container.querySelector("#hero");
    const scrollSequence = container.querySelector(
      '[aria-label="Nail transformation scroll sequence"]',
    );
    const portfolio = container.querySelector("#portfolio");
    const about = container.querySelector("#about");
    const services = container.querySelector("#services");
    const testimonials = container.querySelector("#testimonials");
    const contact = container.querySelector("#contact");

    // All sections must be present
    expect(header).toBeInTheDocument();
    expect(hero).toBeInTheDocument();
    expect(scrollSequence).toBeInTheDocument();
    expect(portfolio).toBeInTheDocument();
    expect(about).toBeInTheDocument();
    expect(services).toBeInTheDocument();
    expect(testimonials).toBeInTheDocument();
    expect(contact).toBeInTheDocument();

    // Verify DOM order using compareDocumentPosition
    // Node.DOCUMENT_POSITION_FOLLOWING (4) means the argument comes after
    const FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;

    expect(header!.compareDocumentPosition(hero!)).toBe(FOLLOWING);
    expect(hero!.compareDocumentPosition(scrollSequence!)).toBe(FOLLOWING);
    expect(scrollSequence!.compareDocumentPosition(portfolio!)).toBe(FOLLOWING);
    expect(portfolio!.compareDocumentPosition(about!)).toBe(FOLLOWING);
    expect(about!.compareDocumentPosition(services!)).toBe(FOLLOWING);
    expect(services!.compareDocumentPosition(testimonials!)).toBe(FOLLOWING);
    expect(testimonials!.compareDocumentPosition(contact!)).toBe(FOLLOWING);
  });

  // ── 2. Navigation anchor links point to correct section IDs ──────────

  it("NavBar contains anchor links pointing to all major section IDs", () => {
    render(<Home />);

    const expectedAnchors = [
      "#hero",
      "#portfolio",
      "#about",
      "#services",
      "#testimonials",
      "#contact",
    ];

    const nav = screen.getByRole("navigation", { name: /main navigation/i });

    for (const href of expectedAnchors) {
      const link = nav.querySelector(`a[href="${href}"]`);
      expect(link).toBeInTheDocument();
    }
  });

  // ── 3. MessengerCTA links have the correct href ──────────────────────

  it("all Messenger CTA links use the correct MESSENGER_URL", () => {
    const { container } = render(<Home />);

    // Find all links pointing to the Messenger URL
    const messengerLinks = container.querySelectorAll(
      `a[href="${MESSENGER_URL}"]`,
    );

    // There should be at least 3 MessengerCTA instances:
    // NavBar "Book Now" (desktop + mobile), AboutSection inline, CTAFooterSection primary
    expect(messengerLinks.length).toBeGreaterThanOrEqual(3);

    // Every Messenger link should open in a new tab
    messengerLinks.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  // ── 4. Reduced motion mode disables animations ───────────────────────

  it("renders static content when prefers-reduced-motion is enabled", () => {
    // Enable reduced motion
    const mql = createMockMediaQueryList(true);
    window.matchMedia = jest.fn().mockReturnValue(mql);

    const { container } = render(<Home />);

    // ScrollSequence should show a static image instead of canvas
    // When reduced motion is active, it renders an <img> (mocked next/image)
    // with alt text about the completed nail art
    const staticImage = container.querySelector(
      'img[alt="Completed nail art by Anna Nails"]',
    );
    expect(staticImage).toBeInTheDocument();

    // The canvas element should NOT be present in reduced motion mode
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeInTheDocument();

    // The final overlay text should be rendered statically
    expect(
      screen.getByText("Anna Nails. Wolverhampton."),
    ).toBeInTheDocument();

    // HeroSection: shimmer backgrounds should have paused animation state
    const shimmerElements = container.querySelectorAll(".hero-shimmer");
    shimmerElements.forEach((el) => {
      expect(el.className).toContain("[animation-play-state:paused]");
    });

    // HeroSection: bokeh particles should have paused animation state
    const bokehElements = container.querySelectorAll('[class*="bokeh-particle"]');
    bokehElements.forEach((el) => {
      expect(el.className).toContain("[animation-play-state:paused]");
    });
  });
});
