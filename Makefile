COMPOSE=docker compose

.PHONY: up down logs migrate seed test

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f api postgres

migrate:
	$(COMPOSE) run --rm api npm run db:migrate

seed:
	$(COMPOSE) run --rm api npm run db:seed

test:
	cd backend && npm run test
