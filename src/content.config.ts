import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be lowercase words joined by hyphens'),
    no: z.string(),
    category: z.enum(['bouquets', 'wedding-bouquets', 'preserved-florals']),
    price: z.number().positive(),
    palette: z.string(),
    size: z.string(),
    /** filenames relative to src/assets/products/, first entry is the main image */
    images: z.array(z.string()).min(1),
    description: z.string(),
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { products };
