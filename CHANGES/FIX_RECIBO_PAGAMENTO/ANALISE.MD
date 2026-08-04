# 🔍 SSD-ANALISE: FIX_RECIBO_PAGAMENTO

**Data**: 30/06/2026  
**Objetivo**: Investigar e corrigir bug onde recibos de pagamento aparecem com endereços incorretos

---

## 📋 Problema Relatado

### Caso Falho (EDLEIDE CARVALHO DE ARAUJO)
```
Cadastro:
├─ Pessoa: EDLEIDE CARVALHO DE ARAUJO
├─ Endereço Correto: RUA VIENA, 48
└─ Endereço no Recibo: 114 ❌ (ERRADO)
```

### Caso Sucesso (Marizete P. De Oliveira)
```
Cadastro:
├─ Pessoa: Marizete P. De Oliveira
├─ Endereço Correto: RUA LONDRES, 63B
└─ Endereço no Recibo: RUA LONDRES, 63B ✅ (CORRETO)
```

---

## 🔎 Análise Técnica

### Hipóteses de Causa Raiz

#### H1: Problema na Query de Endereço
- **Contexto**: A query que busca o endereço associado ao pagamento pode estar retornando dados incompletos
- **Evidência**: Retornando "'114'" (apenas o número) em alguns casos
- **Localização Provável**: `enderecosApi.listarEnderecos()` ou function que busca endereço por ID
- **Impacto**: 🔴 Alto (afeta dados críticos do recibo)

#### H2: Relacionamento Quebrado entre Pagamento e Endereço
- **Contexto**: El relacionamento pagamento → endereço pode estar corrompido no DB
- **Evidência**: Alguns pagamentos apontando para endereço ID '114' ao invés de objeto endereço completo
- **Localização Provável**: Prisma schema, migration, ou data inconsistency
- **Impacto**: 🔴 Alto (problema em nível de dados)

#### H3: Problema na Desestruturação do Objeto Endereço
- **Contexto**: Ao recuperar o endereço, o código pode estar pegando campo errado
- **Evidência**: '114' pode ser um ID ou número de rua que está sendo confundido
- **Localização Provável**: `src/app/pagamentos/page.tsx` na função que monta o recibo
- **Impacto**: 🔴 Alto (bug na apresentação do recibo)

#### H4: Problema na Geração do PDF (jsPDF)
- **Contexto**: Dados corretos no estado React, mas PDF sendo gerado com campo errado
- **Evidência**: valor '114' sendo mapeado para endereço em algum lugar
- **Localização Provável**: Função que generate recibo em PDF
- **Impacto**: 🔴 Alto (afeta output final)

---

## 🎯 Perguntas de Investigação

### Etapa 1: Dados no Frontend
- [ ] Qual é o objeto completo de `pagamento` no React?
- [ ] O campo `pagamento.endereco` ou `pagamento.enderecoId` existe?
- [ ] Qual é o valor de `pagamento.endereco` quando há erro?
- [ ] Qual é o valor de `pagamento.endereco` nos casos que funcionam?

### Etapa 2: Integração com API
- [ ] A API `pagamentosApi.listarPagamentos()` retorna `endereco` completo?
- [ ] Se retorna apenas ID, existe função separate para buscar endereço?
- [ ] O objeto pagamento tem relacionamento com endereço carregado (eager loading)?

### Etapa 3: Lógica de Geração do Recibo
- [ ] Como o endereço é extraído antes de gerar PDF?
- [ ] Qual campo é usado: `pagamento.endereco`, `pagamento.enderecoId`, ou busca adicional?
- [ ] Há tratamento de `null` ou `undefined`?

### Etapa 4: Função de Geração do PDF
- [ ] Qual variável está sendo passada como endereço no PDF?
- [ ] Como ela é desestruturada/acessada?
- [ ] Há fallback ou valor default ('114')?

---

## 🔗 Files Relevantes

**Frontend**:
- [src/app/pagamentos/page.tsx](../../src/app/pagamentos/page.tsx) - Lógica de geração de recibo
- [src/services/pagamentosApi.ts](../../src/services/pagamentosApi.ts) - Chamadas API de pagamento
- [src/services/enderecosApi.ts](../../src/services/enderecosApi.ts) - Chamadas API de endereço

**Backend**:
- `API_DOCUMENTACAO_COMPLETA.md` - Endpoints documentados

---

## 📊 Matriz de Severidade

| Cenário | Frequência | Impacto | Severidade |
|---------|-----------|--------|-----------|
| Alguns endereços aparecem como ID em vez de texto | Média | Alto | 🔴 CRÍTICO |
| Cliente recebe recibo com endereço errado | Média | Alto | 🔴 CRÍTICO |
| Auditoria financeira prejudicada | Baixa | Muito Alto | 🔴 CRÍTICO |

---

## ✅ Próximos Passos (para /ssd-planeje)

1. **Investigar** arquivo `pagamentos/page.tsx` - como o endereço é capturado
2. **Verificar** resposta da API para `listarPagamentos`
3. **Checar** Prisma schema - relacionamento pagamento ↔ endereço
4. **Analisar** função de geração de PDF - como endereço é mapeado
5. **Identificar** pattern: qual tipo de pagamento/endereço falha?
6. **Implementar** fix e adicionar validação
7. **Testar** casos de sucesso e falha

---

**Status**: 🔍 Aguardando planejamento e investigação  
**Próximo**: `/ssd-planeje FIX_RECIBO_PAGAMENTO`
