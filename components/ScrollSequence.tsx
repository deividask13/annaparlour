"use client";

import { useRef } from "react";
import Image from "next/image";
import { useScroll } from "framer-motion";
import { TOTAL_FRAMES, FRAME_PATH_PREFIX, OVERLAY_MILESTONES } from "@/lib/constants";
import { useFrameLoader } from "@/hooks/useFrameLoader";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import ScrollCanvas from "./ScrollCanvas";
import ParallaxOverlay from "./ParallaxOverlay";
import ProgressBar from "./ProgressBar";

/**
 * ScrollSequence – Orchestrates the scroll-synced image sequence section.
 *
 * Wraps ScrollCanvas, ParallaxOverlay, and ProgressBar in a tall container
 * (350vh) with a sticky inner viewport. Uses Framer Motion `useScroll` to
 * derive scroll progress and passes it to child components.
 *
 * While frames are loading, a progress bar is shown and scroll interaction
 * is disabled. When `prefers-reduced-motion` is active, a static final
 * frame and the last overlay text are rendered instead of the canvas.
 *
 * Requirements: 4.5, 5.1, 5.2, 5.6, 5.7, 6.6, 13.4
 */
export default function ScrollSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { frames, progress, isLoaded } = useFrameLoader(TOTAL_FRAMES);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Final frame path for reduced-motion fallback
  const finalFramePath = `${FRAME_PATH_PREFIX}${String(TOTAL_FRAMES).padStart(3, "0")}.jpg`;

  // Last overlay milestone text for reduced-motion static display
  const finalOverlayText =
    OVERLAY_MILESTONES[OVERLAY_MILESTONES.length - 1]?.text ?? "";

  return (
    <section
      ref={containerRef}
      className={`relative h-[350vh]${!isLoaded ? " overflow-hidden" : ""}`}
      aria-label="Nail transformation scroll sequence"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {reducedMotion ? (
          /* Reduced motion: static final frame + static overlay text */
          <div className="relative h-full w-full">
            <Image
              src={finalFramePath}
              alt="Completed nail art by Anna Nails"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 z-10 flex items-center justify-center text-center">
              <p className="font-cormorant text-4xl font-bold text-white/90 sm:text-5xl md:text-6xl lg:text-7xl">
                {finalOverlayText}
              </p>
            </div>
          </div>
        ) : (
          /* Full scroll-synced canvas experience */
          <div className="relative h-full w-full">
            {isLoaded ? (
              <>
                <ScrollCanvas
                  frames={frames}
                  scrollProgress={scrollYProgress}
                />
                <ParallaxOverlay scrollProgress={scrollYProgress} />
              </>
            ) : (
              /* Loading state: dark background with progress bar */
              <div className="flex h-full w-full items-center justify-center bg-background">
                <p className="font-inter text-sm uppercase tracking-[0.2em] text-white/50">
                  Loading experience…
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress bar shown during frame loading */}
      <ProgressBar progress={progress} isVisible={!isLoaded && !reducedMotion} />
    </section>
  );
}
