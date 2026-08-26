/**
 * Viewport screenshots taken while scrolling. fullPage stitching lies on pages
 * with fixed headers and 100vh sections, so shoot what a person would see.
 *
 *   node scripts/scrollshots.mjs <url> <label> [count] [--width=1440] [--mobile]
 */
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, label, countArg = '10', ...rest] = process.argv.slice(2);
const outDir = rest.find((a) => a.startsWith('--out='))?.split('=')[1] ?? '_research';
const OUT = path.join(ROOT, outDir);
const mobile = rest.includes('--mobile');
const wArg = rest.find((a) => a.startsWith('--width='));
const width = mobile ? 390 : wArg ? +wArg.split('=')[1] : 1440;
const height = mobile ? 844 : 900;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({
  viewport: { width, height }, deviceScaleFactor: 1,
  hasTouch: mobile, isMobile: mobile,
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(4500);
for (const s of ['#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection', '#CybotCookiebotDialogBodyButtonDecline', '#CybotCookiebotDialogBodyLevelButtonCustomize ~ button', '[aria-label*="lose" i]', '[class*="close" i]', '#onetrust-accept-btn-handler']) {
  const b = page.locator(s).first();
  if (await b.count().catch(() => 0)) { await b.click({ timeout: 1500, force: true }).catch(() => {}); await page.waitForTimeout(400); }
}
// Warm every lazy image before shooting, then come back to the top.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.75) {
    scrollTo(0, y); await new Promise((r) => setTimeout(r, 250));
  }
  scrollTo(0, 0); await new Promise((r) => setTimeout(r, 800));
});

const total = await page.evaluate(() => document.body.scrollHeight);
const n = Math.min(+countArg, Math.ceil(total / height));
for (let i = 0; i < n; i++) {
  const y = Math.round(i * height * 0.92);
  await page.evaluate((y) => scrollTo(0, y), y);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, `${label}-${String(i).padStart(2, '0')}.png`) });
}
console.log(`${label}: ${n} shots @ ${width}x${height}, page ${total}px`);
await browser.close();
