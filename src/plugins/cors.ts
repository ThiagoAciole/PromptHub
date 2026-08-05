import cors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import type { NodeEnvironment } from "../config/env.js";

export interface CorsPluginOptions {
  origins: string[];
  nodeEnv: NodeEnvironment;
}

const corsPluginHandler: FastifyPluginAsync<CorsPluginOptions> = async (app, options) => {
  const open = options.origins.includes("*");
  if (open && options.nodeEnv !== "development") {
    throw new Error("CORS_ORIGINS=* só é permitido em development");
  }

  await app.register(cors, {
    origin: open ? true : options.origins.length > 0 ? options.origins : false
  });
};

export const corsPlugin = fastifyPlugin(corsPluginHandler, { name: "cors" });
