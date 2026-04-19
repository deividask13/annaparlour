/**
 * Unit tests for useFrameLoader hook.
 *
 * Validates: Requirements 4.1, 4.6
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFrameLoader } from "@/hooks/useFrameLoader";

// ---------------------------------------------------------------------------
// Mock the browser Image constructor
// ---------------------------------------------------------------------------

type MockImage = {
  src: string;
  onload: (() => void) | null;
  onerror: (() => void) | null;
};

let mockImages: MockImage[];

beforeEach(() => {
  mockImages = [];

  // Replace the global Image constructor with a mock
  (global as any).Image = class {
    src = "";
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor() {
      mockImages.push(this as unknown as MockImage);
    }
  };
});

afterEach(() => {
  // Restore original Image (jsdom provides one)
  delete (global as any).Image;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve all pending image loads successfully. */
function resolveAllImages() {
  mockImages.forEach((img) => {
    if (img.onload) img.onload();
  });
}

/** Fail a specific image by index (0-based). */
function failImage(index: number) {
  const img = mockImages[index];
  if (img?.onerror) img.onerror();
}

/** Resolve a specific image by index (0-based). */
function resolveImage(index: number) {
  const img = mockImages[index];
  if (img?.onload) img.onload();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useFrameLoader", () => {
  it("starts with progress 0 and isLoaded false", () => {
    const { result } = renderHook(() => useFrameLoader(10));

    expect(result.current.progress).toBe(0);
    expect(result.current.isLoaded).toBe(false);
  });

  it("creates the correct number of Image objects", () => {
    renderHook(() => useFrameLoader(10));

    expect(mockImages).toHaveLength(10);
  });

  it("sets correct src paths with zero-padded frame numbers", () => {
    renderHook(() => useFrameLoader(3));

    expect(mockImages[0].src).toBe("/frames/frame_0001.png");
    expect(mockImages[1].src).toBe("/frames/frame_0002.png");
    expect(mockImages[2].src).toBe("/frames/frame_0003.png");
  });

  it("sets isLoaded to true when all frames load", async () => {
    const { result } = renderHook(() => useFrameLoader(5));

    act(() => {
      resolveAllImages();
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.progress).toBe(1);
    });
  });

  it("handles failed frames by storing null and continuing", async () => {
    const { result } = renderHook(() => useFrameLoader(5));

    act(() => {
      // Fail frame 0 and 2, resolve the rest
      failImage(0);
      resolveImage(1);
      failImage(2);
      resolveImage(3);
      resolveImage(4);
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.progress).toBe(1);
    });

    // Failed frames should be null
    expect(result.current.frames[0]).toBeNull();
    expect(result.current.frames[2]).toBeNull();
  });

  it("updates progress at 5% milestones", async () => {
    const totalFrames = 20;
    const { result } = renderHook(() => useFrameLoader(totalFrames));

    // Load 1 of 20 = 5% → should trigger a milestone update
    act(() => {
      resolveImage(0);
    });

    await waitFor(() => {
      expect(result.current.progress).toBeGreaterThanOrEqual(0.05);
    });

    // Load up to 10 of 20 = 50%
    act(() => {
      for (let i = 1; i < 10; i++) {
        resolveImage(i);
      }
    });

    await waitFor(() => {
      expect(result.current.progress).toBeGreaterThanOrEqual(0.45);
    });
  });

  it("handles totalFrames of 0 gracefully", async () => {
    const { result } = renderHook(() => useFrameLoader(0));

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.frames).toHaveLength(0);
  });
});
