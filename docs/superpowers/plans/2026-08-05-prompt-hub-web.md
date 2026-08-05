# Plano de implementação: Prompt Hub Web

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIO: usar `superpowers:executing-plans` ou `superpowers:subagent-driven-development` para implementar este plano tarefa por tarefa.

**Objetivo:** Criar o frontend React + Vite + Mantine em `app/`, servido pelo Fastify na mesma porta da API, com catálogo pesquisável e filtrável de prompts.

**Arquitetura:** A API continuará em `src/`. O frontend será um workspace independente em `app/`, com seu próprio `package.json`, build Vite e camada HTTP tipada. O estágio de build do Docker compilará API e frontend; o Fastify servirá `app/dist` como SPA e manterá os endpoints `/api/v1`.

**Stack:** React, TypeScript, Vite, Mantine UI, `@mantine/hooks`, Vitest, Fastify static.

## Restrições globais

- Não mover nem reescrever a API existente em `src/`.
- O deploy de produção continuará usando uma única imagem e a porta `3333`.
- O frontend usará `/api/v1` em produção e `VITE_API_URL` somente quando definido.
- Usar as skills `mantine-custom-components`, `mantine-combobox` e `mantine-form` antes das superfícies Mantine correspondentes.
- Não adicionar autenticação, CRUD de prompts, importação pela UI ou modo offline nesta etapa.
- Toda tarefa termina com validação e commit separado.

---

### Tarefa 1: scaffold do frontend e workspace

**Arquivos:**
- Criar: `app/package.json`, `app/index.html`, `app/tsconfig.json`, `app/tsconfig.node.json`, `app/vite.config.ts`, `app/src/main.tsx`, `app/src/App.tsx`, `app/src/styles.css`
- Modificar: `package.json`, `pnpm-workspace.yaml`, `.gitignore`

**Etapas:**

- [ ] Criar `app/package.json` com React, Mantine, Vite, Vitest, Testing Library e scripts `dev`, `build`, `typecheck`, `lint`, `test`.
- [ ] Configurar o workspace para incluir `app` e scripts raiz que deleguem `build`, `typecheck`, `lint` e `test` ao frontend.
- [ ] Criar o entrypoint React com `MantineProvider`, reset CSS e tema base claro, usando `fontFamily: "Inter, sans-serif"` e raio médio.
- [ ] Criar uma tela inicial mínima com o título `Prompt Hub` para confirmar o bootstrap.
- [ ] Executar `corepack pnpm install`, `corepack pnpm --dir app typecheck` e `corepack pnpm --dir app build`.
- [ ] Criar commit `feat: scaffold prompt hub web app`.

### Tarefa 2: servir o frontend pela API

**Arquivos:**
- Criar: `src/plugins/static.ts`
- Modificar: `src/app.ts`, `package.json`, `Dockerfile`, `.dockerignore`, `README.md`

**Etapas:**

- [ ] Adicionar `@fastify/static` à API e registrar o plugin somente quando o diretório `app/dist` existir.
- [ ] Servir `app/dist` na raiz e responder `index.html` para rotas de frontend que não sejam `/api`, `/docs` ou `/health`.
- [ ] Ajustar o Dockerfile para copiar `app/package.json`, instalar dependências do workspace e executar o build do frontend no estágio de build.
- [ ] Copiar `app/dist` para a imagem runtime sem incluir `node_modules` de desenvolvimento do frontend.
- [ ] Atualizar README com `corepack pnpm dev`, build e acesso à UI em `http://localhost:3333`.
- [ ] Executar typecheck, build e teste de `app/dist` servido via `app.inject()`.
- [ ] Criar commit `feat: serve web app from api`.

### Tarefa 3: cliente HTTP e modelos do catálogo

**Arquivos:**
- Criar: `app/src/lib/api.ts`, `app/src/lib/api.types.ts`, `app/src/lib/query.ts`
- Criar teste: `app/src/lib/query.test.ts`, `app/src/lib/api.test.ts`

**Interfaces:**

```ts
export interface Prompt { id: string; title: string; content: string; description: string | null; type: string; language: string; contributor: string | null; forDevelopers: boolean; favorite: boolean; archived: boolean; category: string | null; subcategory: string | null; tags: string[]; createdAt: string; updatedAt: string }
export interface TaxonomyItem { id: string; name: string; slug: string; promptCount?: number }
export interface PromptQuery { search?: string; categoryId?: string; subcategoryId?: string; tag?: string; language?: string; type?: string; favorite?: boolean; archived?: boolean; page: number; limit: number; sort: "title" | "createdAt" | "updatedAt"; order: "asc" | "desc" }
export interface PromptPage { data: Prompt[]; pagination: { page: number; limit: number; total: number; totalPages: number } }
```

