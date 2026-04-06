import { Router } from "express";

import { analyticsRouter } from "./analytics.routes.js";
import { authRouter } from "./auth.routes.js";
import { communityRouter } from "./community.routes.js";
import { healthRouter } from "./health.routes.js";
import { importRouter } from "./import.routes.js";
import { journalRouter } from "./journal.routes.js";
import { marketRouter } from "./market.routes.js";
import { profileRouter } from "./profile.routes.js";
import { resourceRouter } from "./resource.routes.js";
import { tradeEntryRouter } from "./trade-entry.routes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/community", communityRouter);
apiRouter.use("/imports", importRouter);
apiRouter.use("/market", marketRouter);
apiRouter.use("/profiles", profileRouter);
apiRouter.use("/", journalRouter);
apiRouter.use("/", resourceRouter);
apiRouter.use("/trades", tradeEntryRouter);

export { apiRouter };
