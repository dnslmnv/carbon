# Running Carbon69 locally with Docker

## 1) Prerequisites
- Docker Engine + Docker Compose plugin installed (`docker --version` and `docker compose version`).
- Ports available on your host:
  - `80` (nginx + frontend)
  - `9000` (MinIO API)
  - `9001` (MinIO console)

## 2) Environment setup
1. Ensure backend environment file exists:
   ```bash
   cp backend/env_example.txt backend/.env
   ```
   (Skip copy if `backend/.env` already exists.)
2. Verify these service hostnames in `backend/.env`:
   - `POSTGRES_HOST=db`
   - `MINIO_ENDPOINT=http://minio:9000`
   - `CELERY_BROKER_URL=redis://redis:6379/0`

## 3) Start full stack
From repository root:
```bash
docker compose up --build -d
```

## 4) Validate containers are up
```bash
docker compose ps
```
Expected services: `backend`, `nginx`, `db`, `minio`, `redis`, `celeryworker`, `celerybeat`.

## 5) Validate frontend <-> backend communication
1. Open app:
   - http://localhost
2. Confirm API is reachable through nginx reverse proxy:
   ```bash
   curl -i http://localhost/api/hello/
   ```
   Expected body includes:
   ```json
   {"message":"Hello, DRF!"}
   ```

## 6) Validate backend <-> Postgres communication
Backend runs migrations on startup via entrypoint. Check backend logs for successful migration/application startup:
```bash
docker compose logs backend --tail=200
```
You should see migration and gunicorn startup messages (and no database connection errors).

Optional DB-level sanity check:
```bash
docker compose exec db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```
Expected: `accepting connections`.

## 7) Validate backend <-> S3 (MinIO) communication
Backend entrypoint calls MinIO setup on startup. Check backend logs:
```bash
docker compose logs backend --tail=200
```
You should see MinIO bucket setup messages and no MinIO credential/connection errors.

Optional MinIO console check:
- Open http://localhost:9001
- Log in with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`
- Confirm bucket from `MINIO_BUCKET` exists.

## 8) Validate service wiring quickly
Run from repo root:
```bash
docker compose exec backend python - <<'PY'
import os
import socket

checks = {
    "db": ("db", 5432),
    "minio": ("minio", 9000),
    "redis": ("redis", 6379),
}

for name, (host, port) in checks.items():
    try:
        sock = socket.create_connection((host, port), timeout=3)
        sock.close()
        print(f"OK: {name} reachable at {host}:{port}")
    except Exception as exc:
        print(f"FAIL: {name} unreachable at {host}:{port} -> {exc}")
PY
```

## 9) Stop stack
```bash
docker compose down
```

To also remove volumes (database/object data):
```bash
docker compose down -v
```
