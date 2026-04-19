/**
 * Unit tests for useScrollFrame hook.
 *
 * Validates: Requirements 5.3
 */
import { renderHook } from "@testing-library/react";
import { motionValue, type MotionValue } from "framer-motion";
import { useScrollFrame } from "@/hooks/useScrollFrame";

/**
 * Helper: renders the hook with a given initial progress and returns the
 * computed frame index. This avoids issues with lazy MotionValue propagation
 * in the test environment by always initialising with the desired value.
 */
function getFrameIndex(progress: number, totalFrames: number): number {
  const scrollProgress = motionValue(progress);
  const { result } = renderHook(() => useScrollFrame(scrollProgress, totalFrames));
  return result.current.get();
}

describe("useScrollFrame", () => {
  it("maps progress 0 to frame index 0", () => {
    expect(getFrameIndex(0, 240)).toBe(0);
  });

  it("maps progress 1 to the last frame index (totalFrames - 1)", () => {
    expect(getFrameIndex(1, 240)).toBe(239);
  });

  it("maps progress 0.5 to approximately the middle frame", () => {
    // 0.5 * 239 = 119.5 — useTransform linearly interpolates
    expect(getFrameIndex(0.5, 240)).toBeCloseTo(119.5, 0);
  });

  it("maps progress 0.25 to approximately quarter frame", () => {
    // 0.25 * 239 = 59.75
    expect(getFrameIndex(0.25, 240)).toBeCloseTo(59.75, 0);
  });

  it("maps progress 0.75 to approximately three-quarter frame", () => {
    // 0.75 * 239 = 179.25
    expect(getFrameIndex(0.75, 240)).toBeCloseTo(179.25, 0);
  });

  it("works with different totalFrames values", () => {
    expect(getFrameIndex(1, 100)).toBe(99);
    expect(getFrameIndex(0, 100)).toBe(0);
    expect(getFrameIndex(0.5, 100)).toBeCloseTo(49.5, 0);
  });

  it("returns a MotionValue with get and set methods", () => {
    const scrollProgress = motionValue(0);
    const { result } = renderHook(() => useScrollFrame(scrollProgress, 240));

    expect(typeof result.current.get).toBe("function");
    expect(typeof result.current.set).toBe("function");
  });

  it("clamps to valid frame range at boundaries", () => {
    // At progress 0, frame should be exactly 0
    expect(getFrameIndex(0, 240)).toBe(0);
    // At progress 1, frame should be exactly totalFrames - 1
    expect(getFrameIndex(1, 240)).toBe(239);
    // Small totalFrames
    expect(getFrameIndex(0, 1)).toBe(0);
    expect(getFrameIndex(1, 1)).toBe(0);
  });
});
