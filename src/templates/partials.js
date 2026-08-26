import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { img } from '../image.js';
import { brand, social, showrooms, categories, rooms, products, usps } from '../content.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const svg = (name) => readFileSync(path.join(ROOT, 'public', 'brand', `${name}.svg`), 'utf8')
  .replace('<svg ', `<svg class="logo__${name.replace('logo-', '')}" `);

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const money = (n) => `MYR ${n.toFixed(2)}`;

export { SITE } from '../site.js';
import { SITE } from '../site.js';

/* ── Icons, matching the reference's line weight ───────────────────────── */
export const icons = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 20.5S3.5 15.2 3.5 9.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.6c0 5.6-8.5 10.9-8.5 10.9Z"/></svg>',
  burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  prev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M10.5 2L4.5 8l6 6"/></svg>',
  next: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5.5 2l6 6-6 6"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  back: '<svg viewBox="0 0 13 8" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M4 1L1 4l3 3M1 4h12"/></svg>',
  check: '<svg viewBox="0 0 11 8" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1 4l3 3 6-6"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M14.5 8.5H17V5.5h-2.5A3.5 3.5 0 0 0 11 9v2H9v3h2v7h3v-7h2.3l.7-3H14V9c0-.3.2-.5.5-.5Z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.2 8.2 0 1 1 8 19.4l-4.5 1.1Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.4 1-1v-.8l-1.8-.7-.8.9a5 5 0 0 1-2.3-2.3l.9-.8-.7-1.8h-.8c-.6 0-1 .4-1 1Z" fill="currentColor" stroke="none"/></svg>',
};

/* ── Navigation model, mirroring the reference's four-item menu ─────────── */
export const menu = [
  {
    label: 'Shop',
    href: '/collections/all.html',
    columns: [
      { title: 'Furniture', links: categories.filter((c) => c.slug !== 'accessories').map((c) => ({ label: c.name, href: `/collections/${c.slug}.html` })) },
      {
        title: 'Accessories',
        links: [
          { label: 'All Accessories', href: '/collections/accessories.html' },
          { label: 'Boards & Plates', href: '/collections/accessories.html#boards' },
          { label: 'Bowls & Trays', href: '/collections/accessories.html#bowls' },
          { label: 'Serving', href: '/collections/accessories.html#serving' },
          { label: 'Everything', href: '/collections/all.html' },
        ],
      },
      {
        title: 'Materials',
        links: [
          { label: 'Reclaimed Teak', href: '/materials.html' },
          { label: 'Textures', href: '/materials.html#textures' },
          { label: 'The Sofa Series', href: '/collections/sofa.html#series' },
        ],
      },
    ],
    feature: { img: 'category/sofa', label: 'The Sofa Series', href: '/collections/sofa.html' },
  },
  {
    label: 'Inspiration',
    href: '/projects.html',
    columns: [
      { title: 'Our Work', links: [{ label: 'All Projects', href: '/projects.html' }] },
    ],
    dynamic: 'projects',
    feature: { img: 'home/living-room-02', label: 'Recent Work', href: '/projects.html' },
  },
  {
    label: 'Rooms',
    href: '/rooms/living-room.html',
    columns: [
      { title: 'By Room', links: rooms.map((r) => ({ label: r.name, href: `/rooms/${r.slug}.html` })) },
      { title: 'By Piece', links: categories.map((c) => ({ label: c.name, href: `/collections/${c.slug}.html` })) },
    ],
    feature: { img: 'home/dining-room-01', label: 'The Dining Room', href: '/rooms/dining-room.html' },
  },
  {
    label: 'About',
    href: '/about.html',
    columns: [
      {
        title: 'Big Brain',
        links: [
          { label: 'About Us', href: '/about.html' },
          { label: 'Materials', href: '/materials.html' },
          { label: 'Showrooms', href: '/contact.html' },
        ],
      },
      {
        title: 'Trade',
        links: [
          { label: 'Interior Designers', href: '/about.html#trade' },
          { label: 'Contract Projects', href: '/projects.html' },
          { label: 'Get in Touch', href: '/contact.html' },
        ],
      },
    ],
    feature: { img: 'showroom/johor-bahru', label: 'Visit a Showroom', href: '/contact.html' },
  },
];

