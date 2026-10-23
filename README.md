# Sun Florist — sunflorist.co

Static brochure + catalogue site for Sun Florist (DC · MD · VA · NC), built with
[Astro](https://astro.build). No cart, no checkout, no backend — customers order
via WhatsApp / WeChat / Instagram / RedNote / email links.

Full specifications live in [docs/](docs/) — read them before changing anything.

## Commands

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build to `dist/` (deployed on Cloudflare Pages) |
| `npm run preview` | Serve the production build locally |
| `npm run images -- --slug <slug> --dest <folder>` | Import raw product photos (see below) |
| `npm run gallery` | Clean up the homepage gallery folder (also runs before dev/build) |

## Adding a product

1. Photos live in one folder per product, named `{No}-{slug}` — e.g.
   `src/assets/products/W-18-calla-lily/`. Import raw photos straight into it:

   ```bash
   npm run images -- --slug calla-lily --dest src/assets/products/W-18-calla-lily
   ```

2. Add one Markdown file in `src/content/products/{slug}.md` — copy an existing
   file for the frontmatter fields (name, slug, no, category, price, palette,
   size, images, description, order). `images:` entries are bare filenames;
   the build finds them in any product folder automatically.
3. `npm run build`. The category list, counts, detail page, sitemap and
   structured data all update automatically.

## Importing photos (`npm run images`)

Most product photos arrive as iPhone HEIC files named `IMG_XXXX`. Drop them
(HEIC/JPG/PNG/WebP, mixed is fine) into `raw/` — the folder is git-ignored —
then:

```bash
# rename by capture time and place into the product's folder
npm run images -- --slug calla-lily --dest src/assets/products/W-18-calla-lily
# → src/assets/products/W-18-calla-lily/calla-lily-01.jpg, -02.jpg …

# no slug: normalized names into raw/processed/ for manual picking
npm run images
```

Without `--dest`, slugged photos land directly in `src/assets/products/` —
move them into the product's folder afterwards.

Every photo is auto-rotated, stripped of all metadata (including GPS
location), downscaled to a 2000px long edge and saved as JPEG q85. Existing
files are never overwritten unless you pass `--force`.

> Windows PowerShell swallows the bare `--` separator — use
> `npm run images -- --slug=calla-lily --dest=src/assets/products/W-18-calla-lily`
> from Git Bash/cmd, or `npm run images '--' --slug calla-lily …` in PowerShell.

## Homepage gallery wall

Drop photos — **HEIC straight from the phone is fine** — into
`src/assets/site/gallery/`. Before every `npm run dev` / `npm run build` (or
`npm run gallery` manually) each photo is checked by content, not by filename:
anything over 2000px or still carrying metadata (EXIF/GPS, XMP, IPTC) is
converted, cleaned and given a normalized name; already-clean files are left
alone. The wall shows 10 photos on mobile and 9 on desktop and rotates to the
next set daily, cycling through everything in the folder; tune
`GALLERY_SLOTS` / `GALLERY_ROTATE_DAYS` at the top of
[src/pages/index.astro](src/pages/index.astro).

## Business data

All business facts — pickup addresses, phone, email, hours, WhatsApp /
WeChat / Instagram / RedNote links, Google Maps embed — live in **one file**:
[src/data/site.ts](src/data/site.ts). The footer, contact page and JSON-LD all
read from it, so NAP (name / address / phone) stays identical everywhere; never
hard-code these values in pages.

## Still placeholder

- `public/og/*.jpg` — the 1200×630 share images for the home, collections,
  about and contact pages are still generated gradients. Replace them 1:1
  (same filenames). Product pages already use a crop of the main product photo.

## Shopify redirects

Old Shopify URLs are 301-redirected by [public/_redirects](public/_redirects)
(Cloudflare Pages format). Product handles were kept as slugs, so only
collection pages, standard Shopify pages and the two emoji handles need rules —
add any new mappings there.
