# Frontend Feature Documentation

## Overview
TradePepe frontend is a Next.js App Router application with a dark trading workspace theme. It currently includes private dashboard-style product surfaces and a new public/auth route group.

## Route Map

### `/signin`
- Purpose: first-party sign-in flow
- Data: `POST /auth/signin`
- Notes: stores access token in cookie and refresh token in local storage

### `/signup`
- Purpose: first-party account creation flow
- Data: `POST /auth/signup`

### `/forgot-password`
- Purpose: placeholder recovery surface
- Data: no live backend integration yet

### `/dashboard`
- Purpose: primary summary dashboard
- UI: top KPI cards, performance panel, notes, economic data, flash news
- Data:
  - live: `/analytics/summary`, `/analytics/performance-calendar`, `/analytics/pnl-series`, `/analytics/win-loss`
  - still static/presentational: flash news and economic content in current dashboard implementation

### `/journal`
- Purpose: grouped trade journal with inline expansion, labels, manual entries, and review drawer
- Data:
  - `/order-groups`
  - `/order-groups/:id`
  - `/order-groups/:id/chart`
  - `/order-groups/:id/notes`
  - `/order-groups/:id/setup-tags`
  - `/order-groups/:id/review-tags`
  - `/order-groups/:id/publish`
  - `/tags`
  - `/orders/manual`
- Notes:
  - label editing is frontend-rich and ready for tag endpoints
  - drawer editor is Lexical-backed

### `/analytics`
- Purpose: dual-mode analytics workspace
- Modes:
  - `Trade Analytics` builder
  - `Analytics Dashboard`
- Data:
  - `/analytics/summary`
  - `/analytics/performance-calendar`
  - `/analytics/pnl-series`
  - `/analytics/win-loss`
  - `/order-groups`
- Notes:
  - some dashboard cards derive aggregate values in the frontend from order-group data

### `/imports`
- Purpose: CSV upload/import management surface
- Data:
  - planned live integration around `/imports/csv`, `/imports`, `/imports/:id`

### `/community`
- Purpose: published trade feed and comment surface
- Data:
  - live-ready: `/community/feed`
  - comments: `/community/posts/:id/comments`
  - reactions: `/community/posts/:id/reactions`
- Notes:
  - embedded trade previews still rely on journal group data

### `/profile`
- Purpose: public/current trader profile surface
- Data:
  - `/profiles/me`
  - `/profiles/:handle`
  - `/profiles/:id/follow`

## Application Systems

### Auth
- Auth provider wraps the entire app
- Access token is stored in cookie for route protection
- Refresh token is stored client-side for session renewal
- Dashboard route group is protected at the layout layer

### API Client
- `frontend/lib/api/client.ts` handles app data
- `frontend/lib/api/auth-client.ts` handles auth endpoints
- Mock mode is still supported through `NEXT_PUBLIC_USE_MOCKS`

### Theme and UX
- Core look: dark navy surfaces, teal accents, compact data-dense layout
- Heavy use of custom panels, grouped ledger rows, Recharts visualizations, and motion-enhanced detail surfaces

## Current Live/Mock Split
- Fully mock-friendly:
  - dashboard flash news/economic content
  - some community/profile author identity assumptions
- Mostly backend-mapped:
  - journal
  - analytics
  - tags/funds/resources
- New live auth contract now exists but frontend sessions still assume backend availability and correct API base env setup
