# Implementation Plan: Anna Nails Landing Page

## Overview

Build a luxury "scrollytelling" single-page landing page for Anna Nails using Next.js 14 (App Router), Tailwind CSS, Framer Motion, and HTML5 Canvas. The implementation proceeds bottom-up: project scaffolding → shared utilities/hooks → individual section components → page composition → responsive polish and accessibility.

## Tasks

- [x] 1. Project scaffolding and global configuration
  - [x] 1.1 Initialise Next.js 14 project with App Router, install Tailwind CSS and Framer Motion
    - Run `npx create-next-app@14` with App Router enabled (if not already scaffolded)
    - Install `framer-motion` as a dependency
    - Verify `tailwind.config.ts` is present and configured
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Configure `app/layout.tsx` with fonts, metadata, and global styles
    - Load Cormorant Garamond, Playfair Display, and Inter via `next/font/google` with `display: 'swap'`
    - Apply font CSS variables (`--font-cormorant`, `--font-playfair`, `--font-inter`) to `<body>`
    - Set `<html lang="en">`
    - Set `<meta>` title to "Anna Nails | Luxury Nail Technician · Wolverhampton"
    - Set `<meta>` description optimised for local SEO targeting "nail technician Wolverhampton"
    - Import `globals.css`
    - _Requirements: 1.5, 1.6, 1.7, 1.8_

  - [x] 1.3 Create `app/globals.css` with Tailwind directives and custom theme tokens
    - Add `@tailwind base; @tailwind components; @tailwind utilities;`
    - Define base background colour `#080808`, champagne gold `#C9A84C`, soft rose `#D4A5A5`
    - Add CSS shimmer/bokeh keyframes for the Hero background effect
    - Extend Tailwind config with custom colour tokens and font families
    - _Requirements: 1.9, 1.10, 1.11, 3.4_

- [x] 2. Shared constants and data files
  - [x] 2.1 Create `lib/constants.ts` with shared constants
    - Define `TOTAL_FRAMES`, `FRAME_PATH_PREFIX`, `MESSENGER_URL`, `COLORS`, `FILTER_CATEGORIES`, and `OVERLAY_MILESTONES` as typed constants matching the design document
    - _Requirements: 4.2, 6.1, 6.2, 6.3, 6.4_

  - [x] 2.2 Create `lib/portfolio-data.ts`, `lib/services-data.ts`, and `lib/testimonials-data.ts`
    - Define `PortfolioItem[]` with id, src, alt, category, aspectRatio for each portfolio image
    - Define `Service[]` with id, name, description, priceRange, duration for all six services (Gel Extensions, Acrylic Full Set, Nail Art Add-on, Press-On Sets, Infills, Removal)
    - Define `Testimonial[]` with id, quote, clientName, rating
    - Export TypeScript interfaces (`PortfolioItem`, `Service`, `Testimonial`, `PortfolioCategory`, `OverlayMilestone`) from the data files or a shared types file
    - _Requirements: 7.7, 9.3, 9.4, 10.3_

- [x] 3. Custom hooks
  - [x] 3.1 Implement `hooks/useReducedMotion.ts`
    - Read `window.matchMedia('(prefers-reduced-motion: reduce)')` on mount
    - Listen for changes and return current boolean state
    - Return `false` during SSR as safe default
    - _Requirements: 13.4_

  - [x] 3.2 Implement `hooks/useFrameLoader.ts`
    - Accept `totalFrames: number` parameter
    - On mount, create `Image` objects for each frame (`/frames/ezgif-frame-{NNN}.jpg`)
    - Track load progress (0–1), update state at 5% milestones to avoid excessive re-renders
    - On error, store `null` for that frame index and continue loading
    - Return `{ frames, progress, isLoaded }`
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 14.1_

  - [x] 3.3 Implement `hooks/useScrollFrame.ts`
    - Accept `scrollProgress: MotionValue<number>` and `totalFrames: number`
    - Use `useTransform` to map scroll progress (0–1) to frame index (0–totalFrames-1)
    - Return a `MotionValue<number>` for frame drawing subscription
    - _Requirements: 5.3_

  - [x] 3.4 Write unit tests for custom hooks
    - Test `useReducedMotion` returns correct boolean based on mocked `matchMedia`
    - Test `useFrameLoader` progress tracking and error handling
    - Test `useScrollFrame` maps progress values to correct frame indices
    - _Requirements: 4.1, 4.6, 5.3, 13.4_

