import type { Request, Response } from "express";

import { logger } from "../config/logger.js";
import { tradeEntryService } from "../services/trade-entry.service.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { buildSuccessResponse } from "../utils/error-response.util.js";

function logDeprecatedRouteUsage(req: Request) {
  logger.warn(
    {
      method: req.method,
      path: req.originalUrl
    },
    "Deprecated trade demo route used. Prefer /order-groups and /imports/csv."
  );
}

export const listTradeEntries = asyncHandler(async (_req: Request, res: Response) => {
  logDeprecatedRouteUsage(_req);
  const entries = await tradeEntryService.list();

  res.status(200).json(buildSuccessResponse(entries));
});

export const createTradeEntry = asyncHandler(async (req: Request, res: Response) => {
  logDeprecatedRouteUsage(req);
  const entry = await tradeEntryService.create(req.body);

  res.status(201).json(buildSuccessResponse(entry));
});

export const importTradeEntriesCsv = asyncHandler(async (req: Request, res: Response) => {
  logDeprecatedRouteUsage(req);
  const csvContent =
    typeof req.body === "string"
      ? req.body
      : typeof req.body?.csv === "string"
        ? req.body.csv
        : null;

  if (!csvContent) {
    throw new ApiError(400, "Provide CSV content as text/csv or in a JSON body using the csv field.");
  }

  const entries = await tradeEntryService.importFromCsv(csvContent);

  res.status(201).json(
    buildSuccessResponse(entries, {
      count: entries.length
    })
  );
});
