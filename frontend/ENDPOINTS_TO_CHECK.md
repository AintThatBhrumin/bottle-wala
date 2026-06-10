# Jal-Setu Endpoints To Check

Production domains:

- Frontend: `https://jalsetu.me`
- Backend API: `https://api.jalsetu.me`
- Admin: `https://admin.jalsetu.me`

Local development frontend:

`http://127.0.0.1:3000`

## Production App Routes

- Home: `https://jalsetu.me/`
- Login: `https://jalsetu.me/login`
- Register: `https://jalsetu.me/register`
- Suppliers: `https://jalsetu.me/suppliers`
- Cart: `https://jalsetu.me/cart`
- Checkout: `https://jalsetu.me/checkout`
- Orders: `https://jalsetu.me/orders`
- Supplier dashboard: `https://jalsetu.me/supplier-dashboard`
- Admin revenue dashboard: `https://jalsetu.me/revenue`
- Django admin: `https://admin.jalsetu.me/admin/`

## SEO Endpoints

- Sitemap: `https://jalsetu.me/sitemap.xml`
- Robots: `https://jalsetu.me/robots.txt`
- Canonical public URL: `https://jalsetu.me`

## Protected Route Notes

- `/suppliers`, `/cart`, `/checkout`, `/orders`, `/supplier-dashboard`, and `/revenue` require authentication.
- `/revenue` is admin-only. Supplier and customer users are redirected to their normal dashboard route.
- `/cart`, `/checkout`, and `/orders` are customer-only.
- `/supplier-dashboard` is supplier/admin-only.

## Frontend API Routes

These routes are exposed by the Next.js app and proxy to the backend where needed.

- Login API: `https://jalsetu.me/api/auth/login`
- Register API: `https://jalsetu.me/api/auth/register`
- Logout API: `https://jalsetu.me/api/auth/logout`
- Current user API: `https://jalsetu.me/api/auth/me`
- Refresh session API: `https://jalsetu.me/api/auth/refresh`

## Backend API Routes

These are direct backend API routes.

- Suppliers list: `https://api.jalsetu.me/api/suppliers/`
- Single supplier example: `https://api.jalsetu.me/api/suppliers/<supplier-id>/`
- Current supplier profile: `https://api.jalsetu.me/api/suppliers/mine/`
- Products by supplier example: `https://api.jalsetu.me/api/products/?supplier=<supplier-id>`
- Create order: `https://api.jalsetu.me/api/orders/`
- Customer order history: `https://api.jalsetu.me/api/orders/history/`
- Supplier incoming orders: `https://api.jalsetu.me/api/orders/incoming/`
- Verify payment example: `https://api.jalsetu.me/api/orders/<order-id>/verify-payment/`
- Payment failure example: `https://api.jalsetu.me/api/orders/<order-id>/payment-failed/`
- Revenue dashboard: `https://api.jalsetu.me/api/revenue/dashboard/`
- Monthly revenue: `https://api.jalsetu.me/api/revenue/monthly/`
- Supplier payouts: `https://api.jalsetu.me/api/supplier/payouts/`
- Upgrade subscription: `https://api.jalsetu.me/api/subscription/upgrade/`
- Promote supplier: `https://api.jalsetu.me/api/supplier/promote/`

## Brand Asset Endpoint

- Logo image: `https://jalsetu.me/brand/jal-setu-logo.png`

## Recommended Manual Check Order

1. Open `https://jalsetu.me/`
2. Open `https://jalsetu.me/register`
3. Create a customer account and confirm redirect to `/suppliers`
4. Open `/cart`
5. Open `/orders`
6. Sign in as a supplier and open `/supplier-dashboard`
7. Sign in as an admin and open `/revenue`
8. Open `/api/auth/me`
9. Open `https://api.jalsetu.me/api/suppliers/`
10. Open `https://jalsetu.me/sitemap.xml`
11. Open `https://jalsetu.me/robots.txt`