/* ── Header ────────────────────────────────────────────────────────────── */
function megamenu(item, projects) {
  const cols = item.columns.map((c) => `
        <div class="megamenu__col">
          <h3>${esc(c.title)}</h3>
          <ul>
            ${c.links.map((l) => `<li class="megamenu__item"><a class="underline-grow" href="${l.href}">${esc(l.label)}</a></li>`).join('\n            ')}
          </ul>
        </div>`).join('');

  const dyn = item.dynamic === 'projects' ? `
        <div class="megamenu__col">
          <h3>Recent Projects</h3>
          <ul>
            ${projects.slice(0, 8).map((p) => `<li class="megamenu__item"><a class="underline-grow" href="/projects/${p.slug}.html">${esc(p.title)}</a></li>`).join('\n            ')}
          </ul>
        </div>` : '';

  const feature = item.feature ? `
        <div class="megamenu__feature">
          <a href="${item.feature.href}">
            ${img(item.feature.img, { alt: item.feature.label, sizes: '(max-width: 1023px) 0px, 25vw' })}
            <figcaption>${esc(item.feature.label)}</figcaption>
          </a>
        </div>` : '';

  return `
    <div class="megamenu" id="megamenu-${esc(item.label.toLowerCase())}" data-megamenu>
      <div class="megamenu__inner limit">${cols}${dyn}${feature}
      </div>
    </div>`;
}

