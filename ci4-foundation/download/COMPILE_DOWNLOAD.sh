#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOWNLOAD_DIR="${ROOT_DIR}/download"
VERSION="part1"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
BASE_NAME="verify-dummy-ticket-ci4-${VERSION}"
ZIP_NAME="${BASE_NAME}.zip"
TAR_NAME="${BASE_NAME}.tar.gz"
MANIFEST_NAME="${BASE_NAME}.manifest.json"

cd "$ROOT_DIR"

# Ensure consolidated SQL is always current
cat database/part1_schema.sql database/part1_seed.sql > database/full_database_export.sql

rm -f "${DOWNLOAD_DIR}/${ZIP_NAME}" "${DOWNLOAD_DIR}/${ZIP_NAME}.sha256"
rm -f "${DOWNLOAD_DIR}/${TAR_NAME}" "${DOWNLOAD_DIR}/${TAR_NAME}.sha256"
rm -f "${DOWNLOAD_DIR}/${MANIFEST_NAME}"

zip -r "${DOWNLOAD_DIR}/${ZIP_NAME}" \
  .env.example \
  README.md \
  FILEMANAGER.md \
  app \
  database \
  download/README_DOWNLOAD.md \
  download/INSTALL_QUICKSTART.md \
  download/PUSH_TO_GITHUB.md \
  download/PUSH_NEW_GITHUB_REPO.sh

tar -czf "${DOWNLOAD_DIR}/${TAR_NAME}" \
  .env.example \
  README.md \
  FILEMANAGER.md \
  app \
  database \
  download/README_DOWNLOAD.md \
  download/INSTALL_QUICKSTART.md \
  download/PUSH_TO_GITHUB.md \
  download/PUSH_NEW_GITHUB_REPO.sh

(
  cd "$DOWNLOAD_DIR"
  sha256sum "$ZIP_NAME" > "$ZIP_NAME.sha256"
  sha256sum "$TAR_NAME" > "$TAR_NAME.sha256"
)

cat > "${DOWNLOAD_DIR}/${MANIFEST_NAME}" <<JSON
{
  "package": "${BASE_NAME}",
  "compiled_at_utc": "${STAMP}",
  "artifacts": [
    "${ZIP_NAME}",
    "${ZIP_NAME}.sha256",
    "${TAR_NAME}",
    "${TAR_NAME}.sha256"
  ],
  "database_export": "database/full_database_export.sql"
}
JSON

echo "Compiled download artifacts in ${DOWNLOAD_DIR}"
ls -1 "${DOWNLOAD_DIR}" | sed 's/^/- /'
