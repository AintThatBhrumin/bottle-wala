# Jal-Setu Production Deployment

Production domains:

- Frontend: `https://jalsetu.me`
- Backend API: `https://api.jalsetu.me`
- Admin: `https://admin.jalsetu.me`

## DNS

- Point `jalsetu.me` to the frontend hosting target.
- Point `api.jalsetu.me` to the Django API service or API load balancer.
- Point `admin.jalsetu.me` to the Django admin service or the same Django service behind an admin-only route/proxy.

## Backend Environment

```env
DEBUG=False
FRONTEND_URL=https://jalsetu.me
BACKEND_API_URL=https://api.jalsetu.me
ADMIN_URL=https://admin.jalsetu.me
ALLOWED_HOSTS=jalsetu.me,api.jalsetu.me,admin.jalsetu.me
CSRF_TRUSTED_ORIGINS=https://jalsetu.me,https://api.jalsetu.me,https://admin.jalsetu.me
CORS_ALLOWED_ORIGINS=https://jalsetu.me,https://admin.jalsetu.me
MARKETPLACE_NAME=Jal-Setu
DEFAULT_FROM_EMAIL=Jal-Setu <no-reply@jalsetu.me>
SUPPORT_EMAIL=support@jalsetu.me
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
```

## Frontend Environment

```env
NEXT_PUBLIC_APP_NAME=Jal-Setu
NEXT_PUBLIC_SITE_URL=https://jalsetu.me
NEXT_PUBLIC_API_URL=https://api.jalsetu.me
NEXT_PUBLIC_ADMIN_URL=https://admin.jalsetu.me
BACKEND_API_URL=https://api.jalsetu.me/api
```

## SEO

- Canonical public URL: `https://jalsetu.me`
- Sitemap: `https://jalsetu.me/sitemap.xml`
- Robots: `https://jalsetu.me/robots.txt`
- Auth, checkout, supplier dashboard, customer orders, and revenue dashboard are marked `noindex`.

## Admin

Route `https://admin.jalsetu.me` to Django. The Django admin endpoint remains `/admin/`, so the final admin panel URL is expected to be `https://admin.jalsetu.me/admin/` unless the reverse proxy rewrites `/` to `/admin/`.

## Pre-Launch Checks

1. Confirm TLS certificates for all three domains.
2. Confirm `https://api.jalsetu.me/api/auth/me/` responds over HTTPS.
3. Confirm `https://jalsetu.me/sitemap.xml` and `https://jalsetu.me/robots.txt` are reachable.
4. Confirm admin login is available only at the admin domain.
5. Confirm Razorpay live keys and webhook settings use the production domains.
