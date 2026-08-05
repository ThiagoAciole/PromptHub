# Plano de implementação: Prompt Hub API

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIO: usar superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano tarefa por tarefa. As etapas usam caixas de seleção (`- [ ]`) para acompanhamento.

**Objetivo:** construir a API REST modular `api` para CRUD de prompts, taxonomia, busca, duplicação, importação/exportação, Swagger, PostgreSQL, Docker e testes reais de integração.

**Arquitetura:** Fastify recebe requisições validadas por TypeBox e delega para services pequenos, que usam repositories Drizzle. O app será construído por uma função `buildApp(options)` para permitir testes com `app.inject()` e conexão PostgreSQL real separada. Importação e exportação ficarão em serviços reutilizáveis pelas rotas e CLI.

**Stack:** Node.js, pnpm, TypeScript strict, Fastify, PostgreSQL 17, Drizzle ORM/Kit, TypeBox, Swagger, multipart, CORS, csv-parse, Vitest, Docker Compose.

## Restrições globais

- Usar o módulo/projeto `api` e o prefixo HTTP `/api/v1`.
- Não implementar IA, autenticação, usuários, execução de prompts, agentes, MCPs, memória, embeddings, filas, Redis ou frontend.
- Não usar `any`, SQL interpolado ou mocks na aplicação de produção.
- Usar PostgreSQL real nos testes de integração, com banco separado e migrations reais.
- `contentHash` será SHA-256 de título e conteúdo normalizados e terá constraint única.
- Limite padrão de listagem: 20; máximo: 100.
- CORS, upload, body, logs e variáveis de ambiente devem ser configuráveis.
- Não registrar conteúdo integral dos prompts.

---

### Tarefa 1: scaffold, dependências e configuração

