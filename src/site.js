/**
 * Where the site lives.
 *
 * GitHub Pages on a free org serves a project repo from a *subpath*
 * (lewixai.github.io/BBFurnitureWeb2/), so every absolute URL the templates
 * write — /img/…, /collections/…, /fonts/… — has to carry that prefix. It is
 * applied in one place, by `withBase()` in scripts/render.mjs, rather than
 * threaded through every template literal.
 *
 *   BASE_PATH=/BBFurnitureWeb2 npm run build
 *
 * Empty (the default) gives root-relative URLs, which is what the dev server
 * and any custom-domain deploy want.
 */
const raw = process.env.BASE_PATH ?? '';

/** '' | '/name' — never a trailing slash. */
export const BASE = raw === '/' ? '' : raw.replace(/\/+$/, '');

/** Absolute origin, for canonical/og/sitemap URLs. */
export const ORIGIN = process.env.SITE_ORIGIN ?? 'https://lewixai.github.io';

/** Full public URL of the site root, no trailing slash. */
export const SITE = `${ORIGIN}${BASE}`;
