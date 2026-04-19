"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ProgressBarProps {
  /** Loading progress from 0 (empty) to 1 (complete). */
  progress: number;
  /** Whether the bar should be visible. Fades out when set to false. */
  isVisible: boolean;
}

/**
 * Thin champagne-gold progress bar fixed to the bottom of the viewport.
 * Used to indicate frame-preloading progress for the scroll sequence.
 */
export default function ProgressBar({ progress, isVisible }: ProgressBarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="progress-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-0 left-0 z-50 h-1 w-full"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading scroll sequence frames"
        >
          <motion.div
            className="h-full bg-[#C9A84C]"
            style={{ width: `${Math.min(progress, 1) * 100}%` }}
            transition={{ duration: 0.15, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