export function header({ over = false, projects = [] } = {}) {
  return `
<header class="header${over ? ' header--over' : ''}" data-header role="banner">
  <div class="header__bar">
    <div class="limit">
      <div class="usp" data-usp data-speed="4000" role="region" aria-label="Announcements">
        <div class="usp__track" aria-live="polite">
          ${usps.map((u, i) => `<a class="usp__item${i === 0 ? ' is-in' : ''}" data-usp-item href="${u.href}"${u.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(u.text)}</a>`).join('\n          ')}
          <span class="usp__count"><span data-usp-index>1</span> / ${usps.length}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="header__nav">
    <div class="limit header__inner">
      <div class="header__left">
        <a class="logo" href="/" aria-label="${esc(brand.name)} — home">
          ${svg('logo-mark')}
          ${svg('logo-wordmark')}
        </a>
        <span class="header__lang t-xs" style="color:inherit">Malaysia / MYR</span>
      </div>

      <div class="header__right">
        <nav class="header__menu" aria-label="Main">
          ${menu.map((m) => `<a class="underline-grow" href="${m.href}" data-menu="${esc(m.label.toLowerCase())}">${esc(m.label)}</a>`).join('\n          ')}
        </nav>
        <div class="header__tools">
          <button class="icon-btn" data-search-open aria-expanded="false" aria-controls="search">${icons.search}<span class="sr-only">Search</span></button>
          <a class="tool" href="/wishlist.html" data-wishlist-link><span class="tool__icon">${icons.heart}</span><span class="tool__label">Wishlist<span data-wishlist-count></span></span></a>
          <button class="tool" data-cart-open aria-expanded="false" aria-controls="cart"><span class="tool__icon">${icons.bag}</span><span class="tool__label">Cart <span class="cart-count" data-cart-count>(0)</span></span></button>
          <button class="burger" data-drawer-open aria-expanded="false" aria-controls="drawer">${icons.burger}<span class="sr-only">Menu</span></button>
        </div>
      </div>
    </div>
    ${menu.map((m) => megamenu(m, projects)).join('')}
  </div>
</header>

<div class="searchbar" id="search" data-search hidden>
  <div class="limit">
    <form role="search" data-search-form>
      <input type="search" name="q" placeholder="Search products and projects" aria-label="Search" autocomplete="off">
      <button type="button" class="icon-btn" data-search-close>${icons.close}<span class="sr-only">Close search</span></button>
    </form>
    <div class="search-results" data-search-results></div>
  </div>
</div>

<div class="scrim" data-scrim hidden></div>

<aside class="drawer" id="drawer" data-drawer aria-label="Menu" hidden>
  <div class="drawer__head">
    <a class="logo" href="/" aria-label="${esc(brand.name)} — home">${svg('logo-mark')}${svg('logo-wordmark')}</a>
    <button class="icon-btn" data-drawer-close>${icons.close}<span class="sr-only">Close menu</span></button>
  </div>
  <div class="drawer__body">
    ${menu.map((m) => `
    <div class="drawer__group" data-drawer-group>
      <button class="drawer__toggle" data-drawer-toggle aria-expanded="false"><span>${esc(m.label)}</span><span aria-hidden="true">+</span></button>
      <div class="drawer__panel"><div>
        ${m.columns.map((c) => `<div><a href="${c.links[0].href}" style="font-weight:500">${esc(c.title)}</a>
          ${c.links.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}</div>`).join('')}
      </div></div>
    </div>`).join('')}
    <div style="padding-top:24px">
      <a class="btn btn--block" href="${social.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a>
    </div>
  </div>
</aside>

<aside class="cart" id="cart" data-cart aria-label="Cart" hidden>
  <div class="cart__head">
    <h2 class="t-lead">Cart</h2>
    <button class="icon-btn" data-cart-close>${icons.close}<span class="sr-only">Close cart</span></button>
  </div>
  <div class="cart__body" data-cart-body></div>
  <div class="cart__foot">
    <div class="cart__total"><span>Total</span><span data-cart-total>MYR 0.00</span></div>
    <a class="btn btn--solid" style="display:flex;width:100%" data-cart-checkout href="${social.whatsapp}" target="_blank" rel="noopener">Check out on WhatsApp</a>
    <p class="t-xs" style="margin-top:12px;color:var(--color-label)">Orders are confirmed over WhatsApp — the same way the showrooms take them.</p>
  </div>
</aside>

<div class="toast" data-toast role="status" aria-live="polite"></div>`;
}

/* ── Footer ────────────────────────────────────────────────────────────── */
const footerUsps = [
  { title: 'Two showrooms', sub: 'Johor Bahru and Petaling Jaya', href: '/contact.html' },
  { title: 'Made to order', sub: 'Sized to the room it is going in', href: '/collections/sofa.html' },
  { title: 'We would love to help you', sub: `WhatsApp ${social.whatsappNumber}`, href: social.whatsapp },
  { title: 'Old wood, new life', sub: 'Reclaimed teak, rebuilt by hand', href: '/materials.html' },
];

const footerCols = [
  {
    title: 'Customer Service',
    links: [
      { label: 'Contact', href: '/contact.html' },
      { label: 'Visit a Showroom', href: '/contact.html' },
      { label: 'Delivery', href: '/contact.html#delivery' },
      { label: 'Care and Maintenance', href: '/materials.html#care' },
      { label: 'WhatsApp Us', href: social.whatsapp },
    ],
  },
  {
    title: 'Information',
    links: [
      { label: 'About Us', href: '/about.html' },
      { label: 'Materials', href: '/materials.html' },
      { label: 'Textures', href: '/materials.html#textures' },
      { label: 'Our Work', href: '/projects.html' },
      { label: 'Shop', href: '/collections/accessories.html' },
    ],
  },
  {
    title: 'Professionals',
    links: [
      { label: 'Interior Designers', href: '/about.html#trade' },
      { label: 'Contract Projects', href: '/projects.html' },
      { label: 'Showrooms', href: '/contact.html' },
    ],
  },
];

