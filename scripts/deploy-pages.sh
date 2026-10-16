#!/usr/bin/env bash
# Publishes dist/ to the gh-pages branch, which is what GitHub Pages serves.
#
# The built site carries a lot of imagery, so it lives on its own orphan branch
# rather than in main — `main` stays small source and is regenerable with
# `npm run images` (which reads the local assets/library/ tree).
#
#   BASE_PATH=/your-repo-name npm run build && bash scripts/deploy-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."

REPO=$(git remote get-url origin)
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT

[ -d dist ] || { echo "dist/ missing — run the build first"; exit 1; }
[ -n "${BASE_PATH:-}" ] || { echo "BASE_PATH is not set — every URL would 404 under the subpath"; exit 1; }
grep -q "${BASE_PATH#/}/img" dist/index.html || {
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
