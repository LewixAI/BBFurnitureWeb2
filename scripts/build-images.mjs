/**
 * Turns assets/library/ (originals, up to 24 MB each) into responsive
 * derivatives under public/img/, keeping the semantic path:
 *
 *   assets/library/product/giselle-tray.jpg
 *     → public/img/product/giselle-tray-{400,640,900,1280,1800}.{webp,jpg}
 *
 * Also writes src/image-manifest.json — intrinsic size plus a 20px LQIP per
 * key, so every <picture> can reserve its box and show something immediately.
 *
 *   node scripts/build-images.mjs [--force] [--only=prefix]
 */
import sharp from 'sharp';
import { mkdir, readdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIB = path.join(ROOT, 'assets', 'library');
const OUT = path.join(ROOT, 'public', 'img');
const FORCE = process.argv.includes('--force');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];

// 1800 is the ceiling the reference uses; no layout here is wider.
const WIDTHS = [400, 640, 900, 1280, 1800];
const QUALITY = { webp: 78, jpeg: 82 };
const CONCURRENCY = 4;

async function walk(dir, base = '') {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...await walk(path.join(dir, e.name), rel));
    else if (/\.(jpe?g|png|webp|avif)$/i.test(e.name)) out.push(rel);
  }
  return out;
}

if (!existsSync(LIB)) {
  console.error('assets/library missing — run `npm run organize` first');
  process.exit(1);
}

const files = (await walk(LIB)).filter((f) => !ONLY || f.startsWith(ONLY));
const manifest = {};
let made = 0, skipped = 0, failed = 0;

async function one(rel) {
  const key = rel.replace(/\.[^.]+$/, '');
  const src = path.join(LIB, rel);
  const dest = path.join(OUT, key);
  await mkdir(path.dirname(dest), { recursive: true });

  let meta;
  try { meta = await sharp(src).metadata(); }
  catch (e) { failed++; console.warn(`  ! ${rel}: ${e.message}`); return; }

  const widths = WIDTHS.filter((w) => w <= meta.width).slice();
  if (!widths.length) widths.push(meta.width);

  for (const w of widths) {
    for (const [ext, opts] of [['webp', { quality: QUALITY.webp }], ['jpg', { quality: QUALITY.jpeg, mozjpeg: true }]]) {
      const file = `${dest}-${w}.${ext}`;
      if (!FORCE && existsSync(file)) {
        const [a, b] = await Promise.all([stat(file), stat(src)]);
        if (a.mtimeMs >= b.mtimeMs) { skipped++; continue; }
      }
      const pipe = sharp(src, { failOn: 'none' }).rotate().resize({ width: w, withoutEnlargement: true });
      await (ext === 'webp' ? pipe.webp(opts) : pipe.jpeg(opts)).toFile(file);
      made++;
    }
  }

  const lqip = await sharp(src, { failOn: 'none' }).rotate().resize({ width: 20 })
    .webp({ quality: 30 }).toBuffer();
  manifest[key] = {
    w: meta.width,
    h: meta.height,
    widths,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
  };
}

const queue = [...files];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) await one(queue.shift());
}));

// Merge rather than replace, so --only does not drop everything else.
const MPATH = path.join(ROOT, 'src', 'image-manifest.json');
const prev = existsSync(MPATH) ? JSON.parse(await (await import('node:fs/promises')).readFile(MPATH, 'utf8')) : {};
await writeFile(MPATH, JSON.stringify({ ...prev, ...manifest }, null, 0));

console.log(`images: ${files.length} sources → ${made} written, ${skipped} up to date, ${failed} failed`);
if (failed) process.exitCode = 1;
