"use client";

import { services } from "@/lib/services-data";
import { COLORS } from "@/lib/constants";

/**
 * ServicesSection – Responsive card grid displaying Anna's service menu.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 15.2
 */
export default function ServicesSection() {
  return (
    <section
      id="services"
      className="relative w-full px-6 py-24 md:px-12 lg:px-20"
    >
      {/* Section heading */}
      <h2 className="mb-14 text-center font-cormorant text-4xl font-bold text-white/90 md:text-5xl lg:text-6xl">
        The Menu.
      </h2>

      {/* Service card grid */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.id}
            className="group rounded-lg border-2 border-transparent bg-white/5 p-6 transition-colors duration-300 hover:border-gold md:p-8"
          >
            {/* Service name */}
            <h3 className="mb-3 font-cormorant text-2xl font-semibold text-white/90 md:text-3xl">
              {service.name}
            </h3>

            {/* Description */}
            <p className="mb-6 font-inter text-sm leading-relaxed text-white/60 md:text-base">
              {service.description}
            </p>

            {/* Price & duration */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span
                className="font-inter text-lg font-semibold"
                style={{ color: COLORS.gold }}
              >
                {service.priceRange}
              </span>
              <span className="font-inter text-xs uppercase tracking-[0.2em] text-white/50">
                {service.duration}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
