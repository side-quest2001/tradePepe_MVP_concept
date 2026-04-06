# TradePepe API

Base URL: `http://localhost:4000/api/v1`

Success responses use:

```json
{
  "data": {},
  "meta": {}
}
```

Error responses use:

```json
{
  "error": {
    "message": "Validation failed",
    "details": {},
    "requestId": "..."
  }
}
```

## Health

### `GET /health`

Returns application health status.

## Auth

### `POST /auth/signup`

Creates a new application user and returns:
- `user`
- `accessToken`
- `refreshToken`
- `expiresIn`

### `POST /auth/signin`

Signs in an existing user and returns:
- `user`
- `accessToken`
- `refreshToken`
- `expiresIn`

### `POST /auth/refresh`

Refreshes an access session from `refreshToken`.

### `POST /auth/forgot-password`

Starts the password reset flow for an email address. In local/dev mode, the response also returns a preview reset token.

### `POST /auth/reset-password`

Resets the password using a valid reset token and revokes existing sessions.

### `POST /auth/verify-email/request`

Requires bearer access token. Generates a fresh email verification token for the signed-in user.

### `POST /auth/verify-email/confirm`

Marks a user email as verified from a valid verification token.

### `POST /auth/signout`

Requires bearer access token. Revokes the provided refresh token or all sessions for the current user.

### `GET /auth/me`

Requires bearer access token. Returns current authenticated user identity.

## Imports

### `POST /imports/csv`

Uploads broker CSV data using `multipart/form-data`.

Fields:
- `file`: CSV file
- `fundId`: UUID
- `brokerName`: optional string

Response:
- `importId`
- `totalRows`
- `importedRows`
- `failedRows`
- `errors`

### `POST /imports/orders/csv`

Alias of `POST /imports/csv`.

### `GET /imports`

Paginated import history.

Query params:
- `page`
- `pageSize`
- `fundId`

Each item includes:
- `importId`
- `fundId`
- `brokerName`
- `fileName`
- `totalRows`
- `importedRows`
- `failedRows`
- `createdAt`

### `GET /imports/:id`

Returns one import history record.

## Orders

### `POST /orders/manual`

Creates a manual executed order and immediately runs grouping.

Request body:

```json
{
  "fundId": "11111111-1111-4111-8111-111111111111",
  "symbol": "NIFTY",
  "side": "buy",
  "orderType": "MARKET",
  "productType": "MIS",
  "qty": "2.00000000",
  "limitPrice": null,
  "stopPrice": null,
  "tradedPrice": "123.45000000",
  "status": "filled",
  "executedAt": "2026-04-05T10:30:00.000Z"
}
```

Response:
- created raw order
- affected order group in UI-friendly shape

### `GET /orders`

Paginated order list.

Query params:
- `page`
- `pageSize`
- `symbol`
- `fundId`
- `status`
- `dateFrom`
- `dateTo`
- `sortBy`: `orderTime | executionTime`
- `sortOrder`: `asc | desc`

## Order Groups

### `GET /order-groups`

Paginated grouped trade list for the journal UI.

Query params:
- `page`
- `pageSize`
- `symbol`
- `fundId`
- `positionType`
- `status`
- `returnStatus`
- `dateFrom`
- `dateTo`
- `setupTag`
- `reviewTag`
- `sortBy`: `firstInteractionDate | lastInteractionDate`
- `sortOrder`: `asc | desc`

Each item includes:
- `id`
- `symbol`
- `fundId`
- `positionType`
- `firstInteractionDate`
- `lastInteractionDate`
- `remainingQuantity`
- `realizedPnl`
- `unrealizedPnl`
- `returnStatus`
- `status`
- `entryOrders`
- `exitOrders`
- `setupTags`
- `reviewTags`
- `notesSummary`
- `publishedTrade`

### `GET /order-groups/:id`

Returns one grouped trade in the same UI-friendly shape.

### `PATCH /order-groups/:id`

Updates editable group fields.

Request body:

```json
{
  "notes": "Updated note",
  "brokerFees": "12.00000000",
  "charges": "5.00000000"
}
```

### `POST /order-groups/:id/notes`

Creates a note for a group.

Request body:

```json
{
  "noteType": "review",
  "content": "Held the winner well."
}
```

### `GET /order-groups/:id/notes`

Returns notes for a group ordered by `createdAt desc`.

