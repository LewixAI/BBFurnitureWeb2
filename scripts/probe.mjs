/**
 * Measure fermliving.com in a real headless Chrome and dump everything the
 * rebuild needs: tokens, type scale, layout, section order, fonts, animation.
 *
 *   node scripts/probe.mjs <url> <label> [--width=1440] [--mobile]
 *
 * Writes _research/<label>.json + _research/<label>.png (+ .full.png).
 */
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_research');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const [url, label = 'probe', ...rest] = process.argv.slice(2);
if (!url) { console.error('usage: probe.mjs <url> <label>'); process.exit(1); }
const mobile = rest.includes('--mobile');
const wArg = rest.find((a) => a.startsWith('--width='));
const width = mobile ? 390 : wArg ? +wArg.split('=')[1] : 1440;
const height = mobile ? 844 : 900;

const EXTRACT = () => {
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const pick = (el, props) => {
    const s = cs(el); if (!s) return null;
    const o = {}; for (const p of props) o[p] = s.getPropertyValue(p); return o;
  };
  const TYPO = ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
    'text-transform', 'color', 'margin', 'padding'];
  const BOX = ['width', 'height', 'max-width', 'padding', 'margin', 'background-color',
    'border', 'border-radius', 'display', 'gap', 'grid-template-columns',
    'position', 'top', 'z-index', 'transition'];

  const sel = (s) => document.querySelector(s);
  const all = (s) => [...document.querySelectorAll(s)];

  // ── CSS custom properties declared on :root / html / body ────────────────
  const vars = {};
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules || []) {
      if (r.type !== 1) continue;
      if (!/^(:root|html|body)\b/.test(r.selectorText || '')) continue;
      for (const p of r.style) if (p.startsWith('--')) vars[p] = r.style.getPropertyValue(p).trim();
    }
  }

  // ── Fonts actually used ──────────────────────────────────────────────────
  const faces = [];
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules || []) {
      if (r.type === 5) faces.push({
        family: r.style.fontFamily, weight: r.style.fontWeight,
        style: r.style.fontStyle, src: (r.style.src || '').slice(0, 300),
      });
    }
  }
  const usedFamilies = {};
  for (const el of all('body *')) {
    const s = getComputedStyle(el);
    if (!el.textContent?.trim()) continue;
    const k = `${s.fontFamily} | ${s.fontWeight} | ${s.fontSize} | ${s.lineHeight} | ${s.letterSpacing} | ${s.textTransform}`;
    usedFamilies[k] = (usedFamilies[k] || 0) + 1;
  }

  // ── Section order: direct children of main, with heights + first heading ─
  const main = sel('main') || sel('#MainContent') || document.body;
  const sections = [...main.children].map((el, i) => {
    const r = el.getBoundingClientRect();
    const h = el.querySelector('h1,h2,h3,[class*=heading],[class*=title]');
    const imgs = el.querySelectorAll('img,video,picture');
    return {
      i, tag: el.tagName.toLowerCase(), id: el.id || null,
      cls: (el.className && String(el.className).slice(0, 160)) || null,
      height: Math.round(r.height), width: Math.round(r.width),
      heading: h?.textContent?.trim().slice(0, 120) || null,
      media: imgs.length,
      text: el.textContent?.replace(/\s+/g, ' ').trim().slice(0, 260) || null,
      bg: getComputedStyle(el).backgroundColor,
      pad: getComputedStyle(el).padding,
    };
  });

  // ── Type scale: every distinct heading + paragraph ───────────────────────
  const type = {};
  for (const t of ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'a', 'button', 'li', 'small', 'label']) {
    const el = all(t).find((e) => e.textContent?.trim() && e.getBoundingClientRect().height > 0);
    if (el) type[t] = { ...pick(el, TYPO), sample: el.textContent.trim().slice(0, 80) };
  }

  // ── Header ───────────────────────────────────────────────────────────────
  const header = sel('header') || sel('[class*=header]');
  const navLinks = header ? [...header.querySelectorAll('a')].map((a) => ({
    text: a.textContent.replace(/\s+/g, ' ').trim().slice(0, 60), href: a.getAttribute('href'),
    ...pick(a, ['font-size', 'font-weight', 'letter-spacing', 'text-transform', 'font-family']),
  })).filter((a) => a.text) : [];

  // ── Footer ───────────────────────────────────────────────────────────────
  const footer = sel('footer') || sel('[class*=footer]');
  const footerCols = footer ? [...footer.querySelectorAll('ul,nav,div[class*=col],div[class*=block]')]
    .slice(0, 20).map((c) => c.textContent.replace(/\s+/g, ' ').trim().slice(0, 200)).filter(Boolean) : [];

  // ── Product cards ────────────────────────────────────────────────────────
  const cardSel = ['[class*=product-card]', '[class*=ProductCard]', '[class*=product-item]',
    '[class*=productItem]', 'li[class*=product]', '[data-product-card]', 'article'];
  let cards = [];
  for (const s of cardSel) { const c = all(s); if (c.length > 3) { cards = c; break; } }
  const card = cards[0];
  const cardInfo = card ? {
    count: cards.length,
    selector: card.className && String(card.className).slice(0, 120),
    box: pick(card, BOX),
    img: pick(card.querySelector('img'), ['width', 'height', 'object-fit', 'aspect-ratio', 'border-radius', 'background-color']),
    imgSrc: card.querySelector('img')?.currentSrc?.slice(0, 200) || null,
    title: pick(card.querySelector('h2,h3,h4,[class*=title],[class*=name]'), TYPO),
    price: pick(card.querySelector('[class*=price]'), TYPO),
    text: card.textContent.replace(/\s+/g, ' ').trim().slice(0, 200),
    grid: card.parentElement ? pick(card.parentElement, ['display', 'grid-template-columns', 'gap', 'column-gap', 'row-gap', 'max-width', 'padding']) : null,
  } : null;

  // ── Containers: the widest repeated max-width ────────────────────────────
  const widths = {};
  for (const el of all('div,section,main,header,footer')) {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 200) continue;
    const key = Math.round(r.width);
    widths[key] = (widths[key] || 0) + 1;
    if (s.maxWidth !== 'none') widths['max:' + s.maxWidth] = (widths['max:' + s.maxWidth] || 0) + 1;
  }
  const topWidths = Object.entries(widths).sort((a, b) => b[1] - a[1]).slice(0, 18);

  // ── Colours in use ───────────────────────────────────────────────────────
  const colors = {};
  for (const el of all('body *')) {
    const s = getComputedStyle(el);
    for (const k of ['color', 'backgroundColor', 'borderTopColor']) {
      const v = s[k];
      if (!v || v === 'rgba(0, 0, 0, 0)' || v === 'transparent') continue;
      colors[v] = (colors[v] || 0) + 1;
    }
  }
  const topColors = Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 24);

  // ── Radii / shadows / transitions in use ─────────────────────────────────
  const misc = { radius: {}, shadow: {}, transition: {} };
  for (const el of all('body *')) {
    const s = getComputedStyle(el);
    if (s.borderRadius && s.borderRadius !== '0px') misc.radius[s.borderRadius] = (misc.radius[s.borderRadius] || 0) + 1;
    if (s.boxShadow && s.boxShadow !== 'none') misc.shadow[s.boxShadow.slice(0, 60)] = (misc.shadow[s.boxShadow.slice(0, 60)] || 0) + 1;
    if (s.transition && s.transition !== 'all 0s ease 0s') misc.transition[s.transition.slice(0, 80)] = (misc.transition[s.transition.slice(0, 80)] || 0) + 1;
  }
  const top = (o, n = 10) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);

  return {
    url: location.href, title: document.title,
    meta: {
      description: sel('meta[name=description]')?.content,
      og: sel('meta[property="og:image"]')?.content,
    },
    vars, faces: faces.slice(0, 40),
    usedType: top(usedFamilies, 30),
    html: pick(document.documentElement, ['font-size', 'background-color', 'color']),
    body: pick(document.body, ['font-family', 'font-size', 'line-height', 'letter-spacing', 'color', 'background-color']),
    header: header ? { box: pick(header, BOX), links: navLinks.slice(0, 40) } : null,
    sections, type, cardInfo,
    footer: footer ? { box: pick(footer, BOX), cols: footerCols } : null,
    topWidths, topColors,
    radius: top(misc.radius), shadow: top(misc.shadow), transition: top(misc.transition),
    headings: [...document.querySelectorAll('h1,h2,h3')].slice(0, 40).map((h) => ({
      tag: h.tagName, text: h.textContent.replace(/\s+/g, ' ').trim().slice(0, 120),
      ...pick(h, ['font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform', 'font-family']),
    })),
    scrollHeight: document.documentElement.scrollHeight,
  };
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({
  viewport: { width, height }, deviceScaleFactor: 1,
  userAgent: mobile ? undefined : undefined,
  locale: 'en-US',
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch((e) => console.error('nav:', e.message));
await page.waitForTimeout(2500);

// Dismiss cookie/consent/newsletter overlays so they do not sit on top of every
// screenshot. Close buttons first — an "accept" click on a newsletter modal
// subscribes rather than dismisses.
for (const s of ['#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection', '#CybotCookiebotDialogBodyButtonDecline', '#CybotCookiebotDialogBodyLevelButtonCustomize ~ button', '[aria-label*="lose" i]', '[class*="close" i]', 'button:has-text("×")',
  '#onetrust-accept-btn-handler', 'button:has-text("Accept")', 'button:has-text("Allow all")']) {
  const b = page.locator(s).first();
  if (await b.count().catch(() => 0)) { await b.click({ timeout: 2000, force: true }).catch(() => {}); await page.waitForTimeout(500); }
}
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(600);

await page.screenshot({ path: path.join(OUT, `${label}.png`) });

// Scroll the whole page so lazy media loads, then shoot full-page.
await page.evaluate(async () => {
  const step = innerHeight * 0.8;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    scrollTo(0, y); await new Promise((r) => setTimeout(r, 260));
  }
  scrollTo(0, 0); await new Promise((r) => setTimeout(r, 500));
});
const data = await page.evaluate(EXTRACT);
await page.screenshot({ path: path.join(OUT, `${label}.full.png`), fullPage: true });

await writeFile(path.join(OUT, `${label}.json`), JSON.stringify(data, null, 2));
console.log(`${label}: ${data.title} — ${data.sections.length} sections, ${data.scrollHeight}px tall`);
await browser.close();
