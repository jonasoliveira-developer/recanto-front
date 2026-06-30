# SSD - Planeje (Frontend Recanto)

Objetivo: transformar o planejamento técnico em tarefas claras e executáveis.

## Entrada
- `CHANGES/<NOME_FEATURE>/PLANEJAMENTO.MD`

## Saída
- `CHANGES/<NOME_FEATURE>/TASK.MD`

## Regras para gerar tasks
1. Quebre em tarefas pequenas e independentes.
2. Cada tarefa deve conter:
   - ID
   - Status
   - Objetivo
   - Arquivos-alvo
   - Implementação
   - Critério de aceitação
   - Dependências
3. Ordene por prioridade e dependência.
4. Marque o status inicial como `PENDENTE`.

## Modelo de task
## T01
- Status: PENDENTE
- Objetivo: ...
- Arquivos: ...
- Implementação: ...
- Critério de aceitação: ...
- Dependências: ...

## Regras para fluxos HTTP de autenticação
Sempre incluir tasks específicas para:
- tratamento de `419` com reautenticação e retry
- tratamento de `401` com logout e redirecionamento
- tratamento de `400` com feedback inline
- tratamento de `200` com atualização de estado/interface

## Critérios de conclusão
- `TASK.MD` cobre 100% do `PLANEJAMENTO.MD`.
- Tasks testáveis e sem ambiguidade.
- Ordem de execução coerente.
