# ANALISE - VISAO_360_RESIDENTE

## Problema
O app era uma coleção de listas isoladas (avisos como landing), sem hub do residente, filtros inconsistentes e fetch duplicado por página.

## Causa
Arquitetura página-centrada sem SSOT; navegação só no header; ausência de ficha 360; filtros client-side com deps incompletas.

## Solução
Shell LinkedIn-like (header + bottom tabs + Mais), home `/inicio` centrada em residentes, ficha `/residents/[id]`, SWR + `swrKeys` como fonte única, filtros unificados em `lib/filtros.ts`, query `?residentId=` nos módulos.
