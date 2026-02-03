# AGENTS.md

Welcome! This repo contains the Carbon69 website (backend + frontend) and supporting infrastructure.

## Repo layout
- `backend/`: Django REST API (custom User model, JWT auth, MinIO integration).
- `frontend/`: Vite + React + TypeScript + Tailwind UI.
- `nginx/`: Reverse proxy for API/admin + static frontend.
- `docker-compose.yml`: Local development stack.
- `PROJECT_CONTEXT.txt`: High-level product and architecture overview.

## Quick start
- Backend (local):
  - `cd backend`
  - `python -m venv .venv && source .venv/bin/activate`
  - `pip install -r requirements.txt`
  - `python manage.py migrate && python manage.py runserver`
- Frontend (local):
  - `cd frontend`
  - `npm install`
  - `npm run dev`
- Docker (full stack):
  - `docker compose up --build`

## Development tips
- Prefer small, focused changes with tests when applicable.
- Update `PROJECT_CONTEXT.txt` if you introduce new domain models or major architectural shifts.
- Use `rg` for searching; avoid `ls -R` or `grep -R` in large trees.

## Testing
- Backend: `cd backend && python manage.py test`
- Frontend: `cd frontend && npm test` (if/when tests are added)

## UX/UI changes
- If you change frontend visuals, capture a screenshot using the browser tooling.

