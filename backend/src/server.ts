import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { queryClient } from "./db/client.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`TradePepe backend listening on port ${env.PORT}`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully`);

  server.close(async () => {
    await queryClient.end();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
