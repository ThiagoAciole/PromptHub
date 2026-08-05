# Prompt Hub — Contrato mínimo de prompts

## Objetivo

Recriar o banco do zero e transformar o Prompt Hub em uma API REST independente. O frontend será uma aplicação independente que consome a API por HTTP, assim como futuras extensões, CLIs ou integrações.

Ficam fora do escopo: autenticação, usuários, tags, subcategorias, tabelas de categoria, duplicação, exportação e metadados de prompt.

## Arquitetura

```text
Clientes HTTP (web e futuros clientes)
                |
                v
        API Fastify /api/v1
                |
                v
          PromptService
                |
                v
       PromptRepository (Drizzle)
                |
                v
           PostgreSQL
```

- Rotas HTTP validam e traduzem requests/responses.
- `PromptService` concentra regras de CRUD e importação.
- `PromptRepository` é a única camada que acessa Drizzle/PostgreSQL.
- O web app consome somente a API; ele não conhece banco nem duplica regras de validação.

## Aplicações separadas

O repositório será organizado como um workspace com duas aplicações independentes:

```text
PromptHub/
├── api/                 # Fastify, Drizzle, migrations e testes da API
├── web/                 # React/Vite, componentes e testes do frontend
├── package.json         # scripts de orquestração do workspace
└── pnpm-workspace.yaml
```

Cada aplicação terá seu próprio `package.json`, dependências, scripts de desenvolvimento, build, lint, typecheck e testes. A API não servirá arquivos estáticos do frontend, nem dependerá de código de `web/`; o frontend não importará módulos de `api/` e configurará a URL da API por variável de ambiente. A integração entre as duas será exclusivamente o contrato HTTP documentado abaixo.

## Banco de dados

O banco conterá somente uma tabela.

```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria VARCHAR(120),
  title VARCHAR(200) NOT NULL,
  prompt TEXT NOT NULL
);

CREATE INDEX prompts_categoria_idx ON prompts (categoria);
```

`categoria` é opcional e será persistida como `NULL` quando vazia. `title` e `prompt` são obrigatórios. Não haverá tabela ou relação de categorias: elas são valores livres do próprio prompt.

O reset remove o schema/migrations/tabelas legadas, incluindo `categories`, `subcategories`, `tags`, `prompt_tags` e todos os campos extras da tabela `prompts` atual.

## Contrato HTTP

```ts
type Prompt = {
  id: string;
  categoria: string | null;
  title: string;
  prompt: string;
};
```

- `GET /api/v1/prompts`: lista os prompts.
- `GET /api/v1/prompts/:id`: retorna um prompt.
- `POST /api/v1/prompts`: cria um prompt a partir de `categoria?`, `title` e `prompt`.
- `PATCH /api/v1/prompts/:id`: altera qualquer um dos três campos editáveis.
- `DELETE /api/v1/prompts/:id`: remove um prompt.
- `GET /api/v1/categories`: retorna valores distintos não vazios de `categoria` para apoiar filtros nos clientes.
- `POST /api/v1/prompts/import`: recebe um arquivo CSV multipart.

Erros terão formato estável:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "title é obrigatório", "details": {} } }
```

## Importação CSV

O cabeçalho aceito é `categoria,title,prompt`. A coluna `categoria` pode estar ausente ou vazia; `title` e `prompt` são obrigatórios em cada linha.

A importação é parcial: uma linha inválida não impede as demais. A resposta retorna contagens e os erros por linha:

```json
{
  "imported": 18,
  "rejected": 2,
  "errors": [
    { "row": 7, "fields": ["title"], "message": "title é obrigatório" }
  ]
}
```

## Validação

Testes cobrirão CRUD, categoria nula, listagem de categorias distintas, CSV com linhas válidas e inválidas no mesmo arquivo, e contrato de erro. A validação final executará typecheck, lint, testes e build de API e web app.
