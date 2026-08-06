import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { createDatabase, type Database } from "../database/client.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
  }
}

export interface DatabasePluginOptions {
  databaseUrl: string;
}

const databasePluginHandler: FastifyPluginAsync<DatabasePluginOptions> = async (app, options) => {
  const { db, pool } = createDatabase(options.databaseUrl);

  app.decorate("db", db);
  app.addHook("onClose", async () => {
    await pool.end();
  });
};

export const databasePlugin = fastifyPlugin(databasePluginHandler, { name: "database" });
