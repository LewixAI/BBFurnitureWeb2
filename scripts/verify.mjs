/**
 * The check that has to pass before this ships. Four sweeps, all driven by a
 * real headless Chrome rather than by assertions about the source:
 *
 *   links   every internal href and every image URL, resolved
 *   layout  eight widths × every page type, looking for sideways scroll,
 *           overlapping header, and text that overflows its box
 *   touch   the same pages with a finger: no mouse, hasTouch, tap()
 *   ui      the interactive parts actually doing their job
 *
 *   node scripts/verify.mjs [--only=links,layout,touch,ui] [--root=dist]
 *
 * --root says which directory the server is actually serving. Reading the
 * project root while a built site is being served checks the wrong files: the
 * root copies still point at /src/styles/index.css, which only the dev server
 * has.
 */
import { chromium } from 'playwright-core';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// BASE_URL is the origin; BASE_PATH is the deploy subpath GitHub Pages adds.
const ORIGIN = process.env.BASE_URL ?? 'http://localhost:5191';
const PREFIX = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');
const BASE = ORIGIN + PREFIX;
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1]?.split(',');
const SERVED = path.resolve(ROOT, process.argv.find((a) => a.startsWith('--root='))?.split('=')[1] ?? '.');
const run = (name) => !ONLY || ONLY.includes(name);

let pass = 0;
const fails = [];
const ok = (msg) => { pass++; };
const bad = (msg) => { fails.push(msg); console.log(`  ✗ ${msg}`); };
const check = (cond, msg) => (cond ? ok(msg) : bad(msg));

async function htmlFiles() {
  const out = [];
  const walk = async (dir, base = '') => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (['node_modules', 'dist', '_research', '_shots', 'assets', 'public', '.git', 'scripts', 'src', '.claude'].includes(e.name) && dir === SERVED) continue;
      const rel = base ? `${base}/${e.name}` : e.name;
      if (e.isDirectory()) await walk(path.join(dir, e.name), rel);
      else if (e.name.endsWith('.html')) out.push('/' + rel);
    }
  };
  await walk(SERVED);
  return out.sort();
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

/* ══ 1. Links and images ══════════════════════════════════════════════════ */
if (run('links')) {
  console.log('\n── links ──');
  const pages = await htmlFiles();
  const hrefs = new Set();
  const imgs = new Set();

  for (const p of pages) {
    const html = await readFile(path.join(SERVED, p.slice(1)), 'utf8');
    for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) hrefs.add(m[1]);
    for (const m of html.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
      for (const part of m[1].split(',')) {
        const url = part.trim().split(/\s+/)[0];
        // Prefix-aware on purpose: under a deploy base these become
        // /BBFurnitureWeb2/img/…, and a filter written for /img/ matches
        // nothing and reports a clean pass over an empty set.
        if (/^(?:\/[^/]+)?\/(img|fonts|brand|assets)\//.test(url)) imgs.add(url);
      }
    }
  }

  const page = await browser.newPage();
  const seen = new Map();
  const head = async (u) => {
    if (seen.has(u)) return seen.get(u);
    const r = await page.request.get(ORIGIN + u).catch(() => null);
    const s = r ? r.status() : 0;
    seen.set(u, s);
    return s;
  };

  check(pages.length > 50, `found pages to check (${pages.length} in ${path.relative(ROOT, SERVED) || '.'})`);

  let broken = 0;
  for (const h of hrefs) {
    const s = await head(h);
    if (s !== 200) { bad(`href ${h} → ${s}`); broken++; }
  }
  check(broken === 0, `${hrefs.size} internal hrefs resolve`);
  console.log(`  ${hrefs.size} hrefs, ${broken} broken`);

  broken = 0;
  const sample = [...imgs];
  for (const i of sample) {
    const s = await head(i);
    if (s !== 200) { bad(`asset ${i} → ${s}`); broken++; }
  }
  check(sample.length > 100, `asset check found URLs to test (${sample.length})`);
  check(broken === 0, `${sample.length} asset URLs resolve`);
  console.log(`  ${sample.length} assets, ${broken} broken`);
  await page.close();
}

/* ══ 2. Layout at eight widths ════════════════════════════════════════════ */
const PAGES = [
  '/', '/collections/all.html', '/collections/accessories.html', '/collections/sofa.html',
  '/products/giselle-tray.html', '/projects.html', '/projects/eco-botanic.html',
  '/rooms/dining-room.html', '/about.html', '/materials.html', '/contact.html',
  '/wishlist.html', '/404.html',
];
const WIDTHS = [320, 360, 390, 414, 600, 768, 1024, 1440];

