import path from 'node:path';
import sharp from 'sharp';

/**
 * Build-time blur-up placeholders (docs/media-performance-spec.md §4):
 * a ~20px-wide inline WebP (< 1KB) used as the container background while the
 * full image loads. Runs only at build/dev time in Node — never shipped as JS.
 */

const cache = new Map<string, string>();

/** @param relPath path relative to src/assets/, e.g. "products/the-meridian-01.jpg" */
export async function blurDataUrl(relPath: string): Promise<string> {
  const cached = cache.get(relPath);
  if (cached) return cached;

  const absolute = path.join(process.cwd(), 'src', 'assets', relPath);
  const buffer = await sharp(absolute).resize(20).webp({ quality: 40 }).toBuffer();
  const dataUrl = `data:image/webp;base64,${buffer.toString('base64')}`;
  cache.set(relPath, dataUrl);
  return dataUrl;
}
