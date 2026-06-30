# SSD - Implemente (Frontend Recanto)

Objetivo: implementar as tasks uma por uma, com validação contínua.

## Entrada
- `CHANGES/<NOME_FEATURE>/TASK.MD`

## Fluxo de execução
1. Selecionar a primeira task `PENDENTE`.
2. Implementar somente o necessário para concluir a task atual.
3. Validar build.
4. Atualizar status da task para `EM_PROGRESSO` durante execução e `CONCLUIDA` ao finalizar.
5. Repetir até concluir todas as tasks.

## Regras de implementação
- Respeitar stack do projeto: Next.js + React + TypeScript.
- Reutilizar serviços em `src/services/**` para chamadas HTTP.
- Não mover lógica de negócio para UI se já houver camada de serviço.
- Preservar padrão visual existente.
- Evitar refatorações fora do escopo.

## Regras para status HTTP
- `419`: reautenticar, renovar token e repetir request original.
- `401`: encerrar sessão local e redirecionar para `/login`.
- `400`: exibir erros de formulário em texto visível.
- `200`: atualizar estado/tela conforme resultado.

## Definição de pronto por task
- Código implementado.
- Build executado com sucesso.
- Comportamento validado localmente no fluxo alterado.
- `TASK.MD` atualizado.
