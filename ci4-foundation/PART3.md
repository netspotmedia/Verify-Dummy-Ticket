# Part 3 Foundation (Gateway Expansion + Status Audit)

## Included in this step

- `StripeGateway` stub provider support
- `PaystackGateway` support for **NGN + USD**
- `PayPalGateway` support for **USD** with card and PayPal account flows
- Payment config extension for Stripe, Paystack, and PayPal keys/secrets
- `OrderStatusService` + `OrderStatusHistoryModel` for auditable admin status updates
- `Admin\OrdersController::updateStatus` now writes status history
- SQL extension script for integration hardening:
  - `api_clients`
  - `idempotency_keys`

## Apply Part 3 SQL

```bash
mysql -u root -p verify_dummy_ticket < database/part3/part3_integrations_and_security.sql
```

## Next improvements

- Implement real Paystack transaction initialize + verify API
- Implement real PayPal Orders API + webhook verification API
- Add API key middleware based on `api_clients`
- Add idempotency middleware for checkout and webhook endpoints
