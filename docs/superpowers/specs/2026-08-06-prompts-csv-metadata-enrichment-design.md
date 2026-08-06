# Enriquecimento de metadados do CSV de prompts

## Objetivo

Gerar `prompts-detailed-enriched.csv` a partir de `prompts-detailed.csv`, preenchendo somente os 1.153 registros que não possuem `description`, `category` e `tags`.

## Escopo e preservação

- Preservar integralmente `title`, `content`, `type`, `is_favorite` e `is_archived` em todos os registros.
- Preservar os metadados existentes nos 601 registros já enriquecidos.
- Não substituir nem modificar o CSV de origem.

## Curadoria proposta

Para cada registro sem metadados, interpretar `title` e `content` localmente, por regras determinísticas de termos e padrões, e produzir:

- `description`: uma frase curta, objetiva e em português que descreve a finalidade do prompt.
- `category`: uma única categoria da taxonomia controlada: Geral, Desenvolvimento, Tecnologia, Negócios, Educação, Escrita, Arte, Entretenimento, Produtividade, Design, Fotografia, Vida pessoal, Saúde, Jogos, Finanças, Marketing, Carreira, Idiomas, Gastronomia, Segurança, Música, Matemática, Filosofia, Lazer, Comunicação, Estilo de Vida, Redes Sociais, Religião, Direito, Literatura, Psicologia, Ciência, Criatividade, Desenvolvimento Pessoal, Arquitetura, Terapia, Treinamento, Vendas, Saúde e Bem-estar, Beleza, Ferramentas, Moda, Clima, Cuidados Pessoais, Ciência de Dados, IA, História, Botânica, Viagens, Esoterismo, Automotivo ou Dados.
- `tags`: de três a cinco termos curtos, em minúsculas, separados por ponto e vírgula, sem repetição.

Quando o conteúdo for vago, placeholder ou curto demais para uma classificação confiável, usar `Geral` e tags descritivas mínimas, sem inventar contexto. Não usar serviços externos ou credenciais.

## Validação

- Confirmar 1.754 registros no resultado.
- Confirmar que não restam campos vazios de descrição, categoria ou tags.
- Validar descrições e tags sem quebras de CSV.
- Garantir títulos com no máximo 200 caracteres no arquivo resultante, sem alterar o título de origem; os dois casos acima do limite serão reportados como risco de importação.
- Comparar os 601 registros previamente preenchidos para assegurar que não foram alterados.

## Entrega

O único artefato de dados gerado será `prompts-detailed-enriched.csv`, acompanhado de um resumo de qualidade e dos riscos conhecidos de importação.
