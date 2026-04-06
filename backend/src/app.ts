import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { attachRequestContext } from "./middlewares/request-context.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { apiRouter } from "./routes/index.js";
import { buildSuccessResponse } from "./utils/error-response.util.js";

export function createApp() {
  const app = express();
  const allowedOrigins =
    env.CORS_ORIGIN === "*"
      ? true
      : env.CORS_ORIGIN.split(",")
          .map((origin) => origin.trim())
          .filter(Boolean);

  app.set("trust proxy", env.TRUST_PROXY === "true");
  app.use(requestLogger);
  app.use(attachRequestContext);
  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (_req, res) => {
    res.status(200).json(
      buildSuccessResponse({
        name: "TradePepe API",
        version: "v1"
      })
    );
  });

  app.use("/api/v1", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
