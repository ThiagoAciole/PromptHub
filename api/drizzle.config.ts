import { defineConfig } from "drizzle-kit";
import { validateDatabaseUrl } from "./src/config/env.js";

const databaseUrlValue = process.env.DATABASE_URL?.trim();
if (!databaseUrlValue) {
  throw new Error("Variável de ambiente obrigatória ausente: DATABASE_URL");
}
const databaseUrl = validateDatabaseUrl(databaseUrlValue);

export default defineConfig({
  schema: "./src/database/schema/**/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl
  },
  strict: true,
  verbose: true
});
