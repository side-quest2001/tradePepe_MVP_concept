import express, { Router } from "express";

import {
  createTradeEntry,
  importTradeEntriesCsv,
  listTradeEntries
} from "../controllers/trade-entry.controller.js";

const tradeEntryRouter = Router();

// Deprecated legacy demo routes.
// Prefer /order-groups, /orders/manual, and /imports/csv.
tradeEntryRouter.get("/", listTradeEntries);
tradeEntryRouter.post("/", createTradeEntry);
tradeEntryRouter.post(
  "/import/csv",
  express.text({
    type: ["text/csv", "application/csv"]
  }),
  importTradeEntriesCsv
);

export { tradeEntryRouter };
