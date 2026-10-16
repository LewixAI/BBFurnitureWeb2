/* Rails, card galleries, accordions, reveals, sorting, image fade-in. */

/* ── Horizontal rail ───────────────────────────────────────────────────── */
export function initRails() {
  document.querySelectorAll('[data-rail]').forEach((rail) => {
    const view = rail.querySelector('[data-rail-viewport]');
    const prev = rail.querySelector('[data-rail-prev]');
    const next = rail.querySelector('[data-rail-next]');
    const slide = view?.querySelector('.rail__slide');
    if (!view || !slide) return;

    const step = () => slide.getBoundingClientRect().width || view.clientWidth * 0.25;

    const sync = () => {
      const max = view.scrollWidth - view.clientWidth - 2;
      if (prev) prev.disabled = view.scrollLeft <= 2;
      if (next) next.disabled = view.scrollLeft >= max;
      const dead = max <= 2;
      rail.querySelector('.rail__controls')?.toggleAttribute('hidden', dead);
    };

    prev?.addEventListener('click', () => view.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => view.scrollBy({ left: step(), behavior: 'smooth' }));
    view.addEventListener('scroll', sync, { passive: true });
    new ResizeObserver(sync).observe(view);
    sync();
  });
}

/* ── Product card image carousel ───────────────────────────────────────── */
export function initCards() {
  document.querySelectorAll('[data-card-gallery]').forEach((card) => {
    const shots = [...card.querySelectorAll('.product__gallery .media')];
    if (shots.length < 2) return;
    const dots = [...card.querySelectorAll('[data-card-dot]')];
    let i = 0;

    const go = (n) => {
      i = (n + shots.length) % shots.length;
      shots.forEach((s, k) => s.classList.toggle('is-current', k === i));
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    };

    card.querySelector('[data-card-prev]')?.addEventListener('click', (e) => { e.preventDefault(); go(i - 1); });
    card.querySelector('[data-card-next]')?.addEventListener('click', (e) => { e.preventDefault(); go(i + 1); });
    dots.forEach((d, k) => d.addEventListener('click', (e) => { e.preventDefault(); go(k); }));

    // Swipe, for the phone where the arrows are hidden.
    let x0 = null;
    card.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    card.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    }, { passive: true });
  });
}

/* ── Accordions ────────────────────────────────────────────────────────── */
export function initAccordions() {
  document.querySelectorAll('[data-accordion] .accordion__item').forEach((item) => {
    const btn = item.querySelector('.accordion__btn');
    const sign = item.querySelector('.accordion__sign');
    btn?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (sign) sign.textContent = open ? '–' : '+';
    });
  });
}

/* ── Reveal on scroll ──────────────────────────────────────────────────── */
export function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -100px 0px' });
  targets.forEach((t) => io.observe(t));
}

/* ── Image fade-in ─────────────────────────────────────────────────────── */
export function initImages() {
  const mark = (im) => im.classList.add('is-loaded');
  document.querySelectorAll('.media img').forEach((im) => {
    if (im.complete && im.naturalWidth) mark(im);
    else im.addEventListener('load', () => mark(im), { once: true });
    im.addEventListener('error', () => mark(im), { once: true });
  });
}

/* ── Collection sorting ────────────────────────────────────────────────── */
export function initSort() {
  const select = document.querySelector('[data-sort]');
  const grid = document.querySelector('[data-grid]');
  if (!select || !grid) return;

  const cells = [...grid.children];
  const order = new Map(cells.map((c, i) => [c, i]));
  const priceOf = (c) => {
    const t = c.querySelector('.product__price')?.textContent ?? '';
    const m = t.match(/([\d.,]+)/);
    return m ? parseFloat(m[1].replace(/,/g, '')) : NaN;
  };
  const nameOf = (c) => c.querySelector('.product__title')?.textContent ?? '';

  select.addEventListener('change', () => {
    const mode = select.value;
    const sorted = [...cells].sort((a, b) => {
      if (mode === 'featured') return order.get(a) - order.get(b);
      if (mode === 'name') return nameOf(a).localeCompare(nameOf(b));
      const pa = priceOf(a); const pb = priceOf(b);
      // Cells with no price (quote blocks, furniture tiles) sink to the bottom
      // rather than sorting as zero.
      if (Number.isNaN(pa) && Number.isNaN(pb)) return order.get(a) - order.get(b);
      if (Number.isNaN(pa)) return 1;
      if (Number.isNaN(pb)) return -1;
      return mode === 'price-asc' ? pa - pb : pb - pa;
    });
    sorted.forEach((c) => grid.appendChild(c));
  });
}

/* ── Newsletter (demo: no backend, and it says so rather than pretend) ─── */
export function initNewsletter() {
  document.querySelectorAll('[data-newsletter]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.parentElement.querySelector('[data-newsletter-note]');
      const email = form.querySelector('input')?.value.trim();
      if (!note) return;
      note.hidden = false;
      note.textContent = email
        ? 'This is a demo — your address was not saved.'
        : 'Please enter an email address.';
      if (email) form.reset();
    });
  });
}
