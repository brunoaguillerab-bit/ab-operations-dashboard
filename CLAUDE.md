# CLAUDE.md — AB Tracking Operations Dashboard

Lido automaticamente pelo Claude a cada sessão. Mantenha atualizado após mudanças significativas.

---

## Visão Geral

Dashboard operacional interno da AB Tracking (agência de tráfego pago).
- **URL dev:** `http://localhost:3000` (Next.js)
- **Marketing dashboard:** `http://localhost:3001` (HTML estático, pasta `../marketing-dashboard`)
- **Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Zustand · Framer Motion · Supabase

---

## ⚠️ Estado Atual do Supabase

**Credenciais NÃO configuradas.** `.env.local` tem placeholders:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

`src/lib/supabase.ts` exporta `supabaseConfigured: boolean` (atualmente `false`).
Todos os serviços retornam vazios/silenciosamente quando `!supabaseConfigured`.
**O app funciona 100% com dados locais/mock.** Quando configurado, sincroniza automaticamente.

---

## Arquitetura de Pastas

```
src/
├── app/                        # Next.js App Router (uma pasta = uma rota)
│   ├── demandas/page.tsx       # → usa DemandasCentral (sistema principal)
│   ├── clientes/page.tsx
│   ├── ab-overview/page.tsx    # → EmbedFrame (iframe do marketing-dashboard)
│   ├── meta-ads/page.tsx       # → EmbedFrame
│   ├── google-ads/page.tsx     # → EmbedFrame
│   └── [relatorios|financeiro|automacao|configuracoes]/page.tsx  # placeholders
│
├── components/
│   ├── DashboardLayout.tsx     # wrapper com sidebar
│   ├── Sidebar.tsx             # navegação principal (usePathname para active state)
│   ├── PageHeader.tsx          # header padronizado (icon, title, subtitle, actions)
│   ├── EmbedFrame.tsx          # iframe com ?embed=true para esconder sidebar interna
│   └── demandas/               # sistema principal de demandas (ver abaixo)
│
├── types/
│   ├── demandasCentral.ts      # tipos do sistema real (DemandaClienteStatus, ClienteDemanda)
│   └── demandas.ts             # tipos do sistema legado (não usado na /demandas page atual)
│
├── services/
│   └── demandasCentralService.ts  # CRUD Supabase com fallback silencioso
│
├── data/
│   └── mockDemandasCentral.ts  # 7 demandas mock com todos os campos obrigatórios
│
└── lib/
    └── supabase.ts             # client + supabaseConfigured flag
```

---

## Sistema de Demandas (`/demandas`)

A página usa `DemandasCentral` — **NÃO** usa TaskCard/TaskDrawer/TaskKanban legados.

### Componentes ativos (`components/demandas/`)

| Componente | Função |
|---|---|
| `DemandasCentral.tsx` | Orquestrador — state, filtros, toasts, 3 views |
| `TableView.tsx` | View "Quadro Principal" — tabela com drag-reorder (framer Reorder) |
| `KanbanView.tsx` | View "Kanban" — dnd-kit, 5 colunas |
| `DashboardView.tsx` | View "Dashboard" — gráficos/stats |
| `TaskSidebar.tsx` | Painel lateral deslizante com detalhes, comentários, atividade |
| `DemandaCreateWizardModal.tsx` | Modal criação/edição em 2 etapas (local-first) |
| `StatusBadgeCentral.tsx` | Badge de status com ícone+texto+cor (Clock/Play/MessageCircle/etc) |

### Componentes legados (mantidos, NÃO usados na página atual)
`TaskCard.tsx`, `TaskDrawer.tsx`, `TaskKanban.tsx`, `TaskModal.tsx`, `KPICards.tsx`, `TaskFilters.tsx`, `StatusBadge.tsx`

### Status (`DemandaClienteStatus`)
```
'A fazer' | 'Em andamento' | 'Aguardando cliente' | 'Aguardando pagamento'
'Feito' | 'Recorrente' | 'Pausado' | 'Cancelado'
```

### `StatusBadgeCentral` — como usar
```tsx
// Só exibição
<StatusBadgeCentral status={row.status} />

// Editável com select invisível por cima (mantém combobox nativo)
<StatusBadgeCentral status={row.status} onChange={s => onUpdateStatus(row, s)} fullWidth />
```

---

## Padrão Local-First (salvar sem Supabase)

`DemandaCreateWizardModal` usa local-first:
1. Aplica `onSaved()` e fecha o modal **imediatamente**
2. Tenta persistir no Supabase em background via `.catch()`
3. Erros logados em `console.error('[Supabase] ...')` — nunca bloqueiam o UX

`persistPatch` em `DemandasCentral` usa o mesmo padrão para edições inline (status, campos no sidebar).

---

## Design System

| Token | Valor |
|---|---|
| Fundo principal | `#0F1117` / `#121826` |
| Cards/painéis | `#181C25` / `#1A2235` |
| Bordas | `#2A2F3A` / `white/10` |
| Texto primário | `#F3F4F6` / `white` |
| Texto secundário | `#A1A1AA` / `#94A3B8` |
| Accent azul (demandas) | `#3B82F6` |
| Accent vermelho (resto do app) | `#EF4444` / `red-600` |
| Fonte base | `text-sm` (14px) |

---

## Marketing Dashboard (porta 3001)

Arquivo: `scratch/marketing-dashboard/index.html`

Suporta `?embed=true` — esconde a sidebar interna do dashboard:
```css
body.embedded-mode .sidebar { display: none !important; }
body.embedded-mode .main   { margin-left: 0 !important; width: 100% !important; }
```
Navegação interna via hash: `#overview`, `#meta-ads`, `#google-ads`

---

## Banco de Dados (quando Supabase estiver configurado)

**Tabelas:**
- `demandas_central` — registros principais
- `dashboard_user_preferences` — filtros/preferências por usuário (`user_key` em localStorage)

**Mapeamento snake_case ↔ camelCase** (feito em `normalizeRow` / `toInsert`):
```
nome_cliente           ↔ nomeCliente
tarefa_demanda         ↔ tarefaDemanda
prazo_entrega          ↔ prazoEntrega
valor_mensalidade      ↔ valorMensalidade
saldo_conta_google_ads ↔ saldoContaGoogleAds
saldo_conta_meta_ads   ↔ saldoContaMetaAds
```

---

## TODO / O que falta

- [ ] Configurar credenciais reais do Supabase no `.env.local`
- [ ] View Calendário em `/demandas` (placeholder "em breve")
- [ ] Filtros avançados — botão existe mas não abre painel
- [ ] Páginas placeholder: `/relatorios`, `/financeiro`, `/automacao`, `/configuracoes`
- [ ] Campos `saldoContaGoogleAds` / `saldoContaMetaAds` visíveis no modal de edição

---

## Comandos

```bash
# Dashboard operacional
cd scratch/operations-dashboard && npm run dev        # porta 3000

# Marketing dashboard
cd scratch/marketing-dashboard && npx serve -p 3001   # porta 3001

# Type check
cd scratch/operations-dashboard && npx tsc --noEmit
```

---

## Erros TypeScript conhecidos (pré-existentes, não críticos)

`demandasCentralService.ts` tem erros de tipo `never[]` nas chamadas Supabase — causados pelo
`Database` type não estar gerado (schema não importado). Não afetam o funcionamento.
Correção: `supabase gen types typescript --project-id SEU_ID > src/types/supabase.ts`
