# PLANEJAMENTO FRONTEND - VISAO_360_RESIDENTE

## 1. Contexto
Reestruturação UX/arquitetura para visão 360 do residente, espelhando o shell do FisioAdmin system-manager.

## 2. Objetivo funcional
- Entrada em `/inicio` com busca, add residente, KPIs financeiro/residentes e lista/cards
- Ficha 360 em `/residents/[id]` com seções filtradas
- Módulos globais com `?residentId=`
- Bottom tab + Mais; splash Recanto

## 3. Arquivos impactados
Shell, hooks SWR, lib/filtros, inicio, residents/[id]/*, páginas de módulos, AuthContext, globals.css.

## 4–5. Fluxo
Login → `/inicio` → lista/card → ficha 360 → seções ou módulos `?residentId=`.

## 6. Regras
Identidade = `person` (id). Busca textual em campos tipados. Paginação só no front. Endereço de recibo resolve via lista canônica de endereços quando incompleto.

## 10. Resumo
Implementado conforme plano Visão 360 Residentes.