**Arquivos:** criar `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `vitest.config.ts`, `.env.example`, `.gitignore`, `.dockerignore`, `drizzle.config.ts`, `src/config/env.ts`, `src/app.ts`, `src/server.ts`, `tests/setup.ts`.

**Interfaces:** `loadEnv()` retorna configuração tipada; `buildApp(options)` retorna `FastifyInstance` inicializável e testável.

- [ ] Inicializar o package `prompt-hub-api` e instalar dependências de runtime: `fastify`, `@fastify/cors`, `@fastify/multipart`, `@fastify/swagger`, `@fastify/swagger-ui`, `@sinclair/typebox`, `drizzle-orm`, `pg`, `csv-parse`, `dotenv`.
- [ ] Instalar desenvolvimento: `typescript`, `tsx`, `drizzle-kit`, `vitest`, `@types/node`, `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` e `eslint-config-prettier`.
- [ ] Configurar scripts `dev`, `build`, `start`, `typecheck`, `lint`, `test`, `test:watch`, `db:generate`, `db:migrate`, `db:studio` e `import:csv`.
- [ ] Configurar TypeScript strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, saída `dist` e aliases apenas se reduzirem imports.
- [ ] Implementar `loadEnv()` validando `NODE_ENV`, `HOST`, `PORT`, `DATABASE_URL`, `CORS_ORIGINS`, `MAX_UPLOAD_SIZE_MB` e `LOG_LEVEL`, com falha clara para valores ausentes ou inválidos.
- [ ] Criar `buildApp()` sem iniciar listener, registrando plugins e rotas em ordem determinística; `server.ts` chamará `listen()`.
- [ ] Executar `pnpm typecheck` e `pnpm build`; ambos devem passar.
- [ ] Criar commit `chore: scaffold prompt hub api`.

### Tarefa 2: banco, schema, relações e migrations

**Arquivos:** criar `src/database/client.ts`, `src/database/schema/prompts.ts`, `categories.ts`, `subcategories.ts`, `tags.ts`, `prompt-tags.ts`, `src/database/relations.ts`, `src/plugins/database.ts`, `drizzle/`.

**Interfaces:** `createDatabase(databaseUrl)` retorna `{ db, pool }`; o decorator/plugin disponibiliza `app.db` e encerra o pool no close.

- [ ] Declarar tabelas com UUID, timestamps, defaults, foreign keys `SET NULL`, cascata em `prompt_tags`, índices de filtros e constraints únicas.
- [ ] Declarar relações Drizzle para prompts, taxonomia e tags.
- [ ] Registrar o plugin de banco e permitir injeção de `DATABASE_URL` alternativa nos testes.
- [ ] Gerar a migration inicial com `pnpm db:generate` e confirmar que ela cria todas as constraints.
- [ ] Subir PostgreSQL de desenvolvimento/teste no Compose e executar `pnpm db:migrate` contra cada banco.
- [ ] Criar commit `feat: add postgres schema and migrations`.

### Tarefa 3: utilitários compartilhados com TDD

**Arquivos:** criar `src/shared/slug/normalize-slug.ts`, `src/shared/hashing/create-prompt-hash.ts`, `src/shared/pagination/pagination.ts`, `src/shared/errors/app-error.ts`, `src/shared/errors/error-codes.ts`, `tests/unit/slug.test.ts`, `hashing.test.ts`, `pagination.test.ts`.

**Interfaces:** `normalizeSlug(value: string): string`; `createPromptHash(title: string, content: string): string`; `parsePagination(input): Pagination`; `AppError` possui `code`, `statusCode`, `message` e `details`.

- [ ] Escrever testes falhando para acentos, espaços, hash determinístico, limites de página e cálculo de `totalPages`.
- [ ] Implementar as funções sem estado global e sem `any`.
- [ ] Executar `pnpm vitest run tests/unit` e confirmar todos os testes.
- [ ] Criar commit `feat: add shared validation utilities`.

### Tarefa 4: plugins transversais e contrato de erros

**Arquivos:** criar `src/plugins/cors.ts`, `swagger.ts`, `error-handler.ts`, `src/shared/errors/error-response.ts`, `tests/unit/error-handler.test.ts`.

**Interfaces:** erro HTTP sempre serializa `{ error: { code, message, statusCode, details } }`.

- [ ] Registrar CORS por lista de origens, permitindo configuração aberta apenas em desenvolvimento quando explicitamente configurado.
- [ ] Registrar Swagger/OpenAPI com tags `System`, `Prompts`, `Categories`, `Subcategories`, `Tags`, `Imports`, `Exports` e Swagger UI em `/docs`.
- [ ] Mapear erros TypeBox para `VALIDATION_ERROR`, duplicidade PostgreSQL para `PROMPT_ALREADY_EXISTS` e demais erros internos sem stack trace em produção.
- [ ] Adicionar request ID e logs estruturados sem payload de prompt.
- [ ] Criar commit `feat: add api plugins and error contract`.

### Tarefa 5: taxonomia — categorias, subcategorias e tags

**Arquivos:** criar módulos `src/modules/categories/*`, `subcategories/*`, `tags/*`, schemas TypeBox, repositories, services, routes e testes unitários.

**Interfaces:** services expõem list/create/get/update/delete; subcategorias aceitam `categoryId`; listagens retornam `promptCount` quando solicitado ou por padrão definido no schema.

- [ ] Escrever testes para slug único, conflito de subcategoria, exclusão com prompts preservados e contagens.
- [ ] Implementar repositories com consultas Drizzle parametrizadas e services com `AppError` correto.
- [ ] Criar schemas de body/query/params/response, incluindo UUIDs e strings obrigatórias.
- [ ] Registrar rotas CRUD em `/api/v1/categories`, `/subcategories` e `/tags`.
- [ ] Executar typecheck e testes unitários.
- [ ] Criar commit `feat: add taxonomy modules`.

### Tarefa 6: prompts — CRUD, tags, busca, filtros e duplicação

**Arquivos:** criar `src/modules/prompts/prompt.routes.ts`, `prompt.schemas.ts`, `prompt.service.ts`, `prompt.repository.ts`, `prompt.types.ts`, `prompt.errors.ts`, `tests/integration/prompts.test.ts`.

**Interfaces:** `PromptService` implementa `create`, `list`, `getById`, `update`, `remove`, `duplicate`; filtros tipados incluem `search`, taxonomia, tag, idioma, tipo, favorite, archived, page, limit, sort e order.

- [ ] Escrever testes de integração contra PostgreSQL real para criar, listar, buscar por ID e validar resposta paginada.
- [ ] Implementar criação transacional: validar taxonomia, normalizar/reutilizar/criar tags, calcular hash e inserir relações.
- [ ] Implementar listagem com busca nativa PostgreSQL nos seis campos requeridos, filtros seguros, ordenação whitelist e paginação.
- [ ] Implementar PATCH parcial, recalculando hash apenas quando necessário e substituindo tags integralmente quando `tags` for enviado.
- [ ] Implementar exclusão real com relações removidas por cascata.
- [ ] Implementar duplicação com sequência de títulos e novo UUID/hash.
- [ ] Adicionar testes para atualização, exclusão, duplicidade, filtros, tags automáticas e duplicação.
- [ ] Executar `pnpm vitest run tests/integration/prompts.test.ts` com `DATABASE_URL` de teste.
- [ ] Criar commit `feat: add prompts module`.

### Tarefa 7: importação CSV reutilizável

**Arquivos:** criar `src/modules/imports/csv-parser.ts`, `csv-transformer.ts`, `import.service.ts`, `import.routes.ts`, `import.types.ts`, `tests/unit/csv-parser.test.ts`, `tests/integration/imports.test.ts`, `scripts/import-csv.ts`, `data/imports/.gitkeep`, `data/exports/.gitkeep`.

**Interfaces:** `importCsv(input: NodeJS.ReadableStream, options): Promise<ImportSummary>`; `transformCsvRow(row, rowNumber): Result<PromptImportInput, ImportRowError>`.

- [ ] Escrever testes unitários para linha vazia, colunas obrigatórias, mapeamento, booleano `para_desenvolvedores` e erros por linha.
- [ ] Implementar parser streaming com limite de tamanho, extensão/MIME validados na rota e limite de erros retornados.
- [ ] Implementar serviço transacional por lote: categorias/subcategorias/tags reutilizadas ou criadas, duplicados contabilizados e linhas inválidas isoladas.
- [ ] Registrar `POST /api/v1/imports/csv` com multipart e resposta `received/created/duplicated/ignored/failed/errors/totalErrors`.
- [ ] Implementar CLI reutilizando `importCsv`, sem copiar regras de negócio.
- [ ] Criar teste de integração de CSV pequeno contra PostgreSQL real.
- [ ] Criar commit `feat: add csv import service and cli`.

### Tarefa 8: exportação JSON e CSV

**Arquivos:** criar `src/modules/exports/export.service.ts`, `export.routes.ts`, `export.schemas.ts`, `tests/integration/exports.test.ts`.

**Interfaces:** `exportPrompts(filters): Promise<PromptExportRow[]>`; `serializeCsv(rows): string`.

- [ ] Escrever testes de integração para filtros compartilhados, JSON e escaping de tags/conteúdo no CSV.
- [ ] Implementar serviço baseado no mesmo filtro do repository de prompts.
- [ ] Retornar JSON estruturado e CSV com as colunas especificadas, `Content-Disposition` e `text/csv`.
- [ ] Criar commit `feat: add prompt exports`.

### Tarefa 9: health, info, Docker e Compose

**Arquivos:** criar `src/modules/system/system.routes.ts`, `Dockerfile`, `docker-compose.yml`, `.env.docker.example`, `tests/integration/system.test.ts`.

- [ ] Implementar `/health` consultando `SELECT 1`, incluindo status, database, version e timestamp; falha do banco deve retornar status não saudável sem detalhes internos.
- [ ] Implementar `/api/v1/info` e `/api/v1/openapi.json`.
- [ ] Criar Dockerfile multi-stage, dependências de produção, usuário não root e comando de migrations seguido do servidor.
- [ ] Criar Compose com API, PostgreSQL 17-alpine, healthchecks, volume configurável e porta 3333.
- [ ] Validar `docker compose config`, build da imagem e healthcheck.
- [ ] Criar commit `feat: add system endpoints and docker runtime`.

### Tarefa 10: README, validação final e revisão

**Arquivos:** modificar `README.md`; criar `tests/integration/test-database.ts` se necessário.

- [ ] Documentar visão geral, arquitetura, estrutura, requisitos, `.env`, migrations, curl, Swagger, CSV, testes, backup/restauração e troubleshooting.
- [ ] Executar, nesta ordem: `pnpm install`, `pnpm db:migrate`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.
- [ ] Subir Compose e verificar `GET /health`, CRUD, Swagger e importação CSV com `curl`.
- [ ] Corrigir falhas reais encontradas e repetir a validação completa.
- [ ] Criar commit `docs: complete prompt hub api setup guide`.

## Revisão do plano

- Cobertura: entidades, constraints, CRUD, busca/filtros, duplicidade, taxonomia, importação, exportação, erros, Swagger, CORS, configuração, logs, segurança, testes, Docker e README estão associados a tarefas explícitas.
- Placeholders: nenhum `TODO`, `TBD` ou etapa vaga foi mantido.
- Consistência: as interfaces de configuração, banco, hash, paginação, importação e service são usadas com os mesmos nomes ao longo das tarefas.
