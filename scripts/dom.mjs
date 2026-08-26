/**
 * Dump the real markup + computed geometry of named parts of a page, so the
 * rebuild copies structure rather than a guess at it.
 *
 *   node scripts/dom.mjs <url> <label> "<sel>" "<sel>" ...
 */
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_research');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const [url, label, ...sels] = process.argv.slice(2);
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(4000);
for (const s of ['#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection', '#CybotCookiebotDialogBodyButtonDecline', '#CybotCookiebotDialogBodyLevelButtonCustomize ~ button', '[aria-label*="lose" i]', '[class*="close" i]', '#onetrust-accept-btn-handler']) {
  const b = page.locator(s).first();
  if (await b.count().catch(() => 0)) { await b.click({ timeout: 1500, force: true }).catch(() => {}); await page.waitForTimeout(400); }
}
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) {
    scrollTo(0, y); await new Promise((r) => setTimeout(r, 200));
  }
  scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400));
});

const out = await page.evaluate((sels) => {
  const PROPS = ['display', 'grid-template-columns', 'flex-direction', 'gap', 'column-gap', 'row-gap',
    'width', 'height', 'max-width', 'min-height', 'aspect-ratio', 'padding', 'margin',
    'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform',
    'color', 'background-color', 'border', 'border-radius', 'object-fit', 'position',
    'align-items', 'justify-content', 'text-align', 'opacity', 'overflow', 'transition', 'transform'];
  const geo = (el) => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect(), o = {};
    for (const p of PROPS) { const v = s.getPropertyValue(p); if (v && v !== 'normal' && v !== 'none' && v !== 'auto' && v !== '0px') o[p] = v; }
    o._rect = { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y + scrollY) };
    return o;
  };
  const res = {};
  for (const sel of sels) {
    const els = [...document.querySelectorAll(sel)];
    res[sel] = {
      count: els.length,
      first: els[0] ? {
        html: els[0].outerHTML.slice(0, 6000),
        css: geo(els[0]),
        parentCss: els[0].parentElement ? geo(els[0].parentElement) : null,
        children: [...els[0].children].slice(0, 12).map((c) => ({
          tag: c.tagName.toLowerCase(), cls: String(c.className).slice(0, 120),
          text: c.textContent.replace(/\s+/g, ' ').trim().slice(0, 100), css: geo(c),
        })),
      } : null,
    };
  }
  return res;
}, sels);

await writeFile(path.join(OUT, `${label}.dom.json`), JSON.stringify(out, null, 2));
for (const [k, v] of Object.entries(out)) console.log(`${k} → ${v.count}`);
await browser.close();
