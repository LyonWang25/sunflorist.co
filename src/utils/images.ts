import type { ImageMetadata } from 'astro';

/**
 * Resolves image filenames stored in content frontmatter / data files to the
 * ImageMetadata objects astro:assets needs. Product frontmatter stores bare
 * filenames relative to src/assets/products/ (see docs/development-brief.md §5).
 */

const productModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/products/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

const categoryModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/categories/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

const siteModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/site/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

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
  return resolve(productModules, 'products', filename);
}

export function categoryImage(filename: string): ImageMetadata {
  return resolve(categoryModules, 'categories', filename);
}

export function siteImage(filename: string): ImageMetadata {
  return resolve(siteModules, 'site', filename);
}
