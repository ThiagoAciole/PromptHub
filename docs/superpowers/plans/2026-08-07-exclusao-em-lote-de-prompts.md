# Plano de implementação: exclusão em lote de prompts

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIO: usar superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano tarefa por tarefa. As etapas usam caixas de seleção (`- [ ]`) para acompanhamento.

**Objetivo:** permitir excluir uma lista explícita de prompts ou limpar todo o catálogo com confirmação obrigatória.

**Arquitetura:** as rotas continuam no módulo `prompts`. O service valida o comando, o repositório executa as exclusões no PostgreSQL e a rota devolve somente `deletedCount`; o delete individual permanece inalterado.

**Stack:** Fastify 5, TypeBox, Drizzle ORM, PostgreSQL e Vitest.

## Restrições globais

- `DELETE /api/v1/prompts/batch` recebe `ids` com 1 a 1.000 UUIDs.
- IDs inexistentes não causam erro; `deletedCount` representa somente registros removidos.
- `DELETE /api/v1/prompts` exige `{ "confirm": "DELETE_ALL_PROMPTS" }`.
- A confirmação inválida retorna o contrato padrão de erro com status 400.
- As rotas estáticas devem ser declaradas antes de `/:id`.
- Não alterar o comportamento de `DELETE /api/v1/prompts/:id`.

---

### Tarefa 1: cobrir as duas exclusões por HTTP

**Arquivos:**
- Modificar: `api/tests/integration/prompts.test.ts`
- Testar: `api/tests/integration/prompts.test.ts`

**Interfaces:**
- Consome: `buildApp({ config, databaseUrl, logger })`.
- Produz: os contratos HTTP `DELETE /api/v1/prompts/batch` e `DELETE /api/v1/prompts` documentados pelos testes.

- [ ] **Etapa 1: escrever o teste que falha**

Adicionar ao arquivo de integração uma criação de três prompts e os testes abaixo:

```ts
const batchResponse = await app.inject({
  method: "DELETE",
  url: "/api/v1/prompts/batch",
  payload: { ids: [first.id, second.id] }
});

expect(batchResponse.statusCode).toBe(200);
expect(batchResponse.json()).toEqual({ deletedCount: 2 });

const clearWithoutConfirmation = await app.inject({
  method: "DELETE",
  url: "/api/v1/prompts",
  payload: { confirm: "delete all" }
});
expect(clearWithoutConfirmation.statusCode).toBe(400);

const clearResponse = await app.inject({
  method: "DELETE",
  url: "/api/v1/prompts",
  payload: { confirm: "DELETE_ALL_PROMPTS" }
});
expect(clearResponse.statusCode).toBe(200);
expect(clearResponse.json()).toEqual({ deletedCount: 1 });
```

- [ ] **Etapa 2: executar o teste e confirmar a falha**

Executar: `corepack pnpm --dir api test -- api/tests/integration/prompts.test.ts`

Esperado: FAIL porque as rotas de lote e limpeza ainda não existem.

- [ ] **Etapa 3: escrever a implementação mínima**

Não implementar nesta tarefa; a implementação pertence à Tarefa 2 depois da falha observada.

- [ ] **Etapa 4: executar o teste e confirmar que passa**

Executar após a Tarefa 2: `corepack pnpm --dir api test -- api/tests/integration/prompts.test.ts`

Esperado: PASS quando `DATABASE_URL` apontar para PostgreSQL de teste migrado.

- [ ] **Etapa 5: criar o commit**

Esta tarefa será commitada junto com a Tarefa 2, pois o teste depende da implementação para formar um incremento funcional.

### Tarefa 2: implementar os comandos de exclusão

**Arquivos:**
- Modificar: `api/src/modules/prompts/prompt.schemas.ts`
- Modificar: `api/src/modules/prompts/prompt.types.ts`
- Modificar: `api/src/modules/prompts/prompt.repository.ts`
- Modificar: `api/src/modules/prompts/prompt.service.ts`
- Modificar: `api/src/modules/prompts/prompt.routes.ts`
- Modificar: `api/tests/integration/prompts.test.ts`

