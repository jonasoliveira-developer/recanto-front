# TASKS - REDESIGN_LAYOUT_MODULAR

## T01
- Status: PENDENTE
- Objetivo: Definir design tokens globais (cores, tipografia, espaçamento, radius, sombras) sem quebrar estilos atuais.
- Arquivos: src/app/globals.css
- Implementação:
  - Criar variáveis CSS para paleta principal (marrom, marrom-escuro, marrom-claro, branco, neutros).
  - Definir cores semânticas para estados (sucesso, alerta, erro, info).
  - Padronizar tokens de raio, sombras e espaçamentos-base.
  - Remover dependência de fonte genérica `Arial` e usar fonte principal do layout.
- Critério de aceitação:
  - Tokens globais centralizados e legíveis.
  - Contraste adequado para superfícies claras e elementos marrons.
  - Nenhuma quebra visual crítica nas páginas existentes.
- Dependências: nenhuma

## T02
- Status: PENDENTE
- Objetivo: Refatorar shell global de layout para estrutura moderna e responsiva.
- Arquivos: src/app/layout.tsx
- Implementação:
  - Estruturar container global com largura máxima e respiro lateral responsivo.
  - Definir comportamento de main content com padding consistente por breakpoint.
  - Garantir base mobile-first e leitura confortável.
- Critério de aceitação:
  - Estrutura global consistente em todas as páginas.
  - Conteúdo não encosta nas bordas em mobile.
  - Layout mantém compatibilidade com Header e páginas atuais.
- Dependências: T01

## T03
- Status: PENDENTE
- Objetivo: Modernizar Header com navegação fluida mantendo identidade marrom.
- Arquivos: src/components/Header.tsx
- Implementação:
  - Simplificar densidade visual do header desktop e mobile.
  - Melhorar hierarquia de links ativos/inativos.
  - Reforçar acessibilidade de navegação (foco, área de toque, contraste).
  - Manter comportamento de autenticação (Entrar/Sair) sem alterar regra de negócio.
- Critério de aceitação:
  - Header mais limpo e legível em desktop/mobile.
  - Navegação entre módulos fluida e intuitiva.
  - Estado ativo de rota claramente perceptível.
- Dependências: T01, T02

## T04
- Status: PENDENTE
- Objetivo: Criar base de componentes visuais reutilizáveis para hierarquia de ações.
- Arquivos: src/components/Button.tsx (novo), src/components/Card.tsx (novo), src/components/Alert.tsx (novo), src/components/SectionHeader.tsx (novo)
- Implementação:
  - Criar variantes de botão: primário, secundário, perigo, ghost.
  - Criar Card base para blocos de conteúdo.
  - Criar Alert padronizado para sucesso/erro/info/aviso.
  - Criar SectionHeader para títulos e subtítulos de páginas.
- Critério de aceitação:
  - Componentes com API simples e reutilizável.
  - Hierarquia visual consistente entre ações principais e secundárias.
  - Componentes funcionam em desktop e mobile.
- Dependências: T01

## T05
- Status: PENDENTE
- Objetivo: Refatorar componentes compartilhados já existentes para o novo padrão visual.
- Arquivos: src/components/Modal.tsx, src/components/CustomSelect.tsx, src/components/Paginacao.tsx
- Implementação:
  - Aplicar tokens e tipografia padronizada.
  - Melhorar spacing, foco e legibilidade.
  - Uniformizar estados disabled/loading/hover.
- Critério de aceitação:
  - Modal, select e paginação seguem o mesmo padrão de design.
  - Componentes permanecem compatíveis com telas atuais.
  - Sem regressão funcional nos fluxos existentes.
- Dependências: T01, T04

## T06
- Status: PENDENTE
- Objetivo: Refatorar módulo de autenticação e entrada (home/login) para o novo design.
- Arquivos: src/app/page.tsx, src/app/login/page.tsx
- Implementação:
  - Aplicar SectionHeader, Button e Alert padronizados.
  - Ajustar escala tipográfica de título, subtítulo e mensagens.
  - Melhorar experiência mobile e contraste dos formulários.
- Critério de aceitação:
  - Home/login visualmente alinhados ao novo sistema.
  - Fluxo de login funcional sem regressão.
  - Erros e mensagens com padrão visual único.
- Dependências: T03, T04, T05

## T07
- Status: PENDENTE
- Objetivo: Refatorar módulos cadastrais (residents, funcionarios, enderecos) com mesma linguagem visual.
- Arquivos: src/app/residents/page.tsx, src/app/funcionarios/page.tsx, src/app/enderecos/page.tsx
- Implementação:
  - Unificar padrões de listas/cards/formulários/ações.
  - Aplicar hierarquia de botões (primário, secundário, perigo) em ações de CRUD.
  - Padronizar títulos e alertas por contexto de tela.
- Critério de aceitação:
  - As 3 telas compartilham padrão visual consistente.
  - Ações Editar/Excluir continuam funcionais conforme permissões.
  - Boa usabilidade em mobile sem perda de informação crítica.
- Dependências: T04, T05, T06

## T08
- Status: PENDENTE
- Objetivo: Refatorar módulos operacionais (ocorrencias, pagamentos, avisos, reservas, portaria).
- Arquivos: src/app/ocorrencias/page.tsx, src/app/pagamentos/page.tsx, src/app/avisos/page.tsx, src/app/reservas/page.tsx, src/app/portaria/page.tsx
- Implementação:
  - Aplicar o mesmo sistema de componentes e tokens.
  - Padronizar estados de carregamento, vazio e erro.
  - Ajustar densidade visual e navegação contextual por módulo.
- Critério de aceitação:
  - Módulos operacionais visualmente coerentes com o restante do sistema.
  - Estados de UX padronizados e claros.
  - Sem regressão funcional dos fluxos principais.
- Dependências: T04, T05, T07

## T09
- Status: PENDENTE
- Objetivo: Validar acessibilidade, responsividade e performance visual do redesign.
- Arquivos: todas as telas e componentes alterados
- Implementação:
  - Revisar contraste, foco de teclado e legibilidade.
  - Validar breakpoints principais (mobile, tablet, desktop).
  - Remover classes redundantes e padronizar utilitários repetidos.
- Critério de aceitação:
  - Navegação utilizável por teclado nos elementos interativos.
  - Layout sem quebras nos principais breakpoints.
  - Redução de inconsistências visuais remanescentes.
- Dependências: T08

## T10
- Status: PENDENTE
- Objetivo: Fechamento técnico da feature com validação final e checklist SSD.
- Arquivos: CHANGES/REDESIGN_LAYOUT_MODULAR/TASK.MD, arquivos modificados na feature
- Implementação:
  - Executar build final (`npm run build`).
  - Revisar regressões funcionais críticas por rota.
  - Atualizar status das tasks para concluídas.
  - Preparar commit em Conventional Commits.
- Critério de aceitação:
  - Build final sem erros.
  - Fluxos críticos validados manualmente.
  - Tasks documentadas com status final.
- Dependências: T09

## Ordem recomendada de execução
1. T01
2. T02
3. T03
4. T04
5. T05
6. T06
7. T07
8. T08
9. T09
10. T10
