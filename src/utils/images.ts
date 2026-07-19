import type { ImageMetadata } from 'astro';

/**
 * Resolves image filenames stored in content frontmatter / data files to the
 * ImageMetadata objects astro:assets needs. Product frontmatter stores bare
 * filenames relative to src/assets/products/ (see docs/development-brief.md §5).
 */

// product photos live in per-product folders: products/{No}-{slug}/{file}.jpg
// (e.g. products/W-02-calla-lily-mini-cranberry/...). Frontmatter stores bare
// filenames, so lookups go through a basename index.
const productModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/products/**/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

const productIndex = new Map<string, { meta: ImageMetadata; path: string }>();
for (const [modulePath, mod] of Object.entries(productModules)) {
  const basename = modulePath.split('/').pop()!;
  productIndex.set(basename, {
    meta: mod.default,
    path: modulePath.replace('/src/assets/', ''),
  });
}

const categoryModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/categories/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

const siteModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/site/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

const galleryModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/site/gallery/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

/**
 * Every photo in src/assets/site/gallery/, sorted by filename. Drop new
 * photos into the folder (npm run gallery converts HEIC and cleans names)
 * and they are picked up automatically at the next dev/build.
 */
export function galleryImages(): ImageMetadata[] {
  return Object.entries(galleryModules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, mod]) => mod.default);
}

function resolve(
  modules: Record<string, { default: ImageMetadata }>,
  dir: string,
  filename: string,
): ImageMetadata {
  const mod = modules[`/src/assets/${dir}/${filename}`];
  if (!mod) {
    throw new Error(`Image not found: src/assets/${dir}/${filename}`);
  }
  return mod.default;
}

export function productImage(filename: string): ImageMetadata {
  const entry = productIndex.get(filename);
  if (!entry) throw new Error(`Product image not found: ${filename}`);
  return entry.meta;
}

/** path relative to src/assets/ (for build-time fs access, e.g. blur-up) */
export function productImagePath(filename: string): string {
  const entry = productIndex.get(filename);
  if (!entry) throw new Error(`Product image not found: ${filename}`);
  return entry.path;
}

export function categoryImage(filename: string): ImageMetadata {
  return resolve(categoryModules, 'categories', filename);
}

export function siteImage(filename: string): ImageMetadata {
  return resolve(siteModules, 'site', filename);
}
