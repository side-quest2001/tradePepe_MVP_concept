# TradePepe Frontend

A polished Next.js frontend for the TradePepe trade analytics and journaling platform.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React

## Included views
- Analytics dashboard
- Journal grouped trade list
- Detailed trade review panel
- Custom analytics builder
- Community feed
- Profile page
- Auth flow

## Product docs
- `../docs/frontend-features.md`
- `../docs/integration-audit.md`
- `../docs/third-party-api-report.md`

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment
- `NEXT_PUBLIC_API_BASE_URL`: backend base URL
- `NEXT_PUBLIC_USE_MOCKS`: set to `false` to hit the real backend

## Backend mapping
The frontend is wired around these backend route groups:
- `/analytics/*`
- `/order-groups`
- `/order-groups/:id`
- `/tags`
- publish payloads derived from `/order-groups/:id/publish`
- CSV import support can be added to a dedicated upload view using `/imports/csv`

## Notes
- Mock data is enabled by default so the UI renders immediately.
- Switch mocks off after your backend is up.
- The visual system follows the uploaded PDF references: dark navy panels, compact widgets, teal accents, grouped trade cards, and profile/community surfaces.
