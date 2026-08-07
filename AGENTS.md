# Repository Guidelines

## Estrutura do projeto

Este é um workspace pnpm com a API em `api/`. O código Fastify fica em `api/src/`: `modules/` organiza cada domínio (rotas, serviços, repositórios e schemas), `database/` contém o cliente e o schema Drizzle, e `plugins/` reúne integrações da aplicação. Testes ficam em `api/tests/unit/` e `api/tests/integration/`. Migrations geradas ficam em `api/drizzle/`; dados operacionais importados/exportados usam `data/`. Especificações e planos históricos estão em `docs/superpowers/`.

## Desenvolvimento, build e banco

Use Node.js 22+ e pnpm via Corepack. Antes de executar a API, configure `DATABASE_URL` em `.env.local` na raiz; use `.env.example` como referência.

```powershell
corepack pnpm install                 # instala dependências do workspace
corepack pnpm dev:api                 # inicia a API com recarregamento
corepack pnpm --dir api db:migrate    # aplica migrations no PostgreSQL
corepack pnpm build                   # compila todos os pacotes
corepack pnpm lint                    # executa ESLint
corepack pnpm typecheck               # verifica tipos TypeScript
corepack pnpm test                    # executa Vitest
```

Para o ambiente conteinerizado, ajuste `.env` na raiz usando `.env.example` como referência e execute `docker compose up -d --build`.

## Estilo e convenções

Escreva TypeScript moderno com módulos ESM, aspas duplas e ponto e vírgula, seguindo o padrão dos arquivos existentes. Use nomes em inglês: `camelCase` para variáveis e funções, `PascalCase` para tipos/classes e nomes descritivos em `kebab-case` para arquivos (por exemplo, `prompt.service.ts`). Mantenha responsabilidades nos módulos do domínio e evite `any`; prefira contratos explícitos com TypeBox e tipos locais. Execute `pnpm lint` antes de enviar alterações; ESLint já inclui a compatibilidade com Prettier.

## Testes

O projeto usa Vitest com ambiente Node. Nomeie testes como `*.test.ts` dentro de `api/tests/unit/` ou `api/tests/integration/`, espelhando o comportamento coberto. Testes unitários não exigem banco; testes de integração exigem um PostgreSQL configurado. Rode um arquivo isolado com `corepack pnpm --dir api test -- tests/unit/prompt-contract.test.ts`.

## Commits e pull requests

Siga o padrão observado no histórico: `feat:`, `fix:`, `refactor:`, `docs:` ou `chore:`, com resumo curto no imperativo (ex.: `feat: add prompt export`). Em pull requests, descreva o objetivo, as alterações e a validação executada; vincule a issue quando existir. Inclua exemplos de requisição/resposta para mudanças de API e screenshots somente quando a documentação ou interface mudar.

## Segurança e configuração

Não versione arquivos `.env`, credenciais ou dumps. Mantenha valores sensíveis apenas no ambiente e atualize `.env.example` quando uma nova variável obrigatória for introduzida.
