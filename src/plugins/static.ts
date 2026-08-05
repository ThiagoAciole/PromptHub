import fastifyStatic from "@fastify/static";
import fp from "fastify-plugin";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { FastifyPluginAsync } from "fastify";

const webPlugin: FastifyPluginAsync = async (app) => {
  const root = resolve(process.cwd(), "app/dist");
  if (!existsSync(root)) return;

  await app.register(fastifyStatic, { root, wildcard: false });

  app.get("/*", async (request, reply) => {
    if (request.url.startsWith("/api/") || request.url === "/docs" || request.url === "/health") {
      return reply.callNotFound();
    }

    return reply.sendFile("index.html");
  });
};

export const staticPlugin = fp(webPlugin, { name: "static-web" });
