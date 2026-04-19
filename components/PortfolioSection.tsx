"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FILTER_CATEGORIES } from "@/lib/constants";
import type { PortfolioCategory } from "@/lib/constants";
import { portfolioItems } from "@/lib/portfolio-data";
import type { PortfolioItem } from "@/lib/constants";
import { getTotalPages, getPageSlice, DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import PaginationControl from "@/components/PaginationControl";

type FilterCategory = (typeof FILTER_CATEGORIES)[number];

/**
 * PortfolioSection – Masonry gallery with category filter tabs.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11,
 *               12.3, 14.4, 15.2
 */
export default function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("All");
  const [items, setItems] = useState<PortfolioItem[]>(portfolioItems);
  const [currentPage, setCurrentPage] = useState(1);
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInitialRender = useRef(true);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data: PortfolioItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {
        // Silently keep fallback data on failure
      });
  }, []);

  // Reset to page 1 when the active filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Scroll to section top when page changes (not on initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (typeof sectionRef.current?.scrollIntoView === "function") {
      sectionRef.current.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  }, [currentPage, reducedMotion]);

  const filteredItems =
    activeFilter === "All"
      ? items
      : items.filter(
          (item) => item.category === (activeFilter as PortfolioCategory)
        );

  const totalPages = getTotalPages(filteredItems.length, DEFAULT_PAGE_SIZE);
  const pageSlice = getPageSlice(filteredItems, currentPage, DEFAULT_PAGE_SIZE);

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="relative w-full px-6 py-24 md:px-12 lg:px-20"
    >
      {/* Section heading */}
      <h2 className="mb-12 text-center font-cormorant text-4xl font-bold text-white/90 md:text-5xl lg:text-6xl">
        The Work.
      </h2>

      {/* Filter tabs */}
      <div
        className="mb-10 flex flex-wrap items-center justify-center gap-4 md:gap-6"
        role="tablist"
        aria-label="Portfolio filter categories"
      >
        {FILTER_CATEGORIES.map((category) => (
          <button
            key={category}
            role="tab"
            aria-selected={activeFilter === category}
            onClick={() => setActiveFilter(category)}
            className={`relative min-h-[44px] min-w-[44px] px-3 pb-2 pt-2 font-inter text-xs uppercase tracking-[0.2em] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] ${
              activeFilter === category
                ? "text-gold"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {category}
            {/* Active underline */}
            {activeFilter === category && (
              <motion.span
                layoutId="portfolio-tab-underline"
                className="absolute bottom-0 left-0 h-0.5 w-full bg-gold"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 30 }
                }
              />
            )}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="columns-2 gap-4 md:columns-3 md:gap-5 lg:columns-4 lg:gap-6">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentPage}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
            className="contents"
          >
            {pageSlice.map((item) => (
              <motion.div
                key={item.id}
                layout={!reducedMotion}
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={
                  reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -12, scale: 0.96 }
                }
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.35, ease: "easeOut" }
                }
                whileInView={
                  reducedMotion ? undefined : { opacity: 1, y: 0 }
                }
                viewport={{ once: true, amount: 0.15 }}
                className="mb-4 break-inside-avoid md:mb-5 lg:mb-6"
              >
                <div className="group relative overflow-hidden rounded-lg border-2 border-transparent transition-colors duration-300 hover:border-gold">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={
                      item.aspectRatio === "landscape"
                        ? 600
                        : item.aspectRatio === "square"
                          ? 500
                          : 400
                    }
                    height={
                      item.aspectRatio === "portrait"
                        ? 600
                        : item.aspectRatio === "square"
                          ? 500
                          : 400
                    }
                    loading="lazy"
                    className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination control */}
      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
