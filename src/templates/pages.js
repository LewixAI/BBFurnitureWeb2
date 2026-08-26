import {
  layout, banner, rail, categoryTile, roomTile, productCard, esc, money, img, icons, SITE,
} from './partials.js';
import {
  brand, social, showrooms, categories, rooms, products, textures, textureIntro,
  sofaSeries, copy,
} from '../content.js';
import { has } from '../image.js';

const bySlug = (slug) => products.find((p) => p.slug === slug);
const cat = (slug) => categories.find((c) => c.slug === slug);

/* Lifestyle imagery per furniture category, each one checked by eye against
   the file it points at (see _research/sheet-lib.png). Furniture is quoted, not
   priced, so these are collection tiles rather than product tiles. */
const FEATURES = {
  sofa: ['category/sofa', 'sofa/gallery-02', 'sofa/gallery-05', 'sofa/gallery-07', 'sofa/gallery-03', 'sofa/gallery-06'],
  'dining-table': ['category/dining-table', 'home/dining-room-01', 'material/titan-dining-table', 'home/dining-room-02', 'material/cross-leg-dining-table'],
  'arm-chair': ['category/arm-chair', 'home/arm-chair-01', 'sofa/gallery-04'],
  'coffee-table': ['category/coffee-table', 'home/coffee-table-detail', 'showroom/interior-02'],
  bookcase: ['category/bookcase', 'home/living-room-04', 'home/living-room-03'],
  'sideboard-console': ['category/sideboard-console', 'showroom/interior-01', 'home/living-room-05'],
};

export const collectionKeys = ['all', ...categories.map((c) => c.slug)];

/* ══ Collection ═══════════════════════════════════════════════════════════ */
export function collectionPage(key, { projects = [] } = {}) {
  const isAll = key === 'all';
  const c = isAll ? null : cat(key);
  const title = isAll ? 'Everything' : c.name;
  const priced = key === 'accessories' || isAll;

  const filters = `
    <ul>
      <li><a href="/collections/all.html"${isAll ? ' aria-current="page"' : ''}>Everything</a></li>
      ${categories.map((x) => `<li><a href="/collections/${x.slug}.html"${x.slug === key ? ' aria-current="page"' : ''}>${esc(x.name)}</a></li>`).join('\n      ')}
    </ul>`;

  const quoteCell = `
    <blockquote class="quote-cell">
      <p>${esc(copy.quote.text.split('.').slice(0, 2).join('.') + '.')}</p>
      <cite>${esc(copy.quote.cite)}</cite>
    </blockquote>`;

  let cells;
  if (priced) {
    cells = products.map((p, i) => productCard(p, { eager: i < 4 }));
    cells.splice(6, 0, quoteCell);
    if (isAll) {
      // The furniture the showrooms quote for, shown as the reference shows
      // its lifestyle cells: double width, no price, straight to the collection.
      const wide = categories.filter((x) => x.slug !== 'accessories').map((x) => productCard({
        name: x.name,
        slug: x.slug,
        img: x.img,
        href: `/collections/${x.slug}.html`,
        reclaimed: true,
      }, { wide: true, sizes: '(max-width: 767px) 100vw, 50vw' }));
      cells = [...wide.slice(0, 2), ...cells.slice(0, 8), ...wide.slice(2), ...cells.slice(8)];
    }
  } else {
    cells = null;   // furniture is a lookbook, not a priced grid — see below
  }

  /* A furniture category carries no prices, so a grid of product cards would
     be six cards captioned with the same word and a button that only says
     "Enquire". The photographs are the catalogue; the price conversation
     happens once, at the bottom. */
  const lookbook = cells ? '' : `
  <div class="limit" style="margin-top:24px">
    <div class="lookbook" data-reveal>
      ${(FEATURES[key] || [c.img]).filter(has).map((f, i) => `
      <figure${i % 4 === 0 ? ' class="is-wide"' : ''}>
        ${img(f, { alt: `${c.name} in a Big Brain interior`, sizes: i % 4 === 0 ? '(max-width: 767px) 100vw, 66vw' : '(max-width: 767px) 100vw, 33vw', eager: i < 2 })}
      </figure>`).join('')}
    </div>
  </div>

  <div class="limit">
    <blockquote class="quote-cell" style="aspect-ratio:auto;margin-top:48px;padding:56px 24px">
      <p style="max-width:22em">${esc(copy.quote.text.split('.').slice(0, 2).join('.') + '.')}</p>
      <cite>${esc(copy.quote.cite)}</cite>
    </blockquote>
  </div>`;

  const series = key === 'sofa' ? `
  <div class="limit">
    <section class="series" id="series">
      <h2 class="t-h2">The Sofa Series</h2>
      <p class="t-sm" style="margin-top:8px;color:var(--color-price)">Every one is made to order — sized, upholstered and finished for the room it is going in. Ask us for the fabric book.</p>
      <ul>
        ${sofaSeries.map((s) => `<li>${esc(s)}</li>`).join('\n        ')}
      </ul>
      <a class="btn" style="margin-top:24px" href="${social.whatsapp}" target="_blank" rel="noopener">Ask about a sofa</a>
    </section>
  </div>` : '';

  const enquire = priced ? '' : `
  <div class="limit">
    <div class="section--pad" style="max-width:46em">
      <h2 class="t-h2">Quoted, not listed</h2>
      <p style="margin-top:16px;font-size:16px;line-height:26px">${esc(c.name)} is made to order in reclaimed teak, so the price follows the size, the texture and the finish you choose. Send us the room and we will come back with a number.</p>
      <a class="btn btn--solid" style="margin-top:24px" href="${social.whatsapp}" target="_blank" rel="noopener">Ask for a quote</a>
    </div>
  </div>`;

  const body = `
<div class="headspace">
  <div class="limit collection__head">
    <h1 class="t-h1">${esc(title)}</h1>
    ${isAll ? '' : `<p class="collection__intro">${esc(c.blurb)}</p>`}
    <div class="filters">
      ${filters}
      <div class="sorter"${priced ? '' : ' hidden'}>
        <label for="sort">Sort by</label>
        <select id="sort" data-sort>
          <option value="featured">Featured</option>
          <option value="price-asc">Price, low to high</option>
          <option value="price-desc">Price, high to low</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>
  </div>

  ${cells ? `
  <div class="limit" style="margin-top:24px">
    <div class="product-grid" data-grid>
      ${cells.join('\n      ')}
    </div>
  </div>` : lookbook}

  ${series}
  ${enquire}
</div>`;

  return layout({
    title: `${title} — ${brand.name}`,
    description: isAll
      ? 'Every piece Big Brain makes, from reclaimed teak sofas to the boards and bowls turned from their offcuts.'
      : c.blurb.slice(0, 155),
    body,
    projects,
    canonical: `/collections/${key}.html`,
    ogImage: isAll ? 'category/sofa' : c.img,
  });
}

