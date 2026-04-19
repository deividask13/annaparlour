"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { testimonials } from "@/lib/testimonials-data";
import { COLORS } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Width of each testimonial card in pixels (desktop). */
const CARD_WIDTH = 360;
/** Gap between cards in pixels (desktop). */
const CARD_GAP = 24;

/**
 * TestimonialsSection – Horizontal drag carousel on desktop, vertical stack on mobile.
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 12.4
 */
export default function TestimonialsSection() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  /** Recalculate drag constraints when the container mounts or resizes. */
  const updateConstraints = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const contentWidth =
      testimonials.length * CARD_WIDTH +
      (testimonials.length - 1) * CARD_GAP;
    const overflow = contentWidth - containerWidth;
    setDragConstraints({
      left: overflow > 0 ? -overflow : 0,
      right: 0,
    });
  }, []);

  useEffect(() => {
    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [updateConstraints]);

  return (
    <section
      id="testimonials"
      className="relative w-full px-6 py-24 md:px-12 lg:px-20"
    >
      {/* Section heading */}
      <h2 className="mb-14 text-center font-cormorant text-4xl font-bold text-white/90 md:text-5xl lg:text-6xl">
        They Said It Best.
      </h2>

      {/* ── Desktop: horizontal drag carousel ── */}
      <div
        ref={containerRef}
        className="hidden overflow-hidden md:block"
      >
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          style={{ gap: CARD_GAP }}
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.1}
          dragTransition={
            reducedMotion
              ? { power: 0, timeConstant: 0 }
              : undefined
          }
        >
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </motion.div>
      </div>

      {/* ── Mobile: vertical stack ── */}
      <div className="flex flex-col gap-6 md:hidden">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} testimonial={t} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// TestimonialCard
// ---------------------------------------------------------------------------

interface TestimonialCardProps {
  testimonial: {
    id: string;
    quote: string;
    clientName: string;
    rating: number;
  };
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <article
      className="flex-shrink-0 rounded-lg bg-white/5 p-6 md:p-8"
      style={{ minWidth: CARD_WIDTH, maxWidth: CARD_WIDTH }}
    >
      {/* Champagne gold quotation mark */}
      <span
        className="block font-cormorant text-5xl leading-none select-none"
        style={{ color: COLORS.gold }}
        aria-hidden="true"
      >
        &ldquo;
      </span>

      {/* Client quote */}
      <p className="mt-3 mb-6 font-inter text-sm leading-relaxed text-white/60 md:text-base">
        {testimonial.quote}
      </p>

      {/* Star rating */}
      <div className="mb-2 flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
        {Array.from({ length: testimonial.rating }, (_, i) => (
          <span key={i} style={{ color: COLORS.gold }} aria-hidden="true">
            ★
          </span>
        ))}
      </div>

      {/* Client name */}
      <p className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
        {testimonial.clientName}
      </p>
    </article>
  );
}
