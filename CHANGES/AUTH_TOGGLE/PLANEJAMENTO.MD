# PLANEJAMENTO FRONTEND - AUTH_TOGGLE

## 1. Contexto da feature
Durante a edição de endereço, o frontend recebeu erro HTTP `403` e a experiência atual nao explica de forma clara ao usuario que se trata de falta de permissao. Alem disso, existe necessidade de um modo local de desenvolvimento para liberar acesso total na interface sem afetar producao.

## 2. Objetivo funcional
1. Exibir feedback claro para respostas `403` (sem permissao) no fluxo de editar endereco e nos fluxos protegidos principais.
2. Criar um toggle de desenvolvimento que funcione somente em ambiente local para liberar acesso na interface (modo superacesso local), sem impacto em homologacao/producao.

## 3. Arquivos impactados
- `src/services/api.ts`
- `src/context/AuthContext.tsx`
- `src/app/enderecos/page.tsx`
- `src/components/Header.tsx` (ponto recomendado para exibir/acionar toggle em modo local)
- `src/app/login/page.tsx` (opcional, para indicar quando modo local estiver ativo)
- `CHANGES/AUTH_TOGGLE/TASK.MD` (gerado na etapa `/ssd-planeje`)

## 4. Fluxo atual
1. O interceptor em `api.ts` apenas injeta token no request.
2. Nao existe tratamento global de resposta para `403`.
3. A tela de enderecos trata `400`, `401`, `404`, mas nao tem mensagem dedicada para `403`.
4. Regras de visibilidade de acao usam `hasRole` no frontend.
5. Nao existe toggle de permissao local no projeto atual.

## 5. Fluxo proposto
1. Criar utilitario de ambiente local com checagem estrita:
   - `hostname` igual a `localhost` ou `127.0.0.1`.
   - opcionalmente protegido por `NEXT_PUBLIC_ENABLE_LOCAL_AUTH_TOGGLE=true`.
2. Criar flag de toggle em `localStorage` (ex.: `auth_toggle_superlocal=1`) para ativacao manual no browser local.
3. Em `AuthContext`, expor helper de permissao efetiva que respeite toggle local:
   - em ambiente local + toggle ativo: considera permitido para a camada de UI.
   - fora do ambiente local: comportamento atual, sem bypass.
4. Em `api.ts`, adicionar interceptor de resposta para classificar `403` e devolver mensagem clara de permissao negada para a UI.
5. Em `enderecos/page.tsx`, tratar `403` com texto explicito:
   - "Voce nao tem permissao para editar este endereco."
6. Exibir indicador visual (somente local) quando toggle estiver ativo para evitar confusao operacional.

## 6. Regras de negócio
- `403` deve sempre resultar em mensagem clara de falta de permissao.
- Toggle so pode funcionar localmente.
- Em homologacao/producao, toggle deve ser ignorado mesmo que exista valor no `localStorage`.
- Toggle deve ser reversivel em tempo real sem recarregar toda a aplicacao, quando viavel.
- Seguranca: nenhum bypass deve ser enviado como confianca para backend em ambiente nao local.

Observacao importante de escopo tecnico:
- O toggle no frontend libera acesso de interface local (exibicao de botoes/acoes).
- Se o backend continuar respondendo `403`, a operacao nao sera persistida no servidor.
- Para "acesso total real" em gravacao, backend tambem precisa suporte de modo dev (fora do escopo deste frontend).

## 7. Estratégia de estados e erros
Estados:
- `modoSuperacessoLocalAtivo` (booleano derivado de ambiente local + toggle).
- `mensagemPermissao` para feedback imediato em operacoes bloqueadas.

Erros HTTP:
- `403`: mensagem clara de permissao negada.
- `401`: manter logout/redirecionamento atual.
- `400`: manter feedback de validacao.
- `200`: fluxo normal.

## 8. Estratégia de testes
1. Ambiente local com toggle desligado: comportamento atual de permissoes.
2. Ambiente local com toggle ligado: UI libera acoes protegidas.
3. Receber `403` ao editar: mensagem clara exibida no formulario.
4. Receber `401`: manter fluxo de logout.
5. Rodar em ambiente nao local com toggle salvo no `localStorage`: toggle deve ser ignorado.
6. Build sem erros e sem regressao de login/navegacao.

## 9. Riscos e mitigação
- Risco: toggle escapar para producao.
  - Mitigacao: dupla guarda por ambiente local e flag publica de dev.
- Risco: falsa expectativa de bypass total quando backend negar `403`.
  - Mitigacao: mensagem explicita diferenciando permissao de backend.
- Risco: permissao inconsistente entre telas.
  - Mitigacao: centralizar regra em helper unico no `AuthContext`.
- Risco: regressao de seguranca por mudanca em `hasRole`.
  - Mitigacao: manter `hasRole` original e criar camada adicional de permissao efetiva.

## 10. Resumo acionável
Implementar uma camada de autorizacao efetiva no frontend com toggle de superacesso restrita a ambiente local, adicionar tratamento claro de `403` no fluxo de endereco e interceptor global para padronizacao de mensagens. O resultado esperado e: usuario entende imediatamente quando faltou permissao e consegue testar interface completa localmente sem risco para ambientes remotos.
