# Plano de implementação: Prompt Hub desacoplado com contrato mínimo

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIO: usar superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano tarefa por tarefa. As etapas usam caixas de seleção (`- [ ]`) para acompanhamento.

**Objetivo:** consolidar a branch de redesign, recriar o banco com a tabela mínima `prompts`, expor uma API reutilizável e separar API e frontend em aplicações independentes.

**Arquitetura:** `api/` conterá Fastify, Drizzle e PostgreSQL; `web/` conterá React/Vite. A comunicação ocorrerá apenas por HTTP em `/api/v1`; o frontend receberá a URL da API por `VITE_API_URL`. A API concentrará CRUD, categorias distintas e importação CSV parcial por uma camada de serviço e repositório.

**Stack:** pnpm workspaces, Node.js, TypeScript, Fastify, TypeBox, Drizzle ORM, PostgreSQL, csv-parse, React, Vite, Mantine e Vitest.

## Restrições globais

- Manter somente os campos `id`, `categoria`, `title` e `prompt` na tabela `prompts`.
- `categoria` é opcional e é persistida como `NULL` quando vazia; `title` e `prompt` são obrigatórios.
- Não criar tabelas de categorias, tags, subcategorias ou relações auxiliares.
- A API não pode servir arquivos estáticos do frontend nem importar arquivos de `web/`.
- O frontend não pode importar código de `api/` nem acessar PostgreSQL diretamente.
- A importação aceita `categoria,title,prompt`, processa linhas válidas e retorna as rejeitadas por linha.
- Resetar o banco apenas no ambiente/local volume do Prompt Hub, nunca um banco remoto sem confirmação explícita.
- Preservar os arquivos já pendentes no worktree que não fizerem parte das tarefas.

---

## Estrutura final

```text
PromptHub/
├── api/
│   ├── drizzle/
│   ├── src/{config,database,modules,plugins,shared}/
│   ├── tests/{unit,integration}/
│   ├── package.json
│   └── drizzle.config.ts
├── web/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── package.json
├── pnpm-workspace.yaml
├── docker-compose.yml
└── README.md
```

### Tarefa 1: consolidar a branch e criar os workspaces

**Arquivos:**
- Modificar: `pnpm-workspace.yaml`, `package.json`, `README.md`, `.gitignore`
- Mover: `app/` para `web/`; `src/`, `tests/`, `drizzle/`, `scripts/`, `drizzle.config.ts`, `.env.example`, `Dockerfile` e configurações da API para `api/`
- Criar: `api/package.json`, `web/.env.example`

**Interfaces:** o root apenas orquestra pacotes `api` e `web`; cada pacote possui scripts próprios.

- [ ] **Etapa 1: verificar e integrar a única branch pendente**

Executar:

```powershell
git status --short
git log --oneline main..feat/prompt-hub-redesign
git merge --no-ff feat/prompt-hub-redesign -m "merge: integrate prompt hub redesign"
```

Esperado: os commits de `feat/prompt-hub-redesign` entram em `main`; se houver conflito, resolver preservando o redesign visual e sem incluir alterações não relacionadas já pendentes.

- [ ] **Etapa 2: mover arquivos com histórico preservado**

Executar `git mv app web` e mover os arquivos de backend listados para `api/`. Atualizar o workspace:

```yaml
packages:
  - api
  - web
```

Atualizar o root para scripts explícitos:

```json
{
  "scripts": {
    "dev:api": "pnpm --dir api dev",
    "dev:web": "pnpm --dir web dev",
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  }
}
```

- [ ] **Etapa 3: separar dependências e configuração**

Mover dependências Fastify/Drizzle/CSV para `api/package.json`; manter React/Vite/Mantine apenas em `web/package.json`. Remover `@fastify/static` da API. Criar `web/.env.example`:

```dotenv
VITE_API_URL=http://localhost:3333
```

- [ ] **Etapa 4: validar a separação estrutural**

Executar:

```powershell
pnpm install --lockfile-only
pnpm --dir api typecheck
pnpm --dir web typecheck
```

