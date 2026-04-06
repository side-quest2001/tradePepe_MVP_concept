import { migrate } from "drizzle-orm/postgres-js/migrator";

import { logger } from "../config/logger.js";
import { db, queryClient } from "./client.js";

async function runMigration(): Promise<void> {
  await migrate(db, {
    migrationsFolder: "src/db/migrations"
  });

  logger.info("Database migrations completed");
}

runMigration()
  .catch((error: unknown) => {
    logger.error({ error }, "Database migration failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await queryClient.end();
  });
