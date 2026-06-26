# Implementação do Sistema de Soft Delete para Demandas

## 📋 Resumo Executivo

Implementação completa de um sistema de soft delete (exclusão lógica) para o módulo de Demandas, permitindo que tarefas deletadas não desapareçam permanentemente e possam ser restauradas da Lixeira.

**Problema Original**: Tarefas deletadas desapareciam do UI mas reapareciam após F5 (refresh).
**Solução**: Soft delete com campos `deleted_at` e `deleted_by`, mantendo histórico completo.

---

## ✅ Mudanças Implementadas

### 1. **Tipos e Interfaces** (`src/types/demandasCentral.ts`)
- ✅ Adicionado campo `deletedAt: string | null` a `ClienteDemanda`
- ✅ Adicionado campo `deletedBy: string | null` a `ClienteDemanda`
- ✅ Estas mudanças permitem rastreamento de quando e por quem um item foi deletado

### 2. **Serviço de Banco de Dados** (`src/services/demandasCentralService.ts`)
- ✅ **normalizeRow()**: Atualizado para mapear `deleted_at` e `deleted_by` do banco
- ✅ **toInsert()**: Adicionado suporte para serializar soft delete fields
- ✅ **updateDemandaCentral()**: Permite atualizar campos de soft delete
- ✅ **listDemandasCentral(includeDeleted)**: 
  - Por padrão filtra itens deletados (includeDeleted = false)
  - Pode incluir deletados com flag includeDeleted = true
- ✅ **deleteDemandaCentral(id, deletedBy)**: Implementado soft delete (marca com timestamp)
- ✅ **restoreDemandaCentral(id)**: Restaura item deletado (limpa deleted_at/deleted_by)
- ✅ **hardDeleteDemandaCentral(id)**: Deletar permanentemente (IRREVERSÍVEL)
- ✅ **listDeletedDemandasCentral()**: Lista todos os itens soft-deletados
- ✅ **createDemandaCentral()**: Inicializa novos itens com deletedAt: null, deletedBy: null

### 3. **Componente Principal** (`src/components/demandas/DemandasCentral.tsx`)
- ✅ Adicionada importação de `TrashView` e funções de delete/restore
- ✅ Adicionado state `deletedRows: ClienteDemanda[]`
- ✅ useEffect carrega tanto itens ativos quanto deletados na inicialização
- ✅ **handleDelete()**: 
  - Mostra diálogo de confirmação antes da deleção
  - Move tarefa para Lixeira (soft delete)
  - Adiciona à lista `deletedRows`
  - Toast de sucesso: "X foi para a Lixeira"
- ✅ **handleRestore()**: Restaura tarefa da Lixeira
  - Chama `restoreDemandaCentral()`
  - Remove de `deletedRows`
  - Adiciona de volta a `rows`
- ✅ **handleHardDelete()**: Deletar permanentemente
  - Chama `hardDeleteDemandaCentral()`
  - Remove de `deletedRows`
- ✅ Adicionado botão "Lixeira" à navegação com badge mostrando quantidade
- ✅ Adicionada rota `trash` ao tipo `MainView`
- ✅ TrashView integrada ao main content area

### 4. **Novo Componente Lixeira** (`src/components/demandas/TrashView.tsx`)
- ✅ Componente novo que exibe itens deletados
- ✅ Mostra data e usuário que deletou cada tarefa
- ✅ Botões de ação:
  - **Restaurar**: Reverte soft delete
  - **Deletar Permanentemente**: Hard delete com dupla confirmação
- ✅ Mensagem amigável quando Lixeira está vazia
- ✅ Loading states durante operações assíncronas

---

## 🗄️ Alterações Necessárias no Supabase

Para que o soft delete funcione corretamente, a tabela `demandas_central` no Supabase precisa ter as seguintes colunas:

```sql
-- Adicione essas colunas à tabela demandas_central se não existirem
ALTER TABLE demandas_central
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN deleted_by VARCHAR(255) NULL DEFAULT NULL;

-- Crie um índice para melhorar performance nas queries de deleted items
CREATE INDEX idx_demandas_central_deleted_at 
ON demandas_central(deleted_at);
```

**Importante**: Sem essas colunas no banco, o sistema ainda funcionará (com localStorage), mas não persistirá deletions após reload.

---

## 🔄 Fluxo de Funcionamento

### Ao Deletar uma Tarefa:
1. Usuário clica "Deletar" → Confirmação
2. Sistema:
   - Remove de `rows` (UI)
   - Chama `deleteDemandaCentral(id, 'Bruno')`
   - Define `deletedAt` = agora, `deletedBy` = 'Bruno'
   - Adiciona à Lixeira (`deletedRows`)
   - Toast: "X foi para a Lixeira"