/* ══ Product detail ═══════════════════════════════════════════════════════ */
export function productPage(p, { projects = [] } = {}) {
  const related = products.filter((x) => x.slug !== p.slug && x.price != null).slice(0, 8);
  const gallery = [p.img, 'material/grain-macro', 'material/sanding-by-hand'].filter(has);

  const price = p.price != null ? money(p.price) : p.soldOut ? 'Sold out' : 'Price on request';
  const action = p.price != null
    ? `<button class="btn btn--solid" data-add="${esc(p.slug)}">Add to Cart</button>`
    : `<a class="btn btn--solid" href="${social.whatsapp}" target="_blank" rel="noopener">Enquire on WhatsApp</a>`;

  const body = `
<div class="headspace">
  <div class="limit">
    <a class="back-link" href="/collections/accessories.html">${icons.back}<span>Back</span></a>

    <div class="pdp">
      <div class="pdp__gallery">
        <div class="pdp__badges">${p.reclaimed ? '<div class="badge">Reclaimed</div>' : ''}</div>
        ${gallery.map((g, i) => img(g, { alt: i === 0 ? p.name : '', sizes: '(max-width: 767px) 100vw, 48vw', eager: i === 0, contain: /^(product|object)\//.test(g) })).join('\n        ')}
      </div>

      <div class="pdp__panel">
        <div class="pdp__sticky">
          <h1>${esc(p.name)}</h1>
          <div class="pdp__price">${esc(price)}</div>
          <div class="pdp__variant">Reclaimed teak, oiled</div>

          ${p.price != null ? `
          <div class="qty" data-qty>
            <button type="button" data-qty-down aria-label="Decrease quantity">–</button>
            <input type="number" value="1" min="1" max="99" aria-label="Quantity" data-qty-input>
            <button type="button" data-qty-up aria-label="Increase quantity">+</button>
          </div>` : ''}

          <div class="pdp__actions">
            ${action}
            <button class="wish" data-wish="${esc(p.slug)}" aria-pressed="false" aria-label="Add ${esc(p.name)} to wishlist">${icons.heart}</button>
          </div>

          <div class="pdp__delivery">
            <div><a href="/contact.html#delivery">Delivery across Peninsular Malaysia</a></div>
            <div class="muted">Collect from Johor Bahru or Petaling Jaya, free</div>
          </div>

          <ul class="pdp__usps">
            <li>${icons.check}<a href="/materials.html">Reclaimed teak, no two alike</a></li>
            <li>${icons.check}<a href="/contact.html">Two showrooms to see it in</a></li>
            <li>${icons.check}<a href="${social.whatsapp}" target="_blank" rel="noopener">Order over WhatsApp</a></li>
            <li>${icons.check}<a href="/materials.html#care">Care instructions included</a></li>
          </ul>

          <div class="accordion" data-accordion>
            <div class="accordion__item is-open">
              <button class="accordion__btn" aria-expanded="true"><span>Description</span><span class="accordion__sign" aria-hidden="true">–</span></button>
              <div class="accordion__panel"><div><div class="accordion__body"><p>${esc(p.blurb)}</p></div></div></div>
            </div>
            <div class="accordion__item">
              <button class="accordion__btn" aria-expanded="false"><span>Details</span><span class="accordion__sign" aria-hidden="true">+</span></button>
              <div class="accordion__panel"><div><div class="accordion__body"><ul>
                <li>Reclaimed teak</li>
                <li>Food-safe oil finish</li>
                <li>Hand-finished, so grain, colour and outline vary</li>
                <li>Made in Indonesia, finished for Big Brain</li>
              </ul></div></div></div>
            </div>
            <div class="accordion__item">
              <button class="accordion__btn" aria-expanded="false"><span>Delivery &amp; Returns</span><span class="accordion__sign" aria-hidden="true">+</span></button>
              <div class="accordion__panel"><div><div class="accordion__body">
                <p>Delivery across Peninsular Malaysia, quoted with your order. Collection from either showroom is free.</p>
                <p>Tell us within seven days if a piece arrives damaged and we will replace it.</p>
              </div></div></div>
            </div>
          </div>

          <a class="t-sm" style="text-decoration:underline;text-underline-offset:3px" href="/materials.html">What does our RECLAIMED tag mean?</a>
        </div>
      </div>
    </div>
  </div>

  ${rail(related.map((r) => productCard(r)), { heading: 'You may also like', slide: '23.5%', slideSm: '60%' })}
</div>`;

  return layout({
    title: `${p.name} — ${brand.name}`,
    description: p.blurb.slice(0, 155),
    body,
    projects,
    canonical: `/products/${p.slug}.html`,
    ogImage: p.img,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.blurb,
      image: `${SITE}/img/${p.img}-1280.jpg`,
      brand: { '@type': 'Brand', name: brand.name },
      ...(p.price != null && {
        offers: {
          '@type': 'Offer',
          price: p.price.toFixed(2),
          priceCurrency: 'MYR',
          availability: 'https://schema.org/InStock',
          url: `${SITE}/products/${p.slug}.html`,
        },
      }),
    },
  });
}

