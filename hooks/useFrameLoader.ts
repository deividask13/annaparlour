"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FRAME_PATH_PREFIX } from "@/lib/constants";

/**
 * Preloads all scroll-sequence frames into memory and reports loading progress.
 *
 * - Creates `totalFrames` `Image` objects with `src` set to
 *   `/frames/frame_{NNNN}.png` (NNNN zero-padded to 4 digits).
 * - Tracks load/error events; stores `null` for failed frames.
 * - Uses `useRef` for the frames array to avoid re-renders on each frame load.
 * - Only triggers state updates at 5 % progress milestones and on final completion.
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.6, 14.1
 */
export function useFrameLoader(totalFrames: number): {
  frames: (HTMLImageElement | null)[];
  progress: number;
  isLoaded: boolean;
} {
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Stable reference so the effect doesn't re-run when progress changes
  const lastMilestoneRef = useRef(0);

  const loadFrames = useCallback(() => {
    if (totalFrames <= 0) {
      setIsLoaded(true);
      return;
    }

    // Initialise the frames array with nulls
    framesRef.current = new Array<HTMLImageElement | null>(totalFrames).fill(null);
    lastMilestoneRef.current = 0;

    let loadedCount = 0;

    const promises = Array.from({ length: totalFrames }, (_, i) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        const frameNumber = String(i + 1).padStart(4, "0");
        img.src = `${FRAME_PATH_PREFIX}${frameNumber}.png`;

        img.onload = () => {
          framesRef.current[i] = img;
          loadedCount++;
          updateProgress(loadedCount);
          resolve();
        };

        img.onerror = () => {
          // Store null for failed frames and continue
          framesRef.current[i] = null;
          loadedCount++;
          updateProgress(loadedCount);
          resolve();
        };
      });
    });

    function updateProgress(count: number) {
      const currentProgress = count / totalFrames;
      // Calculate the current 5 % milestone (0, 0.05, 0.10, …, 1.0)
      const milestone = Math.floor(currentProgress * 20) / 20;

      if (milestone > lastMilestoneRef.current || count === totalFrames) {
        lastMilestoneRef.current = milestone;
        setProgress(count === totalFrames ? 1 : milestone);
      }
    }

    Promise.all(promises).then(() => {
      setProgress(1);
      setIsLoaded(true);
    });
  }, [totalFrames]);

  useEffect(() => {
    loadFrames();
  }, [loadFrames]);

  return { frames: framesRef.current, progress, isLoaded };
}
