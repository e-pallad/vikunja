#!/usr/bin/env bash
# Builds the frontend and packs it into an nginx image that runs in front of a
# stock Vikunja server. Usage: ./build.sh [image-tag]
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$here/../.." && pwd)"
tag="${1:-vikunja-frontend-redesign:$(git -C "$repo" rev-parse --short HEAD)}"

(cd "$repo/frontend" && corepack pnpm install --frozen-lockfile && corepack pnpm build)
rm -rf "$here/dist"
cp -r "$repo/frontend/dist" "$here/dist"

# The Go server injects this block into index.html (pkg/routes/static.go).
# Served by nginx it has to be baked in; adjust if Sentry or a custom logo is configured.
node -e '
const fs = require("fs")
const file = process.argv[1]
const marker = "<div id=\"app\"></div>"
const html = fs.readFileSync(file, "utf8")
if (!html.includes(marker)) throw new Error("app container not found in index.html")
const script = `
<script>
	window.SENTRY_ENABLED = false
	window.SENTRY_DSN = ""
	window.CUSTOM_LOGO_URL = ""
	window.CUSTOM_LOGO_URL_DARK = ""
</script>`
fs.writeFileSync(file, html.replace(marker, marker + script))
' "$here/dist/index.html"

docker build -t "$tag" "$here"
echo "Built $tag"
