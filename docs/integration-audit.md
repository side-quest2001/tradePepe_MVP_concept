# Frontend ↔ Backend Integration Audit

## Current Alignment

### Already aligned
- Journal grouped trades: frontend uses the documented order-group/journal API family
- Analytics summary/calendar/pnl/win-loss: frontend has working mappings to documented backend analytics endpoints
- Tags and fund resources: shapes are already compatible with frontend resource usage
- Publish/chart endpoints: backend coverage exists for journal share and chart flows

### Backend exists but frontend is still partly static/mock-backed
- Dashboard flash news
- Dashboard economic indicators / economic calendar content
- Imports page workflow
- Some community/profile identity details and social interactions

### Frontend exists but backend contracts were missing before this pass
- Auth/session endpoints
- Current-user identity endpoint
- Community feed/comments/reactions
- Public/current profile endpoints

## Gaps and Refactors

### Backend work still needed or recommended
- Auth persistence is still a candidate for DB-backed refactor:
  - current implementation can evolve into durable users/sessions tables
- Community/profile data should eventually move from in-memory social metadata to persistent storage
- Dashboard external-data endpoints need provider-backed ingestion and caching if they are to replace static content completely
- Route authorization is not yet enforced across all journal/resource writes; current protected scope is focused on auth/community/profile actions

### Frontend work still needed or recommended
- Community and profile pages should finish migrating from mock-derived assumptions to dedicated live profile/feed endpoints
- Dashboard flash news and economic sections should consume backend market endpoints instead of inline static arrays
- Session refresh and protected-route UX should gain explicit expired-session handling screens
- Authenticated user context can be surfaced more broadly across profile/community/dashboard chrome

## Route Matrix

| Feature | Frontend Status | Backend Status | Next Action |
| --- | --- | --- | --- |
| Auth | Implemented | Implemented | Add durable auth persistence and reset-password flow |
| Dashboard analytics cards | Implemented | Implemented | Tune data contracts only if needed |
| Dashboard flash news | Static frontend | Implemented endpoint | Swap page to backend source |
| Dashboard economic section | Static/frontend-mixed | Implemented endpoint | Replace static arrays with endpoint data |
| Journal table + drawer | Implemented | Implemented | Add auth-aware ownership rules later |
| Imports flow | UI present | Implemented | Wire upload/history UI fully |
| Community feed | Implemented | Implemented | Replace remaining mock assumptions in UI |
| Community comments/reactions | UI-ready | Implemented | Connect comment/reaction interactions in page flow |
| Profile page | Implemented | Implemented | Hydrate with `/profiles/me` and public profile data |

## Integration Risks
- Port defaults were mismatched before this pass; backend/frontend envs should now target frontend on `3000` and backend on `4000`
- Existing frontend pages still run with `NEXT_PUBLIC_USE_MOCKS=true` by default, so live backend coverage may be hidden until mock mode is disabled
- There is still one unrelated frontend TypeScript issue in `components/journal/trade-detail.tsx` that can mask fully clean cross-app verification
