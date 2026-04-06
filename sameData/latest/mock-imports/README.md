These CSV fixtures all use the TradePepe broker import format:

`Symbol,Buy/Sell,Type,Product Type,Qty,Rem Qty,Limit Price,Stop Price,Traded Price,Status,Order Time`

Suggested manual test order:

1. `01-valid-long-closed.csv`
   Expected: full success, creates one closed long group.
2. `02-valid-short-closed-titlecase.csv`
   Expected: full success, creates one closed short group using title-case Buy/Sell values.
3. `03-partial-row-errors.csv`
   Expected: import completes with partial row failures and visible row-level errors.
4. `04-rem-qty-greater-than-qty.csv`
   Expected: import completes with one row-level validation error for `Rem Qty`.
5. `05-header-mismatch.csv`
   Expected: upload is rejected before row processing with a header format error.