Esperado: ambos passam; `api/package.json` não contém React/Vite e `web/package.json` não contém Fastify/Drizzle.

- [ ] **Etapa 5: criar o commit**

```powershell
git add api web package.json pnpm-workspace.yaml pnpm-lock.yaml .gitignore
git commit -m "refactor: split api and web applications"
```

### Tarefa 2: substituir o schema pelo contrato de quatro campos

**Arquivos:**
- Criar: `api/src/database/schema/prompts.ts`, `api/drizzle/0000_minimal_prompts.sql`
- Modificar: `api/src/database/schema/index.ts`, `api/drizzle.config.ts`, `docker-compose.yml`
- Remover: `api/src/database/schema/categories.ts`, `subcategories.ts`, `tags.ts`, `prompt-tags.ts`, `api/src/database/relations.ts` e migrations/metadados legados
- Testar: `api/tests/integration/test-database.ts`

**Interfaces:**

```ts
export const prompts = pgTable("prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoria: varchar("categoria", { length: 120 }),
  title: varchar("title", { length: 200 }).notNull(),
  prompt: text("prompt").notNull()
});
```

- [ ] **Etapa 1: escrever o teste de banco que falha**

Em `api/tests/integration/prompts.test.ts`, criar um prompt com `categoria: null` e verificar que os únicos campos retornados são `id`, `categoria`, `title` e `prompt`.

```ts
expect(Object.keys(created).sort()).toEqual(["categoria", "id", "prompt", "title"]);
expect(created.categoria).toBeNull();
```

- [ ] **Etapa 2: recriar migration e schema**

Remover o schema Drizzle antigo e criar uma migration inicial com apenas `CREATE TABLE prompts` e `CREATE INDEX prompts_categoria_idx`. Atualizar Compose para usar `api/` como contexto de build e manter o volume nomeado restrito ao PostgreSQL local.

- [ ] **Etapa 3: resetar exclusivamente o banco local**

Executar:

```powershell
docker compose down -v
docker compose up -d postgres
pnpm --dir api db:migrate
```

Esperado: o volume local é recriado e `\dt` exibe somente `prompts` entre as tabelas de domínio.

- [ ] **Etapa 4: confirmar o teste**

Executar:

```powershell
pnpm --dir api test -- tests/integration/prompts.test.ts
```

Esperado: PASS com banco contendo somente o contrato mínimo.

- [ ] **Etapa 5: criar o commit**

```powershell
git add api/src/database api/drizzle api/drizzle.config.ts docker-compose.yml api/tests/integration
git commit -m "feat: reset database to minimal prompt schema"
```

### Tarefa 3: reduzir a API ao domínio de prompts

**Arquivos:**
- Criar: `api/src/modules/prompts/prompt.schemas.ts`, `prompt.repository.ts`, `prompt.service.ts`, `prompt.routes.ts`, `prompt.types.ts`
- Modificar: `api/src/app.ts`, `api/src/plugins/swagger.ts`, `api/src/shared/errors/error-codes.ts`
- Remover: módulos `categories`, `subcategories`, `tags`, `exports`; `api/src/plugins/static.ts`; hashing, slug e paginação sem uso
- Testar: `api/tests/integration/prompts.test.ts`, `api/tests/unit/app.test.ts`

**Interfaces:**

```ts
export type PromptInput = { categoria?: string | null; title: string; prompt: string };
export type PromptRecord = { id: string; categoria: string | null; title: string; prompt: string };
export interface PromptService {
  create(input: PromptInput): Promise<PromptRecord>;
  list(): Promise<PromptRecord[]>;
  getById(id: string): Promise<PromptRecord>;
  update(id: string, input: Partial<PromptInput>): Promise<PromptRecord>;
  remove(id: string): Promise<void>;
  listCategories(): Promise<string[]>;
}
```

- [ ] **Etapa 1: escrever testes HTTP que falham**

Adicionar casos com `app.inject()` para `POST`, `GET`, `PATCH`, `DELETE` em `/api/v1/prompts` e `GET /api/v1/categories`. Cobrir `400` para `title`/`prompt` vazios e `404` para UUID inexistente.

