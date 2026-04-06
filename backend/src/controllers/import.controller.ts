import type { Request, Response } from "express";

import { importService } from "../services/import.service.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { buildSuccessResponse } from "../utils/error-response.util.js";

export const uploadBrokerCsv = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "CSV file is required");
  }

  if (file.size === 0) {
    throw new ApiError(400, "CSV file is empty");
  }

  const fundId = typeof req.body.fundId === "string" ? req.body.fundId : null;

  if (!fundId) {
    throw new ApiError(400, "fundId is required");
  }

  const brokerName = typeof req.body.brokerName === "string" ? req.body.brokerName : undefined;
  const summary = await importService.importBrokerCsv({
    csvContent: file.buffer.toString("utf-8"),
    fundId,
    ownerUserId: req.authUser!.id,
    brokerName,
    fileName: file.originalname
  });

  res.status(201).json(buildSuccessResponse(summary));
});
