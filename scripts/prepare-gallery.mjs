/**
 * prepare-gallery — keeps src/assets/site/gallery/ build-ready.
 *
 * Drop photos (HEIC/HEIF/JPG/PNG/WebP, any filenames) into the folder; this
 * script converts HEIC to JPEG, bakes in EXIF orientation, strips all
 * metadata (including GPS), caps the long edge at 2000px and normalizes
 * filenames (lowercase-hyphenated). Already-normalized .jpg files are left
 * untouched, so re-runs are cheap and never recompress twice.
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

function freeTarget(base) {
  let candidate = path.join(GALLERY_DIR, `${base}.jpg`);
  for (let n = 2; existsSync(candidate); n++) {
    candidate = path.join(GALLERY_DIR, `${base}-${n}.jpg`);
  }
  return candidate;
}

const entries = (await readdir(GALLERY_DIR, { withFileTypes: true }).catch(() => []))
  .filter((d) => d.isFile() && INPUT_EXT.has(path.extname(d.name).toLowerCase()))
  .filter((d) => !isNormalizedJpg(d.name));

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
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const target = freeTarget(normalizeBase(dirent.name));
  await writeFile(target, data);
  if (path.resolve(target) !== path.resolve(file)) await unlink(file);
  console.log(
    `  ${dirent.name} → ${path.basename(target)}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
  );
}

console.log(`✓ gallery: ${entries.length} file(s) processed.`);
