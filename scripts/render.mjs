/**
 * Renders every page to static HTML at the project root so Vite can treat the
 * site as a multi-page app, and writes the runtime data files (catalogue,
 * search index, sitemap, robots).
 *
 * Fails loudly on any unresolved image key — a silent <!-- missing image -->
 * is how a hole ships.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');


const home = (await import('../src/templates/home.js')).default;
const pages = await import('../src/templates/pages.js');
const { products, categories, rooms } = await import('../src/content.js');
const { manifest } = await import('../src/image.js');
const { BASE, SITE } = await import('../src/site.js');

/**
 * Prefixes every root-relative URL with the deploy base.
 *
 * `/src/…` is deliberately skipped: Vite resolves those itself and applies its
 * own `base`, and a pre-prefixed path is one it cannot find at all.
 */
const withBase = (html) => (BASE
  ? html
    .replace(/(\s(?:href|src|content)=")\/(?!\/|src\/)/g, `$1${BASE}/`)
    .replace(/(\ssrcset=")([^"]+)"/g, (m, a, list) => a
      + list.split(',').map((part) => part.trim().replace(/^\/(?!\/)/, `${BASE}/`)).join(', ')
      + '"')
  : html);
const { projects } = await import(path.resolve(ROOT, '..', 'BBFurnitureWeb', 'src', 'projects.js'));

const ctx = { projects };
const files = new Map();

files.set('index.html', home(ctx));
files.set('projects.html', pages.projectsPage(ctx));
files.set('about.html', pages.aboutPage(ctx));
files.set('materials.html', pages.materialsPage(ctx));
files.set('contact.html', pages.contactPage(ctx));
files.set('wishlist.html', pages.wishlistPage(ctx));
files.set('404.html', pages.notFoundPage(ctx));

for (const key of pages.collectionKeys) files.set(`collections/${key}.html`, pages.collectionPage(key, ctx));
for (const r of rooms) files.set(`rooms/${r.slug}.html`, pages.roomPage(r, ctx));
for (const p of projects) files.set(`projects/${p.slug}.html`, pages.projectPage(p, ctx));
for (const p of products) files.set(`products/${p.slug}.html`, pages.productPage(p, ctx));

for (const dir of ['collections', 'projects', 'products', 'rooms']) {
  await rm(path.join(ROOT, dir), { recursive: true, force: true });
}
for (const [rel, html] of files) {
  const dest = path.join(ROOT, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, withBase(html));
}

// ── Runtime data ──────────────────────────────────────────────────────────
const thumb = (key) => (manifest[key] ? `${BASE}/img/${key}-400.jpg` : '');

const catalogue = Object.fromEntries(products.map((p) => [p.slug, {
  slug: p.slug, name: p.name, price: p.price, thumb: thumb(p.img),
  href: `${BASE}/products/${p.slug}.html`,
}]));
await writeFile(path.join(ROOT, 'public', 'catalogue.json'), JSON.stringify(catalogue));

const index = [
  ...products.map((p) => ({
    title: p.name, href: `${BASE}/products/${p.slug}.html`, img: thumb(p.img),
    meta: p.price != null ? `MYR ${p.price.toFixed(2)}` : 'Price on request',
    text: `${p.name} ${p.blurb}`.toLowerCase(),
  })),
  ...categories.map((c) => ({
    title: c.name, href: `${BASE}/collections/${c.slug}.html`, img: thumb(c.img), meta: 'Collection',
    text: `${c.name} ${c.lede} ${c.blurb}`.toLowerCase(),
  })),
  ...rooms.map((r) => ({
    title: r.name, href: `${BASE}/rooms/${r.slug}.html`, img: thumb(r.img), meta: 'Room',
    text: r.name.toLowerCase(),
  })),
  ...projects.map((p) => ({
    title: p.title, href: `${BASE}/projects/${p.slug}.html`, img: thumb(`project/${p.slug}/01`),
    meta: p.location, text: `${p.title} ${p.location} ${p.body}`.toLowerCase(),
  })),
];
await writeFile(path.join(ROOT, 'public', 'search-index.json'), JSON.stringify(index));

// ── Sitemap + robots ─────────────────────────────────────────────────────
const NO_INDEX = new Set(['404.html', 'wishlist.html']);
const urls = [...files.keys()].filter((f) => !NO_INDEX.has(f))
  .map((f) => (f === 'index.html' ? '' : f)).sort();
const priority = (u) => (u === '' ? '1.0'
  : /^(collections\/all|projects)\.html$/.test(u) ? '0.9'
    : u.includes('/') ? '0.7' : '0.8');

await writeFile(path.join(ROOT, 'public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + urls.map((u) => `  <url>\n    <loc>${SITE}/${u}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${priority(u)}</priority>\n  </url>`).join('\n')
  + `\n</urlset>\n`);

await writeFile(path.join(ROOT, 'public', 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

// ── Guard: no page may ship a hole where an image should be ──────────────
const holes = new Map();
for (const [rel, html] of files) {
  for (const m of html.matchAll(/<!-- missing image: ([^>]+?) -->/g)) {
    if (!holes.has(m[1])) holes.set(m[1], []);
    holes.get(m[1]).push(rel);
  }
}
console.log(`rendered ${files.size} pages, ${index.length} search entries`);
if (holes.size) {
  console.error(`\n✗ ${holes.size} unresolved image key(s):`);
  for (const [key, where] of holes) console.error(`   ${key}  →  ${where.slice(0, 3).join(', ')}${where.length > 3 ? ` (+${where.length - 3})` : ''}`);
  process.exitCode = 1;
}
