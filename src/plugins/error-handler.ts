import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { toErrorResponse } from "../shared/errors/error-response.js";

export interface ErrorHandlerPluginOptions {
  production: boolean;
}

const errorHandlerPluginHandler: FastifyPluginAsync<ErrorHandlerPluginOptions> = async (app, options) => {
  app.setErrorHandler((error, request, reply) => {
    const response = toErrorResponse(error, options.production);
    request.log.error({ errorCode: response.error.code }, "request failed");
    void reply.status(response.error.statusCode).send(response);
  });

  app.setNotFoundHandler((request, reply) => {
    request.log.info({ errorCode: "NOT_FOUND" }, "request not found");
    return reply.status(404).send({
      error: {
        code: "NOT_FOUND",
        message: "Rota não encontrada",
        statusCode: 404,
        details: null
      }
    });
  });
};

export const errorHandlerPlugin = fastifyPlugin(errorHandlerPluginHandler, { name: "error-handler" });
