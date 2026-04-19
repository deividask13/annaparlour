"use client";

import { useRef, useEffect, useCallback } from "react";
import { type MotionValue, useMotionValueEvent } from "framer-motion";
import { TOTAL_FRAMES } from "@/lib/constants";

interface ScrollCanvasProps {
  /** Pre-loaded frame images (null entries for failed loads are skipped). */
  frames: (HTMLImageElement | null)[];
  /** Scroll progress value from 0 (start) to 1 (end). */
  scrollProgress: MotionValue<number>;
}

/**
 * ScrollCanvas – Renders the scroll-synced image sequence on an HTML5 Canvas.
 *
 * Subscribes to `scrollProgress` and maps it to a frame index (0–239).
 * Draws the current frame using `ctx.drawImage()` inside `requestAnimationFrame`
 * with "cover" scaling to fill the viewport while maintaining aspect ratio.
 *
 * Requirements: 5.3, 5.4, 5.5, 12.2, 14.2
 */
export default function ScrollCanvas({
  frames,
  scrollProgress,
}: ScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentFrameRef = useRef(0);

  /**
   * Draw a single frame onto the canvas using "cover" mode:
   * the image is scaled and centred so it fills the entire canvas
   * without distortion, cropping overflow on the shorter axis.
   */
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = frames[frameIndex];
    if (!img) return;

    // Scale canvas buffer to match device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const { clientWidth, clientHeight } = canvas;
    const bufferWidth = Math.round(clientWidth * dpr);
    const bufferHeight = Math.round(clientHeight * dpr);

    if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
      canvas.width = bufferWidth;
      canvas.height = bufferHeight;
    }

    // Use high-quality image smoothing for downscaled frames
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Calculate "cover" dimensions
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = bufferWidth / bufferHeight;

    let drawWidth: number;
    let drawHeight: number;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image aspect — match width, crop height
      drawWidth = bufferWidth;
      drawHeight = bufferWidth / imgRatio;
    } else {
      // Canvas is taller than image aspect — match height, crop width
      drawHeight = bufferHeight;
      drawWidth = bufferHeight * imgRatio;
    }

    const offsetX = (bufferWidth - drawWidth) / 2;
    const offsetY = (bufferHeight - drawHeight) / 2;

    ctx.clearRect(0, 0, bufferWidth, bufferHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, [frames]);

  /**
   * Schedule a frame draw via requestAnimationFrame to stay in sync
   * with the browser's paint cycle for smooth 60fps performance.
   */
  const scheduleDrawFrame = useCallback(
    (frameIndex: number) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        drawFrame(frameIndex);
        rafRef.current = null;
      });
    },
    [drawFrame]
  );

  // Subscribe to scroll progress changes and map to frame index
  useMotionValueEvent(scrollProgress, "change", (latest) => {
    const index = Math.min(
      Math.floor(latest * TOTAL_FRAMES),
      TOTAL_FRAMES - 1
    );

    if (index !== currentFrameRef.current) {
      currentFrameRef.current = index;
      scheduleDrawFrame(index);
    }
  });

  // Handle window resize — redraw current frame at new canvas size
  useEffect(() => {
    const handleResize = () => {
      scheduleDrawFrame(currentFrameRef.current);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [scheduleDrawFrame]);

  // Draw the initial frame once frames are available
  useEffect(() => {
    if (frames.length > 0 && frames[0]) {
      drawFrame(0);
    }
  }, [frames, drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-hidden="true"
    />
  );
}
