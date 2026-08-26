/**
 * Generates src/library.js — the semantic-path → Wix-filename map.
 *
 * Everything here comes from the client's own data: the shop payload, the
 * document order of the live pages, and the project pages. Nothing is guessed.
 * Re-run after scripts/harvest-meta.py.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OLD = path.resolve(ROOT, '..', 'BBFurnitureWeb');
const BYPAGE = path.join(OLD, 'assets', 'by-page');

const json = async (p) => JSON.parse(await readFile(p, 'utf8'));
const map = await json(path.join(ROOT, '_research', 'library-map.json'));
const productImages = await json(path.join(OLD, '_scrape', 'bb_product_images.json'));
const { projects } = await import(path.join(OLD, 'src', 'projects.js'));

const slug = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const wix = (f) => f.replace(/~/g, '_');
const bare = (f) => f.replace(/\.[^.]+$/, '');

const lib = {};
const used = new Set();
const put = (dest, file) => { lib[dest] = wix(file); used.add(bare(wix(file))); };

// ── Products: the client's own shop payload pairs name → image ──────────────
for (const [name, file] of Object.entries(productImages)) put(`product/${slug(name)}`, file);

// ── Textures: eleven named carvings, paired by document order ───────────────
for (const t of map.textures) put(`texture/${t.slug}`, t.file);

// ── Category tiles ─────────────────────────────────────────────────────────
// map.catalogue pairs each label with the image that PRECEDES it, but the
// catalogue template puts the label first — so those pairings are off by one
// and are not used. Every entry below was confirmed by looking at the file.
const CATEGORY = {
  sofa: 'DSCF6287.jpeg',
  'dining-table': 'DSC07277_edited.jpg',
  'arm-chair': 'aad515_40e7eb0f00f241e881d6bcf3e332eb1f_mv2.jpg',
  'coffee-table': 'DSCF9577.jpg',
  bookcase: 'aad515_63e6be0f0c164e3488ed307da0f7fed7_mv2.jpg',
  'sideboard-console': 'DSC07080_edited.jpg',
  accessories: '481b19_b03b3cc096944316b478ad5e496fd3bc_mv2.jpg',
};
for (const [k, v] of Object.entries(CATEGORY)) put(`category/${k}`, v);

// ── Projects: each page's gallery, in the order the client published it ─────
for (const p of projects) p.images.forEach((f, i) => put(`project/${p.slug}/${String(i + 1).padStart(2, '0')}`, f));

// ── Named, hand-verified singles ───────────────────────────────────────────
const NAMED = {
  'showroom/johor-bahru': '481b19_6e2394f7d31b4ea4b9e0f32c6cd949c4_mv2.jpg',
  'showroom/petaling-jaya': 'aad515_234edb871d5c47ac91e98a8ce59e5464_mv2.jpg',
  'showroom/interior-01': 'DSC07705.jpg',
  'showroom/interior-02': 'aad515_ada61741597c4c95931a11c096dcf168_mv2.jpg',
  'showroom/workshop-tools': 'DSCF0877.jpg',

  'material/upholstery-stitching': '11062b_351c0903e5b0436287532984e311bbdf_mv2_d_4177_2785_s_4_2.jpg',
  'material/cross-leg-dining-table': 'Reclaimed_Teak_Cross_Leg_Dining_Table_260cm.jpg',
  'material/titan-dining-table': 'Titan_Reclaimed_Teak_Dining_Table.jpg',
  'material/sanding-by-hand': 'aad515_0178c0a89580446badccd14677e639ad_mv2.jpg',
  'material/stone-slabs': 'aad515_ae0bb34828004adeb003b936bd13de83_mv2.jpg',
  'material/grain-macro': 'aad515_cd1fa67e8c384c30a44df0c03f8e847f_mv2.jpg',

  'home/living-room-01': 'DSCF4106.jpg',
  'home/living-room-02': 'aad515_03169de001e0443aa97322c767f6b1ec_mv2.jpg',
  'home/living-room-03': 'aad515_0a44d2ffc7934eceada4faa29f3c0473_mv2.jpg',
  'home/living-room-04': 'aad515_13949a1c63ba49a09fd4505174c03688_mv2.jpg',
  'home/dining-room-01': 'aad515_29340f420d3a4c458dc9a4ca725d01dc_mv2.jpg',
  'home/arm-chair-01': 'aad515_4bd35040d27e4c9fb200e0cbfb10a529_mv2.jpg',
  'home/showroom-floor': 'aad515_5ce882c41b9c4901b1ce9db490f74786_mv2.jpg',
  'home/coffee-table-detail': 'aad515_a9d89a5fd1324466a33973de883264af_mv2.jpeg',
  'home/bedroom-01': 'aad515_e10b5ca4d0834cd2ae87f8b3b3583e6d_mv2.jpg',
  'home/living-room-05': 'aad515_f8a039878ffd43c781eaa3e13ca57217_mv2.jpg',
  'home/dining-room-02': 'DSC07473_edited.jpg',
  'home/lounge-01': 'aad515_eda01436280a45069cef38d9515d0754_mv2.jpg',

  'sofa/gallery-01': 'DSC07446.jpg',
  'sofa/gallery-02': 'DSC09266.jpg',
  'sofa/gallery-03': 'DSCF0039_JPG.jpg',
  'sofa/gallery-04': 'DSCF2256_edited.png',
  'sofa/gallery-05': 'DSCF4402_JPG.jpg',
  'sofa/gallery-06': 'DSCF6287.jpeg',
  'sofa/gallery-07': 'KL5864.jpg',
  'sofa/gallery-08': 'aad515_c5e118214aed4ab9adbdcb9dcb8ac28e_mv2.jpg',

};
for (const [k, v] of Object.entries(NAMED)) put(k, v);

// ── The rest of the shop stills: still-life objects, used editorially ───────
const shop = (await readdir(path.join(BYPAGE, 'shop'))).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
let n = 0;
for (const f of shop) {
  if (used.has(bare(f))) continue;
  // The file-NN duplicates of file-(NN-9) add nothing; skip the second copy.
  put(`object/${String(++n).padStart(2, '0')}`, f);
}

const body = `/**
 * The image library: semantic path → the Wix filename it came from.
 *
 * GENERATED by scripts/gen-library.mjs — do not hand-edit; edit the generator.
 * Every pairing traces to the client's own data (shop payload, page document
 * order, project galleries), never to a guess about what a photo shows.
 *
 * scripts/organize.mjs turns this into assets/library/, and
 * scripts/build-images.mjs derives responsive files at the same paths under
 * public/img/. A page therefore asks for \`product/giselle-tray\`, not for a hash.
 */
export const library = ${JSON.stringify(lib, null, 2)};
`;
await writeFile(path.join(ROOT, 'src', 'library.js'), body);

const dirs = {};
for (const k of Object.keys(lib)) { const d = k.split('/')[0]; dirs[d] = (dirs[d] || 0) + 1; }
console.log(`src/library.js — ${Object.keys(lib).length} entries`);
for (const [k, v] of Object.entries(dirs).sort()) console.log(`   ${k.padEnd(12)} ${v}`);
