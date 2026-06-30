# SDD - Finalize (Frontend Recanto)

Objetivo: finalizar a entrega com ambiente limpo, build validado e servidor de desenvolvimento pronto.

## Checklist de finalização
1. Encerrar processos de terminal em background que não sejam necessários.
2. Executar validação de build do frontend:
   - `npm run build`
3. Se houver erro:
   - corrigir
   - repetir build até sucesso
4. Subir servidor de desenvolvimento:
   - `npm run dev`
5. Verificar ausência de erros críticos no startup.
6. Perguntar ao usuário se deseja criar commit.
   - Se aprovado, criar commit no padrão Conventional Commits.
7. Perguntar ao usuário se deseja fazer push.
   - Se aprovado, executar push.

## Regras de commit e push
- Nunca criar commit sem confirmação explícita do usuário.
- Nunca fazer push sem confirmação explícita do usuário.
- Sempre usar Conventional Commits na mensagem de commit (ex.: feat:, fix:, chore:, refactor:).

## Entrega
- Resumo do que foi implementado.
- Lista de arquivos alterados.
- Resultado do build.
- Estado do servidor dev.
- Commit realizado: sim/não (com confirmação).
- Push realizado: sim/não (com confirmação).
- Pendências (se houver).
