# Especificação: Prompt Hub Web

## Objetivo

Criar uma aplicação web simples para navegar pelo catálogo de prompts, usando React, Vite e Mantine UI. O frontend ficará em `app/`, será compilado junto com a API e servido pelo Fastify no mesmo container e na mesma porta.

## Escopo da primeira versão

- Listar prompts em cards responsivos.
- Pesquisar por título, descrição, conteúdo e demais campos suportados pela API.
- Filtrar por categoria, subcategoria, tag, idioma, tipo, favorito e arquivado.
- Ordenar e paginar resultados.
- Abrir um prompt em modal ou painel de detalhes.
- Copiar o conteúdo do prompt para a área de transferência.
- Marcar e desmarcar favorito usando a API.
- Exibir estados de carregamento, vazio e erro.
- Consumir categorias, subcategorias e tags da API.

Ficam fora desta versão autenticação, criação/edição de prompts pelo frontend, importação de CSV pela interface, gerenciamento administrativo e modo offline.

## Arquitetura

O repositório será organizado como um monorepo leve, sem alterar a localização da API:

```text
PromptHub/
├── src/                 # API Fastify existente
├── app/                 # aplicação React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── features/prompts/
│   │   ├── lib/api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── Dockerfile
└── docker-compose.yml
```

O Vite produzirá `app/dist`. O estágio de build copiará esse resultado para a imagem final, e o Fastify servirá os arquivos estáticos. Rotas que não forem endpoints da API retornarão `app/dist/index.html` para permitir navegação client-side.

Em desenvolvimento, o Vite usará `VITE_API_URL`, com fallback para `http://localhost:3333/api/v1`. Em produção, o frontend usará caminho relativo `/api/v1`, evitando configuração adicional de CORS.

## Interface

A tela principal usará uma composição de catálogo minimalista:

- cabeçalho com nome do produto, contagem de resultados e busca;
- sidebar responsiva com filtros;
- grid de cards usando `SimpleGrid`/`Card` do Mantine;
- modal de detalhes para leitura e cópia;
- paginação no final da listagem;
- `Skeleton`, `Alert` e estado vazio para feedback operacional.

Cada card exibirá título, descrição ou trecho do conteúdo, categoria, tags, idioma, tipo e estado de favorito. O conteúdo completo será acessível sem navegar para outra página.

## Skills Mantine

Durante a implementação, devem ser usadas as skills Mantine disponíveis em `/mantine-..` quando o componente correspondente for criado ou alterado:

- `mantine-custom-components`: componentes próprios integrados ao tema, Styles API e tokens do Mantine, como `PromptCard`, `PromptFilters` e estados visuais.
- `mantine-combobox`: filtros de categoria, subcategoria, tags e outros selects com busca ou múltipla seleção.
- `mantine-form`: formulários futuros de criação e edição de prompts, caso essa parte entre no escopo.

As skills serão lidas antes da implementação de cada superfície correspondente. Não serão criadas abstrações customizadas quando um componente Mantine existente atender ao requisito.

## Contrato com a API

O cliente será tipado para os endpoints existentes:

- `GET /api/v1/prompts`
- `GET /api/v1/categories`
- `GET /api/v1/subcategories`
- `GET /api/v1/tags`
- `PATCH /api/v1/prompts/:id` para favorito

Os filtros serão serializados com os nomes da API (`search`, `categoryId`, `subcategoryId`, `tag`, `language`, `type`, `favorite`, `archived`, `page`, `limit`, `sort`, `order`). A camada `app/src/lib/api.ts` concentrará fetch, tratamento de erros e conversão de query string.

## Estado e comportamento

- A busca será aplicada com debounce curto para evitar excesso de requisições.
- Alterar um filtro retornará à primeira página.
- Filtros ficarão refletidos na URL para permitir recarregar e compartilhar a consulta.
- Favoritar atualizará o card localmente após resposta bem-sucedida.
- Falhas de rede exibirão uma mensagem clara e uma ação de tentar novamente.
- A cópia usará `navigator.clipboard` e exibirá confirmação visual.

## Empacotamento e deploy

- `app/package.json` terá dependências isoladas do frontend.
- O root manterá comandos de conveniência para instalar, desenvolver e compilar API + frontend.
- O Dockerfile instalará e compilará o frontend no estágio de build.
- A imagem final conterá a API compilada, `app/dist` e os assets necessários.
- O Compose continuará expondo somente a porta `3333`.

## Testes e validação

- Testes unitários do cliente para serialização de filtros e tratamento de resposta.
- Testes de componentes para card, filtros, estado vazio e modal de detalhes.
- Build de produção do frontend.
- Typecheck e lint da API e do frontend.
- Validação manual com a API real: listagem, busca, filtro, paginação, favorito e cópia.

## Critérios de aceite

1. `corepack pnpm install` instala API e frontend sem passos manuais adicionais.
2. `corepack pnpm dev` permite executar API e Vite em desenvolvimento.
3. `corepack pnpm build` gera API e frontend para a imagem de produção.
4. O container servido no ZimaOS abre a interface pela mesma porta `3333`.
5. O usuário consegue encontrar, filtrar, abrir, copiar e favoritar prompts.
6. O frontend permanece utilizável em desktop e telas menores.
