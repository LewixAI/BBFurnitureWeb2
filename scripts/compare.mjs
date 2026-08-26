/**
 * Measures the same set of values on fermliving.com and on this build, then
 * prints the diff. Screenshots are how a rebuild convinces itself it is close;
 * this is how it finds out it is not.
 *
 *   node scripts/compare.mjs
 */
import { chromium } from 'playwright-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MINE = process.env.BASE_URL ?? 'http://localhost:5191';
const REF = 'https://fermliving.com';

const PROBE = () => {
  const one = (sel) => document.querySelector(sel);
  const px = (el, p) => (el ? getComputedStyle(el).getPropertyValue(p) : '—');
  const box = (sel) => { const e = one(sel); if (!e) return '—'; const r = e.getBoundingClientRect(); return `${Math.round(r.width)}×${Math.round(r.height)}`; };
  const type = (el) => {
    if (!el) return '—';
    const s = getComputedStyle(el);
    return `${s.fontSize}/${s.lineHeight} w${s.fontWeight}`;
  };
  const v = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '—';

  // Same meaning, different class names on each side.
  const pick = (...sels) => sels.map((s) => one(s)).find(Boolean) || null;

  const header = pick('header.header', 'header');
  const bar = pick('.header__bar', '[data-header-bar]');
  const nav = pick('.header__nav', '[data-header-nav]');
  const navLink = pick('.header__menu a', '.header__navigation a', '.nav a');
  const card = pick('.product-thumb__top', '.product__top');
  const cardTitle = pick('.product__title', '.product__information > div');
  const cardPrice = pick('.product__price', '.product__price.current');
  const cardBtn = pick('.product__buttons .btn', '.product-thumb__buttons button');
  const badge = pick('.certified', '.badge:not(.badge--dark)');
  const footUsp = pick('.footer__usps .t-h3', '.footer__top__item div');
  const footCol = pick('.footer__col h2', 'footer li.text-lg.font-medium > div');

  return {
    'body font': px(document.body, 'font-size') + '/' + px(document.body, 'line-height'),
    'body colour': px(document.body, 'color'),
    'page background': px(document.body, 'background-color'),
    'announcement height': bar ? Math.round(bar.getBoundingClientRect().height) + 'px' : '—',
    'announcement bg': px(bar, 'background-color'),
    'announcement type': type(pick('.usp__item', '.usp-text p')),
    'nav bg': px(nav, 'background-color'),
    'nav height': nav ? Math.round(nav.getBoundingClientRect().height) + 'px' : '—',
    'nav link type': type(navLink),
    'container max-width': px(pick('.limit'), 'max-width'),
    'container padding': px(pick('.limit'), 'padding-left'),
    'grid gap': px(pick('.grid-12', '.grid-12'), 'column-gap'),
    'card image ratio': px(card, 'aspect-ratio'),
    'card image bg': px(card, 'background-color'),
    'card gap': px(pick('.product__inner', '.product-thumb .flex.flex-col.gap-4'), 'gap'),
    'card title type': type(cardTitle),
    'card price type': type(cardPrice) + ' ' + px(cardPrice, 'text-transform'),
    'card price colour': px(cardPrice, 'color'),
    'button height': px(cardBtn, 'height'),
    'button padding-x': px(cardBtn, 'padding-left'),
    'button type': type(cardBtn),
    'button border': px(cardBtn, 'border-top-width') + ' ' + px(cardBtn, 'border-top-color'),
    'button radius': px(cardBtn, 'border-top-left-radius'),
    'button transition': px(cardBtn, 'transition-duration') + ' ' + px(cardBtn, 'transition-timing-function'),
    'badge type': type(badge) + ' ' + px(badge, 'text-transform'),
    'badge bg': px(badge, 'background-color'),
    'footer usp type': type(footUsp),
    'footer column type': type(footCol),
    'colour: black': v('--color-black'),
    'colour: cream': v('--color-cream'),
    'colour: canvas': v('--color-canvas'),
    'colour: price': v('--color-price'),
    'site max width': v('--site-max-width'),
  };
};

async function measure(browser, url, waitForCards) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4000);
  for (const s of ['#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection', '[aria-label*="lose" i]', '[class*="close" i]']) {
    const b = page.locator(s).first();
    if (await b.count().catch(() => 0)) { await b.click({ timeout: 1500, force: true }).catch(() => {}); await page.waitForTimeout(300); }
  }
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 200)); }
    scrollTo(0, 0); await new Promise((r) => setTimeout(r, 500));
  });
  const data = await page.evaluate(PROBE);
  await page.close();
  return data;
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ref = await measure(browser, `${REF}/collections/furniture`);
const mine = await measure(browser, `${MINE}/collections/accessories.html`);
await browser.close();

const norm = (s) => String(s).replace(/\s+/g, ' ').trim().toLowerCase()
  .replace(/rgb\((\d+), (\d+), (\d+)\)/, (m, r, g, b) => '#' + [r, g, b].map((n) => (+n).toString(16).padStart(2, '0')).join(''));

const keys = Object.keys(ref);
let same = 0;
const rows = [];
for (const k of keys) {
  const a = norm(ref[k]); const b = norm(mine[k]);
  const hit = a === b;
  if (hit) same++;
  rows.push(`${hit ? '  ' : '≠ '}${k.padEnd(22)} ref: ${String(ref[k]).padEnd(28)} mine: ${mine[k]}`);
}
console.log(rows.join('\n'));
console.log(`\n${same}/${keys.length} identical`);
