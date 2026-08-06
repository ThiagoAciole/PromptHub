# Plano de implementação: enriquecimento de metadados do CSV de prompts

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIO: usar superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano tarefa por tarefa. As etapas usam caixas de seleção (`- [ ]`) para acompanhamento.

**Objetivo:** Gerar `prompts-detailed-enriched.csv` com descrição, categoria e tags curadas para os 1.153 prompts sem metadados.

**Arquitetura:** Um script local lê o CSV de origem, conserva os 601 registros já curados e classifica os 1.153 registros pendentes por regras determinísticas sobre título e conteúdo. O resultado é validado contra a taxonomia, comparado ao original e gravado em um novo CSV.

**Stack:** Node.js, CSV e validações locais em JavaScript.

## Restrições globais

- Nunca modificar `prompts-detailed.csv`.
- Criar somente `prompts-detailed-enriched.csv` como artefato de dados final.
- Preservar `title`, `content`, `type`, `is_favorite` e `is_archived` em todos os 1.754 registros.
- Preservar os três metadados dos 601 registros que já os possuem.
- Usar apenas a taxonomia definida em `docs/superpowers/specs/2026-08-06-prompts-csv-metadata-enrichment-design.md`.
- Gerar descrição em português, uma única frase objetiva.
- Gerar entre três e cinco tags em minúsculas, únicas e separadas por ponto e vírgula.
- Para conteúdo insuficiente ou ambíguo, usar categoria `Geral` sem criar contexto inexistente.

---

### Tarefa 1: preparar o enriquecedor reprodutível

**Arquivos:**
- Criar: `scripts/enrich-prompt-metadata.mjs`
- Ler: `prompts-detailed.csv`
- Produz: `prompts-detailed-enriched.csv`

**Interfaces:**
- Consome: CSV com cabeçalho `title,description,content,type,category,tags,is_favorite,is_archived`.
- Produz: CSV com os mesmos oito campos e o mesmo número de registros.

- [ ] **Etapa 1: implementar leitura, seleção e preservação dos registros**

O script deve considerar pendente somente a linha em que `description`, `category` e `tags` estejam vazios. Toda linha não pendente deve ser copiada sem alteração.

- [ ] **Etapa 2: implementar classificação local e validação por registro**

Classificar cada linha pendente com uma tabela de padrões por categoria; produzir descrição curta da categoria e de três a cinco tags únicas. Usar `Geral` para textos insuficientes ou sem padrão correspondente.

- [ ] **Etapa 3: gerar o CSV de saída de forma atômica**

Gravar primeiro `prompts-detailed-enriched.csv.tmp` e renomear para `prompts-detailed-enriched.csv` somente após todos os lotes passarem na validação.

### Tarefa 2: executar a curadoria e validar o resultado

**Arquivos:**
- Executar: `scripts/enrich-prompt-metadata.mjs`
- Gerar: `prompts-detailed-enriched.csv`

**Interfaces:**
- Consome: script da Tarefa 1 e `prompts-detailed.csv`.
- Produz: CSV enriquecido pronto para revisão/importação.

- [ ] **Etapa 1: executar o enriquecimento**

```powershell
node scripts/enrich-prompt-metadata.mjs
```

Esperado: log com 1.153 registros enriquecidos e 601 preservados.

- [ ] **Etapa 2: validar a integridade estrutural**

```powershell
$rows = Import-Csv 'prompts-detailed-enriched.csv'
if ($rows.Count -ne 1754) { throw 'Quantidade de registros inválida' }
if (@($rows | Where-Object { !$_.description -or !$_.category -or !$_.tags }).Count) { throw 'Ainda há metadados vazios' }
'Estrutura válida'
```

Esperado: `Estrutura válida`.

- [ ] **Etapa 3: comparar os campos imutáveis e os registros já curados**

Comparar cada linha original e enriquecida. `title`, `content`, `type`, `is_favorite`, `is_archived` devem ser idênticos em todas as linhas; `description`, `category` e `tags` devem ser idênticos nas 601 linhas que já tinham os três campos preenchidos.

- [ ] **Etapa 4: auditar distribuição e amostras**

Exibir contagem por categoria, verificar que cada tag foi serializada com `;` e revisar uma amostra aleatória de 30 itens enriquecidos junto de seu conteúdo.
