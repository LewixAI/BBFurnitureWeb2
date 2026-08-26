#!/usr/bin/env bash
# Publishes dist/ to the gh-pages branch, which is what GitHub Pages serves.
#
# The built site is ~350 MB of imagery, so it lives on its own orphan branch
# rather than in main — `main` stays at ~1 MB of source and is regenerable with
# `npm run organize && npm run images` (both read the sibling BBFurnitureWeb
# checkout, which holds the client's originals).
#
#   BASE_PATH=/BBFurnitureWeb2 npm run build && bash scripts/deploy-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."

REPO=$(git remote get-url origin)
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT

[ -d dist ] || { echo "dist/ missing — run the build first"; exit 1; }
grep -q 'BBFurnitureWeb2/img' dist/index.html || {
  echo "dist/ was built without BASE_PATH — every URL would 404 under the subpath"; exit 1; }

cp -a dist/. "$STAGE/"
touch "$STAGE/.nojekyll"          # or Jekyll drops every path starting with _

cd "$STAGE"
git init -q -b gh-pages
git add -A
git commit -q -m "Built site — $(date +%Y-%m-%d)"
git remote add origin "$REPO"
git push -f origin gh-pages
echo "pushed $(find . -type f -not -path './.git/*' | wc -l | tr -d ' ') files"
