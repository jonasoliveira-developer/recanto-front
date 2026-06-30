# Fluxo SSD - Frontend Recanto

Este projeto usa o fluxo SSD (Spec-Driven Development) para organizar mudanças de forma previsível e rastreável.

## Arquivos do fluxo
- `ssd-analise.prompt.md`
- `ssd-planeje.prompt.md`
- `ssd-implemente.prompt.md`
- `sdd-finalize.prompt.md`

## Estrutura de mudança por feature
- `CHANGES/<NOME_FEATURE>/PLANEJAMENTO.MD`
- `CHANGES/<NOME_FEATURE>/TASK.MD`

## Sequência obrigatória
1. Analise
   - Gerar planejamento técnico no arquivo `PLANEJAMENTO.MD`.
2. Planeje
   - Quebrar o planejamento em tarefas no arquivo `TASK.MD`.
3. Implemente
   - Executar tarefa por tarefa e atualizar status.
4. Finalize
   - Encerrar terminais desnecessários, rodar build, corrigir erros e subir servidor de desenvolvimento.
   - Perguntar se deve criar commit (Conventional Commits).
   - Perguntar se deve fazer push.

## Diretrizes para este frontend
- Stack atual: Next.js + React + TypeScript.
- Scripts padrão:
  - dev: `npm run dev`
  - build: `npm run build`
  - lint: `npm run lint`
- Componentes/páginas/hooks/services devem seguir o padrão de organização e legibilidade já existente no projeto.
- Sempre manter nomenclatura clara em português quando aplicável ao contexto do sistema.

## Matriz de respostas HTTP (quando aplicável)
- `419`: reautenticação, renovar token e repetir request original.
- `401`: limpar sessão e redirecionar para login.
- `400`: erro de formulário visível para o usuário.
- `200`: atualizar estado da interface e seguir fluxo normal.

## Modo de uso que você definiu
1. Você escreve o escopo completo da feature.
2. No final, dispara `/ssd-analise`.
3. Depois usa `/ssd-planeje`.
4. Em seguida usa `/ssd-implemente`.
5. Ao concluir, usa `/sdd-finalize`.
