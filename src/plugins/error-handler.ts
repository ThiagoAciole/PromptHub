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
};

export const errorHandlerPlugin = fastifyPlugin(errorHandlerPluginHandler, { name: "error-handler" });
