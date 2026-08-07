# Prompt Hub

API de prompts com Fastify, TypeScript, Drizzle ORM e PostgreSQL.

## Requisitos

- Node.js 22+
- pnpm via Corepack (`corepack pnpm`)
- PostgreSQL 17 para migrations, CRUD e importação real
- Docker/Compose no ZimaOS para execução em servidor

## Configuração

Para desenvolvimento local, crie `.env.local` na raiz e ajuste `DATABASE_URL` usando `.env.example` como referência:

```powershell
Copy-Item .env.example .env.local
corepack pnpm install
```

As variáveis principais são `NODE_ENV`, `HOST`, `PORT`, `DATABASE_URL`, `CORS_ORIGINS`, `MAX_UPLOAD_SIZE_MB` e `LOG_LEVEL`.

## Desenvolvimento

```powershell
corepack pnpm --dir api db:migrate
corepack pnpm dev:api
```

O frontend está em `C:\Projetos\PromptHub-web` e não faz parte deste checkout.

Endpoints principais:

- `GET /health`
- `GET /api/v1/info`
- `GET /api/v1/openapi.json`
- `GET /docs`
- CRUD em `/api/v1/prompts`
- `DELETE /api/v1/prompts/batch` com `{ "ids": ["uuid"] }`
- `DELETE /api/v1/prompts` com `{ "confirm": "DELETE_ALL_PROMPTS" }`
- `GET /api/v1/prompts/categories`
- `POST /api/v1/prompts/import`

## CSV

O importador aceita as colunas `categoria`, `title`, `prompt` e opcionalmente `type`.

```powershell
corepack pnpm --dir api test
```

Linhas inválidas são contabilizadas individualmente e o importador continua processando o arquivo.

## Deploy no ZimaOS

```powershell
Use `.env.example` como referência para criar ou ajustar `.env`.
docker compose up -d --build
docker compose logs -f api
```

No ZimaOS, copie o projeto para uma pasta persistente, ajuste `POSTGRES_PASSWORD` e `API_PORT` no `.env` e importe o `docker-compose.yml` pelo App Store/gerenciador de Compose. O Compose sobe PostgreSQL 17 e a API, executa migrations antes do servidor e reinicia os serviços automaticamente.

A aplicação fica disponível em `http://<ip-do-zimaos>:<API_PORT>`. O frontend e a API usam a mesma porta; o endpoint para o healthcheck é `/health` e a documentação fica em `/docs`.

Para atualizar a instalação:

```powershell
docker compose pull
docker compose up -d --build
```

## Backup e restauração

```powershell
docker compose exec postgres pg_dump -U prompthub prompthub > backup.sql
Get-Content backup.sql | docker compose exec -T postgres psql -U prompthub prompthub
```

## Troubleshooting

- `DATABASE_URL` ausente ou inválida: configure uma URL `postgres://` ou `postgresql://` com host.
- `db:migrate` recusado: confirme que PostgreSQL está acessível na porta configurada ou suba o Compose.
- `pnpm` não encontrado no Windows: use `corepack pnpm`.
- Falha na importação: confirme extensão `.csv`, MIME CSV e as colunas `title` e `prompt`.

## Validação

```powershell
corepack pnpm --dir api typecheck
corepack pnpm --dir api lint
corepack pnpm --dir api test
corepack pnpm --dir api build
```

Os testes unitários não exigem banco. Os testes de integração e a importação real exigem PostgreSQL separado.
