# Third-Party API Recommendation Report

## Recommended Provider Categories

### Broker Connectivity
- Zerodha Kite Connect
  - Best fit for India equities/options funds already reflected in the product
  - Use for broker sync beyond CSV uploads
- Binance API
  - Best fit for crypto funds already present in backend seed data
  - Use for crypto executions, balances, and position snapshots

### Market / OHLC / Quote Data
- Twelve Data
  - Good general-purpose candidate for charts and symbol coverage
  - Easier initial integration path
- Polygon or Finnhub
  - Stronger option/equity market-data direction if deeper analytics or lower-latency needs grow

### Economic Calendar
- Alpha Vantage
  - Free-key-friendly choice for dashboard economic indicators
  - Best fit for the current lightweight economic table
- TradingEconomics
  - Stronger macro/calendar depth if a paid or broader dataset is needed later
- Finnhub economic calendar
  - Good alternative if consolidating providers

### Market News
- MarketAux
  - Practical market/news aggregation candidate for dashboard flash news
- Finnhub news
  - Useful if quote/news/economic provider consolidation is desired

### Sentiment / NLP
- OpenAI or lightweight internal classification
  - Best fit for the sentiment-style analytics fields already envisioned in the spreadsheet spec
  - Recommended as backend-proxied enrichment, not direct frontend usage

### Media Storage
- S3-compatible object storage
  - Best default for avatars, cover images, and future attachments
- Cloudinary
  - Best if image transformation and CDN-style media handling becomes important quickly

## Recommended Integration Shape
- Broker, market, calendar, and news providers should be called by the backend, not directly by the frontend
- Backend should normalize/cache external data into TradePepe-specific DTOs
- Frontend should only consume stable first-party endpoints such as:
  - `/market/flash-news`
  - `/market/economic-indicators`
  - future `/market/ohlc`
  - future `/brokers/accounts`

## V1 Priority
- Required soon:
  - market news
  - economic indicators/calendar
  - broker connectivity strategy
- Can remain mocked in early live rollout:
  - sentiment/NLP
  - media upload workflow
  - deep OHLC overlays beyond current journal-derived chart data
