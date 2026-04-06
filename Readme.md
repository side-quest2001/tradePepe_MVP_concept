# TradePepe

TradePepe is split into separate top-level applications:

- `backend/` contains the production-oriented Node.js API
- `frontend/` is reserved for a future UI and stays independent

This keeps the project simple and avoids monorepo tooling while still giving both apps clear boundaries.

## File Tree

```text
.
├── Readme.md
├── backend
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── .gitignore
│   ├── drizzle.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── app.ts
│   │   ├── config
│   │   │   ├── env.ts
│   │   │   └── logger.ts
│   │   ├── controllers
│   │   │   ├── health.controller.ts
│   │   │   └── trade-entry.controller.ts
│   │   ├── db
│   │   │   ├── client.ts
│   │   │   ├── migrate.ts
│   │   │   ├── migrations
│   │   │   │   └── .gitkeep
│   │   │   ├── schema
│   │   │   │   └── trade-entry.schema.ts
│   │   │   └── seed.ts
│   │   ├── middlewares
│   │   │   ├── error-handler.middleware.ts
│   │   │   ├── not-found.middleware.ts
│   │   │   └── request-logger.middleware.ts
│   │   ├── repositories
│   │   │   └── trade-entry.repository.ts
│   │   ├── routes
│   │   │   ├── health.routes.ts
│   │   │   ├── index.ts
│   │   │   └── trade-entry.routes.ts
│   │   ├── services
│   │   │   ├── health.service.ts
│   │   │   └── trade-entry.service.ts
│   │   ├── types
│   │   │   └── trade-entry.ts
│   │   ├── utils
│   │   │   ├── api-error.ts
│   │   │   ├── async-handler.ts
│   │   │   └── csv.util.ts
│   │   ├── validators
│   │   │   └── trade-entry.validator.ts
│   │   └── server.ts
│   ├── tests
│   │   ├── health.test.ts
│   │   └── setup.ts
│   ├── tsconfig.json
│   └── vitest.config.ts
├── docker-compose.yml
├── frontend
│   └── README.md
└── sameData
```

## Backend Stack

- Node.js
- Express
- TypeScript with strict mode
- PostgreSQL
- Drizzle ORM
- Zod validation
- CSV parsing via `csv-parse`
- Vitest for tests
- Docker Compose for app and database

## Local Setup

1. Copy the example environment file.

```bash
cp backend/.env.example backend/.env
```

2. Install backend dependencies.

```bash
cd backend
npm install
```

3. Start PostgreSQL with Docker Compose from the repository root.

```bash
cd /home/user/projects/tradepepe
docker compose up -d postgres
```

4. Generate the initial migration, run it, and seed sample data.

```bash
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Start the backend in development mode.

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## Available Scripts

From `backend/`:

- `npm run dev` starts the API with hot reload
- `npm run build` compiles TypeScript into `dist/`
- `npm run start` runs the compiled app
- `npm run typecheck` runs strict TypeScript checks
- `npm run test` runs the Vitest suite
- `npm run test:watch` runs tests in watch mode
- `npm run db:generate` generates Drizzle SQL migrations from the schema
- `npm run db:migrate` applies migrations
- `npm run db:seed` seeds sample trade data

## Docker

Start the full stack:

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Primary API surfaces:

- `GET /api/v1/health`
- `POST /api/v1/imports/csv`
- `GET /api/v1/imports`
- `POST /api/v1/orders/manual`
- `GET /api/v1/orders`
- `GET /api/v1/order-groups`
- `GET /api/v1/order-groups/:id`
- `GET /api/v1/tags`
- `GET /api/v1/funds`
- `GET /api/v1/analytics/summary`

Deprecated demo routes remain available temporarily:

- `GET /api/v1/trades`
- `POST /api/v1/trades`
- `POST /api/v1/trades/import/csv`

Prefer the journal routes and `/api/v1/imports/csv` for all new frontend work.

## API Docs

Detailed endpoint documentation lives in [backend/API.md](/home/user/projects/tradepepe/backend/API.md).
