# CHANGES

Esta pasta centraliza o histórico de planejamento e execução por feature no fluxo SSD.

## Convenção de nomes
- Use nomes curtos em maiúsculo com underscore.
- Exemplo: `GESTAO_OCORRENCIAS`, `MELHORIA_LOGIN`, `INTEGRACAO_PAGAMENTOS`.

## Estrutura por feature
- `CHANGES/<NOME_FEATURE>/PLANEJAMENTO.MD`
- `CHANGES/<NOME_FEATURE>/TASK.MD`

## Ordem de uso
1. Criar a pasta da feature.
2. Rodar `/ssd-analise` para gerar o `PLANEJAMENTO.MD`.
3. Rodar `/ssd-planeje` para gerar o `TASK.MD`.
4. Rodar `/ssd-implemente` para executar as tasks.
5. Rodar `/sdd-finalize` para fechamento técnico.
