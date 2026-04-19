import type { PortfolioItem } from '@/lib/constants';

/**
 * Portfolio gallery items.
 *
 * Images sourced from Anna's actual work in `/public/portfolio/`.
 */
export const portfolioItems: PortfolioItem[] = [
  {
    id: 'work-001',
    src: '/portfolio/1.jpg',
    alt: 'Bespoke nail design by Anna — gel extensions with elegant finish',
    category: 'Gel',
    aspectRatio: 'portrait',
  },
  {
    id: 'work-002',
    src: '/portfolio/2.jpg',
    alt: 'Hand-crafted acrylic nail set with intricate detailing',
    category: 'Acrylics',
    aspectRatio: 'square',
  },
  {
    id: 'work-003',
    src: '/portfolio/3.jpg',
    alt: 'Sculpted gel overlay with a glossy champagne finish',
    category: 'Gel',
    aspectRatio: 'portrait',
  },
  {
    id: 'work-004',
    src: '/portfolio/4.jpg',
    alt: 'Creative nail art design with hand-painted details',
    category: 'Nail Art',
    aspectRatio: 'square',
  },
  {
    id: 'work-005',
    src: '/portfolio/5.jpg',
    alt: 'Luxury acrylic set with a refined almond shape',
    category: 'Acrylics',
    aspectRatio: 'portrait',
  },
  {
    id: 'work-006',
    src: '/portfolio/6.jpg',
    alt: 'Bespoke press-on nail set with curated design',
    category: 'Press-Ons',
    aspectRatio: 'square',
  },
  {
    id: 'work-007',
    src: '/portfolio/7.jpg',
    alt: 'Freehand nail art featuring delicate floral patterns',
    category: 'Nail Art',
    aspectRatio: 'portrait',
  },
];
