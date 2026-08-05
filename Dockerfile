FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json drizzle.config.ts ./
COPY app/package.json ./app/package.json
COPY src ./src
COPY app ./app
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml drizzle.config.ts ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
COPY --from=build /app/app/dist ./app/dist
COPY src ./src
COPY drizzle ./drizzle
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app
EXPOSE 3333
CMD ["sh", "-c", "pnpm db:migrate && pnpm start"]
