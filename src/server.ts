import { buildApp } from "./app.js";
import { loadEnv } from "./config/env.js";

const config = loadEnv();
const app = buildApp({ config });

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
