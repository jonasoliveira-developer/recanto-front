# SSD - Analise (Frontend Recanto)

Objetivo: analisar o código atual do frontend e gerar o plano técnico da feature.

## Como executar
1. Leia o contexto da feature solicitado pelo usuário.
2. Defina um nome curto em maiúsculo para a feature (ex.: `GESTAO_VISITANTES`).
3. Mapeie os arquivos impactados no frontend.
4. Registre riscos de regressão.
5. Gere o arquivo `CHANGES/<NOME_FEATURE>/PLANEJAMENTO.MD`.

## Escopo de análise obrigatório
- Rotas e páginas em `src/app/**`
- Componentes em `src/components/**`
- Hooks em `src/hooks/**`
- Serviços HTTP em `src/services/**`
- Contexto de autenticação em `src/context/**`
- Estilos globais quando necessário em `src/app/globals.css`

## Estrutura esperada no PLANEJAMENTO.MD
1. Contexto da feature
2. Objetivo funcional
3. Arquivos impactados
4. Fluxo atual
5. Fluxo proposto
6. Regras de negócio
7. Estratégia de estados e erros
8. Estratégia de testes
9. Riscos e mitigação
10. Resumo acionável

## Se a feature envolver autenticação/tokens
Separar explicitamente:
- O que a API faz
- O que o frontend deve fazer em cada status:
  - `419`: reautenticar, renovar token e repetir request original
  - `401`: limpar sessão e redirecionar para login
  - `400`: mostrar erro de formulário na tela
  - `200`: seguir fluxo normal e atualizar interface

## Critérios de qualidade
- Não quebrar comportamentos existentes sem solicitação explícita.
- Preservar padrão visual e estrutura do projeto.
- Priorizar legibilidade e nomes descritivos.
- Planejamento deve ser acionável para virar tasks.
