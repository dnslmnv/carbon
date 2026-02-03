SHELL := /bin/bash

COMPOSE_DEV := docker compose
COMPOSE_PROD := docker compose -f docker-compose.yml -f docker-compose.prod.yml

.PHONY: dev-up dev-up-d dev-down dev-restart prod-up prod-down prod-restart prod-update

dev-up:
	$(COMPOSE_DEV) up --build

dev-up-d:
	$(COMPOSE_DEV) up -d --build

dev-down:
	$(COMPOSE_DEV) down

dev-restart:
	$(COMPOSE_DEV) down
	$(COMPOSE_DEV) up -d --build

prod-up:
	$(COMPOSE_PROD) up -d

prod-down:
	$(COMPOSE_PROD) down

prod-restart:
	$(COMPOSE_PROD) restart

prod-update:
	git pull
	$(COMPOSE_PROD) up -d --build
