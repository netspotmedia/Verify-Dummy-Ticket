# Strict Gap-Closure Checklist

## (a) Real payment API wiring
- [x] Paystack checkout now initializes a real transaction via `https://api.paystack.co/transaction/initialize` when credentials are configured.
- [x] PayPal checkout now requests OAuth token and creates a real order via PayPal REST API.
- [x] Stripe checkout now creates a real PaymentIntent via Stripe API.
- [x] Checkout flow stores provider reference and redirects to external checkout URL when supplied.

## (b) Exact UI spacing/typography token matching
- [x] Introduced centralized CSS design tokens (`:root`) in the base layout for typography, spacing, radius, border, and primary color.
- [x] Updated shared surfaces/buttons/text colors to consume tokens for consistent spacing/typography rhythm.
- [ ] Pixel-level design QA against source screenshots/video still required in-browser.

## (c) Full route-by-route form UX validation
- [x] Added deterministic route/form validator script to ensure all form actions map to declared routes.
- [x] Added flash-state UX handling (error/success) on major user/admin forms.
- [x] Added role-aware header navigation and logout UX wiring.

## (d) Deterministic E2E test script for user + admin workflows
- [x] Added `scripts/e2e_workflow_check.sh` to run controller lint + route/form wiring assertions.
- [x] Added `scripts/validate_routes_and_forms.php` to check route/form contract deterministically.
- [ ] Full browser-level E2E (click-through + DB assertions) can be layered next using Playwright/Cypress in CI.
