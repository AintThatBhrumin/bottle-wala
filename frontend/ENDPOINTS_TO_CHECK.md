# Jal-Setu Endpoints To Check

Base URL while running locally:

`http://127.0.0.1:3000`

## Main app routes

- Home: `http://127.0.0.1:3000/`
- Login: `http://127.0.0.1:3000/login`
- Register: `http://127.0.0.1:3000/register`
- Suppliers: `http://127.0.0.1:3000/suppliers`
- Cart: `http://127.0.0.1:3000/cart`
- Checkout: `http://127.0.0.1:3000/checkout`
- Orders: `http://127.0.0.1:3000/orders`
- Supplier dashboard: `http://127.0.0.1:3000/supplier-dashboard`

## Notes on protected routes

- `/suppliers`, `/cart`, `/checkout`, `/orders`, and `/supplier-dashboard` require authentication.
- If you are not logged in, the app redirects you to `/login`.
- After creating a customer account, the app currently lands on `/suppliers`.

## Useful frontend API endpoints

These are the Next.js routes exposed by the frontend app itself.

- Login API: `http://127.0.0.1:3000/api/auth/login`
- Register API: `http://127.0.0.1:3000/api/auth/register`
- Logout API: `http://127.0.0.1:3000/api/auth/logout`
- Current user API: `http://127.0.0.1:3000/api/auth/me`
- Refresh session API: `http://127.0.0.1:3000/api/auth/refresh`

## Proxy API endpoints used in the main flow

These are the frontend proxy routes that forward to the backend.

- Suppliers list: `http://127.0.0.1:3000/api/proxy/suppliers/`
- Single supplier example: `http://127.0.0.1:3000/api/proxy/suppliers/<supplier-id>/`
- Current supplier profile: `http://127.0.0.1:3000/api/proxy/suppliers/mine/`
- Products by supplier example: `http://127.0.0.1:3000/api/proxy/products/?supplier=<supplier-id>`
- Create order: `http://127.0.0.1:3000/api/proxy/orders/`
- Customer order history: `http://127.0.0.1:3000/api/proxy/orders/history/`
- Supplier incoming orders: `http://127.0.0.1:3000/api/proxy/orders/incoming/`
- Verify payment example: `http://127.0.0.1:3000/api/proxy/orders/<order-id>/verify-payment/`
- Payment failure example: `http://127.0.0.1:3000/api/proxy/orders/<order-id>/payment-failed/`

## Brand asset endpoint

- Logo image: `http://127.0.0.1:3000/brand/jal-setu-logo.png`

## Recommended manual check order

1. Open `/`
2. Open `/register`
3. Create an account and confirm redirect to `/suppliers`
4. Open `/cart`
5. Open `/orders`
6. Open `/api/auth/me`
7. Open `/api/proxy/suppliers/`
