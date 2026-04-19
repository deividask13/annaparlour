# Requirements Document

## Introduction

A luxury "scrollytelling" landing page for **Anna Nails**, a premium nail technician personal brand based in Wolverhampton, UK. The site follows a dark editorial aesthetic inspired by high-fashion beauty campaigns. The centrepiece is a scroll-synced image sequence rendered on HTML5 Canvas that tells the story of a nail transformation from bare tip to finished art. All conversion funnels through a Facebook Messenger deep-link — there is no booking form.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Framer Motion, HTML5 Canvas.

## Glossary

- **Landing_Page**: The single-page Next.js application comprising all sections (Hero, Scroll Sequence, Portfolio, About, Services, Testimonials, CTA Footer).
- **Scroll_Sequence**: A pinned full-screen HTML5 Canvas section that scrubs through a pre-loaded image sequence frame-by-frame in sync with the user's scroll position.
- **Frame_Loader**: The subsystem responsible for preloading all image sequence frames into memory on component mount and reporting loading progress.
- **Canvas_Renderer**: The subsystem that draws the current frame to an HTML5 Canvas element using `requestAnimationFrame` and `drawImage`.
- **Parallax_Overlay**: Text elements that fade in and out at defined scroll milestones over the Scroll Sequence canvas.
- **Nav_Bar**: The sticky navigation bar containing the logo, anchor links, and the primary CTA button.
- **Portfolio_Grid**: The masonry or asymmetric editorial image grid displaying nail art photography.
- **Testimonial_Carousel**: A horizontally scrollable carousel of client testimonial cards powered by Framer Motion drag gestures.
- **Messenger_CTA**: A call-to-action button that opens a Facebook Messenger deep-link (`https://m.me/[page-username]`).
- **Progress_Bar**: A minimal gold loading indicator displayed at the bottom of the screen while frames are preloading.
- **Hamburger_Menu**: A collapsible mobile navigation menu that replaces the full Nav Bar on small viewports.
- **Reduced_Motion_Mode**: The operating state when the user's system has `prefers-reduced-motion: reduce` enabled.

## Requirements

### Requirement 1: Project Initialisation and Configuration

**User Story:** As a developer, I want the project scaffolded with Next.js 14 App Router, Tailwind CSS, and Framer Motion, so that I have a working foundation to build all landing page sections.

#### Acceptance Criteria

1. THE Landing_Page SHALL be built using Next.js 14 with the App Router.
2. THE Landing_Page SHALL use Tailwind CSS for all styling.
3. THE Landing_Page SHALL use Framer Motion for all scroll-triggered and interaction animations.
4. THE Landing_Page SHALL use HTML5 Canvas for the Scroll Sequence rendering.
5. THE Landing_Page SHALL set the HTML `<meta>` title to "Anna Nails | Luxury Nail Technician · Wolverhampton".
6. THE Landing_Page SHALL set the HTML `<meta>` description to a value optimised for local SEO targeting "nail technician Wolverhampton" and related terms.
7. THE Landing_Page SHALL use 'Cormorant Garamond' or 'Playfair Display' as the heading typeface loaded via Google Fonts or `next/font`.
8. THE Landing_Page SHALL use 'Inter' as the body typeface loaded via Google Fonts or `next/font`.
9. THE Landing_Page SHALL use `#080808` as the base background colour across all sections.
10. THE Landing_Page SHALL use `#C9A84C` (champagne gold) as the primary accent colour for highlights, CTA buttons, and decorative dividers.
11. THE Landing_Page SHALL use `#D4A5A5` (soft rose chrome) as the secondary accent colour for hover states and subtle detail elements.

---

### Requirement 2: Sticky Navigation Bar

**User Story:** As a visitor, I want a persistent navigation bar, so that I can quickly jump to any section or book an appointment at any time.

#### Acceptance Criteria

1. THE Nav_Bar SHALL remain fixed at the top of the viewport during scrolling.
2. THE Nav_Bar SHALL display the logo text "Anna Nails" rendered in the heading serif typeface.
3. THE Nav_Bar SHALL contain anchor links to each major section of the Landing Page.
4. THE Nav_Bar SHALL contain a Messenger_CTA button labelled "Book Now" styled with the champagne gold accent colour.
5. WHEN a visitor clicks the "Book Now" button, THE Nav_Bar SHALL open the Facebook Messenger deep-link in a new tab or the Messenger app.
6. WHEN the viewport width is below the mobile breakpoint (768px), THE Nav_Bar SHALL collapse navigation links into a Hamburger_Menu.
7. WHEN a visitor taps the Hamburger_Menu icon, THE Nav_Bar SHALL reveal the navigation links in a mobile-friendly overlay or drawer.
8. THE Nav_Bar SHALL include `aria-label` attributes on all interactive elements for screen reader accessibility.

