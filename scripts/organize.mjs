/**
 * Builds assets/library/ — the semantic image tree the whole site refers to.
 *
 * Every source file is a Wix hash (481b19_fa8c20…_mv2.jpg) with no meaning in
 * the name. This resolves each one to a path that says what it is:
 *
 *   library/product/lauren-reclaimed-teakwood-plate.jpg
 *   library/texture/rouen-cathedral.jpg
 *   library/project/eco-botanic/03.jpg
 *
 * The pairings are not guesses: product↔image comes from the client's own shop
 * payload, texture↔name and category↔name from the document order of the live
 * pages (see scripts/harvest-meta.py), project↔images from the project pages.
 *
 * Files are hard-linked, not copied — 1.8 GB of originals stay on disk once.
 *
 *   node scripts/organize.mjs [--check]
 */
import { mkdir, readdir, rm, link, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(ROOT, '..', 'BBFurnitureWeb', 'assets', 'images');
const LIB = path.join(ROOT, 'assets', 'library');
const CHECK = process.argv.includes('--check');

const { library } = await import('../src/library.js');

if (!existsSync(SRC)) {
  console.error(`source images not found at ${SRC}`);
  process.exit(1);
}
const have = new Set(await readdir(SRC));

/** Wix names differ by extension between pages; accept any that exists. */
function resolve(file) {
  if (!file) return null;
  if (have.has(file)) return file;
  const stem = file.replace(/\.[^.]+$/, '');
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    if (have.has(`${stem}.${ext}`)) return `${stem}.${ext}`;
  }
  return null;
}

const missing = [];
const plan = [];
for (const [dest, source] of Object.entries(library)) {
  const src = resolve(source);
  if (!src) { missing.push(`${dest} ← ${source}`); continue; }
  plan.push([dest + path.extname(src), src]);
}

if (missing.length) {
  console.error(`\n${missing.length} unresolved source image(s):`);
  missing.forEach((m) => console.error('   ', m));
}

if (CHECK) {
  console.log(`${plan.length} resolved, ${missing.length} missing`);
  process.exit(missing.length ? 1 : 0);
}

await rm(LIB, { recursive: true, force: true });
let bytes = 0;
for (const [dest, src] of plan) {
  const out = path.join(LIB, dest);
  await mkdir(path.dirname(out), { recursive: true });
  await link(path.join(SRC, src), out);
  bytes += (await stat(out)).size;
}

// A flat index so a later step can answer "what is this file" without re-deriving.
await writeFile(
  path.join(ROOT, 'assets', 'library-index.json'),
  JSON.stringify(Object.fromEntries(plan.map(([d, s]) => [d, s])), null, 1)
);

const dirs = {};
for (const [d] of plan) { const k = d.split('/')[0]; dirs[k] = (dirs[k] || 0) + 1; }
console.log(`library: ${plan.length} files, ${(bytes / 1e9).toFixed(2)} GB linked`);
for (const [k, v] of Object.entries(dirs).sort()) console.log(`   ${k.padEnd(12)} ${v}`);
if (missing.length) process.exitCode = 1;
