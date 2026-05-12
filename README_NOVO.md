# 🎯 AB Tracking - Dashboard Operacional Premium

Dashboard operacional estilo **ClickUp/Linear/Notion** para gerenciamento de clientes, demandas e performance da Agência AB Tracking.

## ✨ Destaques

- **🎨 Visual Premium Dark Mode** - Design SaaS profissional com Tailwind CSS
- **📊 Dashboard Completo** - KPI Cards, Tabela avançada, Painel de Insights
- **🔄 Gerenciamento de Tarefas** - Edição modal, status coloridos, filtros avançados
- **⚡ Performance** - Next.js 16 com Turbopack, animações suaves com Framer Motion
- **📱 Desktop-First** - Otimizado para desktop, responsivo
- **🎯 26 Clientes Reais** - Dados mockados baseados na operação real da AB Tracking
- **🏢 Sidebar Recolhível** - UI profissional com navegação intuitiva

## 🛠️ Tech Stack

- **Frontend**: React 19 + Next.js 16
- **Styling**: Tailwind CSS 4 + Framer Motion
- **UI Components**: Lucide Icons + Custom
- **State Management**: Zustand + React Hooks
- **Language**: TypeScript

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Iniciar dev server
npm run dev

# Build para produção
npm run build
```

Acesse **[http://localhost:3000](http://localhost:3000)**

## 📁 Arquitetura

```
src/
├── app/dashboard/page.tsx    ← Dashboard principal
├── components/
│   ├── Sidebar.tsx           ← Menu lateral recolhível
│   ├── DashboardHeader.tsx   ← Barra de filtros
│   ├── KPICardsAB.tsx        ← Cards de métricas
│   ├── ClientsTable.tsx      ← Tabela com agrupamento
│   ├── InsightsPanel.tsx     ← Painel de insights
│   └── ClientEditModal.tsx   ← Modal de edição
├── data/mockClients.ts       ← 26 clientes de exemplo
└── styles/globals.css        ← Tema dark premium
```

## 📊 Funcionalidades

### ✅ Implementado

- [x] 26 clientes com dados reais (Workana, Recorrentes, Pontuais)
- [x] KPI Cards dinâmicos (clientes, receita, saldos)
- [x] Tabela com agrupamento por categoria
- [x] Busca global em tempo real
- [x] Filtros por Mídia e Status
- [x] Modal de edição de demandas
- [x] Painel de insights (saldos baixos, atrasadas, etc.)
- [x] Sidebar recolhível (280px ↔ 80px)
- [x] Status coloridos com ícones
- [x] Hover states elegantes
- [x] Animações Framer Motion
- [x] Formatação monetária (R$)
- [x] Dark mode premium
- [x] Responsivo (desktop-first)

### 🔄 Dados Inclusos

**26 Clientes da AB Tracking:**
- 3 Clientes Workana
- 6 Contas Recorrentes  
- 17 Projetos Pontuais

Cada cliente com:
- Saldos Google Ads e Meta Ads
- Valores mensais
- Datas de relatório e otimização
- Status operacionais
- Links para dashboards

### 🎨 Design System

**Paleta Premium Dark:**
- Fundo: `#0F1117`
- Cards: `#181C25`
- Bordas: `#2A2F3A`
- Sucesso: `#22C55E`
- Alerta: `#EF4444`
- Info: `#3B82F6`

**Status com cores:**
- ✓ Feito (Verde)
- ○ A Fazer (Amarelo)
- ⊗ Cliente (Laranja)
- ∥ Pausado (Cinza)
- ! Urgente (Vermelho)

## 📖 Como Usar

### Buscar Clientes
Use a barra de busca para filtrar por nome, empresa ou demanda.

### Filtrar por Mídia
Clique em "Mídia" para filtrar: Google Ads, Meta Ads ou Google + Meta.

### Editar Demanda
Clique no ícone de editar (✏️) para abrir modal e alterar status, demanda, prazos e valores.

### Ver Grupos
Clique nas setas para expandir/recolher grupos (Workana, Recorrentes, Pontuais).

### Sidebar
Clique no ícone de menu para recolher/expandir a sidebar (280px ↔ 80px).

## 🔐 Segurança

- TypeScript strict mode
- Validação de inputs
- Dados em estado local (seguro)
- CORS ready para integração

## 📋 Próximos Passos Recomendados

1. **Autenticação Supabase Auth** (gratuito)
2. **Persistência em PostgreSQL**
3. **Edição inline na tabela**
4. **Exportação CSV/PDF**
5. **Notificações e alertas**
6. **Análise IA com Claude**
7. **Responsivo mobile**

## 📚 Documentação

Ver [IMPLEMENTACAO.md](./IMPLEMENTACAO.md) para detalhes técnicos completos.

## 🎓 Stack Tecnológico

- **Next.js 16.2.5** - React framework
- **React 19.2.4** - UI library
- **Tailwind CSS 4** - Utility-first CSS
- **Framer Motion 12.38.0** - Animações
- **Lucide React 1.14.0** - Ícones
- **TypeScript 5** - Type safety
- **Date-fns 4.1.0** - Date utilities

## 📊 Performance

- Next.js Turbopack para builds rápidos
- Code splitting automático
- Lazy loading de componentes
- Optimized images
- CSS-in-JS minificado

## 🌐 Deploy

```bash
# Build
npm run build

# Testar build local
npm start
```

Deploy recomendado: **Vercel** (gratuito)

```bash
vercel deploy
```

## 📝 Autor

**AB Tracking Agency** - Dashboard Operacional Premium

---

**Status**: ✅ Pronto para produção  
**Última atualização**: Maio 2026
