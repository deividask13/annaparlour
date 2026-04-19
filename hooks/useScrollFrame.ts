"use client";

import { type MotionValue, useTransform } from "framer-motion";

/**
 * Maps a scroll progress value (0–1) to a frame index (0–totalFrames-1).
 *
 * Uses Framer Motion's `useTransform` to produce a reactive `MotionValue`
 * that can be subscribed to for drawing the correct frame on a canvas.
 *
 * Validates: Requirements 5.3
 */
export function useScrollFrame(
  scrollProgress: MotionValue<number>,
  totalFrames: number
): MotionValue<number> {
  return useTransform(scrollProgress, [0, 1], [0, totalFrames - 1]);
}
