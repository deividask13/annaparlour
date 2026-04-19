"use client";

import { type MotionValue, motion, useTransform } from "framer-motion";
import { OVERLAY_MILESTONES, TOTAL_FRAMES } from "@/lib/constants";

interface ParallaxOverlayProps {
  /** Scroll progress value from 0 (start) to 1 (end). */
  scrollProgress: MotionValue<number>;
}

/**
 * Converts a frame number (1-based) to a scroll progress value (0–1).
 */
function frameToProgress(frame: number): number {
  return (frame - 1) / (TOTAL_FRAMES - 1);
}

/**
 * OverlayText – A single milestone text block whose opacity is driven
 * by scroll progress. Fades in over the first 20% of its frame range
 * and fades out over the last 20%.
 */
function OverlayText({
  text,
  startFrame,
  endFrame,
  scrollProgress,
}: {
  text: string;
  startFrame: number;
  endFrame: number;
  scrollProgress: MotionValue<number>;
}) {
  const start = frameToProgress(startFrame);
  const end = frameToProgress(endFrame);
  const range = end - start;

  // Fade in over the first 20% of the range, hold, fade out over the last 20%
  const fadeIn = start;
  const fadeInEnd = start + range * 0.2;
  const fadeOutStart = end - range * 0.2;
  const fadeOut = end;

  const opacity = useTransform(
    scrollProgress,
    [fadeIn, fadeInEnd, fadeOutStart, fadeOut],
    [0, 1, 1, 0]
  );

  return (
    <motion.p
      className="font-cormorant text-4xl font-bold text-white/90 sm:text-5xl md:text-6xl lg:text-7xl"
      style={{ opacity }}
      aria-hidden="true"
    >
      {text}
    </motion.p>
  );
}

/**
 * ParallaxOverlay – Editorial text that fades in and out at defined
 * scroll milestones over the scroll sequence canvas.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export default function ParallaxOverlay({
  scrollProgress,
}: ParallaxOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-center">
      {OVERLAY_MILESTONES.map((milestone) => (
        <div key={milestone.text} className="absolute">
          <OverlayText
            text={milestone.text}
            startFrame={milestone.startFrame}
            endFrame={milestone.endFrame}
            scrollProgress={scrollProgress}
          />
        </div>
      ))}
    </div>
  );
}
