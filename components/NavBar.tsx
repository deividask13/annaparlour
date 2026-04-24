"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import MessengerCTA from "@/components/MessengerCTA";

const NAV_LINKS = [
  { href: "#hero", label: "Home" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#testimonials", label: "Reviews" },
  { href: "#contact", label: "Contact" },
] as const;

/**
 * Sticky navigation bar.
 *
 * Desktop  – logo left, anchor links centre, "Book Now" CTA right.
 * Mobile   – logo left, hamburger right; tapping opens a full-screen overlay.
 */
export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  /* Lock body scroll while the mobile menu is open */
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50">
      {/* ── Desktop / mobile top bar ── */}
      <nav
        className="flex items-center justify-between px-6 py-4 bg-[#080808]/80 backdrop-blur-md border-b border-white/5"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a
          href="#hero"
          className="inline-flex items-center min-h-[44px] select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
          aria-label="Anastasija's Beauty Parlour – back to top"
        >
          <Image
            src="/logo.jpg"
            alt="Anastasija's Beauty Parlour logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="ml-2 font-playfair text-xl text-white/90 tracking-wide">
            Anastasija&apos;s Beauty Parlour
          </span>
        </a>

        {/* Desktop anchor links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="inline-flex items-center min-h-[44px] px-2 font-inter text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[#C9A84C] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
                aria-label={`Navigate to ${label}`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <MessengerCTA label="Book Now" variant="primary" />
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center w-11 h-11 text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
        >
          {/* Animated hamburger / X icon */}
          <span className="relative w-6 h-5 flex flex-col justify-between" aria-hidden="true">
            <span
              className={`block h-0.5 w-6 bg-current rounded transition-transform duration-300 origin-center ${
                isMenuOpen ? "translate-y-[9px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current rounded transition-opacity duration-200 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current rounded transition-transform duration-300 origin-center ${
                isMenuOpen ? "-translate-y-[9px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      {/* ── Mobile full-screen overlay ── */}
      <div
        className={`fixed inset-0 z-40 bg-[#080808]/95 backdrop-blur-lg flex flex-col items-center justify-center transition-all duration-300 md:hidden ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <nav aria-label="Mobile navigation">
          <ul className="flex flex-col items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-4 py-2 font-inter text-sm uppercase tracking-[0.2em] text-white/80 hover:text-[#C9A84C] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
                  aria-label={`Navigate to ${label}`}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <MessengerCTA
              label="Book Now"
              variant="primary"
              className={isMenuOpen ? "" : "pointer-events-none"}
            />
          </div>
        </nav>
      </div>
    </header>
  );
}
