"use client";

import { MESSENGER_URL } from "@/lib/constants";

interface MessengerCTAProps {
  label: string;
  variant?: "primary" | "inline";
  className?: string;
}

/**
 * Reusable Messenger deep-link CTA.
 *
 * - `primary` – large champagne-gold button with dark text (nav bar, footer).
 * - `inline`  – text link in champagne gold with a trailing arrow (about section).
 */
export default function MessengerCTA({
  label,
  variant = "primary",
  className = "",
}: MessengerCTAProps) {
  const baseClasses =
    "inline-flex items-center transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]";

  const variantClasses =
    variant === "primary"
      ? "bg-[#C9A84C] text-[#080808] font-semibold px-6 py-3 rounded-sm text-sm uppercase tracking-[0.2em] hover:bg-[#D4A5A5] min-h-[44px] min-w-[44px] justify-center"
      : "text-[#C9A84C] hover:text-[#D4A5A5] font-medium min-h-[44px] min-w-[44px] inline-flex items-center";

  return (
    <a
      href={MESSENGER_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {label}
      {variant === "inline" && (
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      )}
    </a>
  );
}
