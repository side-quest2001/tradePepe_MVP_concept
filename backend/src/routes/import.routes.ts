import multer from "multer";
import { Router } from "express";

import { uploadBrokerCsv } from "../controllers/import.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { createRateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";
import { ApiError } from "../utils/api-error.js";

const allowedMimeTypes = new Set([
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel"
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    const isCsvFileName = file.originalname.toLowerCase().endsWith(".csv");
    const isAllowedMimeType = allowedMimeTypes.has(file.mimetype);

    if (!isCsvFileName || !isAllowedMimeType) {
      callback(new ApiError(400, "Only CSV uploads are allowed"));
      return;
    }

    callback(null, true);
  }
});

const importRouter = Router();

importRouter.post("/csv", requireAuth, createRateLimitMiddleware({ keyPrefix: "import-csv", maxRequests: 10 }), upload.single("file"), uploadBrokerCsv);
importRouter.post("/orders/csv", requireAuth, createRateLimitMiddleware({ keyPrefix: "import-orders-csv", maxRequests: 10 }), upload.single("file"), uploadBrokerCsv);

export { importRouter };