### `POST /order-groups/:id/setup-tags`

Assigns a setup tag by `tagId` or `tagSlug`.

### `POST /order-groups/:id/review-tags`

Assigns a review tag by `tagId` or `tagSlug`.

## Notes

### `PATCH /notes/:id`

Updates `content` and/or `noteType`.

### `DELETE /notes/:id`

Hard deletes a note.

## Tags

### `GET /tags`

Returns tags.

Query params:
- `type`: `setup | review`

### `POST /tags`

Creates a tag.

Request body:

```json
{
  "name": "Breakout",
  "type": "setup",
  "color": "#ff6600"
}
```

### `PATCH /tags/:id`

Updates tag fields.

Tag fields:
- `id`
- `name`
- `slug`
- `color`
- `type`
- `createdAt`
- `updatedAt`

## Funds

### `GET /funds`

Returns all funds.

### `POST /funds`

Creates a fund.

Request body:

```json
{
  "name": "Main Fund",
  "brokerName": "Zerodha",
  "currency": "INR"
}
```

### `PATCH /funds/:id`

Updates `name`, `brokerName`, and/or `currency`.

Fund fields:
- `id`
- `name`
- `brokerName`
- `currency`
- `createdAt`

## Publish

### `POST /order-groups/:id/publish`

Publishes or updates the shared trade payload.

Request body:

```json
{
  "title": "NIFTY Breakout",
  "summary": "Clean opening range break with add."
}
```

### `GET /order-groups/:id/publish`

Returns the current published trade payload if present.

### `PATCH /order-groups/:id/publish`

Updates title, summary, and existing share payload fields without duplicating publish records.

## Community

### `GET /community/feed`

Returns published trade cards for the community feed with:
- `id`
- `tradeId`
- `title`
- `summary`
- `likes`
- `comments`
- `createdAt`
- `author`

### `GET /community/posts/:id/comments`

Returns comments for one published trade.

### `POST /community/posts/:id/comments`

Requires bearer access token. Creates a comment.

### `POST /community/posts/:id/reactions`

Requires bearer access token. Toggles a like/reaction for the current user.

## Profiles

### `GET /profiles/me`

Requires bearer access token. Returns the current user profile with stats.

### `GET /profiles/:handle`

Returns a public profile by handle.

### `POST /profiles/:id/follow`

Requires bearer access token. Toggles follow state for the current user.

## Market

### `GET /market/flash-news`

Returns dashboard-ready flash news cards.

Behavior:
- uses backend-managed provider data when configured
- falls back to local seeded data when provider keys are missing or upstream fails
- current free-tier-friendly provider path is designed for Alpha Vantage normalization

### `GET /market/economic-indicators`

Returns dashboard-ready economic indicator rows.

Behavior:
- uses backend-managed provider data when configured
- falls back to local seeded data when provider keys are missing or upstream fails

## Chart

### `GET /order-groups/:id/chart`

Returns:
- `orderMarkers`
- `pnlSeries`
- `summary`
  - `entryAvg`
  - `exitAvg`
  - `remainingQuantity`

This endpoint derives chart data from grouped orders only and does not fetch external market OHLC data.

## Analytics

All analytics endpoints support:
- `fundId`
- `symbol`
- `dateFrom`
- `dateTo`

### `GET /analytics/summary`

Returns:
- `totalRealizedPnl`
- `totalClosedTrades`
- `winRate`
- `avgHoldingTimeMinutes`
- `maxLoss`
- `maxProfit`

### `GET /analytics/performance-calendar`

Returns daily buckets with realized pnl and trade counts.

### `GET /analytics/tag-insights`

Returns setup and review tag usage with win/loss/neutral counts where derivable from closed groups.

### `GET /analytics/pnl-series`

Returns chronological cumulative pnl points.

### `GET /analytics/holding-time`

Returns:
- `avgMinutes`
- `minMinutes`
- `maxMinutes`

### `GET /analytics/win-loss`

Returns:
- `wins`
- `losses`
- `neutral`
- `winRate`
- `currentLossStreak`
- `longestLossStreak`

## Deprecated Routes

These legacy demo routes still exist for compatibility, but new frontend work should use the journal and import APIs above:
- `GET /trades`
- `POST /trades`
- `POST /trades/import/csv`

## Local Commands

From repo root:

```bash
make up
make migrate
make seed
make logs
make test
make down
```
