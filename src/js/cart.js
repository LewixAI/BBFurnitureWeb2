/**
 * Cart and wishlist, both in localStorage. The demo checkout opens a WhatsApp
 * chat with FF Dev Studio carrying the lines and the total, so the Add to Cart
 * button does something real rather than being a decoration.
 */
import { panel } from './header.js';

const KEY = 'ff-cart';
const WISH = 'ff-wishlist';
const WA = 'https://wa.me/60139078719';

const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

const money = (n) => `MYR ${n.toFixed(2)}`;

let catalogue = {};
let cart = read(KEY);
let wishlist = read(WISH);

function toast(msg) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-open');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('is-open'), 2400);
}

function total() {
  return cart.reduce((sum, l) => sum + (catalogue[l.slug]?.price || 0) * l.qty, 0);
}

function renderCart() {
  const body = document.querySelector('[data-cart-body]');
  const count = document.querySelectorAll('[data-cart-count]');
  const sum = document.querySelector('[data-cart-total]');
  const n = cart.reduce((a, l) => a + l.qty, 0);
  count.forEach((c) => { c.textContent = `(${n})`; });
  if (sum) sum.textContent = money(total());
  if (!body) return;

  if (!cart.length) {
    body.innerHTML = '<p class="cart__empty">Your cart is empty.</p>';
  } else {
    body.innerHTML = cart.map((l) => {
      const p = catalogue[l.slug];
      if (!p) return '';
      return `<div class="cart__line">
        <div class="media"><img src="${p.thumb}" alt="" width="80" height="106" class="is-loaded"></div>
        <div style="flex:1;min-width:0">
          <h3>${p.name}</h3>
          <div class="t-price">${money(p.price)}</div>
          <div class="cart__qty">
            <button type="button" data-line-down="${l.slug}" aria-label="Decrease">–</button>
            <span>${l.qty}</span>
            <button type="button" data-line-up="${l.slug}" aria-label="Increase">+</button>
            <button type="button" class="cart__remove" data-line-remove="${l.slug}">Remove</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  const checkout = document.querySelector('[data-cart-checkout]');
  if (checkout) {
    const lines = cart.map((l) => {
      const p = catalogue[l.slug];
      return p ? `• ${l.qty} × ${p.name} — ${money(p.price * l.qty)}` : '';
    }).filter(Boolean);
    const text = lines.length
      ? `Demo order — FF Furniture\n${lines.join('\n')}\n\nTotal: ${money(total())}`
      : 'Demo order — FF Furniture\n\nNo items yet.';
    checkout.href = `${WA}?text=${encodeURIComponent(text)}`;
  }
}

function renderWishlist() {
  document.querySelectorAll('[data-wish]').forEach((b) => {
    b.setAttribute('aria-pressed', String(wishlist.includes(b.dataset.wish)));
  });
  const label = document.querySelector('[data-wishlist-count]');
  if (label) label.textContent = wishlist.length ? ` (${wishlist.length})` : '';

  const grid = document.querySelector('[data-wishlist-grid]');
  const empty = document.querySelector('[data-wishlist-empty]');
  if (!grid) return;
  const items = wishlist.map((s) => catalogue[s]).filter(Boolean);
  if (empty) empty.hidden = items.length > 0;
  grid.innerHTML = items.map((p) => `
    <div class="product">
      <div class="product__inner">
        <div class="product__top">
          <div class="product__gallery"><div class="media is-current"><img src="${p.thumb}" alt="${p.name}" class="is-loaded"></div></div>
          <a href="${p.href}"><span class="sr-only">${p.name}</span></a>
          <button class="wish" data-wish="${p.slug}" aria-pressed="true" aria-label="Remove from wishlist">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 20.5S3.5 15.2 3.5 9.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.6c0 5.6-8.5 10.9-8.5 10.9Z"/></svg>
          </button>
        </div>
        <div class="product__info"><a href="${p.href}">
          <div class="product__title">${p.name}</div>
          <div class="product__price t-price">${p.price != null ? money(p.price) : 'Price on request'}</div>
        </a></div>
        <div class="product__buttons">${p.price != null ? `<button class="btn btn--block" data-add="${p.slug}">+ Add to Cart</button>` : `<a class="btn btn--block" href="${p.href}">Enquire</a>`}</div>
      </div>
    </div>`).join('');
  bindWish();
}

function add(slug, qty = 1) {
  const line = cart.find((l) => l.slug === slug);
  if (line) line.qty += qty; else cart.push({ slug, qty });
  write(KEY, cart);
  renderCart();
  toast(`${catalogue[slug]?.name ?? 'Item'} added to cart`);
}

function bindWish() {
  document.querySelectorAll('[data-wish]').forEach((b) => {
    if (b._bound) return;
    b._bound = true;
    b.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = b.dataset.wish;
      wishlist = wishlist.includes(slug) ? wishlist.filter((s) => s !== slug) : [...wishlist, slug];
      write(WISH, wishlist);
      renderWishlist();
      toast(wishlist.includes(slug) ? 'Saved to wishlist' : 'Removed from wishlist');
    });
  });
}

export async function initCart() {
  catalogue = await fetch(`${import.meta.env.BASE_URL}catalogue.json`).then((r) => r.json()).catch(() => ({}));

  const el = document.querySelector('[data-cart]');
  const p = el ? panel(el) : null;
  document.querySelector('[data-cart-open]')?.addEventListener('click', () => p?.open());
  el?.querySelector('[data-cart-close]')?.addEventListener('click', () => p?.close());

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      e.preventDefault();
      const qtyInput = document.querySelector('[data-qty-input]');
      const qty = addBtn.closest('.pdp__actions') && qtyInput ? Math.max(1, Number(qtyInput.value) || 1) : 1;
      add(addBtn.dataset.add, qty);
      p?.open();
      return;
    }
    const up = e.target.closest('[data-line-up]');
    const down = e.target.closest('[data-line-down]');
    const rm = e.target.closest('[data-line-remove]');
    if (up || down || rm) {
      const slug = (up || down || rm).dataset.lineUp || (up || down || rm).dataset.lineDown || (up || down || rm).dataset.lineRemove;
      const line = cart.find((l) => l.slug === slug);
      if (!line) return;
      if (up) line.qty += 1;
      if (down) line.qty -= 1;
      if (rm || line.qty < 1) cart = cart.filter((l) => l.slug !== slug);
      write(KEY, cart);
      renderCart();
    }
  });

  // PDP quantity stepper
  const qtyInput = document.querySelector('[data-qty-input]');
  document.querySelector('[data-qty-up]')?.addEventListener('click', () => {
    qtyInput.value = Math.min(99, Number(qtyInput.value || 1) + 1);
  });
  document.querySelector('[data-qty-down]')?.addEventListener('click', () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value || 1) - 1);
  });

  bindWish();
  renderCart();
  renderWishlist();
}
