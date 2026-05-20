FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system django \
    && adduser --system --ingroup django --home /app django

COPY requirements.txt /tmp/requirements.txt

RUN pip install --upgrade pip \
    && pip install -r /tmp/requirements.txt

COPY . /app

RUN SECRET_KEY=build-secret \
    DEBUG=False \
    ALLOWED_HOSTS=localhost \
    DB_NAME=bottle_wala \
    DB_USER=postgres \
    DB_PASSWORD=build-password \
    DB_HOST=host.docker.internal \
    DB_PORT=5432 \
    python manage.py collectstatic --noinput

RUN mkdir -p /app/staticfiles /app/media \
    && chown -R django:django /app

USER django

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
