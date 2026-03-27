# Production Deployment Notes

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Payment Gateways
PAYPAL_MODE=sandbox|sandbox
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_MERCHANT_EMAIL=your-merchant-email

# Security
CAPTCHA_SECRET=generate-a-secure-random-string-min-32-chars
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Email (optional - if using custom SMTP)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASSWORD=your-email-password
```

## Database Migrations

Run these in order after deployment:

```bash
# 1. Add missing columns to orders table
psql -h your-host -U postgres -d postgres -f scripts/007_fix_orders_schema.sql

# 2. Remove payment secrets from database (move to env vars)
psql -h your-host -U postgres -d postgres -f scripts/008_remove_payment_secrets.sql
```

## Rate Limiting for Production

The current rate limiting implementation uses in-memory storage (`lib/rate-limit.ts`). This works for development and single-instance deployments, but has limitations in serverless environments (Vercel, AWS Lambda, etc.):

### Limitations:
- Each serverless function instance has its own memory
- Rate limits reset between cold starts
- No shared state across multiple instances

### Production Recommendation: Use Redis/Upstash

For production deployments, replace the in-memory rate limiter with Redis:

```typescript
// lib/rate-limit-redis.ts
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function checkRateLimit(
  key: string, 
  limit: number = 60, 
  window: number = 60
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - window
  
  const multi = redis.multi()
  multi.zremrangebyscore(key, 0, windowStart)
  multi.zadd(key, { score: now, member: now.toString() })
  multi.zcard(key)
  multi.expire(key, window)
  
  const results = await multi.exec()
  const count = results[2] as number
  
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: now + window
  }
}
```

Install dependencies:
```bash
npm install @upstash/redis
```

## Security Checklist

- [ ] Set `CAPTCHA_SECRET` to a secure random string (32+ characters)
- [ ] Move all payment API keys from database to environment variables
- [ ] Enable RLS (Row Level Security) on all tables in Supabase
- [ ] Set up proper CORS rules for API routes
- [ ] Configure rate limiting with Redis for production
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Enable HTTPS on your domain
- [ ] Set up CSP headers to prevent XSS

## Supabase Row Level Security

Ensure RLS is enabled on all tables. Key policies:

```sql
-- Users can only see their own orders
CREATE POLICY "orders_select_own" ON public.orders 
FOR SELECT USING (user_id = auth.uid());

-- Admins can see all orders
CREATE POLICY "orders_admin_all" ON public.orders 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
```

## Monitoring

Consider adding:
- **Sentry**: Error tracking
- **Plausible/Analytics**: Privacy-friendly analytics
- **Uptime Robot**: Uptime monitoring
- **Supabase Dashboard**: Database monitoring
