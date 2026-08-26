/**
 * Indented structural outline of a subtree, with the computed styles that
 * actually matter for a rebuild. SVG innards are collapsed to a single line so
 * a logo does not eat the whole dump.
 *
 *   node scripts/tree.mjs <url> <label> "<rootSel>" [depth]
 */
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_research');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, label, rootSel, depthArg = '6', ...rest] = process.argv.slice(2);
const hover = rest.find((a) => a.startsWith('--hover='))?.split('=')[1];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(4500);
for (const s of ['#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection', '#CybotCookiebotDialogBodyButtonDecline', '#CybotCookiebotDialogBodyLevelButtonCustomize ~ button', '[aria-label*="lose" i]', '[class*="close" i]', '#onetrust-accept-btn-handler']) {
  const b = page.locator(s).first();
  if (await b.count().catch(() => 0)) { await b.click({ timeout: 1500, force: true }).catch(() => {}); await page.waitForTimeout(400); }
}
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) {
    scrollTo(0, y); await new Promise((r) => setTimeout(r, 180));
  }
  scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400));
});
if (hover) { await page.locator(hover).first().hover({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(900); }

const text = await page.evaluate(({ rootSel, depth }) => {
  const root = document.querySelector(rootSel);
  if (!root) return `NOT FOUND: ${rootSel}`;
  const lines = [];
  const walk = (el, d) => {
    if (d > depth) return;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (s.display === 'none') { lines.push('  '.repeat(d) + `[hidden] ${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')}`); return; }
    const tag = el.tagName.toLowerCase();
    if (tag === 'svg') { lines.push('  '.repeat(d) + `<svg> ${Math.round(r.width)}x${Math.round(r.height)} fill=${s.fill} viewBox=${el.getAttribute('viewBox')}`); return; }
    const cls = String(el.className?.baseVal ?? el.className ?? '').split(/\s+/).filter(Boolean).slice(0, 6).join(' ');
    const bits = [`${Math.round(r.width)}x${Math.round(r.height)}`];
    if (s.display !== 'block' && s.display !== 'inline') bits.push(s.display);
    if (s.gridTemplateColumns !== 'none') bits.push(`cols:${s.gridTemplateColumns}`);
    if (s.gap !== 'normal' && s.gap !== '0px') bits.push(`gap:${s.gap}`);
    if (s.padding !== '0px') bits.push(`p:${s.padding}`);
    if (s.margin !== '0px') bits.push(`m:${s.margin}`);
    if (s.maxWidth !== 'none') bits.push(`max:${s.maxWidth}`);
    if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') bits.push(`bg:${s.backgroundColor}`);
    if (s.position !== 'static') bits.push(s.position);
    if (s.aspectRatio !== 'auto') bits.push(`ar:${s.aspectRatio}`);
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).filter(Boolean).join(' ');
    if (own) bits.push(`"${own.slice(0, 70)}" ${s.fontFamily.split(',')[0]} ${s.fontSize}/${s.lineHeight} w${s.fontWeight} ls${s.letterSpacing} ${s.textTransform} ${s.color}`);
    if (tag === 'img') bits.push(`fit:${s.objectFit} src:${(el.currentSrc || el.src || '').split('/').pop()?.slice(0, 60)}`);
    if (tag === 'a') bits.push(`href=${el.getAttribute('href')}`);
    lines.push('  '.repeat(d) + `${tag}${cls ? '.' + cls.replace(/\s+/g, '.') : ''} — ${bits.join(' | ')}`);
    for (const c of el.children) walk(c, d + 1);
  };
  walk(root, 0);
  return lines.join('\n');
}, { rootSel, depth: +depthArg });

await writeFile(path.join(OUT, `${label}.tree.txt`), text);
console.log(text.slice(0, 200));
console.log('... lines:', text.split('\n').length);
await browser.close();
