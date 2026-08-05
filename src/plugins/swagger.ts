import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";

const swaggerPluginHandler: FastifyPluginAsync = async (app) => {
  await app.register(swagger, {
    openapi: {
      info: { title: "Prompt Hub API", version: "0.1.0" },
      servers: [{ url: "/api/v1" }],
      tags: [
        { name: "System" },
        { name: "Prompts" },
        { name: "Categories" },
        { name: "Subcategories" },
        { name: "Tags" },
        { name: "Imports" },
        { name: "Exports" }
      ]
    }
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });
};

export const swaggerPlugin = fastifyPlugin(swaggerPluginHandler, { name: "swagger" });
