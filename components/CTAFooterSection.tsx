"use client";

import MessengerCTA from "@/components/MessengerCTA";

/**
 * CTAFooterSection – Final call-to-action and site footer.
 *
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 13.3
 */
export default function CTAFooterSection() {
  return (
    <section
      id="contact"
      className="relative w-full bg-[#080808] px-6 py-24 md:px-12 lg:px-20"
    >
      {/* CTA block */}
      <div className="mx-auto max-w-2xl text-center">
        {/* Heading */}
        <h2 className="mb-6 font-cormorant text-4xl font-bold text-white/90 md:text-5xl lg:text-6xl">
          Ready for Your Set?
        </h2>

        {/* Sub-copy */}
        <p className="mb-10 font-inter text-base leading-relaxed text-white/60 md:text-lg">
          Message Anna on Facebook to check availability and book your
          appointment in Wolverhampton.
        </p>

        {/* Primary CTA button */}
        <MessengerCTA
          label="Message Anna on Messenger →"
          variant="primary"
          className="mx-auto text-base md:text-lg px-8 py-4"
        />

        {/* Reply time note */}
        <p className="mt-6 font-inter text-sm text-white/50">
          Usually replies within a few hours.
        </p>
      </div>

      {/* Footer */}
      <footer className="mx-auto mt-20 max-w-6xl border-t border-white/10 pt-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Copyright */}
          <p className="font-inter text-xs tracking-wide text-white/50">
            © Anna Nails 2025 · Wolverhampton
          </p>

          {/* Social links */}
          <div className="flex items-center gap-5">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/nails_byanna_08/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Anna Nails on Instagram"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-white/50 transition-colors duration-200 hover:text-[#C9A84C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61583394983925"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Anna Nails on Facebook"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-white/50 transition-colors duration-200 hover:text-[#C9A84C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}
