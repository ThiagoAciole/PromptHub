# Separação de prompts operacionais

## Objetivo

Separar do catálogo enriquecido todos os conteúdos que declaram explicitamente ser uma skill/habilidade ou apresentam forte caráter operacional, criando `prompts-operational.csv` e reduzindo `prompts-detailed-enriched.csv`.

## Critério amplo de seleção

Uma linha será selecionada quando cumprir pelo menos uma condição:

- declarar explicitamente skill/habilidade, citar `SKILL.md` ou diretórios de skills; ou
- apresentar três ou mais sinais entre: quando usar, etapas numeradas, pré-requisitos, regras obrigatórias, comandos/ferramentas e critérios de execução.

O recorte esperado contém 283 registros: 31 explícitos e 252 ou mais operacionais por estrutura. O número efetivo será validado antes da substituição final.

## Arquivos

- `prompts-detailed.csv`: fonte original, nunca modificada.
- `prompts-operational.csv`: receberá os 283 registros selecionados.
- `prompts-detailed-enriched.csv`: será regravado somente com os registros restantes.

## Preservação e validação

- As oito colunas do CSV serão preservadas sem alterações em cada linha movida ou mantida.
- Os dois CSVs finais terão juntos 1.754 registros, sem duplicação nem perda em relação ao CSV enriquecido anterior à separação.
- Nenhum conteúdo selecionado poderá permanecer no catálogo enriquecido.
- Todo conteúdo não selecionado deverá permanecer no catálogo enriquecido.
- O arquivo operacional manterá os 14 registros já marcados como `SKILL`.
