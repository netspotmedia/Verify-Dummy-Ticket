# Part 4 Foundation (Resilience + Access Controls)

## Included in this step

- `ApiClientFilter` requiring `X-Client-Key` + `X-Client-Secret`
- `IdempotencyFilter` requiring `Idempotency-Key` and enforcing duplicate prevention
- `ApiClientModel` and `IdempotencyKeyModel`
- Route-level idempotency protection for checkout and payment webhook
- SQL extension script for resilience/access tables:
  - `request_rate_limits`
  - `webhook_events`

## Apply Part 4 SQL

```bash
mysql -u root -p verify_dummy_ticket < database/part4/part4_resilience_and_access.sql
```

## Next improvements

- Replace simple idempotency response replay with stored response replay logic
- Add request throttling middleware using `request_rate_limits`
- Add webhook event processor worker for delayed retries
