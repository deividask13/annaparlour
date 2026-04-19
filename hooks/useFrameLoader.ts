"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FRAME_PATH_PREFIX } from "@/lib/constants";

/** Number of frames to load in the initial batch before showing the experience. */
const INITIAL_BATCH = 20;

/** How many frames to load concurrently in the background phase. */
const BG_CONCURRENCY = 6;

/**
 * Progressively preloads scroll-sequence frames into memory.
 *
 * Phase 1 – Loads the first INITIAL_BATCH frames. Once complete, sets
 *           `isReady` to true so the scroll experience can begin immediately.
 * Phase 2 – Loads the remaining frames in the background with limited
 *           concurrency so the main thread stays responsive.
 *
 * `progress` reflects overall loading (0 → 1) across both phases.
 * `isLoaded` becomes true only when every frame has been fetched.
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.6, 14.1
 */
export function useFrameLoader(totalFrames: number): {
  frames: (HTMLImageElement | null)[];
  progress: number;
  isReady: boolean;
  isLoaded: boolean;
} {
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const lastMilestoneRef = useRef(0);
  const loadedCountRef = useRef(0);

  /** Load a single frame by index and return a promise. */
  const loadFrame = useCallback(
    (index: number): Promise<void> =>
      new Promise<void>((resolve) => {
        const img = new Image();
        const frameNumber = String(index + 1).padStart(4, "0");
        img.src = `${FRAME_PATH_PREFIX}${frameNumber}.webp`;

        img.onload = () => {
          framesRef.current[index] = img;
          loadedCountRef.current++;
          updateProgress(loadedCountRef.current);
          resolve();
        };

        img.onerror = () => {
          framesRef.current[index] = null;
          loadedCountRef.current++;
          updateProgress(loadedCountRef.current);
          resolve();
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function updateProgress(count: number) {
    const currentProgress = count / (framesRef.current.length || 1);
    const milestone = Math.floor(currentProgress * 20) / 20;

    if (milestone > lastMilestoneRef.current || count === framesRef.current.length) {
      lastMilestoneRef.current = milestone;
      setProgress(count === framesRef.current.length ? 1 : milestone);
    }
  }

  const startLoading = useCallback(() => {
    if (totalFrames <= 0) {
      setIsReady(true);
      setIsLoaded(true);
      return;
    }

    framesRef.current = new Array<HTMLImageElement | null>(totalFrames).fill(null);
    lastMilestoneRef.current = 0;
    loadedCountRef.current = 0;

    const initialCount = Math.min(INITIAL_BATCH, totalFrames);

    // Phase 1: load the first batch concurrently
    const initialPromises = Array.from({ length: initialCount }, (_, i) =>
      loadFrame(i)
    );

    Promise.all(initialPromises).then(() => {
      setIsReady(true);

      // Phase 2: load remaining frames with limited concurrency
      const remaining = Array.from(
        { length: totalFrames - initialCount },
        (_, i) => i + initialCount
      );

      if (remaining.length === 0) {
        setProgress(1);
        setIsLoaded(true);
        return;
      }

      let cursor = 0;

      function next(): Promise<void> {
        if (cursor >= remaining.length) return Promise.resolve();
        const idx = remaining[cursor++];
        return loadFrame(idx).then(next);
      }

      // Start BG_CONCURRENCY parallel "lanes"
      const lanes = Array.from(
        { length: Math.min(BG_CONCURRENCY, remaining.length) },
        () => next()
      );

      Promise.all(lanes).then(() => {
        setProgress(1);
        setIsLoaded(true);
      });
    });
  }, [totalFrames, loadFrame]);

  useEffect(() => {
    startLoading();
  }, [startLoading]);

  return { frames: framesRef.current, progress, isReady, isLoaded };
}
