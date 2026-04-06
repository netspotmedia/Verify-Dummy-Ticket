#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_USERNAME:?Set GITHUB_USERNAME}"
: "${GITHUB_REPO:?Set GITHUB_REPO}"
: "${GITHUB_TOKEN:?Set GITHUB_TOKEN}"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EXPORT_DIR="$(cd "$(dirname "$0")/../.." && pwd)/ci4-foundation-export"

rm -rf "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR"

# Copy CI4 foundation payload
rsync -a --delete \
  --exclude 'download/*.zip' \
  --exclude 'download/*.tar.gz' \
  --exclude 'download/*.sha256' \
  "$ROOT_DIR/" "$EXPORT_DIR/"

cd "$EXPORT_DIR"
git init
git checkout -b main
git add .
git commit -m "Initial CodeIgniter 4 foundation import"

REMOTE_URL="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"
git remote add origin "$REMOTE_URL"
git push -u origin main

# Remove token-bearing remote URL from local config after push for safety
git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"

echo "Pushed to https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}"
