import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z
    .object({
      name: z.string(),
      // underscores allowed: Shopify handles are kept verbatim as slugs so old
      // /products/{handle} URLs survive the migration without redirects
      slug: z
        .string()
        .regex(/^[a-z0-9]+([-_][a-z0-9]+)*$/, 'slug must be lowercase words joined by hyphens'),
      no: z.string(),
      category: z.enum(['bouquets', 'wedding-bouquets', 'preserved-florals']),
      /** with variants, the lowest variant price (shown as "From $…") */
      price: z.number().positive(),
      palette: z.string(),
      /** shown on the detail page unless the product has variants */
      size: z.string(),
      /** optional size options priced separately (e.g. stem counts), in display order */
      variants: z
        .array(z.object({ label: z.string(), price: z.number().positive() }))
        .min(2)
        .optional(),
      /** filenames relative to src/assets/products/, first entry is the main image */
      images: z.array(z.string()).min(1),
      description: z.string(),
      order: z.number(),
      draft: z.boolean().default(false),
    })
    .refine((p) => !p.variants || p.price === Math.min(...p.variants.map((v) => v.price)), {
      message: 'price must equal the lowest variant price',
      path: ['price'],
    }),
});

export const collections = { products };
