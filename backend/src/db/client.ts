import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { env } from "../config/env.js";

const queryClient = postgres(env.DATABASE_URL, {
  max: 10,
  prepare: false
});

export const db = drizzle(queryClient);
export { queryClient };
