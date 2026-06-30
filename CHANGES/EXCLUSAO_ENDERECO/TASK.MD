# TASKS - EXCLUSAO_ENDERECO

## T01
- Status: NOT_STARTED
- Objetivo: Estruturar estado de exclusão na tela de endereços.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Adicionar estado `modalConfirmacaoAberto` para controlar abertura/fechamento da modal de confirmação.
  - Adicionar estado `enderecoDeletando` para armazenar ID do endereço que será deletado.
  - Criar funções `abrirConfirmacaoDeletar(id)` e `fecharConfirmacaoDeletar()`.
  - Preparar espaço visual no componente para renderização da modal de confirmação.
- Critério de aceitação:
  - Estados adicionados sem quebrar lógica existente de criação/edição.
  - Funções de abertura/fechamento funcionam localmente.
  - Modal pode ser aberta/fechada sem executar delete.
- Dependências: nenhuma

## T02
- Status: NOT_STARTED
- Objetivo: Implementar método de delete na camada de serviço.
- Arquivos: src/services/enderecosApi.ts
- Implementação:
  - Adicionar função `deletarEndereco(id)` que faz chamada DELETE para `/adress/{id}`.
  - Usar axios instance com interceptor de autenticação.
  - Retornar resposta ou lançar erro conforme padrão existente de autres methods.
- Critério de aceitação:
  - Função existe e pode ser importada.
  - Request enviado ao endpoint correto com método DELETE.
  - Autenticação (Bearer token) incluída automaticamente.
  - Erros da API são propagados para consumidor.
- Dependências: nenhuma

## T03
- Status: NOT_STARTED
- Objetivo: Adicionar botão "Excluir" na UI do card de endereço com visibilidade por permissão.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Adicionar botão com ícone de lixeira (trash icon) ou texto "Excluir" em cada card.
  - Usar classe Tailwind para cor vermelha/warn: `text-red-600` ou `bg-red-100`.
  - Botão deve estar visível apenas se `temPermissaoEfetiva(UserRole.ADMIN || UserRole.EMPLOYEE)` retorna true.
  - Botão oculto para RESIDENT ou não autenticado.
  - Posicionar próximo ao botão "Editar" para manter consistência visual.
- Critério de aceitação:
  - Botão aparece somente para ADMIN/EMPLOYEE.
  - Botão não aparece para RESIDENT.
  - Visual está alinhado com design existente.
  - Botão é clicável e renderiza sem erros.
- Dependências: nenhuma

## T04
- Status: NOT_STARTED
- Objetivo: Implementar handler de clique no botão Excluir.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Conectar `onClick` do botão "Excluir" à função `abrirConfirmacaoDeletar(endereco.id)`.
  - Armazenar ID no estado `enderecoDeletando`.
  - Abrir modal de confirmação.
  - Garantir que o handler não executa delete diretamente (apenas abre confirmação).
- Critério de aceitação:
  - Clique no botão abre modal de confirmação.
  - ID correto é armazenado no estado.
  - Modal exibe dados do endereço a ser deletado (opcional mas recomendado).
  - Usuário pode cancelar sem risco.
- Dependências: T01, T03

## T05
- Status: NOT_STARTED
- Objetivo: Implementar modal de confirmação com lógica de aceitar/cancelar.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Criar renderização condicional da modal de confirmação baseada em `modalConfirmacaoAberto`.
  - Exibir mensagem clara: "Deseja realmente excluir este endereço? Esta ação não pode ser desfeita."
  - Botão "Cancelar" executa `fecharConfirmacaoDeletar()` sem ação.
  - Botão "Excluir" chamará handler de delete (implementado em T06).
  - Usar Modal component existente ou criar JSX simples com flex/grid Tailwind.
- Critério de aceitação:
  - Modal exibe com título em vermelho ou destaque visual.
  - Mensagem é clara e legível.
  - Botão "Cancelar" funciona sem efeitos colaterais.
  - Botão "Excluir" permanece desativado até pronto (será ativado em T06 após loading).
- Dependências: T01

## T06
- Status: NOT_STARTED
- Objetivo: Implementar submit de delete com chamada à API e loading.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Criar função `executarDeletar()` que lê `enderecoDeletando` do estado.
  - Adicionar estado `deletando` para controlar loading visual.
  - Chamar `enderecosApi.deletarEndereco(enderecoDeletando)`.
  - Enquanto requisição estiver pendente, mostrar spinner/loading no botão "Excluir" da modal.
  - Desabilitar botão durante requisição.
  - Em sucesso (200/204), prosseguir para T07 (sincronização).
  - Em erro, prosseguir para T08 (tratamento de erro).
- Critério de aceitação:
  - Requisição DELETE é enviada ao servidor com ID correto.
  - Loading spinner aparece durante requisição.
  - Botão fica desabilitado durante operação.
  - Resposta é capturada antes de sincronização.
- Dependências: T02, T04

## T07
- Status: NOT_STARTED
- Objetivo: Sincronizar lista e exibir feedback após sucesso de delete.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Após sucesso (200/204), remover item deletado da lista local por `id` ou recarregar lista completa.
  - Fechar modal de confirmação automaticamente.
  - Limpar estados `enderecoDeletando` e `deletando`.
  - Exibir toast/feedback positivo: "Endereço excluído com sucesso." (alert simples ou toast library se existir).
  - Se página estiver em paginação > 1 e última página ficar vazia, retornar para paginação anterior.
- Critério de aceitação:
  - Item deletado desaparece da lista imediatamente.
  - Modal fecha automaticamente após sucesso.
  - Usuário recebe confirmação visual da ação.
  - Busca, paginação e filtros permanecem funcionales após delete.
  - Nenhum item residual ou duplicado após sincronização.
- Dependências: T06

## T08
- Status: NOT_STARTED
- Objetivo: Tratamento de erros de delete com mensagens específicas por status HTTP.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Tratar error 400: "Não é possível excluir este endereço pois está vinculado a registros."
  - Tratar error 401: Delegar ao fluxo global (logout + redirecionar para login).
  - Tratar error 403: "Você não tem permissão para excluir endereços."
  - Tratar error 404: "Endereço não encontrado."
  - Tratar error 500: "Erro ao excluir endereço. Tente novamente mais tarde."
  - Em erro, manter modal de confirmação aberta para que usuário veja mensagem de erro.
  - Adicionar elemento de erro visível na modal (alert/box em vermelho).
  - Limpar estado `deletando` e reabilitar botão após erro.
- Critério de aceitação:
  - Cada código de erro resulta em mensagem adequada e legível.
  - Modal não fecha em erro.
  - Usuário pode tentar novamente após erro.
  - Resposta 401 efetua logout consistente com padrão global.
  - Mensagens de erro não quebram layout da modal.
- Dependências: T06
