"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * HeroSection – Full-viewport hero with shimmer/bokeh background,
 * headline, sub-headline, and animated scroll prompt.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 15.2
 */
export default function HeroSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden"
    >
      {/* CSS shimmer/bokeh background */}
      <div
        className={`hero-shimmer absolute inset-0${reducedMotion ? " [animation-play-state:paused]" : ""}`}
        aria-hidden="true"
      />

      {/* Bokeh particle layers */}
      <div
        className={`bokeh-particle bokeh-particle-1${reducedMotion ? " [animation-play-state:paused]" : ""}`}
        aria-hidden="true"
      />
      <div
        className={`bokeh-particle bokeh-particle-2${reducedMotion ? " [animation-play-state:paused]" : ""}`}
        aria-hidden="true"
      />
      <div
        className={`bokeh-particle bokeh-particle-3${reducedMotion ? " [animation-play-state:paused]" : ""}`}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        <h1 className="font-cormorant text-5xl font-bold text-white/90 sm:text-6xl md:text-7xl lg:text-8xl">
          Art You Wear.
        </h1>
        <p className="mt-4 font-inter text-base tracking-wide text-white/60 sm:text-lg md:text-xl">
          Luxury nail artistry. Wolverhampton.
        </p>
      </div>

      {/* Scroll prompt */}
      <div className="absolute bottom-10 z-10 flex flex-col items-center gap-2">
        <span className="font-inter text-xs uppercase tracking-[0.2em] text-white/50">
          Scroll to Explore
        </span>

        {reducedMotion ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        ) : (
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </motion.svg>
        )}
      </div>
    </section>
  );
}
