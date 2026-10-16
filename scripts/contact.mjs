/**
 * Contact sheet of a directory of images, tiles numbered, so classification is
 * done by looking at the pictures rather than trusting a filename.
 *
 *   node scripts/contact.mjs <dir> <out.png> [cols] [tile]
 */
import sharp from 'sharp';
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [dir, out, colsArg = '8', tileArg = '200'] = process.argv.slice(2);
const cols = +colsArg, TILE = +tileArg;
const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).sort();
const rows = Math.ceil(files.length / cols);
const W = cols * TILE, H = rows * (TILE + 22);

const label = (i, name) => Buffer.from(
  `<svg width="${TILE}" height="22" xmlns="http://www.w3.org/2000/svg">
     <rect width="${TILE}" height="22" fill="#111"/>
     <text x="4" y="15" font-family="monospace" font-size="11" fill="#eee">${i} ${name.slice(0, 20)}</text>
   </svg>`);

const composites = [];
for (let i = 0; i < files.length; i++) {
  const x = (i % cols) * TILE, y = Math.floor(i / cols) * (TILE + 22);
  try {
    const buf = await sharp(path.join(dir, files[i]))
      .resize(TILE, TILE, { fit: 'cover' }).jpeg({ quality: 72 }).toBuffer();
    composites.push({ input: buf, left: x, top: y });
  } catch { /* unreadable file: leave the cell blank, the label still prints */ }
  composites.push({ input: label(i, files[i]), left: x, top: y + TILE });
}
await sharp({ create: { width: W, height: H, channels: 3, background: '#222' } })
  .composite(composites).jpeg({ quality: 78 }).toFile(out);
await writeFile(out.replace(/\.\w+$/, '.txt'), files.map((f, i) => `${i}\t${f}`).join('\n'));
console.log(`${files.length} images → ${out} (${cols}×${rows})`);
