#!/usr/bin/env python3
"""
Recover the client's own image↔label pairings from the scraped Wix HTML, so the
new image library can be named semantically instead of by Wix hash.

The Wix pages carry the label as the next text node after the <img>, which is
how the texture names and the category tiles were paired on the live site. That
ordering is the only record of the pairing — the filenames carry nothing.

Writes _research/library-map.json.
"""
import re, os, json, html, urllib.parse, unicodedata

SCRAPE = os.path.expanduser('~/Desktop/dev/BBFurnitureWeb/_scrape/html')
IMAGES = os.path.expanduser('~/Desktop/dev/BBFurnitureWeb/assets/images')
OUT = os.path.expanduser('~/Desktop/dev/BBFurnitureWeb2/_research/library-map.json')

HAVE = set(os.listdir(IMAGES))


def resolve(url):
    """Wix URL → the filename the harvest actually saved, or None."""
    url = urllib.parse.unquote(url)
    m = re.search(r'/media/([^/?]+)', url)
    cands = []
    if m:
        cands.append(m.group(1).replace('~', '_'))
    tail = url.split('/')[-1].split('?')[0]
    cands.append(tail.replace('~', '_'))
    cands.append(re.sub(r'[ ()]+', '_', tail).strip('_').replace('~', '_'))
    for c in cands:
        if c in HAVE:
            return c
        # try alternate extensions — the harvest sometimes rewrote them
        stem = c.rsplit('.', 1)[0]
        for ext in ('jpg', 'jpeg', 'png', 'webp'):
            if f'{stem}.{ext}' in HAVE:
                return f'{stem}.{ext}'
    return None


def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def sequence(path):
    """(kind, value) tokens in document order: IMG filenames and text nodes."""
    src = open(path, encoding='utf-8', errors='ignore').read()
    src = re.sub(r'<script.*?</script>', '', src, flags=re.S)
    src = re.sub(r'<style.*?</style>', '', src, flags=re.S)
    out = []
    for m in re.finditer(r'<img[^>]+src="([^"]+)"|>([^<>]{1,120})<', src):
        if m.group(1):
            f = resolve(m.group(1))
            if f:
                out.append(('IMG', f))
        elif m.group(2):
            t = html.unescape(m.group(2)).replace('​', '').strip()
            if t:
                out.append(('TXT', t))
    return out


NAV_NOISE = {
    'HOME', 'PRODUCTS', 'SHOP', 'WORK', 'ABOUT', 'MATERIALS', 'Menu', 'Close',
    'top of page', 'bottom of page', 'press to zoom', 'MORE...', '< Back to Project',
}


def labelled(path, wanted):
    """Pair each wanted label with the image that immediately precedes it."""
    pairs, last = {}, None
    for kind, val in sequence(path):
        if kind == 'IMG':
            last = val
        elif val in wanted and last and val not in pairs:
            pairs[val] = last
            last = None
    return pairs


lib = {}

# ── Textures: eleven named carvings, each preceded by its swatch ─────────────
TEXTURES = ['RHAPSODY', 'WAY', 'PICTURESQUE', 'ROUEN CATHEDRAL', 'SISYPHUS',
            'SONG OF WIND', 'IRREGOLARE', 'THE NATURAL', 'DAFFODIL', 'LÍNEA', 'REGOLA']
t = labelled(f'{SCRAPE}/services-4.html', set(TEXTURES))
lib['textures'] = [{'name': n.title().replace('Linea', 'Línea'), 'slug': slugify(n),
                    'file': t.get(n)} for n in TEXTURES]

# ── Category tiles from the products/catalogue page ──────────────────────────
CATS = ['SOFA', 'COFFEE TABLE', 'CHAIR', 'DINING TABLE']
c = labelled(f'{SCRAPE}/catalogue.html', set(CATS))
lib['catalogue'] = [{'name': n.title(), 'slug': slugify(n), 'file': c.get(n)} for n in CATS]

# ── Every page's images, in document order ──────────────────────────────────
lib['pages'] = {}
for f in sorted(os.listdir(SCRAPE)):
    if not f.endswith('.html'):
        continue
    seen, order = set(), []
    for kind, val in sequence(f'{SCRAPE}/{f}'):
        if kind == 'IMG' and val not in seen:
            seen.add(val)
            order.append(val)
    lib['pages'][f[:-5]] = order

json.dump(lib, open(OUT, 'w'), indent=1, ensure_ascii=False)
miss = [x['name'] for x in lib['textures'] + lib['catalogue'] if not x['file']]
print('textures:', sum(1 for x in lib['textures'] if x['file']), '/', len(TEXTURES))
print('catalogue:', sum(1 for x in lib['catalogue'] if x['file']), '/', len(CATS))
print('pages:', len(lib['pages']), 'unresolved labels:', miss or 'none')
