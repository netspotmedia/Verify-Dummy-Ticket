# Download Package

This folder contains generated downloadable artifacts for the CodeIgniter 4 Part 1 foundation.

## Compile artifacts

```bash
cd ci4-foundation/download
./COMPILE_DOWNLOAD.sh
```

`BUILD_DOWNLOAD.sh` is kept as a compatibility alias and calls the same compiler script.

## Output files (generated locally, not committed)

- `verify-dummy-ticket-ci4-part1.zip`
- `verify-dummy-ticket-ci4-part1.zip.sha256`
- `verify-dummy-ticket-ci4-part1.tar.gz`
- `verify-dummy-ticket-ci4-part1.tar.gz.sha256`
- `verify-dummy-ticket-ci4-part1.manifest.json`

> Note: Binary artifacts are intentionally excluded from git history to avoid "Binary files are not supported" errors in some review/deploy pipelines.

## Contents

- CI4 app foundation (`app/`)
- Routes/controllers/models/views
- Full SQL database export (`database/full_database_export.sql`)
- Split SQL files (`part1_schema.sql`, `part1_seed.sql`)


## Push to a new GitHub repository

Use:

```bash
./PUSH_NEW_GITHUB_REPO.sh
```

See full guide in `PUSH_TO_GITHUB.md`.
