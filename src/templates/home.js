import {
  layout, banner, rail, categoryTile, roomTile, productCard, esc, img, SITE,
} from './partials.js';
import {
  brand, categories, rooms, products, hero, homeBanners, homeRails,
  detailsTitle, detailsBlurb, copy,
} from '../content.js';

const bySlug = (slug) => products.find((p) => p.slug === slug);

function heroSection() {
  return `
<section class="hero" aria-label="Featured">
  ${hero.map((h, i) => `
  <div class="hero__pane">
    ${img(h.img, { alt: h.heading, sizes: '(max-width: 767px) 100vw, 50vw', eager: true })}
    <a class="hero__link" href="${h.cta.href}"><span class="sr-only">${esc(h.heading)}</span></a>
    <div class="hero__content">
      <p class="t-display">${esc(h.heading)}</p>
      <a class="btn btn--light" href="${h.cta.href}">${esc(h.cta.label)}</a>
    </div>
  </div>`).join('')}
</section>`;
}

function productGrid(spec) {
  const items = spec.slugs.map(bySlug).filter(Boolean);
  return `
<div class="limit" style="background:var(--color-cream)">
  <div class="section--pad">
    <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:24px">
      <h2 class="t-h2">${esc(spec.title)}</h2>
      <a class="t-sm underline-grow" href="/collections/accessories.html">See all</a>
    </div>
    <div class="product-grid" data-reveal>
      ${items.map((p) => productCard(p)).join('\n      ')}
    </div>
  </div>
</div>`;
}

function ugc() {
  const stills = Array.from({ length: 8 }, (_, i) => `object/${String(i + 1).padStart(2, '0')}`);
  return `
<div class="limit">
  <div class="section--pad">
    <h2 class="t-h2">${esc(detailsTitle)}</h2>
    <p class="t-xs" style="max-width:38em;margin-top:12px;color:var(--color-price)">${esc(detailsBlurb)}</p>
    <div style="margin-top:24px" data-reveal>
      ${rail(stills.map((s) => `<div class="ugc">${img(s, { alt: '', sizes: '(max-width: 767px) 46vw, 24vw', contain: true })}</div>`), { slide: '23.5%' })}
    </div>
  </div>
</div>`;
}

export default function home({ projects = [] } = {}) {
  const body = `
${heroSection()}

${rail(categories.map((c) => categoryTile(c)), { slide: '23.5%', slideSm: '46%' })}

${banner(homeBanners[0])}

${productGrid(homeRails[0])}

${banner(homeBanners[1])}

${productGrid(homeRails[1])}

${banner(homeBanners[2])}

${rail(rooms.map((r) => roomTile(r)), { slide: '23.5%', slideSm: '46%' })}

<div class="limit">
  <div class="section--pad" style="max-width:56em">
    <h2 class="t-h2">Collection</h2>
    <p style="margin-top:16px;font-size:16px;line-height:26px">${esc(copy.collection)}</p>
    <a class="btn" style="margin-top:24px" href="/collections/all.html">Explore the Collection</a>
  </div>
</div>

${ugc()}
`;

  return layout({
    title: `${brand.name} | ${brand.tagline}`,
    description: 'FF Furniture is a demo furniture store by FF Dev Studio: sofas, dining tables, chairs and teak accessories. Products, prices and addresses are placeholders.',
    body,
    over: true,
    projects,
    canonical: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FurnitureStore',
      name: brand.name,
      description: 'A demo furniture store by FF Dev Studio. Products, prices and addresses are placeholders.',
      url: SITE,
    },
  });
}
