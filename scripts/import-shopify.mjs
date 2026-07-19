/**
 * import-shopify — one-time migration from the Shopify product export.
 *
 * Reads docs/products_export_1 (1).csv, downloads every product image from
 * cdn.shopify.com (before the Shopify subscription ends!), pushes each photo
 * through the same cleanup pipeline as import-images (EXIF orientation baked
 * in, all metadata stripped, long edge ≤ 2000px, JPEG q85) and generates one
 * content file per product in src/content/products/.
 *
 * Shopify handles are kept verbatim as slugs so old /products/{handle} URLs
 * keep working on the new site with no redirects.
 *
 * Category mapping (confirmed 2026-07-18):
 *   preserved/dried/centerpiece            → preserved-florals
 *   "Wedding" tag                          → wedding-bouquets
 *   everything else (bouquets, baskets, …) → bouquets
 *   Accessories (wearables, car diffuser)  → skipped for now
 *
 * Usage: node scripts/import-shopify.mjs [--dry-run]
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const CSV_PATH = 'docs/products_export_1 (1).csv';
const IMG_DEST = path.join('src', 'assets', 'products');
const MD_DEST = path.join('src', 'content', 'products');
const SKIP_HANDLES = new Set(['florals-wearable', 'natural-cotton-car-diffuser-bouquet']);
// Shopify allows emoji in handles; our URLs are ASCII. Old URLs for these two
// are covered by public/_redirects.
const SLUG_OVERRIDES = new Map([
  ['heart-on-the-left-love-on-the-right-❤️', 'heart-on-the-left-love-on-the-right'],
  ['🎓-graduation-bouquets', 'graduation-bouquets'],
]);
const CONCURRENCY = 6;
const dryRun = process.argv.includes('--dry-run');

// ------------------------------------------------------------------ CSV
function parseCsv(text) {
  const rows = [];
  let row = [],
    field = '',
    inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const rows = parseCsv(await readFile(CSV_PATH, 'utf8'));
const header = rows[0];
const col = (name) => {
  const i = header.indexOf(name);
  if (i === -1) throw new Error(`CSV column not found: ${name}`);
  return i;
};
const C = {
  handle: col('Handle'),
  title: col('Title'),
  body: col('Body (HTML)'),
  type: col('Type'),
  tags: col('Tags'),
  optName: col('Option1 Name'),
  optValue: col('Option1 Value'),
  price: col('Variant Price'),
  imgSrc: col('Image Src'),
  imgPos: col('Image Position'),
  status: col('Status'),
  color: col('Color (product.metafields.shopify.color-pattern)'),
};

// ------------------------------------------------------- aggregate rows
const products = new Map();
for (const r of rows.slice(1)) {
  const handle = r[C.handle];
  if (!handle) continue;
  if (!products.has(handle)) {
    products.set(handle, {
      handle,
      title: '',
      body: '',
      type: '',
      tags: '',
      optName: '',
      optValues: [],
      prices: [],
      color: '',
      status: '',
      images: [],
    });
  }
  const p = products.get(handle);
  if (r[C.title]) p.title = r[C.title];
  if (r[C.body]) p.body = r[C.body];
  if (r[C.type]) p.type = r[C.type];
  if (r[C.tags]) p.tags = r[C.tags];
  if (r[C.optName]) p.optName = r[C.optName];
  if (r[C.optValue]) p.optValues.push(r[C.optValue]);
  if (r[C.price]) p.prices.push(parseFloat(r[C.price]));
  if (r[C.color] && !p.color) p.color = r[C.color];
  if (r[C.status]) p.status = r[C.status];
  if (r[C.imgSrc]) p.images.push({ pos: Number(r[C.imgPos] || p.images.length + 1), url: r[C.imgSrc] });
}

// ------------------------------------------------------------- mapping
function mapCategory(p) {
  const hay = `${p.type} ${p.tags}`.toLowerCase();
  if (/preserved|dried|centerpiece/.test(hay)) return 'preserved-florals';
  if (/wedding/.test(hay)) return 'wedding-bouquets';
  return 'bouquets';
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function palette(p) {
  if (!p.color) return null;
  return p.color
    .split(';')
    .map((c) => titleCase(c.trim()))
    .filter(Boolean)
    .join(' · ');
}

function sizeField(p) {
  const values = [...new Set(p.optValues)].filter((v) => v && v !== 'Default Title');
  if (!values.length) return 'Standard';
  const label = p.optName && p.optName !== 'Title' ? `${titleCase(p.optName)}: ` : '';
  return `${label}${values.join(' / ')}`;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeDescription(p) {
  const text = stripHtml(p.body);
  if (text.length >= 40) {
    // cut at a sentence boundary within ~180 chars
    const slice = text.slice(0, 180);
    const end = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
    return { text: end > 40 ? slice.slice(0, end + 1) : slice.trim(), todo: false };
  }
  return {
    text: `${p.title} — hand-composed fresh florals by Sun Florist, made to order.`,
    todo: true,
  };
}

const yamlQuote = (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

// --------------------------------------------------------------- plan
const selected = [...products.values()]
  .filter((p) => p.status === 'active' && !SKIP_HANDLES.has(p.handle))
  .map((p) => ({ ...p, handle: SLUG_OVERRIDES.get(p.handle) ?? p.handle, category: mapCategory(p) }));

const slugPattern = /^[a-z0-9]+([-_][a-z0-9]+)*$/;
const badSlugs = selected.filter((p) => !slugPattern.test(p.handle));
if (badSlugs.length) {
  console.error('✗ Handles that need manual slugs:', badSlugs.map((p) => p.handle).join(', '));
  process.exit(1);
}

const prefixes = { bouquets: 'B', 'wedding-bouquets': 'W', 'preserved-florals': 'P' };
const counters = { bouquets: 0, 'wedding-bouquets': 0, 'preserved-florals': 0 };
for (const p of selected) {
  counters[p.category]++;
  p.no = `${prefixes[p.category]}-${String(counters[p.category]).padStart(2, '0')}`;
  p.order = counters[p.category];
  p.images.sort((a, b) => a.pos - b.pos);
  p.files = p.images.map((_, i) => `${p.handle}-${String(i + 1).padStart(2, '0')}.jpg`);
}

console.log(
  `plan: ${selected.length} products — ` +
    Object.entries(counters)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ') +
    ` — ${selected.reduce((n, p) => n + p.images.length, 0)} images` +
    (dryRun ? ' (dry run)' : ''),
);
if (dryRun) {
  for (const p of selected)
    console.log(`  [${p.no}] ${p.category}  ${p.handle}  $${Math.min(...p.prices)}  ${p.images.length} imgs`);
  process.exit(0);
}

// ------------------------------------------------------ download queue
await mkdir(IMG_DEST, { recursive: true });
await mkdir(MD_DEST, { recursive: true });

const jobs = [];
for (const p of selected) {
  p.images.forEach((img, i) => jobs.push({ p, url: img.url, file: p.files[i] }));
}

const failures = [];
let done = 0;

async function fetchWithRetry(url, tries = 3) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (attempt === tries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function worker() {
  while (jobs.length) {
    const job = jobs.shift();
    try {
      const buffer = await fetchWithRetry(job.url);
      const { data, info } = await sharp(buffer)
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });
      await writeFile(path.join(IMG_DEST, job.file), data);
      done++;
      if (done % 25 === 0) console.log(`  … ${done} images downloaded`);
    } catch (err) {
      failures.push({ ...job, error: String(err) });
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`✓ ${done} images written to ${IMG_DEST}${failures.length ? `, ${failures.length} FAILED` : ''}`);

if (failures.length) {
  console.error('\n✗ Failed downloads (product .md files NOT written for these):');
  for (const f of failures) console.error(`    ${f.p.handle}  ${f.url}\n      ${f.error}`);
}

// ------------------------------------------------------- content files
const failedHandles = new Set(failures.map((f) => f.p.handle));
let written = 0;
for (const p of selected) {
  if (failedHandles.has(p.handle)) continue;
  const desc = makeDescription(p);
  const pal = palette(p);
  const md = `---
name: ${yamlQuote(p.title)}
slug: "${p.handle}"
no: "${p.no}"
category: "${p.category}"
price: ${Math.round(Math.min(...p.prices))}
palette: ${yamlQuote(pal ?? 'Seasonal')}
size: ${yamlQuote(sizeField(p))}
images:
${p.files.map((f) => `  - "${f}"`).join('\n')}
description: ${yamlQuote(desc.text)}
order: ${p.order}
draft: false
---
${desc.todo ? '<!-- TODO: review auto-generated description -->\n' : ''}${pal ? '' : '<!-- TODO: set real palette (no Shopify color data) -->\n'}`;
  await writeFile(path.join(MD_DEST, `${p.handle}.md`), md, 'utf8');
  written++;
}

console.log(`✓ ${written} product files written to ${MD_DEST}`);
process.exit(failures.length ? 1 : 0);
