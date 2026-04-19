import type { Service } from '@/lib/constants';

/**
 * Service menu for Anna Nails.
 *
 * All copy uses British English and premium vocabulary as per brand guidelines.
 */
export const services: Service[] = [
  {
    id: 'gel-extensions',
    name: 'Gel Extensions',
    description:
      'Bespoke sculpted gel extensions crafted to your chosen length and shape. Includes cuticle care, shaping, and a flawless gel colour of your choice.',
    priceRange: '£25',
    duration: '2-3 hours',
  },
  {
    id: 'acrylic-full-set',
    name: 'Acrylic Full Set',
    description:
      'A full set of hand-sculpted acrylic enhancements tailored to your preferred silhouette. Finished with a premium polish or gel top coat.',
    priceRange: '£25',
    duration: '2-3 hours',
  },
  {
    id: 'nail-art-add-on',
    name: 'Nail Art Add-on',
    description:
      'Elevate any set with bespoke freehand art, foils, chrome, or crystal embellishments — curated to complement your style.',
    priceRange: 'FREE',
    duration: '30 min / 1 hour',
  },
  {
    id: 'infills',
    name: 'Infills',
    description:
      'Maintain your investment with a professional infill service. Includes rebalancing, reshaping, and a fresh colour application.',
    priceRange: '£20',
    duration: '2-3 hours',
  },
  {
    id: 'removal',
    name: 'Removal',
    description:
      'Gentle, expert removal of gel or acrylic enhancements. Includes nail conditioning to keep your natural nails healthy and strong.',
    priceRange: '£10–£15',
    duration: '1-2 hours',
  },
  {
    id: 'manicure-gel-polish',
    name: 'Manicure Gel Polish',
    description:
      'Long-lasting gel polish applied with precision — delivering a flawless, chip-free finish that keeps your nails looking salon-fresh for up to three weeks.',
    priceRange: '£15',
    duration: '1 hour',
  },
];
