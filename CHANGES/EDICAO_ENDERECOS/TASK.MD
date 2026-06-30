# TASKS - EDICAO_ENDERECOS

## T01
- Status: CONCLUIDA
- Objetivo: Estruturar modo de edição na tela de endereços.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Adicionar estado `editando` para controlar criação vs edição.
  - Criar função para abrir modal em modo novo.
  - Criar função para abrir modal em modo edição recebendo o item selecionado.
  - Ajustar título do modal dinamicamente.
- Critério de aceitação:
  - Tela possui modo explícito de criação e edição.
  - Botão de novo endereço abre modal com formulário limpo.
  - Modal mostra título coerente com o modo ativo.
- Dependências: nenhuma

## T02
- Status: CONCLUIDA
- Objetivo: Implementar ação do botão Editar com preenchimento inicial do formulário.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Conectar botão "Editar" ao handler de edição.
  - Pré-carregar campos `adress`, `person` e `personName` com o endereço selecionado.
  - Garantir fallback com `buscarEnderecoPorId` quando os dados do card estiverem incompletos.
- Critério de aceitação:
  - Clique em "Editar" abre o modal corretamente.
  - Campos aparecem com valores atuais do endereço selecionado.
  - Fallback por ID funciona quando necessário.
- Dependências: T01

## T03
- Status: CONCLUIDA
- Objetivo: Ajustar submit para ramificação criar vs editar sem regressão.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - No submit, manter criação usando `criarEndereco` quando não houver `editando`.
  - No submit, executar update com `atualizarEndereco` quando houver `editando`.
  - Evitar criação duplicada durante edição.
- Critério de aceitação:
  - Fluxo de criação continua funcionando como antes.
  - Fluxo de edição chama endpoint de update.
  - Nenhum novo registro é criado ao editar.
- Dependências: T02

## T04
- Status: CONCLUIDA
- Objetivo: Sincronizar lista de endereços após update e manter consistência de paginação/filtro.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Atualizar item editado na lista local por `id` ou recarregar a lista após sucesso.
  - Preservar comportamento de busca e paginação após atualização.
  - Fechar modal e limpar estados de formulário e `editando` ao concluir.
- Critério de aceitação:
  - Endereço editado aparece atualizado na tela.
  - Busca e paginação continuam funcionais após salvar.
  - Modal fecha e reabre sem dados residuais.
- Dependências: T03

## T05
- Status: CONCLUIDA
- Objetivo: Tratar erros de edição com feedback visível para o usuário.
- Arquivos: src/app/enderecos/page.tsx
- Implementação:
  - Tratar `400` com mensagem de validação no formulário/modal.
  - Tratar `404` com mensagem de endereço não encontrado.
  - Tratar `401` delegando para fluxo global já existente.
  - Em erro, manter modal aberto para correção.
- Critério de aceitação:
  - Usuário recebe mensagem clara para falhas de validação.
  - Modal não fecha automaticamente em erro.
  - Comportamento de autenticação permanece consistente.
- Dependências: T03

## T06
- Status: CONCLUIDA
- Objetivo: Revisar payload de update para garantir consistência de `person` e `personName`.
- Arquivos: src/app/enderecos/page.tsx, src/services/enderecosApi.ts
- Implementação:
  - Validar envio correto de `person` e `personName` no update.
  - Preservar `person` original quando o usuário não alterar a pessoa.
  - Garantir tipo e formato compatíveis com o endpoint `/adress/{id}`.
- Critério de aceitação:
  - Update não perde vínculo do endereço com o residente.
  - Dados enviados são aceitos pela API sem erro de contrato.
  - Fluxo de edição permanece estável.
- Dependências: T03

## T07
- Status: CONCLUIDA
- Objetivo: Validar regras de visibilidade para ação de editar por perfil, se aplicável.
- Arquivos: src/app/enderecos/page.tsx, src/context/AuthContext.tsx
- Implementação:
  - Verificar regra atual de permissões na tela.
  - Se necessário, ocultar ação de editar para perfil residente conforme regra de negócio.
  - Garantir que a UI respeita perfis sem quebrar fluxo para admin/funcionário.
- Critério de aceitação:
  - Permissões refletem regra esperada de negócio.
  - Ação de editar não aparece para perfil sem autorização.
  - Perfis autorizados mantêm acesso normal.
- Dependências: T01

## T08
- Status: EM_PROGRESSO
- Objetivo: Executar validação final e regressão da feature.
- Arquivos: src/app/enderecos/page.tsx, src/app/pagamentos/page.tsx
- Implementação:
  - Validar cenários de criar, editar com sucesso e editar com erro.
  - Validar que consumo de endereços na tela de pagamentos continua funcional.
  - Executar build e confirmar ausência de erros relacionados à feature.
- Critério de aceitação:
  - Cenários principais validados localmente.
  - Sem regressão no uso de endereços em pagamentos.
  - Build concluído com sucesso.
- Dependências: T04, T05, T06, T07

## Ordem recomendada de execução
1. T01
2. T02
3. T03
4. T04
5. T05
6. T06
7. T07
8. T08