---

### Requirement 3: Hero Section

**User Story:** As a visitor, I want an impactful full-screen hero, so that I immediately understand the brand's luxury positioning.

#### Acceptance Criteria

1. THE Landing_Page SHALL render the Hero section at full viewport height (100vh).
2. THE Landing_Page SHALL display the headline "Art You Wear." in the heading serif typeface with `text-white/90` colour.
3. THE Landing_Page SHALL display the sub-headline "Luxury nail artistry. Wolverhampton." in the body typeface with `text-white/60` colour.
4. THE Landing_Page SHALL render a subtle looping background effect (slow-motion shimmer or bokeh of glitter particles) using CSS or Canvas — not video.
5. THE Landing_Page SHALL display an animated downward chevron with the label "Scroll to Explore" as a scroll prompt at the bottom of the Hero section.
6. WHEN the visitor scrolls past the Hero section, THE Landing_Page SHALL smoothly transition into the Scroll Sequence section.
7. WHILE Reduced_Motion_Mode is active, THE Landing_Page SHALL disable or simplify the background shimmer effect and the chevron animation in the Hero section.

---

### Requirement 4: Frame Preloading and Progress Indicator

**User Story:** As a visitor, I want all scroll sequence frames preloaded before I begin scrolling, so that the animation plays smoothly without stutter.

#### Acceptance Criteria

1. WHEN the Scroll Sequence component mounts, THE Frame_Loader SHALL begin preloading all image frames by iterating from `ezgif-frame-001.jpg` to `ezgif-frame-240.jpg` using `Promise.all` and `new Image()`.
2. THE Frame_Loader SHALL use a `TOTAL_FRAMES` constant (set to 240) at the top of the component to determine the number of frames to load.
3. WHILE frames are loading, THE Progress_Bar SHALL display a minimal champagne gold progress indicator at the bottom of the screen showing the percentage of frames loaded.
4. WHEN all frames have loaded, THE Progress_Bar SHALL fade out smoothly.
5. WHILE frames are loading, THE Landing_Page SHALL prevent the Scroll Sequence from responding to scroll input.
6. IF a frame fails to load, THEN THE Frame_Loader SHALL skip the failed frame and continue loading remaining frames without blocking the sequence.

---

### Requirement 5: Scroll-Synced Image Sequence

**User Story:** As a visitor, I want to scrub through a nail transformation sequence by scrolling, so that I experience the artistry story interactively.

#### Acceptance Criteria

1. THE Scroll_Sequence section SHALL be pinned (sticky) to the viewport for the duration of its scroll travel.
2. THE Scroll_Sequence section SHALL have a scroll distance of 300–400vh to provide sufficient travel for the full 240-frame animation.
3. WHEN the visitor scrolls within the Scroll Sequence section, THE Canvas_Renderer SHALL map the scroll position to a frame index (0–239) and draw the corresponding frame to the Canvas element.
4. THE Canvas_Renderer SHALL use `requestAnimationFrame` to synchronise frame drawing for smooth 60fps performance.
5. THE Canvas_Renderer SHALL scale the Canvas to fill the full viewport width and height while maintaining the aspect ratio of the source frames.
6. WHEN the visitor reaches the end of the Scroll Sequence scroll distance, THE Scroll_Sequence section SHALL unpin smoothly and transition into the Portfolio section.
7. WHILE Reduced_Motion_Mode is active, THE Scroll_Sequence section SHALL display a static representative frame (e.g. the final frame) instead of the scroll-synced animation.

---

### Requirement 6: Parallax Text Overlays

**User Story:** As a visitor, I want editorial text to appear and disappear over the scroll sequence at key moments, so that the transformation story is narrated visually.

#### Acceptance Criteria

1. WHILE the scroll position corresponds to frames 1–10, THE Parallax_Overlay SHALL display the text "The Canvas." with a fade-in and fade-out transition.
2. WHILE the scroll position corresponds to frames 11–25, THE Parallax_Overlay SHALL display the text "The Craft." with a fade-in and fade-out transition.
3. WHILE the scroll position corresponds to frames 26–40, THE Parallax_Overlay SHALL display the text "The Art." with a fade-in and fade-out transition.
4. WHILE the scroll position corresponds to frames 41–240, THE Parallax_Overlay SHALL display the text "Anna Nails. Wolverhampton." with a fade-in and fade-out transition.
5. THE Parallax_Overlay text SHALL be rendered in the heading serif typeface with `text-white/90` colour and centred on the viewport.
6. WHILE Reduced_Motion_Mode is active, THE Parallax_Overlay SHALL display the final overlay text ("Anna Nails. Wolverhampton.") statically without animation.

