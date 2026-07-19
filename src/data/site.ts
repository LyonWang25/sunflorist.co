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

  /** pickup locations — first entry is the primary address for NAP/JSON-LD */
  pickupLocations: [
    {
      street: '610 Corbett St',
      city: 'Morrisville',
      region: 'NC',
      postalCode: '27560',
      country: 'US',
    },
    {
      street: '1451 28th St S',
      city: 'Arlington',
      region: 'VA',
      postalCode: '22206',
      country: 'US',
    },
  ],

  phoneDisplay: '919-510-2830',
  phoneHref: 'tel:+19195102830',
  phoneE164: '+1-919-510-2830',

  email: 'dmv@sunflorist.co',
  emailHref: 'mailto:dmv@sunflorist.co',

  delivery: 'United States · preserved florals only',

  /** official WhatsApp contact link (decoded from the account QR) */
  whatsappHref: 'https://wa.me/qr/TTFXAVYSVVD6L1',
  /** WeChat add-friend link (decoded from the account QR); opens the app on mobile */
  wechatHref: 'https://u.wechat.com/kIACFMbe_rQ6tbAersGJJbY',
  wechatName: 'SunFlorist',
  instagramHref: 'https://www.instagram.com/sun_florist.co/',
  instagramHandle: '@sun_florist.co',
  /** RedNote (Xiaohongshu / 小紅書) profile */
  rednoteHref: 'https://www.xiaohongshu.com/user/profile/5e60af8700000000010061e0',

  hours: {
    label: 'Mon–Sat · 9:00–20:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '20:00',
  },

  /** shows the primary (NC) pickup location */
  mapsEmbedUrl:
    'https://www.google.com/maps?q=610%20Corbett%20St%2C%20Morrisville%2C%20NC%2027560&output=embed',
} as const;