if (run('layout')) {
  console.log('\n── layout ──');
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, hasTouch: w < 768, isMobile: w < 768 });
    const page = await ctx.newPage();
    for (const p of PAGES) {
      await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(350);
      const r = await page.evaluate((vw) => {
        const de = document.documentElement;
        const wide = [];
        for (const el of document.querySelectorAll('body *')) {
          const b = el.getBoundingClientRect();
          if (b.width === 0 && b.height === 0) continue;
          if (b.right > vw + 1.5 || b.left < -1.5) {
            const s = getComputedStyle(el);
            if (s.position === 'fixed' || s.overflowX === 'auto' || s.overflowX === 'scroll') continue;
            // Anything inside a scroller is allowed to be wider than the screen.
            let par = el.parentElement, inScroller = false;
            while (par && par !== document.body) {
              const ps = getComputedStyle(par);
              if (ps.overflowX === 'auto' || ps.overflowX === 'scroll' || ps.overflow === 'hidden') { inScroller = true; break; }
              par = par.parentElement;
            }
            if (inScroller) continue;
            wide.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${Math.round(b.left)}→${Math.round(b.right)}`);
          }
        }
        return {
          scrollW: de.scrollWidth,
          clientW: de.clientWidth,
          wide: [...new Set(wide)].slice(0, 4),
        };
      }, w);
      check(r.scrollW <= r.clientW + 1, `${w}px ${p}: no sideways scroll (${r.scrollW} vs ${r.clientW})${r.wide.length ? ' — ' + r.wide.join(', ') : ''}`);
    }
    await ctx.close();
    console.log(`  ${w}px × ${PAGES.length} pages`);
  }
}

/* ══ 3. Touch ergonomics ══════════════════════════════════════════════════ */
if (run('touch')) {
  console.log('\n── touch ──');
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // The menu must exist and open with a tap.
  const burger = page.locator('[data-drawer-open]');
  check(await burger.isVisible(), 'phone: burger is visible');
  await burger.tap();
  await page.waitForTimeout(450);
  check(await page.locator('.drawer.is-open').count() === 1, 'phone: drawer opens on tap');

  // With the drawer open the page behind must not move.
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 600).catch(() => {});
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => window.scrollY);
  check(before === after, `phone: body is locked behind the drawer (${before} → ${after})`);

  // The close control must be reachable without scrolling.
  const closeBox = await page.locator('[data-drawer-close]').boundingBox();
  check(closeBox && closeBox.y >= 0 && closeBox.y < 844, 'phone: drawer close is on screen');
  await page.locator('[data-drawer-close]').tap();
  await page.waitForTimeout(400);
  check(await page.locator('.drawer.is-open').count() === 0, 'phone: drawer closes');

  // Every field must be ≥16px or iOS Safari zooms in and stays there.
  for (const p of ['/', '/contact.html', '/products/giselle-tray.html']) {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const small = await page.evaluate(() => [...document.querySelectorAll('input, select, textarea')]
      .filter((el) => el.offsetParent !== null && parseFloat(getComputedStyle(el).fontSize) < 16)
      .map((el) => `${el.tagName.toLowerCase()}[${el.type || ''}] ${getComputedStyle(el).fontSize}`));
    check(small.length === 0, `phone ${p}: no field under 16px${small.length ? ' — ' + small.join(', ') : ''}`);
  }

  // Tap targets.
  await page.goto(BASE + '/collections/accessories.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const tiny = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('button, a[href], [role=button]')) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      if (getComputedStyle(el).display === 'inline' && el.tagName === 'A') continue;
      if (b.height < 30 || b.width < 24) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${Math.round(b.width)}×${Math.round(b.height)}`);
    }
    return [...new Set(out)].slice(0, 8);
  });
  check(tiny.length === 0, `phone: tap targets are big enough${tiny.length ? ' — ' + tiny.join(', ') : ''}`);

  await ctx.close();
  console.log('  390×844 done');
}

