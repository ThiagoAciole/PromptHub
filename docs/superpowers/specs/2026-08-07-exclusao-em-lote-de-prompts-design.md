# Exclusao em lote de prompts

## Objetivo

Permitir remover prompts selecionados e limpar todo o catalogo sem alterar o CRUD individual existente.

## Endpoints

### Excluir IDs selecionados

`DELETE /api/v1/prompts/batch`

Body:

```json
{ "ids": ["uuid-1", "uuid-2"] }
```

- `ids` e obrigatorio e aceita de 1 a 1.000 UUIDs.
- A operacao remove somente os registros encontrados.
- IDs inexistentes nao causam erro.
- Resposta `200`: `{ "deletedCount": 2 }`.

### Limpar catalogo

`DELETE /api/v1/prompts`

Body:

```json
{ "confirm": "DELETE_ALL_PROMPTS" }
```

- A frase de confirmacao deve ser exatamente `DELETE_ALL_PROMPTS`.
- Sem a confirmacao valida, a API retorna `400` com o contrato padrao de erro.
- Resposta `200`: `{ "deletedCount": 248 }`.

## Implementacao

- As rotas de lote sao declaradas antes de `/:id`.
- O repositorio concentra as exclusoes SQL e retorna a quantidade removida.
- O service valida entradas e preserva o comportamento do delete individual.

## Testes

- Excluir uma lista de IDs remove apenas os registros solicitados e informa a quantidade correta.
- Lista vazia ou UUID invalido retorna `400`.
- Limpar o catalogo exige a confirmacao literal e retorna a quantidade removida.
- O delete individual continua respondendo `204`.
