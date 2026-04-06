import { Router } from "express";

import { analyticsRouter } from "./analytics.routes.js";
import { healthRouter } from "./health.routes.js";
import { importRouter } from "./import.routes.js";
import { journalRouter } from "./journal.routes.js";
import { resourceRouter } from "./resource.routes.js";
import { tradeEntryRouter } from "./trade-entry.routes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/imports", importRouter);
apiRouter.use("/", journalRouter);
apiRouter.use("/", resourceRouter);
apiRouter.use("/trades", tradeEntryRouter);

export { apiRouter };
