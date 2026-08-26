# BBFurnitureWeb2 — Big Brain, built on ferm LIVING

A second, independent version of the Big Brain Furniture site (TGS Furnishings
Sdn Bhd), rebuilt to the structure and design system of **fermliving.com**
instead of District Eight. The first version lives at
[`../BBFurnitureWeb`](../BBFurnitureWeb) and is untouched.

**Live: https://lewixai.github.io/BBFurnitureWeb2/**

Same client, same photography, a different reference — so the two can be shown
side by side.

```bash
npm install
npm run organize      # assets/library/  ← the semantic image tree
npm run images        # public/img/      ← responsive derivatives + manifest
npm run dev           # localhost:5191
npm run build         # dist/
npm run verify        # 148 checks against a running server
```

## Deploying

GitHub Pages on a free org serves a project repo from a **subpath**, so the
build has to know it:

```bash
BASE_PATH=/BBFurnitureWeb2 npm run build
touch dist/.nojekyll
bash scripts/deploy-pages.sh          # pushes dist/ to the gh-pages branch
```

`BASE_PATH` prefixes every root-relative URL the templates write — `/img/…`,
`/collections/…`, `/fonts/…`, and the runtime `fetch()` calls — in one pass
(`withBase()` in `scripts/render.mjs`, `import.meta.env.BASE_URL` in the JS).
`/src/…` is deliberately left alone: Vite resolves those itself and applies its
own base, and a pre-prefixed path is one it cannot find.

Leave `BASE_PATH` unset for the dev server or for a custom-domain deploy.

Verify the deployed site, not a local stand-in:

```bash
BASE_URL=https://lewixai.github.io BASE_PATH=/BBFurnitureWeb2 \
  node scripts/verify.mjs --root=dist
```

---

## What was copied, and how it was measured

Nothing here was eyeballed from a screenshot. Every token came out of
fermliving.com in a real headless Chrome (`scripts/probe.mjs`,
`scripts/tree.mjs`, `scripts/css.mjs`), and `scripts/compare.mjs` re-measures
both sites and prints the diff. It currently reports **33/33 identical** on:

| | |
|---|---|
| Palette | `--color-black #383838`, `--color-cream #fffefa`, `--color-canvas #f7f5ef`, `--color-price #545454` — the reference's own variable names |
| Layout | `--site-max-width 1920`, gutter 24 (16 on phones), 12-column grid, 24px gap |
| Header | 32px announcement bar over a 69px nav row, both fixed; bar slides out on scroll |
| Type | body 16/24, nav 14/14, card title 14/16.1 w500, price 11/16.5 uppercase `#545454`, section head 32/40, collection h1 64/80 |
| Buttons | 48px tall, 14px padding, 1px rule, square, `0.3s cubic-bezier(.4,0,.2,1)` |
| Cards | image cell `1 / 1.33` on canvas (`1 / 1.53` on phones), 16px gap, badge 11px uppercase, 40px wishlist, 6px dots |
| Footer | canvas USP band (24/32 serif + 14px sub) → four columns → legal rule at 13/19.5 `rgba(0,0,0,.75)` |

**Type is the one deliberate imperfection.** The reference sets **Canela Text**
and **KH Teka**, both licensed. Every free candidate was rendered beside the
real faces at the sizes this site actually uses
(`_research/specimen-serif2.png`, `_research/specimen-sans.png`) and the two
that matched on width, x-height and colour were kept:

* **Petrona** for display, in place of Canela Text
* **Instrument Sans** for UI and body, in place of KH Teka

Both are self-hosted (`scripts/fetch-fonts.sh`), latin + latin-ext only, 154 kB
for all eight files. The reference's own woff2 files were downloaded **for
measurement only**, live under `_research/fonts/` and are gitignored — they are
never shipped.

---

## The image library

The 383 originals are Wix hashes (`481b19_fa8c20b4…_mv2.jpg`) that say nothing
about what they show. `src/library.js` maps each to a path that does:

```
library/product/giselle-tray.jpg          library/texture/rouen-cathedral.jpg
library/category/sofa.jpg                 library/project/eco-botanic/03.jpg
library/showroom/johor-bahru.jpg          library/material/grain-macro.jpg
```

Every pairing traces to the client's own data, not to a guess:

* **products** ← the Wix shop payload (`bb_product_images.json`)
* **textures** ← the document order of `services-4.html`, where each swatch
  `<img>` is immediately followed by its name. `AGED_OAK_1 → THE NATURAL`
  confirms the direction.
* **projects** ← each project page's gallery, in publication order
* **categories, showrooms, materials** ← hand-checked against a contact sheet
  (`scripts/contact.mjs` → `_research/sheet-lib.png`)

**The trap worth remembering:** the texture page puts each label *after* its
image; the catalogue page puts it *before*. Reading both the same way silently
mislabelled every furniture category — `arm-chair` pointed at a coffee table,
`sofa` at a sideboard. It was caught by looking, not by testing. Those seven
entries are now pinned explicitly in `scripts/gen-library.mjs` with a comment
saying why the harvested pairing is not used.

