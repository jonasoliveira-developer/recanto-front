# PLANEJAMENTO FRONTEND - EDICAO_ENDERECOS

## 1. Contexto da feature
A tela de endereços no frontend atual lista e cadastra registros, mas o botão "Editar" ainda não executa nenhuma ação. No sistema legado (Angular), a edição de endereço já existia em fluxo dedicado: abrir edição por ID, carregar dados atuais e persistir atualização via endpoint de update.

## 2. Objetivo funcional
Implementar o fluxo de edição de endereços corretamente no frontend Next.js, preservando o padrão do projeto e convertendo o comportamento funcional do sistema legado para a arquitetura atual.

## 3. Arquivos impactados
- `src/app/enderecos/page.tsx`
- `src/services/enderecosApi.ts`
- `src/components/Modal.tsx` (somente se necessário para ajuste de UX do formulário)
- `src/context/AuthContext.tsx` (somente se necessário para regra de permissão por papel)
- `src/app/pagamentos/page.tsx` (validação de regressão, pois consome lista de endereços)
- `CHANGES/EDICAO_ENDERECOS/TASK.MD` (gerado na etapa `/ssd-planeje`)

## 4. Fluxo atual
1. A página carrega lista de endereços com `listarEnderecos`.
2. Existe busca, paginação e modal de cadastro.
3. O botão "Editar" aparece em cada card, porém sem `onClick` e sem estado de edição.
4. O serviço já possui métodos `buscarEnderecoPorId` e `atualizarEndereco`, mas não são utilizados na página.
5. O modal atual sempre opera no modo criação (`criarEndereco`).

## 5. Fluxo proposto
1. Adicionar estado de edição (`editando`) na página de endereços.
2. Ao clicar em "Editar", abrir modal no modo edição com título dinâmico.
3. Pré-preencher o formulário com dados do item selecionado (com fallback para busca por ID quando necessário).
4. Salvar no endpoint de update (`PUT /adress/{id}`) usando `atualizarEndereco`.
5. Atualizar lista localmente ou recarregar lista após sucesso, mantendo busca/paginação consistentes.
6. Fechar modal e limpar estado do formulário após sucesso.
7. Tratar erros de API com feedback visível ao usuário.

Conversão do legado Angular:
- Legado usava rota `adress/update/:id` + carregamento por ID + update + retorno para lista.
- No Next.js, manteremos mesma regra funcional, adaptada para modal único de criar/editar para manter padrão já usado no projeto.

## 6. Regras de negócio
- Edição deve alterar o endereço correto pelo `id`.
- Não criar novo registro quando estiver em modo edição.
- `person` e `personName` devem permanecer consistentes no payload de update.
- Em caso de falha, não fechar modal automaticamente.
- Se houver regra de permissão por papel (como no legado), usuários residentes não devem ver ações de alteração.

## 7. Estratégia de estados e erros
Estados de UI:
- `modalAberto`: controle de abertura do modal.
- `editando`: objeto atual em edição ou `null` para criação.
- `adress`, `person`, `personName`: campos do formulário.
- `carregando`: estado de carga da lista.

Erros:
- `400`: exibir mensagem de validação no formulário.
- `401`: seguir política global de autenticação da aplicação.
- `404`: informar que o endereço não foi encontrado para edição.
- `200`: aplicar atualização e sincronizar lista na tela.

## 8. Estratégia de testes
1. Listar endereços e abrir edição de um item existente.
2. Validar preenchimento inicial do formulário com dados do item selecionado.
3. Salvar edição e confirmar atualização visual do card/lista sem duplicar registro.
4. Garantir que o fluxo de cadastro continua funcionando.
5. Validar comportamento para erro de validação (`400`).
6. Validar que páginas dependentes (ex.: pagamentos) continuam carregando endereços normalmente.
7. Validar regras de visibilidade de ação de editar por papel, se aplicadas.

## 9. Riscos e mitigação
- Risco: modal não limpar estado após alternar entre criar e editar.
  - Mitigação: reset explícito de `editando` e campos ao abrir/fechar modal.
- Risco: update sobrescrever `person` incorretamente.
  - Mitigação: preservar `person` original quando não houver alteração explícita.
- Risco: inconsistência da lista após update.
  - Mitigação: atualizar item por `id` em memória e manter fallback de recarga completa.
- Risco: regressão em fluxo de cadastro.
  - Mitigação: separar ramificação de submit entre criar e editar com critérios claros.

## 10. Resumo acionável
Implementar edição de endereços em `src/app/enderecos/page.tsx` reutilizando o modal existente com modo duplo (criar/editar), ativar o botão "Editar", usar `atualizarEndereco` para persistência, aplicar feedback de erro e sincronizar lista após sucesso. Na próxima etapa (`/ssd-planeje`), quebrar em tasks incrementais com critérios de aceitação e validação de regressão em páginas que consomem endereços.