- [ ] Implementar `buildQueryString` ignorando valores vazios e serializando booleanos em `true`/`false`.
- [ ] Implementar `apiClient` com `VITE_API_URL` ou `/api/v1`, resposta JSON tipada e erro `ApiError` com status e mensagem.
- [ ] Implementar `listPrompts`, `listCategories`, `listSubcategories`, `listTags` e `updatePrompt`.
- [ ] Escrever testes para query string, resposta paginada, status HTTP não-2xx e atualização de favorito.
- [ ] Executar os testes unitários do cliente.
- [ ] Criar commit `feat: add typed prompt api client`.

### Tarefa 4: componentes Mantine do catálogo

**Skills obrigatórias:** ler `mantine-custom-components` para os componentes próprios e `mantine-combobox` para filtros com seleção/busca.

**Arquivos:**
- Criar: `app/src/features/prompts/PromptCard.tsx`, `PromptGrid.tsx`, `PromptDetailsModal.tsx`, `PromptFilters.tsx`, `PromptSearch.tsx`, `PromptEmptyState.tsx`, `app/src/components/AppShell.tsx`
- Criar estilos: `app/src/features/prompts/prompt.css`
- Criar testes: `app/src/features/prompts/PromptCard.test.tsx`, `PromptFilters.test.tsx`

- [ ] Implementar `PromptCard` com título, descrição, metadados, tags, favorito e botão copiar.
- [ ] Implementar `PromptGrid` com `SimpleGrid` responsivo e estados skeleton/empty/error.
- [ ] Implementar `PromptDetailsModal` com conteúdo completo e cópia via `navigator.clipboard`.
- [ ] Implementar filtros com `Select`/`MultiSelect` ou Combobox Mantine, incluindo categoria, subcategoria, tag, idioma, tipo e favoritos.
- [ ] Implementar `AppShell` responsivo com header, sidebar desktop e drawer de filtros em telas pequenas.
- [ ] Usar tokens do tema e Styles API; não criar CSS que duplique componentes Mantine sem necessidade.
- [ ] Executar testes de componentes em jsdom.
- [ ] Criar commit `feat: add prompt catalog components`.

### Tarefa 5: estado da página, URL e integração visual

**Arquivos:**
- Modificar: `app/src/App.tsx`
- Criar: `app/src/features/prompts/usePromptCatalog.ts`, `app/src/features/prompts/catalog.types.ts`
- Criar teste: `app/src/features/prompts/usePromptCatalog.test.tsx`

- [ ] Ler filtros iniciais de `window.location.search` com defaults `page=1`, `limit=24`, `sort=updatedAt`, `order=desc`.
- [ ] Implementar debounce de busca e resetar página para 1 quando filtros mudarem.
- [ ] Carregar prompts, categorias, subcategorias e tags em paralelo.
- [ ] Atualizar a URL sem recarregar a página e manter filtros ao atualizar o navegador.
- [ ] Fazer favorito via `PATCH /prompts/:id` e atualizar o card somente após sucesso.
- [ ] Exibir loading, erro com retry, vazio filtrado e paginação.
- [ ] Executar os testes da página e validar manualmente busca, filtros, paginação, modal, copiar e favorito contra a API.
- [ ] Criar commit `feat: connect prompt catalog page`.

### Tarefa 6: build, Docker e validação final

**Arquivos:**
- Modificar: `Dockerfile`, `docker-compose.yml`, `README.md`, `package.json`
- Criar: `app/.env.example`

- [ ] Rodar `corepack pnpm install --frozen-lockfile`.
- [ ] Rodar `corepack pnpm typecheck` para API e frontend.
- [ ] Rodar `corepack pnpm lint` para API e frontend.
- [ ] Rodar `corepack pnpm test` para API e frontend.
- [ ] Rodar `corepack pnpm build` e confirmar `app/dist` e `dist/src`.
- [ ] Confirmar que a imagem de produção contém `app/dist` e que `GET /` retorna a UI.
- [ ] Executar `git diff --check`.
- [ ] Criar commit `feat: package prompt hub web for zimaos`.

## Validação final

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

Depois do deploy, validar:

```bash
curl http://localhost:3333/health
curl http://localhost:3333/
curl "http://localhost:3333/api/v1/prompts?page=1&limit=24"
```