/* ══ Rooms ════════════════════════════════════════════════════════════════ */
export function roomPage(r, { projects = [] } = {}) {
  const links = r.links.map(cat).filter(Boolean);
  const picks = projects.slice(0, 6);

  const body = `
<div class="headspace">
  <div class="limit collection__head">
    <h1 class="t-h1">${esc(r.name)}</h1>
    <p class="collection__intro">${esc(copy.collection)}</p>
  </div>

  <div class="limit">
    <div class="media" style="aspect-ratio:16/7">${img(r.img, { alt: r.name, sizes: '100vw', eager: true })}</div>
  </div>

  ${rail(links.map((c) => categoryTile(c)), { slide: '23.5%', slideSm: '46%' })}

  <div class="limit">
    <div class="section--pad">
      <h2 class="t-h2" style="margin-bottom:24px">${esc(r.name)} in our projects</h2>
      <div class="gallery" data-reveal>
        ${picks.map((p) => `
        <figure>
          <a href="/projects/${p.slug}.html">
            ${img(`project/${p.slug}/01`, { alt: p.title, sizes: '(max-width: 767px) 100vw, 33vw' })}
          </a>
          <figcaption class="t-sm" style="margin-top:8px">${esc(p.title)} — ${esc(p.location)}</figcaption>
        </figure>`).join('')}
      </div>
    </div>
  </div>

  <div class="limit">
    <div class="section--pad" style="max-width:46em">
      <h2 class="t-h2">Plan the room with us</h2>
      <p style="margin-top:16px;font-size:16px;line-height:26px">Bring a floor plan, or just the measurements on your phone. We will work out what fits, in what texture, and what it costs.</p>
      <a class="btn btn--solid" style="margin-top:24px" href="${social.whatsapp}" target="_blank" rel="noopener">Talk to us</a>
    </div>
  </div>
</div>`;

  return layout({
    title: `${r.name} — ${brand.name}`,
    description: `${r.name}: reclaimed teak furniture from Big Brain, made to order for Malaysian homes.`,
    body,
    projects,
    canonical: `/rooms/${r.slug}.html`,
    ogImage: r.img,
  });
}

