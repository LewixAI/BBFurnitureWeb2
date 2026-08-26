import { lock, unlock } from './scroll-lock.js';

const BAR = 32;

/* ── The rotating announcement bar ─────────────────────────────────────── */
function usp(root) {
  const items = [...root.querySelectorAll('[data-usp-item]')];
  const counter = root.querySelector('[data-usp-index]');
  if (items.length < 2) return;
  const speed = Number(root.dataset.speed) || 4000;
  let i = 0;
  let timer;

  const show = (next) => {
    items[i].classList.remove('is-in');
    items[i].classList.add('is-out');
    items[i].setAttribute('aria-hidden', 'true');
    const prev = i;
    i = next;
    setTimeout(() => items[prev].classList.remove('is-out'), 320);
    items[i].classList.add('is-in');
    items[i].removeAttribute('aria-hidden');
    if (counter) counter.textContent = String(i + 1);
  };

  const start = () => { timer = setInterval(() => show((i + 1) % items.length), speed); };
  const stop = () => clearInterval(timer);

  items.forEach((el, n) => { if (n !== 0) el.setAttribute('aria-hidden', 'true'); });
  start();
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}

/* ── Mega menu ─────────────────────────────────────────────────────────── */
function megamenus(header) {
  const nav = header.querySelector('.header__nav');
  const triggers = [...header.querySelectorAll('[data-menu]')];
  if (!triggers.length) return;
  let openId = null;
  let leaveTimer;

  const close = () => {
    if (!openId) return;
    header.querySelector(`#megamenu-${openId}`)?.classList.remove('is-open');
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    header.classList.remove('is-menu-open');
    openId = null;
  };

  const open = (id) => {
    if (openId === id) return;
    close();
    const panel = header.querySelector(`#megamenu-${id}`);
    if (!panel) return;
    panel.classList.add('is-open');
    header.querySelector(`[data-menu="${id}"]`)?.setAttribute('aria-expanded', 'true');
    header.classList.add('is-menu-open');
    openId = id;
  };

  triggers.forEach((t) => {
    t.setAttribute('aria-haspopup', 'true');
    t.setAttribute('aria-expanded', 'false');
    // pointerenter opens; the click that follows must not immediately close it,
    // so the link keeps working and the panel simply stays.
    t.addEventListener('pointerenter', () => { clearTimeout(leaveTimer); open(t.dataset.menu); });
    t.addEventListener('focus', () => open(t.dataset.menu));
  });

  // A 500ms tolerance so crossing the gap between trigger and panel is forgiving.
  nav.addEventListener('pointerleave', () => { leaveTimer = setTimeout(close, 500); });
  nav.addEventListener('pointerenter', () => clearTimeout(leaveTimer));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* ── Sticky behaviour + transparency over a hero ───────────────────────── */
function sticky(header) {
  const over = header.classList.contains('header--over');
  const hero = document.querySelector('.hero');
  let last = window.scrollY;
  let ticking = false;

  const apply = () => {
    const y = window.scrollY;
    header.classList.toggle('is-bar-hidden', y > BAR);

    if (over && hero) {
      // Turn solid once the hero has scrolled past the header. `header` is
      // only 32px tall — its nav row is absolutely positioned — so measuring it
      // would fire the swap 70px late; the token is the real height.
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header'), 10) || 101;
      const solid = y > hero.offsetHeight - headerH;
      header.classList.toggle('header--over', !solid);
    }
    last = y;
    ticking = false;
  };

  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  }, { passive: true });
  apply();
}

/* ── Overlay panels: drawer, cart, search ──────────────────────────────── */
export function panel(el, { onOpen, onClose } = {}) {
  const scrim = document.querySelector('[data-scrim]');
  let open = false;

  const setOpen = (next) => {
    if (next === open) return;
    open = next;
    if (open) {
      el.hidden = false;
      if (scrim) scrim.hidden = false;
      // Force a frame so the transition runs from the closed state.
      requestAnimationFrame(() => {
        el.classList.add('is-open');
        scrim?.classList.add('is-open');
      });
      lock();
      onOpen?.();
      el.querySelector('button, a, input')?.focus({ preventScroll: true });
    } else {
      el.classList.remove('is-open');
      scrim?.classList.remove('is-open');
      unlock();
      onClose?.();
      setTimeout(() => {
        if (!el.classList.contains('is-open')) {
          el.hidden = true;
          if (scrim && !document.querySelector('.drawer.is-open, .cart.is-open, .searchbar.is-open')) scrim.hidden = true;
        }
      }, 320);
    }
  };

  scrim?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setOpen(false); });
  return { open: () => setOpen(true), close: () => setOpen(false), get isOpen() { return open; } };
}

/* ── Mobile drawer ─────────────────────────────────────────────────────── */
function drawer() {
  const el = document.querySelector('[data-drawer]');
  if (!el) return;
  const p = panel(el);
  document.querySelector('[data-drawer-open]')?.addEventListener('click', p.open);
  el.querySelector('[data-drawer-close]')?.addEventListener('click', p.close);

  el.querySelectorAll('[data-drawer-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.closest('[data-drawer-group]');
      const nowOpen = !group.classList.contains('is-open');
      group.classList.toggle('is-open', nowOpen);
      btn.setAttribute('aria-expanded', String(nowOpen));
      btn.lastElementChild.textContent = nowOpen ? '–' : '+';
    });
  });
  el.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', p.close));
}

/* ── Search ────────────────────────────────────────────────────────────── */
async function search() {
  const el = document.querySelector('[data-search]');
  if (!el) return;
  const p = panel(el);
  const openBtn = document.querySelector('[data-search-open]');
  const input = el.querySelector('input[type=search]');
  const out = el.querySelector('[data-search-results]');

  openBtn?.addEventListener('click', () => {
    p.open();
    setTimeout(() => input?.focus(), 60);
  });
  el.querySelector('[data-search-close]')?.addEventListener('click', p.close);
  el.querySelector('form')?.addEventListener('submit', (e) => e.preventDefault());

  let index = null;
  const load = async () => {
    if (index) return index;
    index = await fetch(`${import.meta.env.BASE_URL}search-index.json`).then((r) => r.json()).catch(() => []);
    return index;
  };

  let t;
  input?.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(async () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) { out.innerHTML = ''; return; }
      const data = await load();
      const hits = data.filter((d) => d.text.includes(q)).slice(0, 8);
      out.innerHTML = hits.length
        ? hits.map((h) => `<a href="${h.href}">
            <div class="media"><img src="${h.img}" alt="" width="56" height="72" loading="lazy" class="is-loaded"></div>
            <div><div style="font-weight:500">${h.title}</div><div class="t-price">${h.meta}</div></div>
          </a>`).join('')
        : `<p class="search-empty">Nothing matches “${q}”.</p>`;
    }, 140);
  });
}

export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const bar = header.querySelector('[data-usp]');
  if (bar) usp(bar);
  megamenus(header);
  sticky(header);
  drawer();
  search();
}
