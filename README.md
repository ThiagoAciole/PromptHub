# Prompt Hub API

API REST modular para catálogo local de prompts, construída com Fastify, TypeScript, Drizzle ORM e PostgreSQL.

## Requisitos

- Node.js 22+
- pnpm via Corepack (`corepack pnpm`)
- PostgreSQL 17 para migrations, CRUD e importação real
- Docker opcional para execução completa

## Configuração

Copie `.env.example` para `.env` e ajuste `DATABASE_URL`:

```powershell
Copy-Item .env.example .env
corepack pnpm install
```

As variáveis principais são `NODE_ENV`, `HOST`, `PORT`, `DATABASE_URL`, `CORS_ORIGINS`, `MAX_UPLOAD_SIZE_MB` e `LOG_LEVEL`.

## Desenvolvimento

```powershell
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm dev
```

Endpoints principais:

- `GET /health`
- `GET /api/v1/info`
- `GET /api/v1/openapi.json`
- `GET /docs`
- CRUD em `/api/v1/prompts`, `/categories`, `/subcategories` e `/tags`
- `POST /api/v1/imports/csv`
- `GET /api/v1/exports/json` e `/api/v1/exports/csv`

## CSV

O importador aceita as colunas `act`, `prompt`, `for_devs`, `type` e `contributor`.

```powershell
corepack pnpm import:csv prompts.csv
```

Linhas inválidas são contabilizadas individualmente e o importador continua processando o arquivo.

## Docker

```powershell
Copy-Item .env.docker.example .env
docker compose up --build
```

O Compose sobe PostgreSQL 17 e a API na porta 3333, executando migrations antes do servidor.

## Backup e restauração

```powershell
docker compose exec postgres pg_dump -U prompthub prompthub > backup.sql
Get-Content backup.sql | docker compose exec -T postgres psql -U prompthub prompthub
```

## Troubleshooting

- `DATABASE_URL` ausente ou inválida: configure uma URL `postgres://` ou `postgresql://` com host.
- `db:migrate` recusado: confirme que PostgreSQL está acessível na porta configurada ou suba o Compose.
- `pnpm` não encontrado no Windows: use `corepack pnpm`.
- Falha na importação: confirme extensão `.csv`, MIME CSV e as colunas `act` e `prompt`.

## Validação

```powershell
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

Os testes unitários não exigem banco. Os testes de integração e a importação real exigem PostgreSQL separado.