---

### Requirement 7: Portfolio Section

**User Story:** As a visitor, I want to browse a gallery of Anna's nail art, so that I can see the quality and range of her work.

#### Acceptance Criteria

1. THE Portfolio_Grid SHALL display nail art photography in a masonry or asymmetric editorial grid layout.
2. THE Portfolio_Grid SHALL use the Next.js `Image` component for all portfolio photographs with appropriate `alt` text.
3. THE Portfolio_Grid SHALL lazy-load images as they enter the viewport.
4. WHEN a portfolio image scrolls into the viewport, THE Portfolio_Grid SHALL animate the image with a Framer Motion fade-in-up entrance.
5. WHEN a visitor hovers over a portfolio image, THE Portfolio_Grid SHALL apply a subtle scale-up effect and reveal a champagne gold border.
6. THE Portfolio_Grid section SHALL display the heading "The Work." in the heading serif typeface.
7. THE Portfolio_Grid SHALL display filter tabs labelled "All", "Gel", "Acrylics", "Nail Art", and "Press-Ons" above the grid.
8. WHEN a visitor selects a filter tab, THE Portfolio_Grid SHALL display only portfolio images matching the selected category, with a Framer Motion layout animation for the transition.
9. THE "All" filter tab SHALL be selected by default on initial load.
10. WHEN the viewport width is below the mobile breakpoint (768px), THE Portfolio_Grid SHALL collapse to a two-column layout.
11. WHILE Reduced_Motion_Mode is active, THE Portfolio_Grid SHALL display images without entrance animations.

---

### Requirement 8: About Section

**User Story:** As a visitor, I want to learn about Anna, so that I feel a personal connection and trust in her expertise.

#### Acceptance Criteria

1. THE Landing_Page SHALL render the About section in a split layout with Anna's portrait photograph on the left and biographical copy on the right.
2. THE Landing_Page SHALL use the Next.js `Image` component for Anna's portrait with descriptive `alt` text.
3. THE Landing_Page SHALL display a champagne gold horizontal rule as a decorative divider above and below the About section content.
4. THE Landing_Page SHALL include an inline Messenger_CTA with the text "Want to chat? Message me directly →" that opens the Facebook Messenger deep-link.
5. THE Landing_Page SHALL use a warm, personal yet premium tone in all About section copy, using British English throughout.
6. WHEN the viewport width is below the mobile breakpoint (768px), THE Landing_Page SHALL stack the portrait above the copy in a single-column layout.

---

### Requirement 9: Services and Pricing Section

**User Story:** As a visitor, I want to see available services and their prices, so that I can decide what to book.

#### Acceptance Criteria

1. THE Landing_Page SHALL display the Services section heading "The Menu." in the heading serif typeface.
2. THE Landing_Page SHALL render services in a card grid layout with dark-background cards.
3. THE Landing_Page SHALL display cards for the following services: Gel Extensions, Acrylic Full Set, Nail Art Add-on, Press-On Sets, Infills, and Removal.
4. Each service card SHALL display the service name, a short description, a price range, and an estimated duration.
5. WHEN a visitor hovers over a service card, THE Landing_Page SHALL reveal a champagne gold border on the card.
6. WHEN the viewport width is below the mobile breakpoint (768px), THE Landing_Page SHALL stack service cards in a single-column layout.

---

### Requirement 10: Testimonials Section

**User Story:** As a visitor, I want to read client testimonials, so that I gain confidence in Anna's work before booking.

#### Acceptance Criteria

1. THE Landing_Page SHALL display the Testimonials section heading "They Said It Best." in the heading serif typeface.
2. THE Testimonial_Carousel SHALL render testimonial cards in a horizontally scrollable carousel using Framer Motion drag-to-scroll gestures.
3. Each testimonial card SHALL display a client quote, a champagne gold quotation mark accent, the client's first name, and a star rating.
4. THE Testimonial_Carousel cards SHALL use a dark background consistent with the site's colour scheme.
5. WHEN the viewport width is below the mobile breakpoint (768px), THE Testimonial_Carousel SHALL stack testimonial cards vertically instead of horizontally.
6. WHILE Reduced_Motion_Mode is active, THE Testimonial_Carousel SHALL remain scrollable but disable drag-based momentum animations.

---

### Requirement 11: CTA Footer Section

