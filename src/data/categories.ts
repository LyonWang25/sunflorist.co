export interface Category {
  /** URL segment: /products/category/{slug}/ */
  slug: string;
  name: string;
  /** lowercase roman numeral, editorial index style */
  numeral: string;
  /** cover image filename under src/assets/categories/ */
  cover: string;
  coverAlt: string;
  intro: string;
  /** no product list — consultation CTA instead */
  consultationOnly?: boolean;
  /** optional self-hosted hero video (media-performance-spec §5.1) */
  heroVideo?: {
    mp4: string;
    webm: string;
    poster: string;
    width: number;
    height: number;
  };
}

export const categories: Category[] = [
  {
    slug: 'bouquets',
    name: 'Bouquets',
    numeral: 'i.',
    cover: 'category-bouquets.jpg',
    coverAlt: 'Fresh hand-tied bouquets in seasonal colors',
    intro: 'Ready-made designs. Message us your pick.',
  },
  {
    slug: 'wedding-bouquets',
    name: 'Wedding Bouquets',
    numeral: 'ii.',
    cover: 'category-wedding-bouquets.jpg',
    coverAlt: 'Bridal bouquet of garden roses and soft greenery',
    intro: 'Bridal and bridesmaid bouquets, composed to your palette.',
  },
  {
    slug: 'preserved-florals',
    name: 'Preserved Florals',
    numeral: 'iii.',
    cover: 'category-preserved-florals.jpg',
    coverAlt: 'Preserved flower arrangement in muted tones',
    intro: 'Everlasting arrangements that keep their beauty for years.',
  },
  {
    slug: 'wedding-events',
    name: 'Wedding & Events',
    numeral: 'iv.',
    cover: 'category-wedding-events.jpg',
    coverAlt: 'Wedding ceremony chairs decorated with fresh florals',
    intro:
      'Full-service floral design for weddings and events — ceremony, reception and everything in between. Every celebration is planned in conversation, not off a shelf.',
    consultationOnly: true,
    heroVideo: {
      mp4: '/videos/weddings-hero-v1.mp4',
      webm: '/videos/weddings-hero-v1.webm',
      poster: '/videos/weddings-hero-poster-v1.webp',
      width: 1280,
      height: 720,
    },
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