```ts
expect(response.statusCode).toBe(201);
expect(response.json()).toMatchObject({ categoria: null, title: "Nome", prompt: "Texto" });
```

- [ ] **Etapa 2: implementar repository, service e rotas mínimas**

Normalizar `categoria` vazia para `null` no service. `listCategories()` deve usar valores distintos, ignorar `NULL` e ordenar alfabeticamente. Registrar somente:

```ts
app.register(promptRoutes, { prefix: "/api/v1/prompts" });
app.get("/api/v1/categories", () => service.listCategories());
```

Remover registros de rotas e tags Swagger legadas. A resposta de lista deve ser diretamente `PromptRecord[]`, sem paginação ou campos derivados.

- [ ] **Etapa 3: garantir que não há frontend embutido**

Remover `staticPlugin` de `api/src/app.ts` e o pacote `@fastify/static`. Testar `GET /` como 404 e `GET /api/v1/info` como resposta da API.

- [ ] **Etapa 4: executar testes e typecheck**

```powershell
pnpm --dir api typecheck
pnpm --dir api test -- tests/integration/prompts.test.ts tests/unit/app.test.ts
```

Esperado: PASS; nenhuma rota de taxonomia, exportação ou arquivos estáticos permanece registrada.

- [ ] **Etapa 5: criar o commit**

```powershell
git add api/src api/tests api/package.json api/pnpm-lock.yaml
git commit -m "refactor: expose minimal prompts api"
```

### Tarefa 4: implementar importação CSV parcial

**Arquivos:**
- Criar: `api/src/modules/imports/csv-parser.ts`, `import.service.ts`, `import.routes.ts`, `import.types.ts`
- Modificar: `api/src/app.ts`, `api/src/modules/prompts/prompt.service.ts`
- Testar: `api/tests/unit/csv-parser.test.ts`, `api/tests/integration/imports.test.ts`

**Interfaces:**

```ts
export type ImportError = { row: number; fields: ("categoria" | "title" | "prompt")[]; message: string };
export type ImportSummary = { imported: number; rejected: number; errors: ImportError[] };
export function importCsv(stream: NodeJS.ReadableStream, service: PromptService): Promise<ImportSummary>;
```

- [ ] **Etapa 1: escrever testes de parser e importação que falham**

Usar CSV com três linhas: uma válida com categoria, uma válida sem categoria e uma sem `title`.

```ts
expect(result).toEqual({
  imported: 2,
  rejected: 1,
  errors: [{ row: 4, fields: ["title"], message: "title é obrigatório" }]
});
```

- [ ] **Etapa 2: implementar parser streaming e validação por linha**

Aceitar apenas cabeçalho `title,prompt` ou `categoria,title,prompt`; converter categoria vazia em `null`; rejeitar `title` ou `prompt` ausentes/vazios. A função continua após erros e chama `service.create()` apenas para linhas válidas.

- [ ] **Etapa 3: expor multipart em `/api/v1/prompts/import`**

Registrar a rota com `@fastify/multipart`, exigir um arquivo CSV e retornar `201` com `ImportSummary`. Arquivo sem `title`/`prompt` no cabeçalho retorna `400`; erro de uma linha retorna `201` no resumo.

- [ ] **Etapa 4: executar testes**

```powershell
pnpm --dir api test -- tests/unit/csv-parser.test.ts tests/integration/imports.test.ts
```

Esperado: PASS e duas inserções persistidas após importação parcial.

- [ ] **Etapa 5: criar o commit**

```powershell
git add api/src/modules/imports api/src/app.ts api/tests
git commit -m "feat: import valid prompts from csv"
```

### Tarefa 5: adaptar o frontend ao contrato público

**Arquivos:**
- Modificar: `web/src/lib/api.types.ts`, `web/src/lib/api.ts`, `web/src/features/prompts/catalog.types.ts`, `web/src/features/prompts/usePromptCatalog.ts`, `web/src/App.tsx`
- Criar: `web/src/features/prompts/PromptForm.tsx`, `web/src/features/prompts/CsvImportForm.tsx`
- Testar: `web/src/lib/api.test.ts`, `web/src/features/prompts/PromptForm.test.tsx`, `web/src/features/prompts/CsvImportForm.test.tsx`

