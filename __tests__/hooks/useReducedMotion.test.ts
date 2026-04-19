/**
 * Unit tests for useReducedMotion hook.
 *
 * Validates: Requirements 13.4
 */
import { renderHook, act } from "@testing-library/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Helper to create a mock MediaQueryList
function createMockMediaQueryList(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  return {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: jest.fn((event: string, cb: (e: MediaQueryListEvent) => void) => {
      if (event === "change") listeners.push(cb);
    }),
    removeEventListener: jest.fn((event: string, cb: (e: MediaQueryListEvent) => void) => {
      if (event === "change") {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      }
    }),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
    // Expose listeners for testing
    _listeners: listeners,
  };
}

describe("useReducedMotion", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("returns false by default when reduced motion is not enabled", () => {
    const mql = createMockMediaQueryList(false);
    window.matchMedia = jest.fn().mockReturnValue(mql);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it("returns true when reduced motion is enabled", () => {
    const mql = createMockMediaQueryList(true);
    window.matchMedia = jest.fn().mockReturnValue(mql);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it("updates when the media query changes", () => {
    const mql = createMockMediaQueryList(false);
    window.matchMedia = jest.fn().mockReturnValue(mql);

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    // Simulate the user enabling reduced motion
    act(() => {
      mql._listeners.forEach((cb) =>
        cb({ matches: true } as MediaQueryListEvent)
      );
    });

    expect(result.current).toBe(true);
  });

  it("cleans up the event listener on unmount", () => {
    const mql = createMockMediaQueryList(false);
    window.matchMedia = jest.fn().mockReturnValue(mql);

    const { unmount } = renderHook(() => useReducedMotion());

    expect(mql.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
