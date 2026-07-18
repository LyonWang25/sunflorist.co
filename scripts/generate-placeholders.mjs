/**
 * Generates placeholder imagery for development (soft floral-toned gradients
 * with an italic label). Real photography will replace these files 1:1 —
 * same paths, same names — via scripts/import-images.mjs.
 *
 * Usage: npm run placeholders
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();

/** soft floral duotones [light, deep] */
const PALETTES = [
  ['#f3d9cf', '#e0a98f'], // peach
  ['#f7e6c4', '#e3bd7a'], // golden
  ['#f5d5dd', '#dfa0b4'], // blush
  ['#dee7d5', '#a9c29a'], // sage
  ['#f0dcc8', '#cfa678'], // amber
  ['#dce4e8', '#9db7c6'], // dusty blue
  ['#ece5da', '#c2ae93'], // ivory
  ['#e8dced', '#b8a0cc'], // lilac
  ['#e3d5c8', '#ab8d70'], // sepia
];

const PRODUCTS = [
  // bouquets
  { slug: 'the-meridian', name: 'The Meridian', palette: 0 },
  { slug: 'golden-hour', name: 'Golden Hour', palette: 1 },
  { slug: 'blush-study', name: 'Blush Study', palette: 2 },
  { slug: 'the-hand-tie', name: 'The Hand-Tie', palette: 3 },
  { slug: 'amber-no-2', name: 'Amber No. 2', palette: 4 },
  { slug: 'field-notes', name: 'Field Notes', palette: 5 },
  // wedding bouquets
  { slug: 'the-vow', name: 'The Vow', palette: 6 },
  { slug: 'first-dance', name: 'First Dance', palette: 2 },
  { slug: 'something-blue', name: 'Something Blue', palette: 5 },
  { slug: 'the-promise', name: 'The Promise', palette: 7 },
  { slug: 'ivory-letter', name: 'Ivory Letter', palette: 6 },
  // preserved florals
  { slug: 'amber-keepsake', name: 'Amber Keepsake', palette: 4 },
  { slug: 'still-life', name: 'Still Life', palette: 8 },
  { slug: 'the-archive', name: 'The Archive', palette: 7 },
  { slug: 'sepia-study', name: 'Sepia Study', palette: 8 },
  { slug: 'everlast-no-1', name: 'Everlast No. 1', palette: 1 },
];

