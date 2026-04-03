# CodeIgniter 4 Foundation (Part 1)

This folder contains a **production-ready foundation** for migrating the existing Verify Dummy Ticket product to **CodeIgniter 4 + PHP + MySQL/MariaDB** with server-rendered Bootstrap UI.

## What is included in Part 1

- CI4-compatible project skeleton (core app folders + starter config stubs)
- Route map for public, authenticated, and admin flows
- Core controllers for checkout workflow, dashboard, and admin
- Core models for users, orders, items, payments, and support tickets
- Bootstrap-based base layout + starter pages
- Complete SQL schema for MySQL/MariaDB (`database/part1_schema.sql`)
- Starter seed data (`database/part1_seed.sql`)
- Combined SQL export (`database/full_database_export.sql`)
- Download packaging scripts/docs under `download/`

## Installation (new repository)

```bash
composer create-project codeigniter4/appstarter verify-dummy-ticket-ci4
cd verify-dummy-ticket-ci4
```

Then copy the contents of this folder into that repository (merge `app/` and import the SQL files).

## Database setup

1. Create database:
   ```sql
   CREATE DATABASE verify_dummy_ticket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Import full database export:
   ```bash
   mysql -u root -p verify_dummy_ticket < database/full_database_export.sql
   ```

## Create downloadable package

```bash
cd ci4-foundation/download
./COMPILE_DOWNLOAD.sh
```

This compiles (locally):

- `ci4-foundation/download/verify-dummy-ticket-ci4-part1.zip`
- `ci4-foundation/download/verify-dummy-ticket-ci4-part1.zip.sha256`
- `ci4-foundation/download/verify-dummy-ticket-ci4-part1.tar.gz`
- `ci4-foundation/download/verify-dummy-ticket-ci4-part1.tar.gz.sha256`
- `ci4-foundation/download/verify-dummy-ticket-ci4-part1.manifest.json`

Binary artifacts are not committed to git to avoid binary-file restrictions.


## Push to new GitHub repository

From `ci4-foundation/download/`, run `./PUSH_NEW_GITHUB_REPO.sh` after setting `GITHUB_USERNAME`, `GITHUB_REPO`, and `GITHUB_TOKEN` (PAT).

## Part 2

Part 2 foundation is now included (auth filters, login flow, payment abstraction, webhook validation, upload endpoint, and SQL ops/security extension). See `PART2.md`.

## Part 3

Part 3 foundation is now included (Stripe + Paystack + PayPal gateway stubs, auditable order status service, and integration security SQL extension). See `PART3.md`.

## Part 4

Part 4 foundation is now included (API client filter, idempotency filter, and resilience/access SQL extension). See `PART4.md`.

## Part 5

Part 5 production-readiness foundation is now included (idempotent replay, throttling filter, webhook event persistence, and admin payment settings). See `PART5.md`.

## Remaining final hardening

Real provider SDK/API integration, signed webhook verification by provider APIs, automated feature tests, and deployment security runbooks are still required before go-live.
