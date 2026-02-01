# Production deployment (single VM + Docker)

This guide assumes a single Linux server with Docker installed, a domain already purchased, and that the site can be served as a static frontend with an (optional) Django backend behind Nginx.

## 1) Server prerequisites

1. **Point DNS to your server**
   - Create an `A` record for `example.com` pointing to your server's IPv4 address.
   - (Optional) Create an `A` record for `www` pointing to the same IP.

2. **Open firewall ports**
   - Allow inbound TCP on **80** and **443**.

3. **Install Docker + Docker Compose**
   - Install Docker Engine and the `docker compose` plugin for your distribution.

## 2) Prepare environment files

1. Copy the production environment template and update values:
   ```bash
   cp backend/env_production_example.txt backend/.env
   ```
2. Edit `backend/.env`:
   - Set `ALLOWED_HOSTS` to your domain(s).
   - Set `SECRET_KEY` to a strong random value.
   - Update any DB credentials you want to use.

> **Note:** The backend is optional for your current deployment. If you do not need it, you can keep it running as-is; it will not affect the static frontend unless you call the `/api` or `/admin` routes.

## 3) Configure Nginx for your domain + SSL

1. Open `nginx/prod.conf` and replace:
   - `example.com` / `www.example.com` with your real domain(s).
   - SSL certificate paths should match your domain directory in `/etc/letsencrypt/live/<your-domain>/`.

2. The production Nginx config already includes:
   - HTTP → HTTPS redirect
   - ACME challenge path for Let's Encrypt
   - Static SPA routing

## 4) Obtain SSL certificates

Use the included `certbot` container to issue the certificate:

```bash
# First boot with HTTP only (for ACME challenge)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx

# Request cert (replace domain + email)
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  -d example.com \
  -d www.example.com \
  --email you@example.com \
  --agree-tos \
  --no-eff-email
```

After the certificate is issued, restart Nginx so it picks up the new files:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx
```

## 5) Run the full stack

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 6) Automatic certificate renewal

Let's Encrypt certificates expire every 90 days. Run this monthly via cron:

```bash
0 3 1 * * docker compose -f /path/to/docker-compose.yml -f /path/to/docker-compose.prod.yml run --rm certbot renew && docker compose -f /path/to/docker-compose.yml -f /path/to/docker-compose.prod.yml exec nginx nginx -s reload
```

## 7) Validation checklist

- `http://example.com` redirects to `https://example.com`.
- `https://example.com` serves the SPA.
- `https://example.com/api/` returns a backend response (optional).
- SSL check: <https://www.ssllabs.com/ssltest/>