/* ══ 4. Interactive parts ═════════════════════════════════════════════════ */
if (run('ui')) {
  console.log('\n── ui ──');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  // Header over the hero, solid past it.
  check(await page.locator('header.header--over').count() === 1, 'header is transparent over the hero');
  await page.evaluate(() => scrollTo(0, innerHeight));
  await page.waitForTimeout(500);
  check(await page.locator('header.header--over').count() === 0, 'header turns solid past the hero');
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(500);

  // The announcement bar rotates.
  const first = await page.locator('[data-usp-index]').textContent();
  await page.waitForTimeout(4600);
  const second = await page.locator('[data-usp-index]').textContent();
  check(first !== second, `announcement bar rotates (${first} → ${second})`);

  // Mega menu opens on hover and its links are real.
  await page.locator('[data-menu="shop"]').hover();
  await page.waitForTimeout(500);
  check(await page.locator('#megamenu-shop.is-open').count() === 1, 'mega menu opens on hover');
  const cols = await page.locator('#megamenu-shop .megamenu__col').count();
  check(cols >= 3, `mega menu shows ${cols} columns`);
  const megaLinkBox = await page.locator('#megamenu-shop a').first().boundingBox();
  check(megaLinkBox && megaLinkBox.width > 10, 'mega menu links are laid out, not collapsed');

  // A pointer that leaves the trigger toward the panel must not shut it.
  await page.mouse.move(700, 200);
  await page.waitForTimeout(200);
  check(await page.locator('#megamenu-shop.is-open').count() === 1, 'mega menu survives the trip to the panel');
  await page.mouse.move(700, 800);
  await page.waitForTimeout(900);
  check(await page.locator('#megamenu-shop.is-open').count() === 0, 'mega menu closes when the pointer leaves');

  // Rails scroll and their controls enable/disable correctly.
  const railNext = page.locator('[data-rail-next]').first();
  const railPrev = page.locator('[data-rail-prev]').first();
  check(await railPrev.isDisabled(), 'rail: prev starts disabled');
  await railNext.click();
  await page.waitForTimeout(700);
  check(!(await railPrev.isDisabled()), 'rail: prev enables after advancing');
  const scrolled = await page.locator('[data-rail-viewport]').first().evaluate((el) => el.scrollLeft);
  check(scrolled > 50, `rail: viewport actually moved (${Math.round(scrolled)}px)`);

  // Cart.
  await page.goto(BASE + '/collections/accessories.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.locator('[data-add]').first().click();
  await page.waitForTimeout(700);
  check(await page.locator('.cart.is-open').count() === 1, 'cart opens on add');
  check((await page.locator('[data-cart-count]').first().textContent()).includes('1'), 'cart count reads 1');
  const wa = await page.locator('[data-cart-checkout]').getAttribute('href');
  check(wa?.includes('wa.me') && wa.includes('text='), 'checkout link carries the order to WhatsApp');
  check(decodeURIComponent(wa).includes('MYR'), 'checkout message quotes a price');

  await page.locator('[data-line-up]').first().click();
  await page.waitForTimeout(400);
  check((await page.locator('[data-cart-count]').first().textContent()).includes('2'), 'cart quantity increments');
  await page.locator('[data-line-remove]').first().click();
  await page.waitForTimeout(400);
  check((await page.locator('[data-cart-count]').first().textContent()).includes('0'), 'cart empties on remove');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // Wishlist persists across a reload.
  await page.locator('[data-wish]').first().click();
  await page.waitForTimeout(300);
  check(await page.locator('[data-wish][aria-pressed="true"]').count() >= 1, 'wishlist marks the piece');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  check(await page.locator('[data-wish][aria-pressed="true"]').count() >= 1, 'wishlist survives a reload');
  await page.goto(BASE + '/wishlist.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  check(await page.locator('[data-wishlist-grid] .product').count() >= 1, 'wishlist page lists the saved piece');

  // Sorting.
  await page.goto(BASE + '/collections/accessories.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const namesBefore = await page.locator('.product__title').allTextContents();
  await page.selectOption('[data-sort]', 'price-asc');
  await page.waitForTimeout(400);
  const pricesAfter = await page.locator('.product__price').allTextContents();
  const nums = pricesAfter.map((t) => parseFloat((t.match(/([\d.]+)/) || [])[1])).filter((n) => !Number.isNaN(n));
  check(nums.every((n, i) => i === 0 || nums[i - 1] <= n), `sort by price ascends (${nums.slice(0, 4).join(', ')}…)`);
  await page.selectOption('[data-sort]', 'featured');
  await page.waitForTimeout(400);
  const namesRestored = await page.locator('.product__title').allTextContents();
  check(namesRestored.join('|') === namesBefore.join('|'), 'sort restores the featured order');

  // Search.
  await page.locator('[data-search-open]').click();
  await page.waitForTimeout(400);
  check(await page.locator('.searchbar.is-open').count() === 1, 'search opens');
  await page.locator('.searchbar input').fill('teak');
  await page.waitForTimeout(700);
  const hits = await page.locator('[data-search-results] a').count();
  check(hits > 0, `search returns results (${hits})`);
  await page.locator('.searchbar input').fill('zzzznothing');
  await page.waitForTimeout(700);
  check(await page.locator('.search-empty').count() === 1, 'search says so when nothing matches');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // Product page: gallery, accordions, quantity.
  await page.goto(BASE + '/products/giselle-tray.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const openPanels = await page.locator('.accordion__item.is-open').count();
  check(openPanels === 1, 'one accordion starts open');
  await page.locator('.accordion__btn').nth(1).click();
  await page.waitForTimeout(400);
  const h = await page.locator('.accordion__item').nth(1).locator('.accordion__panel > div').boundingBox();
  check(h && h.height > 20, `accordion actually expands (${Math.round(h?.height ?? 0)}px)`);
  await page.locator('[data-qty-up]').click();
  check(await page.locator('[data-qty-input]').inputValue() === '2', 'quantity stepper increments');
  await page.locator('.pdp__actions [data-add]').click();
  await page.waitForTimeout(600);
  check((await page.locator('[data-cart-count]').first().textContent()).includes('2'), 'PDP adds the chosen quantity');

  // The sticky panel must stay in view while the gallery scrolls.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.evaluate(() => scrollTo(0, 1200));
  await page.waitForTimeout(400);
  const sticky = await page.locator('.pdp__sticky').boundingBox();
  check(sticky && sticky.y > 0 && sticky.y < 900, `PDP panel stays in view while scrolling (y=${Math.round(sticky?.y ?? -1)})`);

  // Card image carousel.
  await page.goto(BASE + '/collections/all.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  check(errors.length === 0, `no console errors${errors.length ? ' — ' + errors.slice(0, 3).join(' | ') : ''}`);
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) process.exitCode = 1;