export function footer() {
  return `
<footer class="footer">
  <div class="footer__usps">
    <div class="limit">
      <div class="grid-12">
        ${footerUsps.map((u) => `
        <div>
          <a href="${u.href}"${u.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>
            <div class="t-h3">${esc(u.title)}</div>
            <div class="t-sm">${esc(u.sub)}</div>
          </a>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <div class="footer__main">
    <div class="limit">
      <div class="grid-12">
        <div class="newsletter">
          <h2 class="t-lead">Join the studio list</h2>
          <p>New pieces, new projects, and the occasional look at what is on the workshop floor.</p>
          <form data-newsletter>
            <input type="email" name="email" required placeholder="Your email" aria-label="Your email">
            <button type="submit">Sign up</button>
          </form>
          <p class="newsletter__note" data-newsletter-note hidden></p>
        </div>
        ${footerCols.map((c) => `
        <nav class="footer__col" aria-label="${esc(c.title)}">
          <h2 class="t-lead">${esc(c.title)}</h2>
          <ul>
            ${c.links.map((l) => `<li><a class="underline-grow" href="${l.href}"${l.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}</a></li>`).join('\n            ')}
          </ul>
        </nav>`).join('')}
      </div>
    </div>
  </div>

  <div class="footer__legal">
    <div class="limit">
      <div class="grid-12">
        <div class="footer__links">
          ${showrooms.map((s) => `<a href="${s.mapHref}" target="_blank" rel="noopener">${esc(s.city)}</a>`).join('\n          ')}
          <a href="tel:${showrooms[0].telHref}">${esc(showrooms[0].tel)}</a>
          <a href="mailto:${showrooms[0].email}">${esc(showrooms[0].email)}</a>
        </div>
        <address>© ${brand.year} ${esc(brand.legal)}</address>
        <div class="footer__social">
          <a href="${social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icons.instagram}</a>
          <a href="${social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icons.facebook}</a>
          <a href="${social.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${icons.whatsapp}</a>
        </div>
      </div>
    </div>
  </div>
</footer>`;
}

/* ── Page shell ────────────────────────────────────────────────────────── */
export function layout({ title, description, body, over = false, projects = [], canonical = '/', ogImage = 'home/living-room-01', jsonLd = null }) {
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${canonical}">
<meta property="og:image" content="${SITE}/img/${ogImage}-1280.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#fffefa">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" href="/fonts/instrument-sans-normal-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/petrona-normal-latin.woff2" crossorigin>
<link rel="stylesheet" href="/src/styles/index.css">
<script>document.documentElement.classList.replace('no-js','js')</script>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${header({ over, projects })}
<main id="main" class="content">
${body}
</main>
${footer()}
<script type="module" src="/src/js/main.js"></script>
</body>
</html>`;
}

/* ── Product card ──────────────────────────────────────────────────────── */
export function productCard(p, { sizes = '(max-width: 767px) 50vw, 25vw', wide = false, eager = false } = {}) {
  const gallery = (p.gallery && p.gallery.length ? p.gallery : [p.img]).filter(Boolean);
  // Still-life shots are shown whole on the canvas; room shots fill the cell.
  const still = /^(product|object)\//.test(gallery[0] ?? '');
  const href = p.href ?? `/products/${p.slug}.html`;
  const badges = [];
  if (p.tag) badges.push(`<div class="badge badge--dark">${esc(p.tag)}</div>`);
  if (p.reclaimed) badges.push('<div class="badge">Reclaimed</div>');

  const price = p.price != null ? money(p.price)
    : p.soldOut ? 'Sold out'
      : 'Price on request';

  const action = p.price != null
    ? `<button class="btn btn--block" data-add="${esc(p.slug)}">+ Add to Cart</button>`
    : p.soldOut
      ? '<button class="btn btn--block" disabled>Sold out</button>'
      : `<a class="btn btn--block" href="${href}">Enquire</a>`;

  return `
<div class="product${wide ? ' product--wide' : ''}">
  <div class="product__inner">
    <div class="product__top${still ? ' product__top--still' : ''}" data-card-gallery>
      <div class="product__gallery">
        ${gallery.map((g, i) => img(g, { alt: i === 0 ? p.name : '', sizes, eager: eager && i === 0, contain: still, className: i === 0 ? 'is-current' : '' })).join('\n        ')}
      </div>
      <a href="${href}"><span class="sr-only">${esc(p.name)}</span></a>
      ${badges.length ? `<div class="product__badges">${badges.join('')}</div>` : ''}
      <button class="wish" data-wish="${esc(p.slug)}" aria-pressed="false" aria-label="Add ${esc(p.name)} to wishlist">${icons.heart}</button>
      ${gallery.length > 1 ? `
      <button class="product__arrow product__arrow--prev" data-card-prev aria-label="Previous image">${icons.prev}</button>
      <button class="product__arrow product__arrow--next" data-card-next aria-label="Next image">${icons.next}</button>
      <div class="product__dots" data-card-dots>
        ${gallery.map((_, i) => `<button data-card-dot="${i}" aria-current="${i === 0}" aria-label="Image ${i + 1}"></button>`).join('')}
      </div>` : ''}
    </div>
    <div class="product__info">
      <a href="${href}">
        <div class="product__title">${esc(p.name)}</div>
        <div class="product__price t-price">${esc(price)}</div>
      </a>
    </div>
    <div class="product__buttons">${action}</div>
  </div>
</div>`;
}

/* ── Text + image banner ───────────────────────────────────────────────── */
export function banner(b) {
  return `
<div class="limit">
  <div class="banner banner--${b.side === 'left' ? 'left' : 'right'}" data-reveal>
    <div class="banner__media">
      <a href="${b.cta.href}">${img(b.img, { alt: b.heading, sizes: '(max-width: 767px) 100vw, 48vw' })}</a>
    </div>
    <div class="banner__text">
      <h2>${esc(b.heading)}</h2>
      ${b.body ? `<p>${esc(b.body)}</p>` : ''}
      <a class="btn" href="${b.cta.href}">${esc(b.cta.label)}</a>
    </div>
  </div>
</div>`;
}

/* ── Horizontal rail ───────────────────────────────────────────────────── */
export function rail(slides, { slide = '23.5%', slideSm = '46%', heading = '', extraClass = '' } = {}) {
  return `
<div class="limit">
  <section class="section rail ${extraClass}" data-rail style="--slide:${slide};--slide-sm:${slideSm}">
    ${heading ? `<h2 class="t-h2" style="margin-bottom:8px">${esc(heading)}</h2>` : ''}
    <div class="rail__controls">
      <button class="rail__btn" data-rail-prev aria-label="Previous" disabled>${icons.prev}</button>
      <button class="rail__btn" data-rail-next aria-label="Next">${icons.next}</button>
    </div>
    <div class="rail__viewport" data-rail-viewport>
      <div class="rail__track">
        ${slides.map((s) => `<div class="rail__slide">${s}</div>`).join('\n        ')}
      </div>
    </div>
  </section>
</div>`;
}

export function categoryTile(c, { links = null } = {}) {
  return `
<a class="tile" href="/collections/${c.slug}.html">
  ${img(c.img, { alt: c.name, sizes: '(max-width: 767px) 46vw, 24vw' })}
  <span class="tile__label">${esc(c.name)}</span>
</a>${links ? `<div class="tile__links">${links}</div>` : ''}`;
}

export function roomTile(r) {
  const links = r.links
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean)
    .map((c) => `<a href="/collections/${c.slug}.html">${esc(c.name)}</a>`)
    .join(' · ');
  return `
<a class="tile" href="/rooms/${r.slug}.html">
  ${img(r.img, { alt: r.name, sizes: '(max-width: 767px) 46vw, 24vw' })}
  <span class="tile__label">${esc(r.name)}</span>
</a>
<div class="tile__links">${links}</div>`;
}

export { img, products, categories, rooms, showrooms, brand, social };