- [x] 4. Checkpoint — Verify foundation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Reusable components
  - [x] 5.1 Implement `components/MessengerCTA.tsx`
    - Accept `label`, optional `variant` ('primary' | 'inline'), optional `className`
    - Render `<a>` with `href={MESSENGER_URL}`, `target="_blank"`, `rel="noopener noreferrer"`
    - `primary` variant: large button with champagne gold background, dark text
    - `inline` variant: text link with champagne gold colour and arrow
    - Include `aria-label` on the link
    - _Requirements: 2.4, 2.5, 8.4, 11.3, 11.4, 13.3_

  - [x] 5.2 Implement `components/ProgressBar.tsx`
    - Accept `progress: number` (0–1) and `isVisible: boolean`
    - Render a thin horizontal bar at the bottom of the screen, champagne gold fill, width = progress × 100%
    - Use Framer Motion `AnimatePresence` to fade out when `isVisible` becomes false
    - _Requirements: 4.3, 4.4_

- [x] 6. Navigation
  - [x] 6.1 Implement `components/NavBar.tsx`
    - Fixed position (`sticky top-0 z-50`) with semi-transparent dark background + backdrop blur
    - Desktop: logo "Anna Nails" in serif font left, anchor links centre (`#hero`, `#portfolio`, `#about`, `#services`, `#testimonials`, `#contact`), "Book Now" MessengerCTA right
    - Mobile (< 768px): logo left, hamburger icon right
    - Tapping hamburger opens full-screen overlay with nav links
    - Manage `isMenuOpen` state for mobile menu
    - All interactive elements have `aria-label` attributes
    - Navigation items in all-caps Inter with `letter-spacing: 0.2em`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 12.5, 15.5_

- [x] 7. Hero section
  - [x] 7.1 Implement `components/HeroSection.tsx`
    - Full viewport height (`h-screen`) with `id="hero"`
    - Headline "Art You Wear." in serif heading font, `text-white/90`
    - Sub-headline "Luxury nail artistry. Wolverhampton." in Inter, `text-white/60`
    - CSS-only shimmer/bokeh background using animated `radial-gradient` layers (keyframes from `globals.css`)
    - Animated downward chevron with "Scroll to Explore" label using Framer Motion `animate` with `y` oscillation
    - When `useReducedMotion()` returns true: pause shimmer animation, render static chevron
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 15.2_

- [x] 8. Scroll sequence section
  - [x] 8.1 Implement `components/ScrollCanvas.tsx`
    - Accept `frames: HTMLImageElement[]` and `scrollProgress: MotionValue<number>`
    - Render a `<canvas>` element sized to fill the viewport (`w-full h-full`)
    - Subscribe to `scrollProgress` via `useMotionValueEvent` or `useTransform`
    - Map progress (0–1) → frame index (0–239) using `Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1)`
    - Draw current frame with `ctx.drawImage()` inside `requestAnimationFrame`
    - Handle canvas resize on window resize to maintain aspect ratio (cover mode)
    - _Requirements: 5.3, 5.4, 5.5, 12.2, 14.2_

  - [x] 8.2 Implement `components/ParallaxOverlay.tsx`
    - Accept `scrollProgress: MotionValue<number>`
    - Position absolutely over the canvas
    - Use `OVERLAY_MILESTONES` from constants to define text + frame ranges
    - Convert frame ranges to scroll progress ranges (e.g. frames 1–10 → progress 0–0.042)
    - Use `useTransform` to map `scrollProgress` to opacity (0→1→0) for each text block
    - Text in heading serif font, `text-white/90`, centred
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 8.3 Implement `components/ScrollSequence.tsx`
    - Wrap `ScrollCanvas`, `ParallaxOverlay`, and `ProgressBar`
    - Tall container (`h-[350vh]`) with sticky inner wrapper (`sticky top-0 h-screen`)
    - Use Framer Motion `useScroll({ target: containerRef, offset: ["start start", "end end"] })` to get `scrollYProgress`
    - Pass `scrollYProgress` to `ScrollCanvas` and `ParallaxOverlay`
    - While frames loading: render `ProgressBar`, disable scroll interaction via `overflow-hidden`
    - When `useReducedMotion()` returns true: render a static `<Image>` of the final frame instead of canvas
    - When reduced motion active: display final overlay text statically
    - _Requirements: 4.5, 5.1, 5.2, 5.6, 5.7, 6.6, 13.4_

