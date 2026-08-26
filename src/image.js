/**
 * Renders a <picture> from a library key ("category/sofa"), using the manifest
 * scripts/build-images.mjs writes. Every call emits width/height so the box is
 * reserved before the bytes arrive, plus the LQIP as the element background so
 * there is something to look at while they do.
 *
 * A key with no manifest entry renders an HTML comment rather than a broken
 * image, and scripts/render.mjs fails the build on any that appear.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'src', 'image-manifest.json');

export const manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
  : {};

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * @param {string} key   library path, e.g. "product/giselle-tray"
 * @param {object} opts
 *   alt       required for anything meaningful; pass '' for decoration
 *   sizes     CSS sizes attribute (default: full viewport width)
 *   eager     skip lazy-loading, for anything above the fold
 *   contain   show the whole object inside the cell instead of filling it —
 *             also drops the LQIP, which is a cover-sized thumbnail and would
 *             fringe out on the two sides the artwork does not reach
 *   className extra classes on the wrapping .media element
 */
export function img(key, { alt = '', sizes = '100vw', eager = false, contain = false, className = '' } = {}) {
  const entry = manifest[key];
  if (!entry) return `<!-- missing image: ${esc(key)} -->`;

  const { widths, w, h, lqip } = entry;
  const srcset = (ext) => widths.map((width) => `/img/${key}-${width}.${ext} ${width}w`).join(', ');
  const fallback = `/img/${key}-${widths[widths.length - 1]}.jpg`;
  const loading = eager ? '' : ' loading="lazy" decoding="async"';
  const priority = eager ? ' fetchpriority="high" decoding="async"' : '';

  const cls = [className, contain && 'media--contain'].filter(Boolean).join(' ');
  const bg = contain || !lqip ? ''
    : ` style="background-image:url(${lqip});background-size:cover;background-position:center"`;

  // The LQIP rides on the <picture>, not on .media: a contained image insets
  // the picture inside the cell, and a background on the cell would halo out
  // around the artwork.
  return `<div class="media${cls ? ' ' + cls : ''}">
  <picture${bg}>
    <source type="image/webp" srcset="${srcset('webp')}" sizes="${esc(sizes)}">
    <img src="${fallback}" srcset="${srcset('jpg')}" sizes="${esc(sizes)}" width="${w}" height="${h}" alt="${esc(alt)}"${loading}${priority}>
  </picture>
</div>`;
}

/** Bare <img> for places that must not carry an extra layout box. */
export function imgSrc(key, width = 1280, ext = 'jpg') {
  return manifest[key] ? `/img/${key}-${width}.${ext}` : '';
}

export function has(key) { return Boolean(manifest[key]); }