**User Story:** As a visitor, I want a clear final call to action, so that I know exactly how to book an appointment with Anna.

#### Acceptance Criteria

1. THE Landing_Page SHALL render a full-width dark CTA section with the centred heading "Ready for Your Set?" in the heading serif typeface.
2. THE Landing_Page SHALL display the sub-copy "Message Anna on Facebook to check availability and book your appointment in Wolverhampton." in the body typeface with `text-white/60` colour.
3. THE Landing_Page SHALL display a single large Messenger_CTA button labelled "Message Anna on Messenger →" styled with the champagne gold accent colour.
4. WHEN a visitor clicks the Messenger_CTA button, THE Landing_Page SHALL open the Facebook Messenger deep-link (`https://m.me/[page-username]`) in a new tab or the Messenger app.
5. THE Landing_Page SHALL display the text "Usually replies within a few hours." below the CTA button in a small body typeface.
6. THE Landing_Page SHALL render a minimal footer containing: "© Anna Nails 2025 · Wolverhampton", an Instagram icon link, and a Facebook icon link.
7. THE Landing_Page SHALL include `aria-label` attributes on all footer icon links for screen reader accessibility.

---

### Requirement 12: Responsive Design

**User Story:** As a mobile visitor, I want the site to be fully usable on my phone, so that I can browse and book from any device.

#### Acceptance Criteria

1. THE Landing_Page SHALL be designed mobile-first with responsive breakpoints for tablet (768px) and desktop (1024px) viewports.
2. WHEN the viewport width is below 768px, THE Canvas_Renderer SHALL scale the canvas to full viewport width while maintaining the source frame aspect ratio.
3. WHEN the viewport width is below 768px, THE Portfolio_Grid SHALL display in a two-column masonry layout.
4. WHEN the viewport width is below 768px, THE Testimonial_Carousel SHALL stack cards vertically.
5. WHEN the viewport width is below 768px, THE Nav_Bar SHALL display a Hamburger_Menu instead of inline navigation links.
6. THE Landing_Page SHALL ensure all text remains legible and all interactive elements remain tappable (minimum 44×44px touch target) on mobile viewports.

---

### Requirement 13: Accessibility

**User Story:** As a visitor using assistive technology, I want the site to be accessible, so that I can navigate and understand all content.

#### Acceptance Criteria

1. THE Landing_Page SHALL use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) throughout.
2. THE Landing_Page SHALL provide descriptive `alt` text on all `<img>` elements.
3. THE Landing_Page SHALL provide `aria-label` attributes on all icon-only buttons and links.
4. WHILE Reduced_Motion_Mode is active, THE Landing_Page SHALL disable or simplify all Framer Motion animations and the scroll sequence animation.
5. THE Landing_Page SHALL ensure all interactive elements are keyboard-navigable with visible focus indicators.
6. THE Landing_Page SHALL maintain a minimum colour contrast ratio of 4.5:1 for body text and 3:1 for large text against the background.

---

### Requirement 14: Performance Optimisation

**User Story:** As a visitor, I want the page to load quickly and animate smoothly, so that I have a premium browsing experience.

#### Acceptance Criteria

1. THE Frame_Loader SHALL preload all 240 frames using `Promise.all` and `new Image()` on component mount — frames SHALL NOT be fetched lazily during scroll.
2. THE Canvas_Renderer SHALL use `requestAnimationFrame` for all frame drawing operations to maintain 60fps performance.
3. THE Landing_Page SHALL use the Next.js `Image` component with appropriate `sizes` and `priority` attributes for all non-canvas images.
4. THE Portfolio_Grid SHALL lazy-load images using native or Next.js lazy-loading to reduce initial page weight.
5. THE Landing_Page SHALL load typefaces using `next/font` or an equivalent optimised loading strategy to prevent layout shift.

---

### Requirement 15: Tone of Voice and Copy Standards

**User Story:** As the brand owner, I want all copy to reflect a luxury-but-human tone in British English, so that the site matches the Anna Nails brand identity.

#### Acceptance Criteria

1. THE Landing_Page SHALL use British English spelling throughout all copy (e.g. "colour", "centre", "specialise").
2. THE Landing_Page SHALL use short, punchy section headings of one or two words followed by a full stop (e.g. "The Work.", "The Menu.").
3. THE Landing_Page SHALL avoid the words "cheap", "affordable", and "deals" in all copy.
4. THE Landing_Page SHALL use premium vocabulary such as "investment", "bespoke", "crafted", and "curated" where appropriate.
5. THE Landing_Page SHALL use all-caps utility labels in the Inter typeface with `letter-spacing: 0.2em` for secondary labels and navigation items.
