# PLANEJAMENTO FRONTEND - EXCLUSAO_ENDERECO

## 1. Contexto da feature
A tela de endereços no frontend atual lista, cadastra e edita registros, mas não possui funcionalidade de exclusão. No sistema, endereços podem ficar desatualizados ou duplicados e precisam ser removidos. A API possui um endpoint DELETE /adress/{id} que não está sendo consumido pelo frontend.

## 2. Objetivo funcional
Implementar a funcionalidade de exclusão (delete) de endereços no frontend Next.js, permitindo que usuários com permissão de administrador removam registros obsoletos com confirmação de segurança e feedback visual adequado.

## 3. Arquivos impactados
- `src/app/enderecos/page.tsx` (adicionar botão delete e handler)
- `src/services/enderecosApi.ts` (adicionar método deletarEndereco se não existir)
- `src/components/Modal.tsx` (somente se precisar de modal de confirmação customizado)
- `src/context/AuthContext.tsx` (validação de permissão para delete, caso necessário)
- Testes de regressão em: `src/app/pagamentos/page.tsx` (lista usa endereços)

## 4. Fluxo atual
1. A página carrega lista de endereços com `listarEnderecos`.
2. Cada card exibe dados do endereço (endereço, residente).
3. Botão "Editar" agora funciona (feature EDICAO_ENDERECOS).
4. Não existe botão ou ação de exclusão.
5. Não existe confirmação de delete antes de executar operação.

## 5. Fluxo proposto
1. Adicionar botão "Excluir" ou ícone de lixeira em cada card de endereço.
2. Ao clicar, exibir modal de confirmação com mensagem clara: "Deseja realmente excluir este endereço? Esta ação não pode ser desfeita."
3. Se usuário confirmar:
   - Enviar DELETE request para `/adress/{id}` usando `enderecosApi.deletarEndereco(id)`.
   - Exibir loading/spinner durante a requisição.
   - Se sucesso (200/204): remover item da lista local ou recarregar lista.
   - Se erro: exibir mensagem de erro específica por status (403, 404, 500).
4. Se usuário cancelar: fechar modal sem executar ação.
5. Sincronizar lista de endereços após exclusão bem-sucedida.

Conversão do padrão:
- Reutilizar Modal existente ou criar modal de confirmação simples.
- Manter estado de loading para feedback visual.
- Integrar regra de permissão (somente ADMIN/EMPLOYEE pode deletar).
- Seguir padrão de erro já estabelecido (401, 403, 404, 500).

## 6. Regras de negócio
- Apenas usuários com role ADMIN ou EMPLOYEE podem deletar endereços.
- Residentes não devem ver botão de exclusão.
- Confirmação explícita obrigatória antes de executar delete.
- Endereço correctamente removido do banco de dados (DELETE real, não soft-delete).
- Após exclusão, lista deve refletir a remoção imediatamente.
- Se endereço estiver em uso (relacionado com pagamento/reserva), backend pode retornar erro 400 ou constraint violation.

## 7. Estratégia de estados e erros
Estados de UI:
- `modalConfirmacaoAberto`: controle de abertura do modal de confirmação.
- `enderecoDeletando`: armazena ID do endereço que está sendo deletado (para mostrar loader no card correto).
- `carregando`: estado geral de carregamento da lista.
- `erro`: mensagem de erro a exibir ao usuário.

Erros esperados:
- `400`: Endereço não pode ser deletado (pode estar vinculado); exibir mensagem: "Não é possível excluir este endereço pois está vinculado a registros."
- `401`: Não autenticado; redirecionar para login (padrão global).
- `403`: Sem permissão; exibir mensagem: "Você não tem permissão para excluir endereços."
- `404`: Endereço não encontrado; exibir mensagem: "Endereço não encontrado."
- `500`: Erro no servidor; exibir mensagem: "Erro ao excluir endereço. Tente novamente mais tarde."
- `200/204`: Sucesso; remover do estado local e mostrar toast/feedback positivo.

## 8. Estratégia de UX
- **Botão visual:** Adicionar ícone de lixeira (trash icon) ou texto "Excluir" em vermelho/warn color (Tailwind: text-red-600).
- **Posicionamento:** Próximo ao botão "Editar" no card ou em menu dropdown se espaço limitado.
- **Modal de confirmação:** Título em vermelho "Confirmar exclusão", mensagem clara, 2 botões (Cancelar / Excluir).
- **Feedback:** Toast ou alert inline confirmando exclusão ("Endereço excluído com sucesso").
- **Permissão:** Botão oculto se usuário == RESIDENT ou não autenticado.

## 9. Estratégia de testes
1. **Teste 1:** Listar endereços, verificar presença do botão "Excluir" somente para ADMIN/EMPLOYEE.
2. **Teste 2:** Clicar em "Excluir", verificar abertura de modal de confirmação com mensagem adequada.
3. **Teste 3:** Clicar "Cancelar" no modal, verificar fechamento sem executar delete.
4. **Teste 4:** Clicar em "Excluir", confirmar, e validar remoção visual do item da lista.
5. **Teste 5:** Testar resposta 404 (endereço não existe), validar exibição de erro.
6. **Teste 6:** Testar resposta 403 (sem permissão), validar mensagem clara.
7. **Teste 7:** Testar resposta 400 (endereço vinculado), validar mensagem descritiva.
8. **Teste 8:** Validar regressão: lista de pagamentos continua navegável e funcionando.

## 10. Dependências
- Modal component já existe e pode ser reutilizado.
- enderecosApi.ts deve fornecer método `deletarEndereco(id)`.
- AuthContext já fornece `hasRole()` e `temPermissaoEfetiva()` para validar permissão.
- Interceptor de erro em api.ts já trata 401/403/404.

## 11. Riscos e mitigações
| Risco | Mitigação |
|-------|-----------|
| Usuário deleta endereço por acidente | Implementar modal de confirmação obrigatória |
| Endereço vinculado a outros registros causa erro | Tratamento de erro 400 com mensagem descritiva |
| Usuário RESIDENT consegue deletar | Validação de permissão no frontend e backend |
| Requisição lenta/timeout | Adicionar loading state e timeout sensato (ex: 30s) |
| Inconsistência entre local state e servidor | Recarregar lista completa ou manter sincronização manual rigorosa |
