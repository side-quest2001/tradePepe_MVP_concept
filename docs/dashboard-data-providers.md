# Dashboard Data Provider Guide

TradePepe should keep dashboard news and economic data behind first-party backend endpoints. The frontend should never call third-party providers directly.

## Recommended Providers

### Alpha Vantage
- Needed for: `Economic Indicators`
- Scope: macro indicator snapshots and calendar-style economic data
- Why it fits now:
  - free API key is easy to get for local and early-stage production use
  - economic indicator endpoints are simple enough to normalize into the current dashboard table
  - good fit when TradePepe needs a lightweight first provider before deeper calendar coverage
- Integration shape:
  - backend-proxied
  - short-lived cache recommended
  - normalize into the existing `/market/economic-indicators` DTOs
- Recommendation level: Primary

Official docs:
- https://www.alphavantage.co/documentation/
- https://www.alphavantage.co/support/

### MarketAux
- Needed for: `Flash News`
- Scope: market/news aggregation for dashboard-ready headlines
- Why it fits now:
  - simple REST API for financial news
  - good fit for a compact flash-news sidebar
  - fast first integration path without redesigning the dashboard
- Integration shape:
  - backend-proxied
  - short-lived cache recommended
  - normalize into the existing `/market/flash-news` DTOs
- Recommendation level: Primary

Official docs:
- https://www.marketaux.com/docs

### Finnhub
- Needed for: `Flash News` and `Economic Indicators`
- Scope: consolidation fallback if TradePepe prefers fewer providers later
- Why it fits now:
  - can cover both macro/economic and market/news use cases
  - useful if provider sprawl becomes a maintenance concern
- Integration shape:
  - backend-proxied
  - cache recommended
  - candidate for a later provider-consolidation pass
- Recommendation level: Fallback / consolidation option

## TradePepe Decision For This Phase
- `Alpha Vantage` for `/market/economic-indicators`
- `MarketAux` for `/market/flash-news`
- keep DB-seeded market data as the fallback when:
  - provider keys are missing
  - provider requests fail
  - provider payloads cannot be normalized safely

## Not In Scope Right Now
- broker connectivity
- broker account sync
- direct frontend provider calls
- replacing CSV upload with broker APIs
