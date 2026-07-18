/**
 * import-images — photo intake pipeline (docs/development-brief.md §7)
 *
 * Drop raw iPhone/camera photos (HEIC/HEIF/JPG/PNG/WebP, mixed is fine) into
 * raw/, then:
 *
 *   npm run images -- --slug the-meridian
 *     → src/assets/products/the-meridian-01.jpg, -02.jpg … (sorted by capture time)
 *
 *   npm run images
 *     → raw/processed/{original-name-normalized}.jpg (for manual picking)
 *
 * Options:
 *   --slug <slug>   rename to {slug}-NN.jpg ordered by EXIF capture time
 *   --dest <dir>    output directory (default src/assets/products)
 *   --force         allow overwriting existing files (default: abort)
 *
 * Every image is: converted from HEIC if needed → auto-rotated per EXIF →
 * stripped of ALL metadata (including GPS) → downscaled so the long edge
 * is ≤ 2000px → saved as JPEG quality 85. WebP/AVIF/srcset variants are
 * produced later by Astro at build time; this script only prepares clean
 * "originals".
 *
 * Note: HEIC capture time falls back to file modified time (EXIF does not
 * survive HEIC decoding); JPG/PNG/WebP use EXIF DateTimeOriginal when present.
 */
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

const RAW_DIR = 'raw';
const DEFAULT_DEST = path.join('src', 'assets', 'products');
const HEIC_EXT = new Set(['.heic', '.heif']);
const INPUT_EXT = new Set(['.heic', '.heif', '.jpg', '.jpeg', '.png', '.webp']);
const MAX_LONG_EDGE = 2000;
const JPEG_QUALITY = 85;

// ---------------------------------------------------------------- arguments
const args = process.argv.slice(2);
function argValue(flag) {
  // supports "--slug value" and "--slug=value" (the latter survives shells
  // like Windows PowerShell 5.1 that swallow a bare "--" separator)
  const eq = args.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
}
const slug = argValue('--slug');
const force = args.includes('--force');
const dest = argValue('--dest') ?? (slug ? DEFAULT_DEST : path.join(RAW_DIR, 'processed'));

if (slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error(`✗ Invalid slug "${slug}" — use lowercase words joined by hyphens.`);
  process.exit(1);
}

// ------------------------------------------------------- EXIF capture time
/** Minimal EXIF walk for DateTimeOriginal (0x9003), fallback DateTime (0x0132). */
function exifCaptureTime(exif) {
  try {
    if (!exif || exif.length < 14) return null;
    const start = exif.subarray(0, 6).toString('latin1') === 'Exif\0\0' ? 6 : 0;
    const tiff = exif.subarray(start);
    const le = tiff.subarray(0, 2).toString('latin1') === 'II';
    const u16 = (o) => (le ? tiff.readUInt16LE(o) : tiff.readUInt16BE(o));
    const u32 = (o) => (le ? tiff.readUInt32LE(o) : tiff.readUInt32BE(o));
    if (u16(2) !== 42) return null;

    const findTag = (ifd, wanted) => {
      const count = u16(ifd);
      for (let i = 0; i < count; i++) {
        const entry = ifd + 2 + i * 12;
        if (u16(entry) === wanted) return entry;
      }
      return null;
    };

    const ifd0 = u32(4);
    let entry = null;
    const exifPointer = findTag(ifd0, 0x8769);
    if (exifPointer) entry = findTag(u32(exifPointer + 8), 0x9003);
    if (!entry) entry = findTag(ifd0, 0x0132);
    if (!entry) return null;

    const count = u32(entry + 4);
    const valueOffset = count <= 4 ? entry + 8 : u32(entry + 8);
    const text = tiff
      .subarray(valueOffset, valueOffset + count)
      .toString('latin1')
      .replace(/\0/g, '')
      .trim();
    const m = text.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime();
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------- main
const rawFiles = (await readdir(RAW_DIR, { withFileTypes: true }).catch(() => null))?.filter(
  (d) => d.isFile() && INPUT_EXT.has(path.extname(d.name).toLowerCase()),
);

if (!rawFiles?.length) {
  console.error(`✗ No input images found in ${RAW_DIR}/ (HEIC/HEIF/JPG/PNG/WebP).`);
  process.exit(1);
}

// 1) load + convert + read capture time
const items = [];
for (const dirent of rawFiles) {
  const file = path.join(RAW_DIR, dirent.name);
  const ext = path.extname(dirent.name).toLowerCase();
  let buffer = await readFile(file);
  let time = null;

  if (HEIC_EXT.has(ext)) {
    buffer = Buffer.from(await heicConvert({ buffer, format: 'JPEG', quality: 0.95 }));
  } else {
    const meta = await sharp(buffer).metadata().catch(() => null);
    time = exifCaptureTime(meta?.exif ?? null);
  }
  if (time === null) time = (await stat(file)).mtimeMs;

  items.push({ original: dirent.name, buffer, time });
}

// 2) target names
items.sort((a, b) => a.time - b.time || a.original.localeCompare(b.original));
for (const [i, item] of items.entries()) {
  if (slug) {
    item.target = `${slug}-${String(i + 1).padStart(2, '0')}.jpg`;
  } else {
    const base = path
      .parse(item.original)
      .name.toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '');
    item.target = `${base || 'image'}.jpg`;
  }
}

// 3) refuse to overwrite unless --force (never silently)
const conflicts = items.filter((item) => existsSync(path.join(dest, item.target)));
if (conflicts.length && !force) {
  console.error(`✗ Aborted — ${conflicts.length} file(s) already exist in ${dest}:`);
  for (const c of conflicts) console.error(`    ${c.target}`);
  console.error('  Re-run with --force to overwrite.');
  process.exit(1);
}

// 4) process + write
await mkdir(dest, { recursive: true });
let totalBytes = 0;
for (const item of items) {
  // .rotate() bakes in EXIF orientation; metadata (EXIF/GPS/ICC) is dropped
  // because .withMetadata() is intentionally never called.
  const { data, info } = await sharp(item.buffer)
    .rotate()
    .resize({
      width: MAX_LONG_EDGE,
      height: MAX_LONG_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  await writeFile(path.join(dest, item.target), data);
  totalBytes += info.size;
  console.log(
    `  ${item.original} → ${item.target}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
  );
}

console.log(
  `\n✓ ${items.length} image(s) written to ${dest} (${(totalBytes / 1024 / 1024).toFixed(1)} MB total, metadata stripped).`,
);
