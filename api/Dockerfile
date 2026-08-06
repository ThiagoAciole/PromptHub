FROM node:22-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/package.json
RUN pnpm install --frozen-lockfile --filter prompt-hub-api...
COPY api ./api
RUN pnpm --dir api build

FROM node:22-alpine AS runtime
WORKDIR /workspace
ENV NODE_ENV=production
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/package.json
# drizzle-kit executa as migrations no boot, portanto também precisa existir na imagem de runtime.
RUN pnpm install --frozen-lockfile --filter prompt-hub-api...
COPY --from=build /workspace/api/dist ./api/dist
COPY --from=build /workspace/api/src ./api/src
COPY --from=build /workspace/api/drizzle ./api/drizzle
COPY --from=build /workspace/api/drizzle.config.ts ./api/drizzle.config.ts
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /workspace
USER app
EXPOSE 3333
CMD ["sh", "-c", "pnpm --dir api db:migrate && pnpm --dir api start"]
