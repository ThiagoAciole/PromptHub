import cors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";

export interface CorsPluginOptions {
  origins: string[];
}

const corsPluginHandler: FastifyPluginAsync<CorsPluginOptions> = async (app, options) => {
  const open = options.origins.includes("*");
  await app.register(cors, {
    origin: open ? true : options.origins.length > 0 ? options.origins : false
  });
};

export const corsPlugin = fastifyPlugin(corsPluginHandler, { name: "cors" });
