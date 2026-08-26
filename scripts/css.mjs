/**
 * Print the full computed style of the first match of each selector, filtered
 * to the properties that carry design intent.
 *
 *   node scripts/css.mjs <url> "<sel>" ...
 */
import { chromium } from 'playwright-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, ...sels] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(4000);
for (const s of ['#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection', '#CybotCookiebotDialogBodyButtonDecline', '#CybotCookiebotDialogBodyLevelButtonCustomize ~ button', '[aria-label*="lose" i]', '[class*="close" i]']) {
  const b = page.locator(s).first();
  if (await b.count().catch(() => 0)) { await b.click({ timeout: 1500, force: true }).catch(() => {}); await page.waitForTimeout(300); }
}
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
  scrollTo(0, 0); await new Promise((r) => setTimeout(r, 300));
});
const res = await page.evaluate((sels) => {
  const KEEP = /^(color|background|border|font|line-height|letter-spacing|text-|padding|margin|width|height|max-|min-|display|grid|flex|gap|align|justify|opacity|transition|transform|box-shadow|object-|aspect|position|top|left|right|bottom|z-index|overflow|cursor|white-space|writing)/;
  const SKIP = /(image-source|image-slice|image-repeat|image-outset|block-start|block-end|inline-start|inline-end|font-variant|font-feature|font-kerning|font-optical|font-language|font-palette|font-synthesis|text-emphasis|text-decoration-thickness|text-underline|text-orientation|text-combine|text-size|text-rendering|background-blend|background-attachment|background-origin|background-clip|transition-behavior)/;
  const out = {};
  for (const sel of sels) {
    const el = document.querySelector(sel);
    if (!el) { out[sel] = 'NOT FOUND'; continue; }
    const s = getComputedStyle(el); const o = {};
    for (const p of s) {
      if (!KEEP.test(p) || SKIP.test(p)) continue;
      const v = s.getPropertyValue(p);
      if (!v || v === 'none' || v === 'normal' || v === 'auto' || v === '0px' || v === 'rgba(0, 0, 0, 0)' || v === 'static' || v === '0s' || v === 'visible') continue;
      o[p] = v;
    }
    const r = el.getBoundingClientRect();
    o._rect = `${Math.round(r.width)}x${Math.round(r.height)}`;
    o._text = el.textContent.replace(/\s+/g, ' ').trim().slice(0, 60);
    out[sel] = o;
  }
  return out;
}, sels);
console.log(JSON.stringify(res, null, 1));
await browser.close();
