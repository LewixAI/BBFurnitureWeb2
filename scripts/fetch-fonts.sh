#!/usr/bin/env bash
# Re-fetches the two self-hosted typefaces from Google Fonts into public/fonts/
# and rewrites src/styles/fonts.css. Only the latin and latin-ext subsets are
# kept — the site has no Vietnamese or Cyrillic copy.
#
#   bash scripts/fetch-fonts.sh
set -euo pipefail
cd "$(dirname "$0")/.."

UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
mkdir -p public/fonts /tmp/bbf-fonts

curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=Petrona:ital,wght@0,400..600;1,400&display=swap" -o /tmp/bbf-fonts/petrona.css
curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..600;1,400&display=swap" -o /tmp/bbf-fonts/instrument.css

python3 - <<'PY'
import re, os, urllib.request
css = ''.join(open(f'/tmp/bbf-fonts/{f}').read() + '\n' for f in ('petrona.css', 'instrument.css'))
out_dir = 'public/fonts'
blocks = re.findall(r'/\*\s*([\w-]+)\s*\*/\s*@font-face\s*\{(.*?)\}', css, re.S)
lines = []
for subset, body in blocks:
    if subset not in {'latin', 'latin-ext'}:
        continue
    fam = re.search(r"font-family:\s*'([^']+)'", body).group(1)
    style = re.search(r'font-style:\s*(\w+)', body).group(1)
    weight = re.search(r'font-weight:\s*([\d ]+);', body).group(1).strip()
    url = re.search(r'src:\s*url\(([^)]+)\)', body).group(1).strip('\'"')
    ur = re.search(r'unicode-range:\s*([^;]+);', body).group(1)
    name = f"{fam.lower().replace(' ', '-')}-{style}-{subset}.woff2"
    urllib.request.urlretrieve(url, os.path.join(out_dir, name))
    lines.append(f"""@font-face {{
  font-family: '{fam}';
  font-style: {style};
  font-weight: {weight};
  font-display: swap;
  src: url('/fonts/{name}') format('woff2');
  unicode-range: {ur};
}}""")
open('src/styles/fonts.css', 'w').write(
    """/* Self-hosted subsets of Petrona and Instrument Sans, pulled from Google Fonts
   by scripts/fetch-fonts.sh. Both are variable (400–600), so one file per
   style covers every weight the site uses.

   These stand in for the reference's Canela Text and KH Teka, which are
   licensed. The substitutes were chosen by rendering the real faces beside
   every free candidate at the sizes this site actually uses — see
   _research/specimen-serif2.png and _research/specimen-sans.png. */
""" + '\n'.join(lines) + '\n')
print(f'{len(lines)} faces')
PY
