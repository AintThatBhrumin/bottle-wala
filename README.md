# Jal-Setu

Production-oriented marketplace where customers order customized water bottles for events from multiple suppliers.

## Production Domains

- Frontend: `https://jalsetu.me`
- Backend API: `https://api.jalsetu.me`
- Admin: `https://admin.jalsetu.me`

## Stack

- Django
- Django REST Framework
- PostgreSQL
- JWT authentication with `djangorestframework-simplejwt`

## Project Structure

```text
.
|-- manage.py
|-- requirements.txt
|-- .env.example
|-- config/
|   |-- __init__.py
|   |-- settings.py
|   |-- urls.py
|   |-- asgi.py
|   `-- wsgi.py
|-- common/
|   |-- __init__.py
|   `-- pagination.py
`-- apps/
    |-- __init__.py
    |-- accounts/
    |-- suppliers/
    |-- products/
    `-- orders/
```

## Quick Start

1. Install dependencies: `pip install -r requirements.txt`
2. Create a PostgreSQL database and user.
3. Copy `.env.example` to `.env` and fill in secrets/domain values.
4. Run migrations: `python manage.py makemigrations && python manage.py migrate`
5. Create a superuser: `python manage.py createsuperuser`
6. Start the API: `python manage.py runserver`

## Roles

- `customer`: Can browse products and place orders.
- `supplier`: Can manage supplier profile and catalog.
- `admin`: Platform administration role.

## Auth Endpoints

- `POST /api/auth/register/`
- `POST /api/auth/token/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/me/`

## Deployment

See `DEPLOYMENT.md` for production domain, SEO, CORS, CSRF, and admin-domain configuration.
