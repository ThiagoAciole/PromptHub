import { createReadStream } from "node:fs";
import { createDatabase } from "../src/database/client.js";
import { loadEnv } from "../src/config/env.js";
import { importCsv } from "../src/modules/imports/import.service.js";

const filePath = process.argv[2];
if (!filePath) throw new Error("Uso: pnpm import:csv <arquivo.csv>");
const config = loadEnv();
const { db, pool } = createDatabase(config.databaseUrl);
try {
  const summary = await importCsv(createReadStream(filePath), { db });
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await pool.end();
}
