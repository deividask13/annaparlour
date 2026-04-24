// ---------------------------------------------------------------------------
// Shared constants – Anna Nails landing page
// ---------------------------------------------------------------------------

/** Total number of frames in the scroll-synced image sequence. */
export const TOTAL_FRAMES = 192;

/** Path prefix for frame images (append zero-padded index + '.png'). */
export const FRAME_PATH_PREFIX = '/frames/frame_';

/** Facebook page link for all CTA buttons.
 *  Links directly to the Facebook page so users can message from there. */
export const MESSENGER_URL = 'https://www.facebook.com/profile.php?id=61583394983925';

/** Core colour palette used across the site. */
export const COLORS = {
  background: '#080808',
  gold: '#C9A84C',
  rose: '#D4A5A5',
  textPrimary: 'rgba(255, 255, 255, 0.9)',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
} as const;

/** Portfolio filter tab labels. */
export const FILTER_CATEGORIES = [
  'All',
  'Gel',
  'Acrylics',
  'Nail Art',
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single milestone overlay shown during the scroll sequence. */
export interface OverlayMilestone {
  text: string;
  startFrame: number;
  endFrame: number;
}

/** Category values used to tag portfolio items. */
export type PortfolioCategory = 'Gel' | 'Acrylics' | 'Nail Art';

/** A single portfolio image entry. */
export interface PortfolioItem {
  id: string;
  src: string;
  alt: string;
  category: PortfolioCategory;
  aspectRatio: 'portrait' | 'landscape' | 'square';
}

/** A service offered by Anna Nails. */
export interface Service {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  duration: string;
}

/** A client testimonial. */
export interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  rating: number;
}

// ---------------------------------------------------------------------------
// Overlay milestones for the parallax text during the scroll sequence
// ---------------------------------------------------------------------------

export const OVERLAY_MILESTONES: OverlayMilestone[] = [
  { text: 'The Canvas.', startFrame: 1, endFrame: 8 },
  { text: 'The Craft.', startFrame: 9, endFrame: 20 },
  { text: 'The Art.', startFrame: 21, endFrame: 32 },
  { text: 'Anna Nails. Wolverhampton.', startFrame: 33, endFrame: 192 },
];
