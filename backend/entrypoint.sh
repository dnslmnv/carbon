#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python -c "from minio_setup import ensure_minio_bucket; ensure_minio_bucket()"
# Create a superuser if credentials are provided
python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model
from django.db import IntegrityError

username = os.getenv("DJANGO_SUPERUSER_USERNAME")
email = os.getenv("DJANGO_SUPERUSER_EMAIL")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

if username and email and password:
    User = get_user_model()
    try:
        obj, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "is_superuser": True, "is_staff": True},
        )
        if created:
            obj.set_password(password)
            obj.save()
            print(f"Superuser '{username}' created")
        else:
            print(f"Superuser '{username}' already exists; skipping creation")
    except IntegrityError as exc:
        print(f"Superuser creation failed: {exc}")
else:
    print("Superuser env vars not fully set; skipping superuser creation")
PY

exec "$@"
