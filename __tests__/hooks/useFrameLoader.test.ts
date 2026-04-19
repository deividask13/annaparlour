/**
 * Unit tests for useFrameLoader hook (progressive loading).
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
  it("starts with progress 0, isReady false, and isLoaded false", () => {
    const { result } = renderHook(() => useFrameLoader(10));

    expect(result.current.progress).toBe(0);
    expect(result.current.isReady).toBe(false);
    expect(result.current.isLoaded).toBe(false);
  });

  it("sets correct src paths with zero-padded frame numbers and .webp extension", () => {
    renderHook(() => useFrameLoader(3));

    expect(mockImages[0].src).toBe("/frames/frame_0001.webp");
    expect(mockImages[1].src).toBe("/frames/frame_0002.webp");
    expect(mockImages[2].src).toBe("/frames/frame_0003.webp");
  });

  it("sets isReady after initial batch loads (small total)", async () => {
    // With only 5 frames, all are in the initial batch
    const { result } = renderHook(() => useFrameLoader(5));

    act(() => {
      resolveAllImages();
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.progress).toBe(1);
    });
  });

  it("sets isReady before isLoaded for large frame counts", async () => {
    const { result } = renderHook(() => useFrameLoader(40));

    // Resolve only the first 20 (initial batch)
    act(() => {
      for (let i = 0; i < 20; i++) {
        resolveImage(i);
      }
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    // isLoaded should still be false since remaining frames haven't loaded
    expect(result.current.isLoaded).toBe(false);

    // Background loading uses concurrency lanes that create Image objects
    // on demand. Keep resolving newly created images until all 40 are done.
    const resolved = new Set<number>();
    for (let i = 0; i < 20; i++) resolved.add(i);

    await waitFor(() => {
      act(() => {
        mockImages.forEach((img, idx) => {
          if (!resolved.has(idx) && img.onload) {
            resolved.add(idx);
            img.onload();
          }
        });
      });
      expect(result.current.isLoaded).toBe(true);
    });
  });

  it("handles failed frames by storing null and continuing", async () => {
    const { result } = renderHook(() => useFrameLoader(5));

    act(() => {
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
      expect(result.current.isReady).toBe(true);
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.frames).toHaveLength(0);
  });
});