- [x] 9. Checkpoint — Verify scroll sequence
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Portfolio section
  - [x] 10.1 Implement `components/PortfolioSection.tsx`
    - Section heading "The Work." in serif font with `id="portfolio"`
    - Filter tabs: "All", "Gel", "Acrylics", "Nail Art", "Press-Ons" from `FILTER_CATEGORIES`
    - Active tab highlighted with champagne gold underline
    - Manage `activeFilter` state, default "All"
    - Masonry grid using Tailwind `columns-2 md:columns-3 lg:columns-4` with `break-inside-avoid`
    - Images via `next/image` with descriptive `alt` text, lazy-loaded
    - Framer Motion `AnimatePresence` + `layout` prop for smooth filter transitions
    - Scroll-triggered fade-in-up entrance via `whileInView`
    - Hover: subtle scale-up + champagne gold border
    - Mobile (< 768px): two-column layout
    - Reduced motion: no entrance animation, instant filter transitions
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 12.3, 14.4, 15.2_

- [x] 11. About section
  - [x] 11.1 Implement `components/AboutSection.tsx`
    - Split layout with `id="about"`: portrait image left (50%), biographical copy right (50%)
    - Portrait via `next/image` with descriptive `alt` text
    - Champagne gold `<hr>` dividers above and below content
    - Inline MessengerCTA: "Want to chat? Message me directly →"
    - Copy in warm, personal British English tone with premium vocabulary
    - Mobile (< 768px): stack portrait above copy
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 15.1, 15.4_

- [x] 12. Services section
  - [x] 12.1 Implement `components/ServicesSection.tsx`
    - Section heading "The Menu." in serif font with `id="services"`
    - Responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
    - Render service cards from `services-data.ts`: name, description, priceRange, duration
    - Dark card background (`bg-white/5`), champagne gold border on hover
    - Mobile (< 768px): single-column stack
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 15.2_

- [x] 13. Testimonials section
  - [x] 13.1 Implement `components/TestimonialsSection.tsx`
    - Section heading "They Said It Best." in serif font with `id="testimonials"`
    - Desktop: horizontal carousel with Framer Motion `drag="x"` and `dragConstraints`
    - Each card: client quote, champagne gold quotation mark, client first name, star rating
    - Dark card background consistent with site theme
    - Mobile (< 768px): vertical stack
    - Reduced motion: scrollable but no drag momentum
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 12.4_

- [x] 14. CTA footer section
  - [x] 14.1 Implement `components/CTAFooterSection.tsx`
    - Full-width dark section with `id="contact"`
    - Heading "Ready for Your Set?" in serif font, centred
    - Sub-copy in Inter, `text-white/60`
    - Large MessengerCTA button: "Message Anna on Messenger →" in champagne gold
    - "Usually replies within a few hours." below button
    - Footer: "© Anna Nails 2025 · Wolverhampton", Instagram icon link, Facebook icon link
    - All icon links have `aria-label` attributes
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 13.3_

- [x] 15. Page composition and wiring
  - [x] 15.1 Compose `app/page.tsx` with all section components
    - Mark as `"use client"`
    - Import and render all sections in order: NavBar → HeroSection → ScrollSequence → PortfolioSection → AboutSection → ServicesSection → TestimonialsSection → CTAFooterSection
    - Wrap in `<main>` with semantic HTML structure (`<header>`, `<main>`, `<footer>`)
    - Ensure smooth scroll behaviour between sections
    - _Requirements: 13.1, 13.5_

- [x] 16. Responsive design and accessibility polish
  - [x] 16.1 Verify responsive breakpoints and touch targets
    - Confirm mobile-first design with breakpoints at 768px (tablet) and 1024px (desktop)
    - Ensure all interactive elements meet minimum 44×44px touch target on mobile
    - Verify text legibility across all viewports
    - _Requirements: 12.1, 12.6, 13.5, 13.6_

  - [x] 16.2 Verify semantic HTML and accessibility attributes
    - Ensure `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` are used throughout
    - Verify all images have descriptive `alt` text
    - Verify all icon-only buttons/links have `aria-label`
    - Ensure keyboard navigation works with visible focus indicators
    - Check colour contrast ratios: 4.5:1 for body text, 3:1 for large text
    - _Requirements: 13.1, 13.2, 13.3, 13.5, 13.6_

  - [x] 16.3 Write integration tests for page composition
    - Test that all sections render in correct order
    - Test navigation anchor links scroll to correct sections
    - Test MessengerCTA links have correct href
    - Test reduced motion mode disables animations
    - _Requirements: 2.3, 5.7, 13.4_

- [x] 17. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- All copy must use British English spelling and the luxury-but-human tone defined in Requirement 15
- The `MESSENGER_URL` placeholder `[page-username]` should be replaced with the actual Facebook page username before deployment
- Portfolio images in `lib/portfolio-data.ts` will need actual image paths once assets are provided
