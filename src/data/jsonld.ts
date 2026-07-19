import { site } from './site';

/**
 * Schema.org builders. Keep values sourced from src/data/site.ts so JSON-LD
 * always matches the visible NAP text.
 */

export function floristJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Florist',
    name: site.name,
    url: `${site.url}/`,
    image: `${site.url}/og/home.jpg`,
    telephone: site.phoneE164,
    email: site.email,
    address: site.pickupLocations.map((loc) => ({
      '@type': 'PostalAddress',
      streetAddress: loc.street,
      addressLocality: loc.city,
      addressRegion: loc.region,
      postalCode: loc.postalCode,
      addressCountry: loc.country,
    })),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...site.hours.days],
        opens: site.hours.opens,
        closes: site.hours.closes,
      },
    ],
    sameAs: [site.instagramHref, site.rednoteHref],
    areaServed: ['Washington DC', 'Maryland', 'Virginia', 'North Carolina'],
  };
}

export interface Crumb {
  name: string;
  /** site-relative path with trailing slash, e.g. "/products/" — omit on the current page */
  path?: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      ...(crumb.path ? { item: `${site.url}${crumb.path}` } : {}),
    })),
  };
}

export function productJsonLd(opts: {
  name: string;
  description: string;
  imageUrls: string[];
  price: number;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    image: opts.imageUrls,
    description: opts.description,
    brand: { '@type': 'Brand', name: site.name },
    offers: {
      '@type': 'Offer',
      price: String(opts.price),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${site.url}${opts.path}`,
    },
  };
}