/* ══ Projects ═════════════════════════════════════════════════════════════ */
export function projectsPage({ projects = [] } = {}) {
  const body = `
<div class="headspace">
  <div class="limit collection__head">
    <h1 class="t-h1">Inspiration</h1>
    <p class="collection__intro">Twenty-six homes, showrooms and workspaces Big Brain has furnished across Johor and the Klang Valley.</p>
  </div>

  <div class="limit">
    <div class="product-grid" style="row-gap:48px">
      ${projects.map((p, i) => `
      <div class="product${i % 5 === 0 ? ' product--wide' : ''}">
        <div class="product__inner">
          <div class="product__top">
            ${img(`project/${p.slug}/01`, { alt: p.title, sizes: i % 5 === 0 ? '(max-width: 767px) 100vw, 50vw' : '(max-width: 767px) 50vw, 25vw', eager: i < 4 })}
            <a href="/projects/${p.slug}.html"><span class="sr-only">${esc(p.title)}</span></a>
          </div>
          <div class="product__info">
            <a href="/projects/${p.slug}.html">
              <div class="product__title">${esc(p.title)}</div>
              <div class="product__price t-price">${esc(p.location)}${p.date ? ` · ${esc(p.date)}` : ''}</div>
            </a>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>`;

  return layout({
    title: `Inspiration — ${brand.name}`,
    description: 'Twenty-six residential and commercial interiors furnished by Big Brain across Johor and the Klang Valley.',
    body,
    projects,
    canonical: '/projects.html',
    ogImage: 'home/living-room-02',
  });
}

export function projectPage(project, { projects = [] } = {}) {
  const others = projects.filter((p) => p.slug !== project.slug).slice(0, 8);
  const shots = project.images.map((_, i) => `project/${project.slug}/${String(i + 1).padStart(2, '0')}`).filter(has);

  const body = `
<div class="headspace">
  <div class="limit">
    <a class="back-link" href="/projects.html">${icons.back}<span>Back to Inspiration</span></a>
  </div>

  <div class="limit">
    <div class="media" style="aspect-ratio:16/9">${img(shots[0], { alt: project.title, sizes: '100vw', eager: true })}</div>
  </div>

  <div class="limit">
    <div class="section--pad split">
      <div class="split__body" style="grid-column:span 6">
        <h1 class="t-h1">${esc(project.title)}</h1>
      </div>
      <div class="split__body">
        <div class="project-meta">
          <span>${esc(project.location)}</span>
          ${project.date ? `<span>${esc(project.date)}</span>` : ''}
          ${project.designer ? `<span>${esc(project.designer)}</span>` : ''}
        </div>
        <div class="prose" style="grid-column:auto"><p>${esc(project.body)}</p></div>
      </div>
    </div>
  </div>

  <div class="limit">
    <div class="gallery" data-reveal>
      ${shots.slice(1).map((s) => `<figure>${img(s, { alt: '', sizes: '(max-width: 767px) 100vw, 33vw' })}</figure>`).join('\n      ')}
    </div>
  </div>

  ${rail(others.map((p) => `
  <a class="tile" href="/projects/${p.slug}.html">
    ${img(`project/${p.slug}/01`, { alt: p.title, sizes: '(max-width: 767px) 46vw, 24vw' })}
    <span class="tile__label">${esc(p.title)}</span>
  </a>`), { heading: 'More projects', slide: '23.5%', slideSm: '60%' })}
</div>`;

  return layout({
    title: `${project.title} — ${brand.name}`,
    description: project.body.slice(0, 155),
    body,
    projects,
    canonical: `/projects/${project.slug}.html`,
    ogImage: shots[0],
  });
}

/* ══ Editorial ════════════════════════════════════════════════════════════ */
export function aboutPage({ projects = [] } = {}) {
  const body = `
<div class="headspace">
  <div class="limit page-head grid-12">
    <h1 class="t-h1">About Us</h1>
  </div>

  <div class="limit">
    <div class="split">
      <div class="split__media">${img('showroom/interior-02', { alt: 'Inside a Big Brain showroom', sizes: '(max-width: 767px) 100vw, 48vw', eager: true })}</div>
      <div class="split__body prose" style="grid-column:8 / span 5">
        ${copy.about.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
        <h2 class="t-h3" id="trade">For the trade</h2>
        <p>We collaborate with the best architecture studios, promoters, interior designers, and decorators. If you are specifying for a project, talk to us about lead times, fabric books and contract pricing.</p>
        <a class="btn" style="margin-top:16px" href="${social.whatsapp}" target="_blank" rel="noopener">Talk to us</a>
      </div>
    </div>
  </div>

  ${banner({
    heading: 'Old Wood, New Life',
    body: copy.quote.text,
    cta: { label: 'Discover Materials', href: '/materials.html' },
    img: 'material/grain-macro',
    side: 'right',
  })}

  <div class="limit">
    <div class="section--pad">
      <h2 class="t-h2" style="margin-bottom:24px">The showrooms</h2>
      <div class="grid-12 showroom-grid" style="row-gap:40px">
        ${showrooms.map((s) => `
        <div class="showroom-card">
          ${img(s.img, { alt: `${s.city} showroom`, sizes: '(max-width: 767px) 100vw, 48vw' })}
          <h3 class="t-h3">${esc(s.city)}</h3>
          <dl>
            <dt>Address</dt><dd>${esc(s.address)}</dd>
            <dt>Hours</dt><dd>${esc(s.hours)}</dd>
            <dt>Telephone</dt><dd><a href="tel:${s.telHref}">${esc(s.tel)}</a></dd>
          </dl>
          <a class="btn" href="${s.mapHref}" target="_blank" rel="noopener">Directions</a>
        </div>`).join('')}
      </div>
    </div>
  </div>
</div>`;

  return layout({
    title: `About Us — ${brand.name}`,
    description: 'Big Brain is a creative home editor working in reclaimed teak, with showrooms in Johor Bahru and Petaling Jaya.',
    body,
    projects,
    canonical: '/about.html',
    ogImage: 'showroom/interior-02',
  });
}

export function materialsPage({ projects = [] } = {}) {
  const body = `
<div class="headspace">
  <div class="limit page-head grid-12">
    <h1 class="t-h1">Materials</h1>
  </div>

  <div class="limit">
    <div class="split">
      <div class="split__media">${img('material/grain-macro', { alt: 'Reclaimed teak grain', sizes: '(max-width: 767px) 100vw, 48vw', eager: true })}</div>
      <div class="split__body prose" style="grid-column:8 / span 5">
        <h2 class="t-h3">Reclaimed Teak</h2>
        ${copy.materials.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
      </div>
    </div>
  </div>

  <div class="limit">
    <div class="section--pad">
      <div class="gallery" data-reveal>
        ${['material/titan-dining-table', 'material/sanding-by-hand', 'material/cross-leg-dining-table', 'material/stone-slabs', 'material/upholstery-stitching', 'showroom/workshop-tools']
    .filter(has).map((m) => `<figure>${img(m, { alt: '', sizes: '(max-width: 767px) 100vw, 33vw' })}</figure>`).join('\n        ')}
      </div>
    </div>
  </div>

  <div class="limit">
    <div class="section--pad" id="textures">
      <h2 class="t-h2">Texture</h2>
      <p style="max-width:46em;margin-top:16px;font-size:16px;line-height:26px">${esc(textureIntro)}</p>
      <div class="swatches" style="margin-top:32px" data-reveal>
        ${textures.map((t) => `
        <figure>
          ${img(t.img, { alt: `${t.name} texture`, sizes: '(max-width: 767px) 46vw, 24vw' })}
          <figcaption>${esc(t.name)}</figcaption>
        </figure>`).join('')}
      </div>
    </div>
  </div>

  <div class="limit">
    <div class="section--pad" id="care" style="max-width:46em">
      <h2 class="t-h2">Care and maintenance</h2>
      <p style="margin-top:16px;font-size:16px;line-height:26px">Wipe with a damp cloth and dry it. Re-oil a table top once or twice a year, more if it lives in the sun. Do not put reclaimed teak through a dishwasher, and do not leave it standing in water.</p>
      <p style="margin-top:16px;font-size:16px;line-height:26px">Knots, cracks and colour shifts will keep moving for the first year in your house. That is the wood settling into a new humidity, not a fault.</p>
    </div>
  </div>
</div>`;

  return layout({
    title: `Materials — ${brand.name}`,
    description: 'Reclaimed teak, and the sixteen textures Big Brain’s carpenters can work into it.',
    body,
    projects,
    canonical: '/materials.html',
    ogImage: 'material/grain-macro',
  });
}

export function contactPage({ projects = [] } = {}) {
  const body = `
<div class="headspace">
  <div class="limit page-head grid-12">
    <h1 class="t-h1">Visit us</h1>
  </div>

  <div class="limit">
    <div class="grid-12 showroom-grid" style="row-gap:48px">
      ${showrooms.map((s) => `
      <div class="showroom-card">
        ${img(s.img, { alt: `${s.city} showroom`, sizes: '(max-width: 767px) 100vw, 48vw', eager: true })}
        <h2 class="t-h3">${esc(s.region)} — ${esc(s.city)}</h2>
        <dl>
          <dt>Address</dt><dd>${esc(s.address)}</dd>
          <dt>Opening hours</dt><dd>${esc(s.hours)}</dd>
          <dt>Telephone</dt><dd><a href="tel:${s.telHref}">${esc(s.tel)}</a></dd>
          <dt>Email</dt><dd><a href="mailto:${s.email}">${esc(s.email)}</a></dd>
        </dl>
        <a class="btn" href="${s.mapHref}" target="_blank" rel="noopener">Directions</a>
      </div>`).join('')}
    </div>
  </div>

  <div class="limit">
    <div class="section--pad" id="delivery" style="max-width:46em">
      <h2 class="t-h2">Delivery</h2>
      <p style="margin-top:16px;font-size:16px;line-height:26px">We deliver across Peninsular Malaysia. Delivery is quoted with the order, because a sofa and a serving spoon are not the same problem. Collection from either showroom is free.</p>
      <h2 class="t-h2" style="margin-top:40px">Talk to us</h2>
      <p style="margin-top:16px;font-size:16px;line-height:26px">WhatsApp is the fastest way to reach either showroom. Send the room, the measurements, or just a photo of what you like.</p>
      <a class="btn btn--solid" style="margin-top:24px" href="${social.whatsapp}" target="_blank" rel="noopener">WhatsApp ${esc(social.whatsappNumber)}</a>
    </div>
  </div>
</div>`;

  return layout({
    title: `Visit us — ${brand.name}`,
    description: 'Big Brain showrooms in Johor Bahru and Petaling Jaya — addresses, opening hours and directions.',
    body,
    projects,
    canonical: '/contact.html',
    ogImage: 'showroom/johor-bahru',
  });
}

export function wishlistPage({ projects = [] } = {}) {
  const body = `
<div class="headspace">
  <div class="limit page-head grid-12">
    <h1 class="t-h1">Wishlist</h1>
  </div>
  <div class="limit">
    <div class="product-grid" data-wishlist-grid></div>
    <p class="t-sm" data-wishlist-empty style="color:var(--color-label)">Nothing saved yet. Tap the heart on any piece to keep it here.</p>
  </div>
</div>`;
  return layout({
    title: `Wishlist — ${brand.name}`,
    description: 'The pieces you have saved.',
    body, projects, canonical: '/wishlist.html',
  });
}

export function notFoundPage({ projects = [] } = {}) {
  const body = `
<div class="headspace">
  <div class="limit">
    <div class="notfound">
      <h1 class="t-h1">Life’s not perfect…</h1>
      <div>
        <p style="font-size:16px;line-height:26px">We’re sorry — this page no longer exists. Try the search, or start from one of these.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px">
          <a class="btn" href="/collections/all.html">Everything</a>
          <a class="btn" href="/projects.html">Inspiration</a>
          <a class="btn" href="/contact.html">Visit us</a>
        </div>
      </div>
    </div>
  </div>
  ${rail(rooms.map((r) => roomTile(r)), { slide: '23.5%', slideSm: '46%' })}
</div>`;
  return layout({
    title: `Page not found — ${brand.name}`,
    description: 'That page no longer exists.',
    body, projects, canonical: '/404.html',
  });
}
