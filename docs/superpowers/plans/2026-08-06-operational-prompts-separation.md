# Plano de implementação: separação de prompts operacionais

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIO: usar superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano tarefa por tarefa. As etapas usam caixas de seleção (`- [ ]`) para acompanhamento.

**Objetivo:** Mover os 283 prompts explícitos como skill ou operacionalmente estruturados para `prompts-operational.csv` e manter o restante em `prompts-detailed-enriched.csv`.

**Arquitetura:** O mesmo classificador local que marca `SKILL` avaliará seis sinais operacionais. Uma linha será movida quando for skill explícita ou apresentar pelo menos três sinais; o gerador escreverá ambos os CSVs a partir do catálogo enriquecido atual.

**Stack:** Node.js, `csv-parse` e testes nativos `node:test`.

## Restrições globais

- Nunca modificar `prompts-detailed.csv`.
- Preservar todas as oito colunas de cada linha sem mudança de conteúdo.
- Selecionar skills explícitas ou linhas com ao menos três sinais operacionais.
- Produzir `prompts-operational.csv` e regravar `prompts-detailed-enriched.csv` somente após validar as duas saídas.
- As saídas devem somar 1.754 registros sem interseção.

---

### Tarefa 1: testar e implementar a seleção operacional

**Arquivos:**
- Modificar: `tests/prompt-metadata-rules.test.mjs`
- Modificar: `scripts/prompt-metadata-rules.mjs`

**Interfaces:**
- Produz: `isOperationalPrompt({ type: string, content: string }): boolean`.

- [ ] **Etapa 1: criar casos de teste de seleção**

Cobrir uma skill explícita, um conteúdo com três sinais e um prompt técnico com apenas uma ferramenta, que não deve ser selecionado.

- [ ] **Etapa 2: executar o teste e confirmar a falha**

Executar: `node --test tests/prompt-metadata-rules.test.mjs`

Esperado: falha porque `isOperationalPrompt` ainda não existe.

- [ ] **Etapa 3: implementar os seis sinais e a regra de três sinais**

Usar expressões regulares para: quando usar, etapas, pré-requisitos, regras, comandos/ferramentas e critérios de execução; retornar verdadeiro para skill explícita ou três sinais.

- [ ] **Etapa 4: executar o teste e confirmar que passa**

Executar: `node --test tests/prompt-metadata-rules.test.mjs`

Esperado: todos os testes aprovados.

### Tarefa 2: gerar a partição e validar sua integridade

**Arquivos:**
- Modificar: `scripts/enrich-prompt-metadata.mjs`
- Criar: `prompts-operational.csv`
- Regravar: `prompts-detailed-enriched.csv`

**Interfaces:**
- Consome: catálogo enriquecido completo de 1.754 registros.
- Produz: arquivos operacional e enriquecido residual.

- [ ] **Etapa 1: particionar as linhas classificadas**

Usar `isOperationalPrompt` para enviar cada linha a exatamente uma coleção, preservando a ordem e todas as colunas.

- [ ] **Etapa 2: gravar as duas saídas temporárias e promovê-las após validação**

Gerar os dois CSVs temporários; exigir 283 registros operacionais e 1.471 restantes antes de substituir os arquivos finais.

- [ ] **Etapa 3: validar a partição**

Confirmar contagem total, ausência de duplicidade por índice, preservação dos 14 `SKILL` na saída operacional e igualdade das linhas reconstruídas com o catálogo de entrada.

