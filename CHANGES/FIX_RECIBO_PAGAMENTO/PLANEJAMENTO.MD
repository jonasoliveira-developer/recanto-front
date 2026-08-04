# 📋 SSD-PLANEJAMENTO: FIX_RECIBO_PAGAMENTO

**Data**: 30/06/2026  
**Origem**: Cliente relata endereços incorretos em recibos de pagamento  
**Referência SSD-ANALISE**: FIX_RECIBO_PAGAMENTO/ANALISE.MD

---

## 🎯 Objetivo Geral

Identificar e corrigir o bug onde alguns recibos de pagamento exibem endereços incorretos (ex: "114" em vez de "RUA VIENA, 48") e implementar validações para evitar regressões.

---

## 🚦 Plano de Execução

### FASE 1: INVESTIGAÇÃO & DIAGNÓSTICO (Tasks 1-4)

#### Task 1: Investigar código de geração de recibo
**Prioridade**: 🔴 CRÍTICO  
**Duração Est.**: 15 min  
**Responsável**: Explore + read_file

```plaintext
Objetivo: Entender como o endereço é capturado e onde vai parar no PDF
Entrada: src/app/pagamentos/page.tsx
Saída: 
  - Identificar função que gera recibo
  - Localizar onde endereço é extraído
  - Encontrar função jsPDF e como endereço é mapeado
```

**Checklist**:
- [ ] Encontrar função `gerarRecibo()` ou similar
- [ ] Verificar como `pagamento.endereco` é acessado
- [ ] Checar se há fallback/default
- [ ] Notar se endereço é string completa ou apenas número

---

#### Task 2: Analisar estrutura do objeto pagamento
**Prioridade**: 🔴 CRÍTICO  
**Duração Est.**: 10 min  
**Responsável**: read_file + grep_search

```plaintext
Objetivo: Entender estrutura de dados retornada pela API
Entrada: src/services/pagamentosApi.ts
Saída:
  - Tipo/interface do objeto Pagamento
  - Qual campo contém endereço (endereco, enderecoId, etc)
  - Se há eager loading ou lazy loading
```

**Checklist**:
- [ ] Ver interface/type Pagamento
- [ ] Verificar se relacionamento com Endereço está carregado
- [ ] Checar formato de retorno da API
- [ ] Confirmar campo que traz endereço

---

#### Task 3: Verificar resposta real da API
**Prioridade**: 🟠 ALTO  
**Duração Est.**: 10 min  
**Responsável**: Manual testing + console.log

```plaintext
Objetivo: Ver dados reais retornados pela API
Entrada: Dev server + Network tab
Saída:
  - Response JSON de listarPagamentos
  - Confirmar se endereço vem completo ou apenas ID
  - Comparar sucesso vs. erro
```

**Checklist**:
- [ ] Iniciar dev server
- [ ] Abrir DevTools → Network
- [ ] Fazer requisição de listarPagamentos
- [ ] Copiar resposta completa
- [ ] Comparar estrutura entre pagamentos corretos e incorretos

---

#### Task 4: Checar Prisma schema de relacionamento
**Prioridade**: 🟠 ALTO  
**Duração Est.**: 5 min  
**Responsável**: read_file

```plaintext
Objetivo: Validar que relacionamento pagamento ↔ endereço está correto
Entrada: prisma/schema.prisma (ou banco dados schema)
Saída:
  - Confirmar modelo Pagamento tem foreign key para Endereço
  - Verificar se há índices/constraints
  - Notar data integrity
```

**Checklist**:
- [ ] Localizar modelo Pagamento
- [ ] Verificar campo que referencia Endereço
- [ ] Checar modelo Endereço
- [ ] Notar relações bidirecionais

---

### FASE 2: ROOT CAUSE IDENTIFICATION (Tasks 5-6)

#### Task 5: Reproduzir bug com casos conhecidos
**Prioridade**: 🔴 CRÍTICO  
**Duração Est.**: 15 min  
**Responsável**: Manual testing

```plaintext
Objetivo: Confirmar que conseguimos reproduzir o bug
Entrada: Caso 1 (EDLEIDE - falha), Caso 2 (Marizete - sucesso)
Saída:
  - Debug string exato que aparece no recibo
  - Valores do objeto pagamento durante geração
  - Comparação entre os dois casos
```

**Passo a Passo**:
1. Abrir app no localhost:3000/pagamentos
2. Localizar pagamento de EDLEIDE CARVALHO DE ARAUJO
3. Adicionar console.log antes de gerar PDF
4. Gerar recibo e observar console
5. Comparar com caso de Marizete
6. Documentar exatamente qual valor está chegando

---

#### Task 6: Identificar padrão/causa raiz
**Prioridade**: 🔴 CRÍTICO  
**Duração Est.**: 10 min  
**Responsável**: Analysis

```plaintext
Objetivo: Definir qual das 4 hipóteses é verdadeira
Entrada: Dados de Tasks 1-5
Saída:
  - Diagnóstico definitivo
  - Root cause identificada
  - Plano de correção específico
```

**Possíveis Diagnósticos**:
- [ ] **Causa 1**: Código está fazendo `endereco.numero` quando deveria ser `endereco.rua + ' ' + endereco.numero`
- [ ] **Causa 2**: API não está fazendo eager load de endereço, retorna apenas ID
- [ ] **Causa 3**: Dados corrompidos no banco (alguns Pagamentos apontam para endereço ID inválido)
- [ ] **Causa 4**: Há dois campos (enderecoId e endereco), código está pegando o errado
- [ ] **Causa 5**: Fallback incorreto quando endereço não existe

---