**Interfaces:**

```ts
export type Prompt = { id: string; categoria: string | null; title: string; prompt: string };
export type ImportSummary = { imported: number; rejected: number; errors: { row: number; fields: string[]; message: string }[] };
export const api = {
  listPrompts: (): Promise<Prompt[]>,
  createPrompt: (input: Omit<Prompt, "id">) => Promise<Prompt>,
  importCsv: (file: File) => Promise<ImportSummary>
};
```

- [ ] **Etapa 1: escrever testes que falham para o cliente HTTP**

Mockar `fetch` e verificar `POST ${VITE_API_URL}/api/v1/prompts` com JSON e `POST /api/v1/prompts/import` com `FormData`; testar exibição do resumo de rejeições.

- [ ] **Etapa 2: reduzir tipos e cards ao novo contrato**

Substituir referências a `content`, tags, subcategoria, idioma e timestamps por `prompt` e `categoria`. O card e modal exibem título, categoria quando presente e texto do prompt.

- [ ] **Etapa 3: adicionar entradas do produto**

Implementar `PromptForm` com `categoria` opcional, `title` e `prompt` obrigatórios. Implementar `CsvImportForm` com seletor CSV e resultado com `imported`, `rejected` e lista de erros por linha. Após sucesso, atualizar o catálogo.

- [ ] **Etapa 4: executar validação do web**

```powershell
pnpm --dir web typecheck
pnpm --dir web test
pnpm --dir web build
```

Esperado: PASS; `VITE_API_URL` é a única dependência de ambiente para acessar o backend.

- [ ] **Etapa 5: criar o commit**

```powershell
git add web
git commit -m "feat: connect web app to minimal prompts api"
```

### Tarefa 6: documentação, execução local e validação final

**Arquivos:**
- Modificar: `README.md`, `docker-compose.yml`, `.env.docker.example`
- Criar: `api/.env.example`, `web/.env.example` se ausente

**Interfaces:** documentação descreve `api` em `http://localhost:3333` e `web` no servidor Vite, sem proxy implícito ou banco exposto aos clientes.

- [ ] **Etapa 1: documentar comandos e contratos reais**

Incluir no README:

```powershell
pnpm install
pnpm dev:api
pnpm dev:web
docker compose up --build
```

Documentar o CSV aceito e os exemplos:

```csv
categoria,title,prompt
Desenvolvimento,Criar API,Crie uma API REST segura
,Explicar conceito,Explique recursão para iniciantes
```

- [ ] **Etapa 2: validar API pela borda HTTP**

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3333/api/v1/prompts -ContentType 'application/json' -Body '{"title":"Teste","prompt":"Conteúdo"}'
Invoke-RestMethod http://localhost:3333/api/v1/prompts
```

Esperado: o POST retorna quatro campos; o GET retorna uma lista contendo o prompt criado.

- [ ] **Etapa 3: executar validação completa**

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
docker compose config
```

Esperado: todos os comandos retornam código `0`. Testar manualmente criação individual e CSV com uma linha rejeitada no web app.

- [ ] **Etapa 4: criar o commit**

```powershell
git add README.md docker-compose.yml .env.docker.example api/.env.example web/.env.example
git commit -m "docs: document separated prompt hub applications"
```

## Revisão do plano

- Cobertura da especificação: Tarefa 1 separa as aplicações e integra a branch; Tarefa 2 recria o banco; Tarefa 3 estabelece o contrato HTTP; Tarefa 4 trata CSV parcial; Tarefa 5 torna o frontend um cliente desacoplado; Tarefa 6 valida e documenta.
- Não há requisitos de taxonomia, relações, duplicação, exportação, conteúdo estático ou metadados fora do escopo.
- Tipos usados pelo frontend e API mantêm exatamente `id`, `categoria`, `title` e `prompt`.
