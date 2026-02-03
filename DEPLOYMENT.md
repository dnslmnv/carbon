# Production deployment (single VM + Docker)

This guide assumes a single Linux server with Docker installed, a domain already purchased, and that the site can be served as a static frontend with an (optional) Django backend behind Nginx.

## 1) Server prerequisites

1. **Point DNS to your server**
   - Create an `A` record for `carbon69.ru` pointing to your server's IPv4 address.
   - (Optional) Create an `A` record for `www` pointing to the same IP.
   - (Optional) If you also have IPv6, add matching `AAAA` records for `carbon69.ru` and `www`.
   - **IP choice:** make sure you provision a **public IPv4** address. IPv6 is optional, but IPv4 ensures compatibility with all DNS clients.

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
3. Create the frontend environment file to enable the WIP page:
   ```bash
   echo "VITE_WIP_PAGE=1" > frontend/.env
   ```
   - Set it to `0` (or remove the file) when you want the full site to show.

> **Note:** The backend is optional for your current deployment. If you do not need it, you can keep it running as-is; it will not affect the static frontend unless you call the `/api` or `/admin` routes.

## 3) Configure Nginx for your domain + SSL

1. Open `nginx/prod.conf` and replace:
   - `carbon69.ru` / `www.carbon69.ru` with your real domain(s).
   - SSL certificate paths should match your domain directory in `/etc/letsencrypt/live/<your-domain>/`.

2. Open `nginx/prod-http.conf` and replace:
   - `carbon69.ru` / `www.carbon69.ru` with your real domain(s).

3. The production Nginx config already includes:
   - HTTP → HTTPS redirect
   - ACME challenge path for Let's Encrypt
   - Static SPA routing

## 4) Obtain SSL certificates

Before you have certificates, use the HTTP-only config so Nginx can start and serve the ACME challenge.

```bash
# First boot with HTTP only (for ACME challenge)
# Use --no-deps so nginx can start even if backend isn't ready yet.
export NGINX_CONF=prod-http.conf
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps nginx
```

Use the included `certbot` container to issue the certificate (replace domain + email):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  -d carbon69.ru \
  -d www.carbon69.ru \
  --email you@example.com \
  --agree-tos \
  --no-eff-email
```

After the certificate is issued, restart Nginx so it picks up the new files:

```bash
unset NGINX_CONF
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx
```

## 5) Run the full stack

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 5.1) Makefile shortcuts (local + server)

The repo includes a `Makefile` to chain common workflows.

### Local development

- Start the stack (foreground):
  ```bash
  make dev-up
  ```
- Start the stack (detached):
  ```bash
  make dev-up-d
  ```
- Rebuild and restart in the background:
  ```bash
  make dev-restart
  ```
- Stop containers:
  ```bash
  make dev-down
  ```

### Server updates

Run these on the server in the repo folder.

- Pull latest code and rebuild the production stack:
  ```bash
  make prod-update
  ```
- Start the production stack:
  ```bash
  make prod-up
  ```
- Restart running production containers:
  ```bash
  make prod-restart
  ```
- Stop production containers:
  ```bash
  make prod-down
  ```

## 6) Automatic certificate renewal

Let's Encrypt certificates expire every 90 days. Run this monthly via cron:

```bash
0 3 1 * * docker compose -f /path/to/docker-compose.yml -f /path/to/docker-compose.prod.yml run --rm certbot renew && docker compose -f /path/to/docker-compose.yml -f /path/to/docker-compose.prod.yml exec nginx nginx -s reload
```

## 7) Validation checklist

- `http://carbon69.ru` redirects to `https://carbon69.ru`.
- `https://carbon69.ru` serves the SPA.
- `https://carbon69.ru/api/` returns a backend response (optional).
- SSL check: <https://www.ssllabs.com/ssltest/>
