# System Audit Report

**Date:** 2026-03-30  
**Scope:** Full-stack review across architecture, QA readiness, UI/UX consistency, form design, and security controls.

## Executive Summary

The platform has a solid baseline structure (typed codebase, route segmentation, shared auth helper, reusable components). This follow-up remediation pass addressed the previously identified critical issues and strengthened security and QA reliability.

### Remediation Status

- ✅ Admin authorization in order update API now uses centralized `requireAdmin()` checks.
- ✅ CAPTCHA no longer relies on insecure default secret in production.
- ✅ Upload API now enforces type/size constraints, user-scoped paths, and disables overwrite-by-default.
- ✅ Lint pipeline now has an ESLint v9 flat config and runs successfully.
- ✅ Build no longer depends on runtime Google Fonts fetching.

## Detailed Findings

### P0 / High

#### 1) Admin privilege check uses `user_metadata.is_admin`
- **Location:** `app/api/admin/orders/[id]/route.ts`
- **Issue:** This endpoint checks `user.user_metadata?.is_admin` rather than using the same DB-backed role check pattern (`profiles.role`) used elsewhere.
- **Risk:** Inconsistent trust model can lead to privilege escalation in environments where metadata may be set/propagated incorrectly.
- **Recommendation:** Replace with `requireAdmin()` helper for centralized, authoritative role verification.

#### 2) CAPTCHA uses insecure default secret when env is missing
- **Location:** `app/api/captcha/route.ts`, `app/api/orders/route.ts`
- **Issue:** Both routes fall back to `"default-captcha-secret-change-me"` when `CAPTCHA_SECRET` is undefined.
- **Risk:** Predictable secret enables token forgery and CAPTCHA bypass.
- **Recommendation:** Fail closed in production if secret is missing; use startup/runtime guard and explicit 500 with safe error message.

#### 3) Upload API allows uncontrolled `path` and no file policy
- **Location:** `app/api/upload/route.ts`
- **Issue:** Client-provided `path` is accepted directly; no allowlist for MIME types/extensions, no size checks, and upload uses `upsert: true`.
- **Risk:** Arbitrary object overwrite in public bucket, unexpected content hosting, abuse/storage poisoning.
- **Recommendation:** Enforce server-generated path prefixes per user, disable unrestricted overwrite, validate file type and size, and consider private bucket + signed URLs.

### P1 / Medium

#### 4) HTML sanitizer attribute allowlist logic is flawed
- **Location:** `lib/utils.ts`
- **Issue:** `sanitizeAttribute()` looks up allowed attributes via `ALLOWED_ATTRS[name.toLowerCase()]`, where `name` is attribute name, but `ALLOWED_ATTRS` is keyed by tag name.
- **Impact:** Intended attribute allowlist is effectively bypassed in a restrictive way (most attributes dropped), causing inconsistent rendering and false sense of sanitizer correctness.
- **Recommendation:** Refactor sanitizer to validate attributes using current tag context; add security unit tests for payload corpus.

#### 5) Lint script is broken under ESLint v9
- **Location:** `package.json`
- **Issue:** `pnpm lint` fails because no `eslint.config.js/mjs/cjs` exists.
- **Impact:** QA gate is incomplete; regressions can merge undetected.
- **Recommendation:** Add flat ESLint config and CI lint gate.

#### 6) Build depends on live Google Fonts fetch
- **Location:** `app/layout.tsx` import path via Next font pipeline
- **Issue:** `next build` failed in this environment when fetching Outfit from Google Fonts.
- **Impact:** Non-deterministic builds in restricted/offline CI environments.
- **Recommendation:** Self-host fonts or provide resilient fallback strategy.

### P2 / Low

#### 7) In-memory rate limiting is instance-local
- **Location:** `lib/rate-limit.ts`
- **Issue:** Uses process memory map; no distributed backing.
- **Impact:** Ineffective under horizontal scaling/serverless cold starts.
- **Recommendation:** Move to Redis/Upstash/KV-based distributed rate limiter for APIs exposed publicly.

#### 8) Form wizard completion checks are minimal
- **Location:** `components/order/order-wizard.tsx`
- **Issue:** Frontend step completion checks rely on non-empty fields rather than schema-level quality checks.
- **Impact:** UX allows progression with low-quality data until server-side validation.
- **Recommendation:** Share zod schemas with client and validate per-step prior to navigation.

## QA Execution Results

- `pnpm exec tsc --noEmit` ✅ pass
- `pnpm lint` ✅ pass
- `pnpm build` ✅ pass (with non-blocking framework warnings about middleware deprecation and metadataBase)

## Priority Remediation Plan

1. **Security Hotfixes (P0):** Admin auth check unification, CAPTCHA secret hard-fail, upload constraints.
2. **Reliability/CI (P1):** Restore lint configuration, stabilize build/font dependency.
3. **Defense-in-Depth (P1/P2):** Sanitizer refactor + unit tests, distributed rate limiting, client-side schema enforcement.

## Suggested Acceptance Criteria for Re-Audit

- All admin API routes use shared `requireAdmin()` with profile role check.
- CAPTCHA endpoints refuse operation when `CAPTCHA_SECRET` is unset in production.
- Upload API enforces strict file policy, server-side pathing, no unrestricted overwrite.
- `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` run successfully in CI.
- Security test cases include XSS payload corpus and authorization regression tests.
