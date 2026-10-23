/**
 * prepare-gallery — keeps src/assets/site/gallery/ build-ready.
 *
 * Drop photos (HEIC/HEIF/JPG/PNG/WebP, any filenames) into the folder; this
 * script converts HEIC to JPEG, bakes in EXIF orientation, strips all
 * metadata (including GPS), caps the long edge at 2000px and normalizes
 * filenames (lowercase-hyphenated). A normalized .jpg is skipped only when it
 * is already within 2000px and carries no metadata, so re-runs are cheap and
 * never recompress twice — but a camera JPG that happens to have a clean name
 * still gets cleaned (in place).
 *
 * Runs automatically before `npm run dev` and `npm run build` (pre-scripts),
 * or manually: npm run gallery
 */
import { readdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

const GALLERY_DIR = path.join('src', 'assets', 'site', 'gallery');
const HEIC_EXT = new Set(['.heic', '.heif']);
const INPUT_EXT = new Set(['.heic', '.heif', '.jpg', '.jpeg', '.png', '.webp']);
const MAX_LONG_EDGE = 2000;

const normalizeBase = (name) =>
  path
    .parse(name)
    .name.toLowerCase()
    .replace(/[\s_()]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '') || 'photo';

const isNormalizedJpg = (name) =>
  name.endsWith('.jpg') && normalizeBase(name) === path.parse(name).name;

/** judged by content, not filename — EXIF can hold GPS location */
async function isClean(file) {
  const meta = await sharp(file).metadata();
  return (
    Math.max(meta.width ?? 0, meta.height ?? 0) <= MAX_LONG_EDGE &&
    !meta.exif &&
    !meta.xmp &&
    !meta.iptc
  );
}

function freeTarget(base) {
  let candidate = path.join(GALLERY_DIR, `${base}.jpg`);
  for (let n = 2; existsSync(candidate); n++) {
    candidate = path.join(GALLERY_DIR, `${base}-${n}.jpg`);
  }
  return candidate;
}

const candidates = (await readdir(GALLERY_DIR, { withFileTypes: true }).catch(() => [])).filter(
  (d) => d.isFile() && INPUT_EXT.has(path.extname(d.name).toLowerCase()),
);
const entries = [];
for (const dirent of candidates) {
  const file = path.join(GALLERY_DIR, dirent.name);
  if (isNormalizedJpg(dirent.name) && (await isClean(file))) continue;
  entries.push(dirent);
}

if (!entries.length) {
  console.log('gallery: nothing to process.');
  process.exit(0);
}

for (const dirent of entries) {
  const file = path.join(GALLERY_DIR, dirent.name);
  const ext = path.extname(dirent.name).toLowerCase();
  let buffer = await readFile(file);

  if (HEIC_EXT.has(ext)) {
    buffer = Buffer.from(await heicConvert({ buffer, format: 'JPEG', quality: 0.95 }));
  }

  const { data, info } = await sharp(buffer)
    .rotate()
    .resize({
      width: MAX_LONG_EDGE,
      height: MAX_LONG_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  // a normalized name is cleaned in place; anything else gets a fresh name
  const target = isNormalizedJpg(dirent.name) ? file : freeTarget(normalizeBase(dirent.name));
  await writeFile(target, data);
  if (path.resolve(target) !== path.resolve(file)) await unlink(file);
  console.log(
    `  ${dirent.name} → ${path.basename(target)}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
  );
}

console.log(`✓ gallery: ${entries.length} file(s) processed.`);
