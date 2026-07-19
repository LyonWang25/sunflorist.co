# Sun Florist — sunflorist.co

Static brochure + catalogue site for Sun Florist (DC · MD · VA · NC), built with
[Astro](https://astro.build). No cart, no checkout, no backend — customers order
via WhatsApp / WeChat / Instagram / phone deep links.

Full specifications live in [docs/](docs/) — read them before changing anything.

## Commands

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build to `dist/` (deployed on Cloudflare Pages) |
| `npm run preview` | Serve the production build locally |
| `npm run images -- --slug <slug>` | Import raw photos (see below) |
| `npm run placeholders` | Regenerate development placeholder imagery |

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
# rename by capture time and place into src/assets/products/
npm run images -- --slug the-meridian
# → src/assets/products/the-meridian-01.jpg, -02.jpg …

# no slug: normalized names into raw/processed/ for manual picking
npm run images
```

Every photo is auto-rotated, stripped of all metadata (including GPS
location), downscaled to a 2000px long edge and saved as JPEG q85. Existing
files are never overwritten unless you pass `--force`.

> Windows PowerShell swallows the bare `--` separator — use
> `npm run images -- --slug=the-meridian` from Git Bash/cmd, or
> `npm run images '--' --slug the-meridian` in PowerShell.

## Homepage gallery wall

Drop photos — **HEIC straight from the phone is fine** — into
`src/assets/site/gallery/`. They are converted, cleaned and renamed
automatically before every `npm run dev` / `npm run build` (or run
`npm run gallery` manually). The wall shows 9 photos at a time and rotates
to the next set daily, cycling through everything in the folder; tune
`GALLERY_SLOTS` / `GALLERY_ROTATE_DAYS` at the top of
[src/pages/index.astro](src/pages/index.astro).

## Placeholder data — replace before launch

All business facts live in **one file**: [src/data/site.ts](src/data/site.ts).
Everything marked `TODO` there (address, phone, WhatsApp, WeChat ID, Instagram,
Google Maps embed URL) is an obvious placeholder. Also replace:

- `src/assets/**` placeholder imagery (generated gradients) with real photos
- `public/og/*.jpg` share images (1200×630)
- the text wordmark in `src/components/Nav.astro` with the real script logo
- `public/favicon.svg` if a real mark is available

Shopify → new-site 301 redirects: when the mapping list is ready, add a
`public/_redirects` file (Cloudflare Pages format) — nothing else needs to
change.
