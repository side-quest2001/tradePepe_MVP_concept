import type { IncomingMessage, ServerResponse } from "node:http";
import { pinoHttp } from "pino-http";

import { logger } from "../config/logger.js";

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req: IncomingMessage, _res: ServerResponse) =>
    req.headers["x-request-id"]?.toString() ?? crypto.randomUUID()
});
