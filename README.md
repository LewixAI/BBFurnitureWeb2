# FF Furniture — a demo store by FF Dev Studio

A furniture shop built to the structure and design system of **fermliving.com**:
transparent hero header, mega menu, product rails, collection grids, product
pages with a sticky panel, a cart and a wishlist. Every product, price, address
and photograph is placeholder content. It exists to show what a store like this
looks like, not to describe a real business.

```bash
npm install
npm run images        # public/img/  ← responsive derivatives + src/image-manifest.json
npm run dev           # localhost:5191
npm run render        # the static HTML at the project root
npm run build         # dist/
npm run verify        # sweeps against a running server
```

Every page carries `<meta name="robots" content="noindex">`, and the footer
says what this is: *Demo store by FF Dev Studio — products, prices and
addresses are placeholders.*

## Deploying

A project repo on GitHub Pages is served from a **subpath**, so the build has
to know it:

```bash
BASE_PATH=/your-repo-name npm run build
touch dist/.nojekyll
bash scripts/deploy-pages.sh          # pushes dist/ to the gh-pages branch
```

`BASE_PATH` prefixes every root-relative URL the templates write — `/img/…`,
`/collections/…`, `/fonts/…`, and the runtime `fetch()` calls — in one pass
(`withBase()` in `scripts/render.mjs`, `import.meta.env.BASE_URL` in the JS).
`/src/…` is deliberately left alone: Vite resolves those itself and applies its
own base, and a pre-prefixed path is one it cannot find.

Leave `BASE_PATH` unset for the dev server or a custom-domain deploy. The
canonical, Open Graph and sitemap URLs use `SITE_ORIGIN`, which defaults to
`https://ff-furniture-alt.pages.dev`.

Verify a built site, not a local stand-in:

```bash
npm run preview &                     # serves dist/ on :5191
node scripts/verify.mjs --root=dist
```

---

## What was copied, and how it was measured

Every layout token came out of fermliving.com in a real headless Chrome
(`scripts/probe.mjs`, `scripts/tree.mjs`, `scripts/css.mjs`), and
`scripts/compare.mjs` re-measures both sites and prints the diff.

| | |
|---|---|
| Palette | `--color-black #383838`, `--color-cream #fffefa`, `--color-canvas #f7f5ef`, `--color-price #545454` — the reference's own variable names |
| Layout | `--site-max-width 1920`, gutter 24 (16 on phones), 12-column grid, 24px gap |
| Header | 32px announcement bar over a 69px nav row, both fixed; bar slides out on scroll |
| Type | body 16/24, nav 14/14, card title 14/16.1 w500, price 11/16.5 uppercase `#545454`, section head 32/40, collection h1 64/80 |
| Buttons | 48px tall, 14px padding, 1px rule, square, `0.3s cubic-bezier(.4,0,.2,1)` |
| Cards | image cell `1 / 1.33` on canvas (`1 / 1.53` on phones), 16px gap, badge 11px uppercase, 40px wishlist, 6px dots |
| Footer | canvas USP band (24/32 serif + 14px sub) → four columns → legal rule at 13/19.5 `rgba(0,0,0,.75)` |

**Type is the one deliberate imperfection.** The reference sets Canela Text and
KH Teka, both licensed. The two free faces that matched on width, x-height and
colour were kept:

* **Petrona** for display, in place of Canela Text
* **Instrument Sans** for UI and body, in place of KH Teka

Both are self-hosted (`scripts/fetch-fonts.sh`), latin + latin-ext only.

## The logo

The mark is FF Dev Studio's own (two slashes and two Fs), paired with the word
FURNITURE set in Petrona. Both are inline SVG (`public/brand/logo-mark.svg`,
`public/brand/logo-wordmark.svg`, the word outlined so no font has to load) and
take their colour from `currentColor`, so the lockup turns cream over a hero
and ink everywhere else. `public/favicon.svg`, `apple-touch-icon.png` and
`icon-512.png` are the studio's favicon.

## The image library

`assets/library/` holds the source photographs, git-ignored, named by what they
show and never by where they came from:

```
product/01.jpg            texture/03.jpg           category/sofa.jpg
project/garden-house/04.jpg   material/grain-macro.jpg   showroom/one.jpg
```

`scripts/build-images.mjs` derives `public/img/<same path>-{400…1800}.{webp,jpg}`
plus a 20px LQIP per key into `src/image-manifest.json`, and `src/image.js`
renders the `<picture>`. A page asks for `product/01`; `scripts/render.mjs`
**fails the build** on any key that does not resolve, so a hole cannot ship as
a silent HTML comment.

Before a photograph goes into the library, look at it: signage, logos and
watermarks belong to someone, and a contact sheet
(`node scripts/contact.mjs <dir> <out.png>`) is the quickest way to see them.

`LQIP_AVOID='regex' node scripts/build-images.mjs --only=<prefix>` re-encodes a
placeholder whose base64 happens to spell a string you do not want anywhere in
the built HTML.

## The cart

The cart and wishlist live in `localStorage`. **Check out on WhatsApp** opens a
chat with FF Dev Studio's own number, and the message starts
`Demo order — FF Furniture`, followed by the lines and the total. Nothing is
shipped and nothing is charged.

## Verification

`npm run verify` runs five sweeps against a running server — the **dist** build,
not just the dev server:

| sweep | what it does |
|---|---|
| `links` | resolves every internal href and every image/font URL |
| `demo` | every page is noindex, carries the demo note, links to no map, Instagram or Facebook, and sends WhatsApp links only to the studio number |
| `layout` | 8 widths × 13 page types, looking for sideways scroll |
| `touch` | 390×844 with `hasTouch`, `page.tap()`, no mouse |
| `ui` | header, mega menu, rails, cart, wishlist, sort, search, accordions, sticky panel, console errors |

`--root` says which directory the server is actually serving. It matters: with
it unset the sweep reads the project root while `dist/` is being served, and
those copies still point at `/src/styles/index.css`, which only the dev server
has. Both the link and asset sweeps assert that they found something to check
before asserting that it resolved.

## Structure

```
src/
  content.js        brand, showrooms, categories, rooms, products, textures, all copy
  projects.js       the placeholder portfolio
  image.js          <picture> renderer, reads src/image-manifest.json
  templates/        partials (header, footer, card, banner, rail) + home + pages
  js/               header (usp, mega menu, sticky, drawer, search), cart, ui, scroll-lock
  styles/           fonts → tokens → base → components → mobile
scripts/
  probe · tree · css · dom · scrollshots   measure the reference
  contact · build-images                   the image pipeline
  render            43 static pages + catalogue.json, search-index.json, sitemap, robots
  compare           re-measures both sites and diffs
  verify            the sweeps above
```

43 pages: home, 8 collections, 16 products, 8 projects, 4 rooms, about,
materials, contact, wishlist, 404.
