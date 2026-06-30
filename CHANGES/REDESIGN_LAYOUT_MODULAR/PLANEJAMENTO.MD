# PLANEJAMENTO FRONTEND - REDESIGN_LAYOUT_MODULAR

## 1. Contexto da feature
O sistema possui funcionalidade estável, porém a interface está heterogênea entre páginas, com padrões visuais mistos de tipografia, espaçamento, hierarquia de botões e navegação. O objetivo é evoluir para um layout simples e moderno, sem perder a identidade de tons marrons do Recanto, equilibrando com branco e cores de apoio para estados e alertas.

A solicitação é explicitamente módulo por módulo (todas as páginas), com navegação fluida, boa experiência mobile e hierarquia visual consistente.

## 2. Objetivo funcional
Refatorar a camada visual e de layout de forma incremental por módulo, padronizando:
- Design tokens (cores, tipografia, espaçamentos, bordas, sombras)
- Estrutura de página (header, conteúdo, ações primárias/secundárias)
- Componentes base reutilizáveis (botões, cards, campos, alertas, tabelas/listas, modais)
- Responsividade mobile-first
- Hierarquia visual de títulos, subtítulos, textos e alertas

Resultado esperado: sistema com aparência moderna, consistente, legível e responsiva, mantendo identidade marrom como cor de marca.

## 3. Arquivos impactados
Base global:
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/Header.tsx`

Componentes de fundação (novos ou refatorados):
- `src/components/` (Button, Card, SectionHeader, Alert, Input, Badge, EmptyState, etc.)
- `src/components/Modal.tsx`
- `src/components/CustomSelect.tsx`
- `src/components/Paginacao.tsx`

Páginas/módulos:
- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/residents/page.tsx`
- `src/app/funcionarios/page.tsx`
- `src/app/ocorrencias/page.tsx`
- `src/app/pagamentos/page.tsx`
- `src/app/avisos/page.tsx`
- `src/app/enderecos/page.tsx`
- `src/app/reservas/page.tsx`
- `src/app/portaria/page.tsx`

Documentação SSD da feature:
- `CHANGES/REDESIGN_LAYOUT_MODULAR/TASK.MD` (gerado no `/ssd-planeje`)

## 4. Fluxo atual
1. Header funcional, porém visualmente carregado e com variação forte entre desktop/mobile.
2. Tipografia global usa fallback genérico (`Arial`) e títulos sem escala consistente entre telas.
3. Páginas usam estilos Tailwind pontuais, sem sistema de tokens centralizado para cores/raio/espaçamento.
4. Botões variam em tamanho, peso visual e sem hierarquia clara de ação (primária/secundária/perigo/ghost).
5. Alertas e mensagens de erro/sucesso não seguem padrão único de UI.
6. Experiência mobile funciona, mas com inconsistência de espaçamento, densidade e legibilidade.

## 5. Fluxo proposto
### 5.1 Estratégia por camadas
1. Criar fundação visual global (tokens + tipografia + utilitários de superfície).
2. Refatorar Header e shell de layout para navegação fluida e sticky behavior leve.
3. Definir biblioteca mínima de componentes de UI do projeto.
4. Migrar módulo por módulo (ordem definida em tasks), sem quebra funcional.
5. Validar cada etapa com build e teste manual responsivo.

### 5.2 Direção visual
- Manter marrom como marca principal (primária).
- Usar branco/off-white para superfície e respiro visual.
- Usar cores de apoio para estados:
  - sucesso (verde), aviso (âmbar), erro (vermelho), info (azul suave)
- Aplicar contraste adequado para acessibilidade.

### 5.3 Tipografia e hierarquia
- Fonte principal consistente via `next/font` (já existente no layout).
- Escala tipográfica unificada (exemplo):
  - H1: 32/36
  - H2: 24/28
  - H3: 20/24
  - Body: 16/24
  - Small: 14/20
- Peso e espaçamento consistentes para títulos, subtítulos e labels.

### 5.4 Botões e componentes
- Botão Primário: ação principal da tela (marrom principal).
- Botão Secundário: ação de apoio (neutro claro).
- Botão Perigo: exclusão/remoção (vermelho).
- Botão Ghost/Link: ação de baixa prioridade.
- Estados padrão: default, hover, active, disabled, loading.

### 5.5 Mobile-first e navegação
- Priorizar breakpoints pequenos primeiro.
- Áreas de toque mínimas de 44px.
- Menus e ações críticas sempre acessíveis sem zoom.
- Reduzir ruído visual no mobile mantendo clareza de fluxo.

## 6. Regras de negócio
- Não alterar contratos de API nem lógica de permissões.
- Não remover funcionalidades existentes.
- Editar/Excluir continuam visíveis conforme role real (ADMIN/EMPLOYEE).
- Fluxos de login/logout permanecem intactos.
- Modais e formulários devem preservar validações e mensagens já implementadas.

## 7. Estratégia de estados e erros
Estados visuais padronizados em todas as páginas:
- loading inicial de página/lista
- empty state
- erro de carregamento
- sucesso de ação
- erro de validação em formulário

Padrão de alerta:
- Container semântico com cor e ícone por severidade
- Mensagens curtas e acionáveis
- Espaçamento e legibilidade iguais em desktop/mobile

## 8. Estratégia de testes
1. Teste visual por módulo em desktop e mobile (DevTools).
2. Verificar contraste e legibilidade dos textos principais.
3. Validar hierarquia dos botões (primário, secundário, perigo).
4. Validar estados de loading/erro/sucesso em cada tela.
5. Testar navegação entre módulos sem regressão funcional.
6. Rodar `npm run build` ao fim de cada lote de módulos.

## 9. Riscos e mitigação
- Risco: regressão visual ampla por mudança global.
  - Mitigação: rollout incremental por módulo + validação frequente.
- Risco: divergência entre desktop/mobile.
  - Mitigação: abordagem mobile-first e revisão por breakpoint.
- Risco: quebra de componentes compartilhados.
  - Mitigação: criar camada base reutilizável e testes manuais dos fluxos críticos.
- Risco: excesso de customização sem consistência.
  - Mitigação: tokens centrais em `globals.css` e checklist de design system.

## 10. Resumo acionável
- Criar design tokens globais e escala tipográfica.
- Refatorar Header/layout shell para navegação fluida.
- Construir componentes base (Button, Card, Alert, SectionHeader, Input).
- Migrar telas por blocos funcionais, mantendo regras de negócio.
- Validar build e UX mobile a cada etapa.
- Consolidar padrão visual moderno com marrom+branco balanceado e suporte de cores de estado.