`scripts/organize.mjs` hard-links the originals into `assets/library/` (no
second copy of 1.9 GB), `scripts/build-images.mjs` derives
`public/img/<same path>-{400…1800}.{webp,jpg}` plus a 20px LQIP per key, and
`src/image.js` renders the `<picture>`. A page asks for `product/giselle-tray`;
`scripts/render.mjs` **fails the build** on any key that does not resolve, so a
hole cannot ship as a silent HTML comment.

---

## What is honest about the catalogue

Big Brain published prices for exactly **sixteen** pieces — the reclaimed-teak
tableware. Furniture has never been priced online; the showrooms quote it. So:

* **Accessories / Everything** are a full ferm-style product grid: real names,
  real MYR prices, working Add to Cart.
* **Furniture categories** are a lookbook — the reference's dense mixed-width
  grid, no card chrome, then the sofa series list the client publishes, then one
  "Quoted, not listed" block with a WhatsApp CTA.

No price, product name or specification anywhere on the site is invented. All
long-form copy is the client's own, lifted from the Wix pages.

**The cart checks out to WhatsApp**, because Big Brain has no gateway and that
is how both showrooms already take orders. The message carries the lines and the
total.

---

## Verification

`npm run verify` runs four sweeps against a running server — the **dist** build,
not just the dev server:

| sweep | what it does | count |
|---|---|---|
| `links` | resolves every internal href and every image/font URL | 65 + 3113 |
| `layout` | 8 widths × 13 page types, looking for sideways scroll | 104 |
| `touch` | 390×844 with `hasTouch`, `page.tap()`, no mouse | 9 |
| `ui` | header, mega menu, rails, cart, wishlist, sort, search, accordions, sticky panel, console errors | 31 |

`--root` says which directory the server is actually serving. It matters: with
it unset the sweep read the project root while `dist/` was being served, and
those copies still point at `/src/styles/index.css`, which only the dev server
has. The asset filter had the same shape of bug — written for `/img/`, it
matched nothing once the URLs became `/BBFurnitureWeb2/img/` and reported a
clean pass over an empty set. Both now assert that they found something to
check before asserting that it resolved.

**148 passed, 0 failed** — locally and against the deployed site.

### Five defects the checks found that screenshots did not

1. **The burger could not be tapped on a phone.** A decorative bloom behind the
   banner copy was an oversized pseudo-element (`inset: -20% -30%`) reaching
   107px past the viewport. Chrome grows the mobile *layout* viewport to cover
   horizontal overflow, so `innerWidth` became 481 on a 390px screen, the fixed
   header stretched to 481 and the burger sat off-screen at x=431. The bloom is
   a background now.
2. **The banner image was invisible on phones.** A column flex with
   `align-items: flex-start` shrink-wraps its items, and the media has only
   absolutely positioned children — so it computed to width 0.
3. **Every wide cell rendered at single width.** `.product-grid > .product`
   sets `span 3` at the same specificity as `.product--wide` and later in the
   file, so the wide rule lost. Same class-order trap as `[hidden]`.
4. **Project tiles were empty grey boxes.** A `.media` dropped straight into
   `.product__top` has no height of its own — the aspect ratio is on the cell —
   so it collapsed to zero and the loaded picture had nowhere to paint.
5. **Footer social icons were 15×59 slivers.** Flex children with no `flex: none`
   shrink to whatever the row has left.

### Two things the reference does that Big Brain's photography cannot

* **The transparent header.** ferm's hero shots are dark enough to carry cream
  type unaided. Big Brain's are bright interiors, so the hero carries two scrims
  — 220px under the header, 340px under the caption. Measured contrast against
  `#fffefa` is 6.4–13.9:1 across the bar, the nav, the headings and the buttons.
* **Cover-cropped product cells.** ferm shoots product portrait; Big Brain's
  still lifes are landscape on white, and a portrait cover-crop cut them in
  half. Those cells are contained on the canvas instead (`img(key, {contain:
  true})`), which also drops the LQIP — a cover-sized thumbnail behind a
  contained image fringes out on the two sides the artwork does not reach.

---

## Structure

```
src/
  content.js        brand, showrooms, categories, rooms, 16 products, textures, all copy
  library.js        GENERATED — semantic path → Wix filename
  image.js          <picture> renderer, reads src/image-manifest.json
  templates/        partials (header, footer, card, banner, rail) + home + pages
  js/               header (usp, mega menu, sticky, drawer, search), cart, ui, scroll-lock
  styles/           fonts → tokens → base → components → mobile
scripts/
  probe · tree · css · dom · scrollshots   measure the reference
  contact · harvest-meta · gen-library · organize · build-images   the image pipeline
  render            61 static pages + catalogue.json, search-index.json, sitemap, robots
  compare           re-measures both sites and diffs
  verify            the 146 checks
```

61 pages: home, 8 collections, 16 products, 26 projects, 4 rooms, about,
materials, contact, wishlist, 404. **33 kB CSS, 14.8 kB JS (5 kB gzipped).**

Deployed to GitHub Pages from the `gh-pages` branch (the built site), with
`main` holding the source. The repo is **public** because Pages on a free org
cannot serve a private repo.
