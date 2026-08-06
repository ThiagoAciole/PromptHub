import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as tableDefinitions from "./schema/index.js";

export const databaseSchema = tableDefinitions;

export type Database = NodePgDatabase<typeof databaseSchema>;

export interface DatabaseConnection {
  db: Database;
  pool: Pool;
}

export function createDatabase(databaseUrl: string): DatabaseConnection {
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle({ client: pool, schema: databaseSchema });

  return { db, pool };
}