### FASE 3: IMPLEMENTAÇÃO DO FIX (Tasks 7-9)

#### Task 7: Implementar fix no código
**Prioridade**: 🔴 CRÍTICO  
**Duração Est.**: 20 min  
**Responsável**: code_edit

```plaintext
Objetivo: Corrigir o bug identificado
Entrada: Root cause de Task 6 + código fonte
Saída:
  - Código corrigido e testado
  - Validações adicionadas
  - Build bem-sucedido
```

**Escopo possível**:
- [ ] Ajustar desestruturação de endereço em pagamentos/page.tsx
- [ ] Adicionar eager loading no API call
- [ ] Adicionar validação de null/undefined
- [ ] Criar helper function para formatar endereço completamente
- [ ] Adicionar fallback seguro

---

#### Task 8: Adicionar validação/sanitização
**Prioridade**: 🟠 ALTO  
**Duração Est.**: 15 min  
**Responsável**: code_edit

```plaintext
Objetivo: Prevenir regressões com validações robustas
Entrada: Código corrigido
Saída:
  - Função validadora de endereço
  - Tratamento de edge cases
  - Logs para debug
```

**Implementar**:
- [ ] Helper function `formatarEnderecoCompleto(endereco)` com checks
- [ ] Validação se endereço tem rua + numero obrigatoriamente
- [ ] Tratamento de valores nulos/vazios
- [ ] Console.warn se endereço está incompleto
- [ ] Fallback com valor legível ('Endereço não disponível')

---

#### Task 9: Validar build e dev
**Prioridade**: 🟢 MÉDIO  
**Duração Est.**: 10 min  
**Responsável**: run_in_terminal

```plaintext
Objetivo: Garantir código sem errors
Entrada: Código implementado
Saída:
  - Build bem-sucedido `npm run build`
  - Dev server rodando sem errors `npm run dev`
  - TypeScript sem erros
```

**Checklist**:
- [ ] `npm run build` sem erros
- [ ] Nenhum `error TS` na compilação
- [ ] Dev server inicia com `✓ Ready`
- [ ] Nenhum console.error sobre pagamentos

---

### FASE 4: TESTES & VALIDAÇÃO (Tasks 10-11)

#### Task 10: Testar caso de falha
**Prioridade**: 🔴 CRÍTICO  
**Duração Est.**: 10 min  
**Responsável**: Manual testing

```plaintext
Objetivo: Confirmar que bug foi corrigido
Entrada: App rodando com fix
Saída:
  - Recibo de EDLEIDE mostra "RUA VIENA, 48" (não "114")
  - PDF gerado corretamente
```

**Passo a Passo**:
1. Abrir localhost:3000/pagamentos
2. Localizar pagamento EDLEIDE CARVALHO DE ARAUJO
3. Gerar recibo
4. Verificar PDF: ENDEREÇO deve ser "RUA VIENA, 48"
5. Confirmar TITULO, VALOR, NOME também estão corretos

---

#### Task 11: Testar caso de sucesso
**Prioridade**: 🟢 MÉDIO  
**Duração Est.**: 5 min  
**Responsável**: Manual testing

```plaintext
Objetivo: Confirmar que casos que já funcionavam ainda funktionieren
Entrada: App rodando com fix
Saída:
  - Recibo de Marizete mostra "RUA LONDRES, 63B"
  - Sem regressão
```

**Passo a Passo**:
1. Localizar pagamento de Marizete P. De Oliveira
2. Gerar recibo
3. Verificar PDF: ENDEREÇO deve ser "RUA LONDRES, 63B"
4. Comparar com output anterior (deve ser idêntico)

---

### FASE 5: FINALIZAÇÃO (Tasks 12-13)

#### Task 12: Criar testes unitários (opcional)
**Prioridade**: 🟢 MÉDIO  
**Duração Est.**: 15 min  
**Responsável**: code_create (se houver estrutura de testes)

```plaintext
Objetivo: Evitar regressão futura
Entrada: Função de formatação de endereço
Saída:
  - 3-4 test cases cobrindo:
    - Endereço completo normal
    - Endereço com valores null
    - Endereço incompleto
    - Edge cases
```

---

#### Task 13: Commit e documentação
**Prioridade**: 🟢 MÉDIO  
**Duração Est.**: 10 min  
**Responsável**: git + document

```plaintext
Objetivo: Registrar fix no repositório
Entrada: Código testado e validado
Saída:
  - Commit com msg descritiva
  - Branch main atualizada
  - Documentação de mudanças
```

**Commit**:
```bash
git add -A
git commit -m "fix: endereço incorreto em recibos de pagamento

- [Descrição da causa raiz]
- [O que foi corrigido]
- Testes: Caso EDLEIDE e Marizete validados"
git push
```

---

## 📊 Matriz de Dependências

```
Task 1 ──┐
Task 2 ──┼─→ Task 5 ──┐
Task 3 ──┤            ├─→ Task 6 ──→ Task 7 ──→ Task 8 ──→ Task 9 ──┐
Task 4 ──┘                                                           ├─→ Task 10
                                                                      ├─→ Task 11
                                                                      ├─→ Task 12
                                                                      └─→ Task 13
```

**Caminho crítico**: Task 1 → Task 5 → Task 6 → Task 7 → Task 9 → Task 10

---

## 🎬 Começar

**Próximo Comando**: 
```bash
/ssd-implemente FIX_RECIBO_PAGAMENTO
```

Isso iniciará a fase de investigação e implementação do fix.

---

**Status**: ✅ Planejamento aprovado  
**Estimativa Total**: ~2 horas  
**Risco**: 🟡 Médio (dados corrompidos podem pedir intervenção manual no BD)