**Interfaces:**
- Consome: `ids: string[]` e `confirm: string` validados pelo TypeBox.
- Produz: `removeMany(ids: string[]): Promise<number>` e `removeAll(confirm: string): Promise<number>` no service; ambas as rotas respondem `{ deletedCount: number }`.

- [ ] **Etapa 1: escrever o teste que falha**

Usar o teste da Tarefa 1; ele cobre a exclusão parcial, a confirmação inválida e a limpeza total.

- [ ] **Etapa 2: executar o teste e confirmar a falha**

Executar: `corepack pnpm --dir api test -- api/tests/integration/prompts.test.ts`

Esperado: FAIL por rota inexistente antes de alterar o código de produção.

- [ ] **Etapa 3: escrever a implementação mínima**

Definir schemas:

```ts
export const promptBulkDeleteBody = Type.Object({
  ids: Type.Array(Type.String({ format: "uuid" }), { minItems: 1, maxItems: 1000 })
});
export const promptDeleteAllBody = Type.Object({
  confirm: Type.Literal("DELETE_ALL_PROMPTS")
});
```

No repositório, usar `inArray(prompts.id, ids)` para a exclusão seletiva e `db.delete(prompts).returning({ id: prompts.id })` para a limpeza; ambas retornam `rows.length`.

No service, expor `removeMany(ids)` e `removeAll(confirm)`; `removeAll` deve lançar `new AppError("VALIDATION_ERROR", 400, "Confirmação inválida para excluir todos os prompts")` se a frase não for exata.

Registrar antes de `/:id`:

```ts
app.delete<{ Body: { ids: string[] } }>("/batch", { schema: { body: promptBulkDeleteBody } }, async (request) =>
  ({ deletedCount: await service.removeMany(request.body.ids) })
);
app.delete<{ Body: { confirm: string } }>("/", { schema: { body: promptDeleteAllBody } }, async (request) =>
  ({ deletedCount: await service.removeAll(request.body.confirm) })
);
```

- [ ] **Etapa 4: executar o teste e confirmar que passa**

Executar: `corepack pnpm --dir api test -- api/tests/integration/prompts.test.ts`

Esperado: PASS com PostgreSQL de teste configurado; se não houver `DATABASE_URL`, o arquivo é corretamente ignorado pelo `describe.skipIf`.

- [ ] **Etapa 5: criar o commit**

```powershell
git add api/src/modules/prompts/prompt.schemas.ts api/src/modules/prompts/prompt.types.ts api/src/modules/prompts/prompt.repository.ts api/src/modules/prompts/prompt.service.ts api/src/modules/prompts/prompt.routes.ts api/tests/integration/prompts.test.ts
git commit -m "feat: add bulk prompt deletion"
```

### Tarefa 3: validar regressões estáticas

**Arquivos:**
- Testar: `api/src/modules/prompts/*.ts`
- Testar: `api/tests/**/*.test.ts`

**Interfaces:**
- Consome: os comandos de exclusão implementados na Tarefa 2.
- Produz: verificação de tipo, lint, testes e build sem regressões.

- [ ] **Etapa 1: escrever o teste que falha**

Não há novo comportamento nesta tarefa; os testes de contrato já foram escritos na Tarefa 1.

- [ ] **Etapa 2: executar o teste e confirmar a falha**

Já concluído na Tarefa 1 antes da implementação.

- [ ] **Etapa 3: escrever a implementação mínima**

Não há código de produção adicional nesta tarefa.

- [ ] **Etapa 4: executar o teste e confirmar que passa**

Executar:

```powershell
corepack pnpm --dir api typecheck
corepack pnpm --dir api lint
corepack pnpm --dir api test
corepack pnpm --dir api build
```

Esperado: typecheck, lint, testes unitários e build passam; testes de integração sem banco permanecem ignorados por desenho.

- [ ] **Etapa 5: criar o commit**

Nenhum commit adicional se não houver ajustes; reportar os comandos e resultados no resumo final.
