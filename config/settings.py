from datetime import timedelta
import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured


BASE_DIR = Path(__file__).resolve().parent.parent


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"").strip("'")
        os.environ.setdefault(key, value)


load_env_file(BASE_DIR / ".env")


def env(key: str, default: str | None = None) -> str | None:
    return os.environ.get(key, default)


def env_first(keys: tuple[str, ...], default: str | None = None) -> str | None:
    for key in keys:
        value = os.environ.get(key)
        if value not in {None, ""}:
            return value
    return default


def env_bool(key: str, default: bool = False) -> bool:
    value = env(key)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def env_int(key: str, default: int) -> int:
    value = env(key)
    if value is None:
        return default
    return int(value)


def env_list(key: str, default: str = "") -> list[str]:
    return [item.strip() for item in env(key, default).split(",") if item.strip()]


SECRET_KEY = env_first(("SECRET_KEY", "DJANGO_SECRET_KEY"), "unsafe-development-secret-key")
DEBUG = env_bool("DEBUG", env_bool("DJANGO_DEBUG", False))
FRONTEND_URL = env("FRONTEND_URL", "https://jalsetu.me").rstrip("/")
BACKEND_API_URL = env("BACKEND_API_URL", "https://api.jalsetu.me").rstrip("/")
ADMIN_URL = env("ADMIN_URL", "https://admin.jalsetu.me").rstrip("/")
ALLOWED_HOSTS = env_list(
    "ALLOWED_HOSTS",
    "jalsetu.me,api.jalsetu.me,admin.jalsetu.me,localhost,127.0.0.1",
)
CSRF_TRUSTED_ORIGINS = env_list(
    "CSRF_TRUSTED_ORIGINS",
    "https://jalsetu.me,https://api.jalsetu.me,https://admin.jalsetu.me",
)
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    "https://jalsetu.me,https://admin.jalsetu.me,http://localhost:3000,http://127.0.0.1:3000",
)
MARKETPLACE_NAME = env("MARKETPLACE_NAME", "Jal-Setu")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", "Jal-Setu <no-reply@jalsetu.me>")
SUPPORT_EMAIL = env("SUPPORT_EMAIL", "support@jalsetu.me")

if not DEBUG and SECRET_KEY == "unsafe-development-secret-key":
    raise ImproperlyConfigured("Set DJANGO_SECRET_KEY in the environment for non-debug deployments.")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "apps.accounts.apps.AccountsConfig",
    "apps.suppliers.apps.SuppliersConfig",
    "apps.products.apps.ProductsConfig",
    "apps.orders.apps.OrdersConfig",
    "apps.revenue.apps.RevenueConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "common.middleware.DomainAwareCorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env_first(("DB_NAME", "POSTGRES_DB"), "bottle_wala"),
        "USER": env_first(("DB_USER", "POSTGRES_USER"), "postgres"),
        "PASSWORD": env_first(("DB_PASSWORD", "POSTGRES_PASSWORD"), "change-me"),
        "HOST": env_first(("DB_HOST", "POSTGRES_HOST"), "host.docker.internal"),
        "PORT": env_first(("DB_PORT", "POSTGRES_PORT"), "5432"),
        "CONN_MAX_AGE": env_int("DB_CONN_MAX_AGE", env_int("POSTGRES_CONN_MAX_AGE", 60)),
        "OPTIONS": {
            "sslmode": env("DB_SSLMODE", "prefer"),
        },
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = Path(env("STATIC_ROOT", "/app/staticfiles"))
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = Path(env("MEDIA_ROOT", str(BASE_DIR / "media")))

ORDER_CURRENCY = env("ORDER_CURRENCY", "INR").upper()
RAZORPAY_KEY_ID = env("RAZORPAY_KEY_ID", "") or ""
RAZORPAY_KEY_SECRET = env("RAZORPAY_KEY_SECRET", "") or ""
RAZORPAY_API_BASE_URL = env("RAZORPAY_API_BASE_URL", "https://api.razorpay.com")
RAZORPAY_TIMEOUT_SECONDS = env_int("RAZORPAY_TIMEOUT_SECONDS", 15)
DEMO_PAYMENT_MODE = env_bool("DEMO_PAYMENT_MODE", not (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET))

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", False if DEBUG else True)
SECURE_HSTS_SECONDS = env_int("SECURE_HSTS_SECONDS", 31536000 if not DEBUG else 0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("SECURE_HSTS_INCLUDE_SUBDOMAINS", not DEBUG)
SECURE_HSTS_PRELOAD = env_bool("SECURE_HSTS_PRELOAD", not DEBUG)
SECURE_REFERRER_POLICY = "same-origin"
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_PAGINATION_CLASS": "common.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 20,
    "EXCEPTION_HANDLER": "common.exceptions.custom_exception_handler",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=env_int("ACCESS_TOKEN_MINUTES", 30)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=env_int("REFRESH_TOKEN_DAYS", 7)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "UPDATE_LAST_LOGIN": True,
}

# Guest Session Configuration
GUEST_SESSION_EXPIRY_DAYS = env_int("GUEST_SESSION_EXPIRY_DAYS", 14)
GUEST_SESSION_CLEANUP_INTERVAL_HOURS = env_int("GUEST_SESSION_CLEANUP_INTERVAL_HOURS", 24)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        }
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}
