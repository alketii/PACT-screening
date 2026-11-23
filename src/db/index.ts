import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pactScreeningPool?: Pool };

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  }
  // Small pool: serverless hosts open one per instance, and Neon's free plan limits connections.
  globalForDb.pactScreeningPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  return globalForDb.pactScreeningPool;
}

/** Created on first use so the app can build without a database. */
export function getDb() {
  return drizzle({ client: getPool(), schema });
}
export { schema };