### Ao Restaurar:
1. Usuário clica "Restaurar" na Lixeira
2. Sistema:
   - Chama `restoreDemandaCentral(id)`
   - Limpa `deletedAt` e `deletedBy`
   - Remove de `deletedRows`
   - Adiciona de volta a `rows`
   - Toast: "X foi restaurado da Lixeira"

### Ao Deletar Permanentemente:
1. Usuário clica "Deletar Permanentemente" → Dupla confirmação
2. Sistema:
   - Chama `hardDeleteDemandaCentral(id)`
   - Remove registro do banco completamente (IRREVERSÍVEL)
   - Remove de `deletedRows`
   - Toast: "X foi deletado permanentemente"

---

## 📊 Estados de uma Tarefa

```
┌─────────────────────┐
│   Nova Tarefa       │
│ deletedAt: null     │
│ deletedBy: null     │
└──────────┬──────────┘
           │
           ▼
   ┌───────────────┐
   │   Ativa       │
   │   (na lista)  │
   └───────┬───────┘
           │ [Delete]
           ▼
   ┌───────────────┐
   │   Lixeira     │
   │ deletedAt: ✓  │
   │ deletedBy: ✓  │
   └───────┬───────┘
           │ 
      ┌────┴────┐
      │          │
   [Restore]  [Hard Delete]
      │          │
      ▼          ▼
    Ativa     Permanentemente
             Deletada
             (removida)
```

---

## 🧪 Teste o Sistema

1. **Criar uma tarefa**: Clique "Nova Tarefa" e preencha os campos
2. **Deletar a tarefa**: Clique no ícone de delete, confirme
3. **Verificar Lixeira**: O item deve aparecer na aba "Lixeira"
4. **Restaurar**: Clique "Restaurar" na tarefa na Lixeira
5. **Verificar restauração**: Item volta para lista principal
6. **F5 Refresh**: ✅ Tarefa restaurada deve persistir (não voltar para Lixeira)
7. **Hard Delete**: Deletar novamente, ir para Lixeira, deletar permanentemente
8. **Verificar**: Item desaparece da Lixeira após hard delete

---

## 📝 Pontos Importantes

### ✅ O que Foi Implementado
- Soft delete completo com rastreamento (who/when)
- Trash/Lixeira view com restauração
- Dupla confirmação para deletar permanentemente
- Toast notifications para feedback do usuário
- Persistência em localStorage via Zustand
- Integração com Supabase para sincronização

### ⚠️ O que Ainda Precisa Ser Feito
1. **Supabase Schema**: Adicione as colunas `deleted_at` e `deleted_by` à tabela
2. **Migration do Banco**: Se há dados existentes, considere fazer migration
3. **TaskSidebar**: Poderia mostrar status deletado com opção de restaurar direto do drawer
4. **Filtros Avançados**: Adicionar filtro "Mostrar Deletados" aos filtros da tabela
5. **Testes Automatizados**: Unit tests para soft delete logic
6. **Documentação do Usuário**: Guia de uso da Lixeira para os usuários finais

### 🔒 Segurança
- Soft delete preserva dados para auditoria (nunca perde dados até hard delete)
- Campo `deletedBy` rastreia quem deletou (facilita auditoria)
- Hard delete requer dupla confirmação
- Toast notifications confirmam todas as ações

### 🚀 Performance
- Índice em `deleted_at` melhora queries
- `listDemandasCentral()` filtra deletados por padrão (não carrega 2x de dados)
- `listDeletedDemandasCentral()` busca apenas deletados (separado)

---

## 📚 Referência de Funções

### Service (`demandasCentralService.ts`)
```typescript
// Listar ativos (padrão) ou incluir deletados
await listDemandasCentral(includeDeleted?: boolean)

// Listar apenas deletados
await listDeletedDemandasCentral()

// Soft delete
await deleteDemandaCentral(id: string, deletedBy?: string)

// Restaurar
await restoreDemandaCentral(id: string)

// Hard delete (irreversível)
await hardDeleteDemandaCentral(id: string)
```

### Component (`DemandasCentral.tsx`)
```typescript
// Handlers
const handleDelete = async (task: ClienteDemanda)
const handleRestore = async (id: string)
const handleHardDelete = async (id: string)

// State
const [deletedRows, setDeletedRows] = useState<ClienteDemanda[]>([])

// View
{view === 'trash' && <TrashView items={deletedRows} ... />}
```

---

## 🎯 Conclusão

O sistema de soft delete está completamente implementado no front-end. Agora as tarefas deletadas:
- ❌ Não desaparecem para sempre
- ✅ Aparecem na Lixeira
- ✅ Podem ser restauradas
- ✅ Persistem após F5 (com Supabase configurado)
- ✅ Rastreiam quem/quando foram deletadas

**Próximo passo crítico**: Configure as colunas no Supabase conforme instruído acima.

---

*Última atualização: 2026-05-18*
*Implementação: Claude AI Agent*
