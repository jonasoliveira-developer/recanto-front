# TASKS - AUTH_TOGGLE

## T01
- Status: CONCLUIDA
- Objetivo: Criar base segura para detectar ambiente local elegível ao toggle.
- Arquivos: src/context/AuthContext.tsx
- Implementação:
  - Criar função utilitária para validar ambiente local (`localhost` e `127.0.0.1`).
  - Aplicar guarda opcional via `NEXT_PUBLIC_ENABLE_LOCAL_AUTH_TOGGLE`.
  - Garantir retorno sempre `false` fora de ambiente browser.
- Critério de aceitação:
  - Ambiente não local nunca habilita toggle.
  - Ambiente local é detectado corretamente.
  - Função é reutilizável para outras telas.
- Dependências: nenhuma

## T02
- Status: CONCLUIDA
- Objetivo: Implementar estado de toggle local de superacesso no contexto de autenticação.
- Arquivos: src/context/AuthContext.tsx
- Implementação:
  - Ler/gravar flag `auth_toggle_superlocal` no `localStorage`.
  - Expor estado `modoSuperacessoLocalAtivo` no contexto.
  - Expor ação para alternar toggle sem reiniciar aplicação.
- Critério de aceitação:
  - Toggle pode ser ligado e desligado em runtime no ambiente local.
  - Estado persiste no browser local.
  - Em ambiente não local a flag é ignorada.
- Dependências: T01

## T03
- Status: CONCLUIDA
- Objetivo: Criar helper de autorização efetiva preservando `hasRole` original.
- Arquivos: src/context/AuthContext.tsx
- Implementação:
  - Implementar helper central de permissão efetiva para UI.
  - Quando toggle local ativo, liberar ações protegidas no frontend.
  - Fora desse caso, manter regra atual por perfil/role.
- Critério de aceitação:
  - Regras atuais permanecem válidas por padrão.
  - Toggle altera somente autorização de interface local.
  - Sem regressão no comportamento de roles existentes.
- Dependências: T02

## T04
- Status: CONCLUIDA
- Objetivo: Padronizar tratamento de resposta `403` no cliente HTTP.
- Arquivos: src/services/api.ts
- Implementação:
  - Adicionar interceptor de resposta para capturar `403`.
  - Normalizar mensagem amigável de permissão negada para consumo da UI.
  - Manter fluxo atual para outros códigos (`401`, `400`, etc.).
- Critério de aceitação:
  - Respostas `403` entregam mensagem clara e consistente.
  - Tratamento não quebra requests de sucesso.
  - Códigos diferentes de `403` seguem fluxo existente.
- Dependências: nenhuma

## T05
- Status: CONCLUIDA
- Objetivo: Exibir mensagem clara de falta de permissão na edição de endereço.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Tratar explicitamente `403` no fluxo de editar/salvar endereço.
  - Mostrar texto objetivo: sem permissão para editar este endereço.
  - Diferenciar erro de permissão de erro de validação.
- Critério de aceitação:
  - Em `403`, usuário recebe mensagem clara e específica.
  - Modal permanece aberto para leitura/correção.
  - Mensagens de `400` e `404` continuam funcionando.
- Dependências: T04

## T06
- Status: CONCLUIDA
- Objetivo: Integrar autorização efetiva na tela de endereços com suporte ao toggle local.
- Arquivos: src/app/enderecos/page.tsx, src/context/AuthContext.tsx
- Implementação:
  - Substituir checagem isolada por helper central de permissão efetiva.
  - Garantir que botão/ação de editar reflita toggle local ativo.
  - Manter ocultação da ação para perfil sem permissão quando toggle desligado.
- Critério de aceitação:
  - Sem toggle, comportamento segue regra atual.
  - Com toggle local ativo, UI libera ação de edição.
  - Em ambiente não local, toggle não tem efeito.
- Dependências: T03, T05

## T07
- Status: CONCLUIDA
- Objetivo: Exibir e controlar toggle de superacesso apenas em ambiente local.
- Arquivos: src/components/Header.tsx
- Implementação:
  - Inserir controle visual de toggle somente quando ambiente local permitido.
  - Exibir indicador de estado (ativo/inativo) para evitar confusão operacional.
  - Acionar alternância do contexto de autenticação.
- Critério de aceitação:
  - Toggle não aparece fora de ambiente local.
  - Usuário local pode alternar o modo visualmente.
  - Estado refletido no indicador imediatamente.
- Dependências: T02

## T08
- Status: CONCLUIDA
- Objetivo: Validar cenários de permissão, toggle e regressão da feature.
- Arquivos: src/context/AuthContext.tsx, src/services/api.ts, src/app/enderecos/page.tsx, src/components/Header.tsx
- Implementação:
  - Validar cenário local com toggle desligado.
  - Validar cenário local com toggle ligado.
  - Validar exibição de mensagem para `403`.
  - Validar que `401` e login/logout não sofreram regressão.
  - Rodar build e corrigir erros relacionados.
- Critério de aceitação:
  - Todos os cenários de permissão previstos validados.
  - Comportamento restrito a local confirmado.
  - Build concluído com sucesso.
- Dependências: T06, T07

## Ordem recomendada de execução
1. T01
2. T02
3. T03
4. T04
5. T05
6. T06
7. T07
8. T08
