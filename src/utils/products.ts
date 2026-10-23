import { getCollection, type CollectionEntry } from 'astro:content';

export type Product = CollectionEntry<'products'>;

/** Published products, optionally filtered by category, sorted by manual order. */
export async function getProducts(category?: string): Promise<Product[]> {
  const entries = await getCollection(
    'products',
    ({ data }) => !data.draft && (!category || data.category === category),
  );
  return entries.sort((a, b) => a.data.order - b.data.order || a.data.no.localeCompare(b.data.no));
}

/** Display price: "$126", or "From $318" when the product has size variants. */
export function formatPrice({ price, variants }: Product['data']): string {
  return variants ? `From $${price}` : `$${price}`;
}
