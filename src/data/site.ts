/**
 * Single source of truth for business/contact data.
 * ALL values marked TODO are obvious placeholders — replace them once the
 * real business details are confirmed. Never hard-code any of these in pages.
 * NAP (name / address / phone) must stay identical everywhere it appears
 * (footer, contact page, JSON-LD, Google Business Profile).
 */
export const site = {
  name: 'Sun Florist',
  url: 'https://sunflorist.co',
  tagline: 'boutique florist | weddings & events',
  description:
    'Boutique florist for hand-composed bouquets, preserved florals and wedding work, serving Washington DC, Maryland, Virginia and North Carolina.',

  serviceAreaShort: 'DC · MD · VA · NC',
  serviceAreaKicker: 'Washington · Maryland · Virginia · Carolina',
  serviceAreaLong: 'Washington DC, Maryland, Virginia and North Carolina',

  address: {
    street: 'Street address', // TODO: real street address
    city: 'City', // TODO: real city
    region: 'State', // TODO: real state (e.g. MD)
    postalCode: '00000', // TODO: real ZIP
    country: 'US',
  },

  phoneDisplay: '+1 (000) 000-0000', // TODO: real phone
  phoneHref: 'tel:+10000000000', // TODO: real phone (E.164)
  phoneE164: '+1-000-000-0000', // TODO: real phone for JSON-LD

  whatsappHref: 'https://wa.me/10000000000', // TODO: real WhatsApp number
  wechatId: 'WECHAT-ID', // TODO: real WeChat ID
  instagramHref: 'https://instagram.com/sunflorist', // TODO: real Instagram URL
  instagramHandle: '@sunflorist', // TODO: real Instagram handle

  hours: {
    label: 'Mon–Sat · 9:00–19:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '19:00',
  },

  /** TODO: real Google Maps embed URL (share → embed a map) */
  mapsEmbedUrl: 'https://www.google.com/maps?q=Washington%20DC&output=embed',
} as const;
