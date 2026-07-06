import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

let db: ReturnType<typeof createDb> | undefined;

export const isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL);

export const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  db ??= createDb(process.env.DATABASE_URL);
  return db;
};

const createDb = (connectionString: string) => {
  const sql = neon(connectionString);
  return drizzle({ client: sql, schema });
};