const escapeXml = (s) =>
  s.replace(/[&<>'"]/g, (c) => `&#${c.charCodeAt(0)};`);

function svg({ w, h, colors, label, sublabel, fontScale = 1 }) {
  const [light, deep] = colors;
  label = escapeXml(label);
  if (sublabel) sublabel = escapeXml(sublabel);
  const fontSize = Math.round(Math.min(w, h) * 0.055 * fontScale);
  const subSize = Math.round(fontSize * 0.55);
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${light}"/>
      <stop offset="1" stop-color="${deep}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${w * 0.3}" cy="${h * 0.32}" r="${w * 0.26}" fill="rgba(255,255,255,0.16)"/>
  <circle cx="${w * 0.74}" cy="${h * 0.66}" r="${w * 0.32}" fill="rgba(255,255,255,0.10)"/>
  <circle cx="${w * 0.58}" cy="${h * 0.18}" r="${w * 0.13}" fill="rgba(255,255,255,0.14)"/>
  <text x="50%" y="${sublabel ? '49%' : '51%'}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="${fontSize}" fill="rgba(32,31,29,0.5)">${label}</text>
  ${sublabel ? `<text x="50%" y="${h * 0.49 + fontSize * 1.4}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${subSize}" letter-spacing="${subSize * 0.25}" fill="rgba(32,31,29,0.42)">${sublabel.toUpperCase()}</text>` : ''}
</svg>`;
}

async function write(file, spec) {
  const dest = path.join(ROOT, file);
  await mkdir(path.dirname(dest), { recursive: true });
  await sharp(Buffer.from(svg(spec))).jpeg({ quality: 82, mozjpeg: true }).toFile(dest);
  console.log(`  ${file}  (${spec.w}×${spec.h})`);
}

const jobs = [];

// --- product images: 3 per product, 4:5 -------------------------------------
for (const p of PRODUCTS) {
  for (let i = 1; i <= 3; i++) {
    const colors = PALETTES[(p.palette + i - 1) % PALETTES.length];
    jobs.push(
      write(`src/assets/products/${p.slug}-0${i}.jpg`, {
        w: 1280,
        h: 1600,
        colors,
        label: `${p.name} · 0${i}`,
      }),
    );
  }
}

// --- category covers ---------------------------------------------------------
const CATEGORIES = [
  { file: 'category-bouquets.jpg', label: 'Bouquets', palette: 2 },
  { file: 'category-wedding-bouquets.jpg', label: 'Wedding Bouquets', palette: 6 },
  { file: 'category-preserved-florals.jpg', label: 'Preserved Florals', palette: 8 },
  { file: 'category-wedding-events.jpg', label: 'Wedding & Events', palette: 3 },
];
for (const c of CATEGORIES) {
  jobs.push(
    write(`src/assets/categories/${c.file}`, {
      w: 1600,
      h: 1200,
      colors: PALETTES[c.palette],
      label: c.label,
      sublabel: 'placeholder',
    }),
  );
}

// --- homepage / about photography slots --------------------------------------
jobs.push(
  write('src/assets/site/hero.jpg', {
    w: 2400,
    h: 1500,
    colors: ['#8a7a68', '#3c342a'],
    label: 'Hero photograph',
    sublabel: 'placeholder',
  }),
  write('src/assets/site/intro.jpg', {
    w: 1200,
    h: 1500,
    colors: PALETTES[0],
    label: 'Studio photograph',
    sublabel: 'placeholder',
  }),
  write('src/assets/site/statement.jpg', {
    w: 2400,
    h: 1200,
    colors: PALETTES[3],
    label: 'Statement photograph',
    sublabel: 'placeholder',
  }),
  write('src/assets/site/about.jpg', {
    w: 1280,
    h: 1600,
    colors: PALETTES[6],
    label: 'The Studio',
    sublabel: 'placeholder',
  }),
  write('src/assets/site/wechat-qr.jpg', {
    w: 640,
    h: 640,
    colors: ['#f5f3ef', '#e5e0d6'],
    label: 'WeChat QR',
    sublabel: 'todo',
  }),
);

// gallery wall: varied aspect ratios for the masonry layout
const GALLERY = [
  [1280, 1600, 0],
  [1280, 960, 1],
  [1280, 1707, 2],
  [1280, 1280, 3],
  [1280, 1600, 4],
  [1280, 1024, 5],
  [1280, 1440, 6],
  [1280, 1120, 7],
  [1280, 1600, 8],
];
GALLERY.forEach(([w, h, palette], i) => {
  jobs.push(
    write(`src/assets/site/gallery-0${i + 1}.jpg`, {
      w,
      h,
      colors: PALETTES[palette],
      label: `Gallery · 0${i + 1}`,
    }),
  );
});

// --- og share images (1200×630, referenced from public/) ---------------------
const OG = [
  { file: 'home.jpg', label: 'Sun Florist', sublabel: 'boutique florist · dc · md · va · nc' },
  { file: 'collections.jpg', label: 'The Collections', sublabel: 'Sun Florist' },
  { file: 'about.jpg', label: 'The Studio', sublabel: 'Sun Florist' },
  { file: 'contact.jpg', label: 'Contact', sublabel: 'Sun Florist' },
];
for (const o of OG) {
  jobs.push(
    write(`public/og/${o.file}`, {
      w: 1200,
      h: 630,
      colors: PALETTES[1],
      label: o.label,
      sublabel: o.sublabel,
      fontScale: 1.6,
    }),
  );
}

await Promise.all(jobs);
console.log(`\nDone — ${jobs.length} placeholder images generated.`);
