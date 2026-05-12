# 🚀 Setup: Aba AB Tracking

Guia de configuração da nova aba **AB Tracking** no dashboard, integrada com o workflow n8n de análise 7 dias.

---

## 📋 Pré-requisitos

- ✅ Workflow n8n `AB-Tracking-7-dias-GPT-Batches.json` importado e ativado
- ✅ Google Sheet com ID: `10JZoFUAKmQxMqnYqRt2lrvFeWGL4O8bBy8HUwt9sKwU` criada
- ✅ Aba `2026` no Google Sheet (n8n escreve dados aqui)

---

## 🔑 Passo 1: Obter Google Sheets API Key

### No Google Cloud Console:

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto (ou use existente)
3. Ative a API: **Google Sheets API**
4. Crie credencial: **API Key** (não OAuth)
5. Copie a chave

### Exemplo:
```
AIzaSyD_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🛠️ Passo 2: Configurar `.env.local`

No arquivo `.env.local` do dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyD_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Importante**: Use a chave da Google Sheets API (não OAuth token)

---

## 🎯 Passo 3: Verificar Google Sheet

### URL da Sheet:
```
https://docs.google.com/spreadsheets/d/10JZoFUAKmQxMqnYqRt2lrvFeWGL4O8bBy8HUwt9sKwU/edit
```

### Estrutura esperada (aba "2026"):
```
| Data | Cliente | Status | G_Spend | G_Conversions | G_CPA | M_Spend | M_Freq | M_Results | Plataformas | Insight | Tags |
|------|---------|--------|---------|---------------|-------|---------|--------|-----------|-------------|---------|------|
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
```

---

## ✅ Passo 4: Testar Dashboard

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) → **AB Tracking** (sidebar)

### Esperado:
- Aba carrega com dados da sheet
- Filtros funcionam (Crítico/Atenção/Bom/Destaques)
- Busca por cliente funciona
- Métrica exibem corretamente

---

## 📊 Estrutura de Dados

### O que o n8n escreve:
```json
{
  "Data": "2026-05-11",
  "Cliente": "Instituto Cimas",
  "Status": "Crítico",
  "G_Spend": 150.50,
  "G_Conversions": 5,
  "G_CPA": 30.10,
  "M_Spend": 200.00,
  "M_Freq": 2.5,
  "M_Results": 450,
  "Plataformas": "Ambas",
  "Insight": "CPA elevado em Google, frequency alta em Meta",
  "Tags": "CPA Alto, Frequency Alta"
}
```

### O que o dashboard exibe:
- ✅ Cards com status (Crítico/Atenção/Bom)
- ✅ Métrica por plataforma (Google Ads / Meta Ads)
- ✅ Insight de uma linha (do GPT)
- ✅ Tags destacadas

---

## 🎨 Filtros Disponíveis

### Status (4 pills):
- **Crítico**: Status = "Crítico" (vermelho)
- **Atenção**: Status = "Atenção" (amarelo)
- **Bom**: Status = "Bom" (verde)
- **Destaques**: Tem tags não-vazias (roxo)

### Busca:
- Filtra por nome de cliente
- Real-time

---

## 🔄 Fluxo de Dados

```
n8n Workflow (5h São Paulo)
    ↓
Executa a cada segunda-feira (Mon-Fri)
    ↓
Google Sheet (aba "2026")
    ↓
Dashboard (http://localhost:3000/ab-tracking)
    ↓
Exibe Crítico/Atenção/Bom com insights + tags
```

---

## ⚠️ Troubleshooting

### Erro: "Nenhum dado encontrado"
**Causa**: Sheet vazia (workflow ainda não executou ou falhou)  
**Solução**:
1. Verifique n8n workflow se rodou
2. Confira se dados foram inseridos na aba "2026"
3. Aguarde próxima execução (segunda 5am)

### Erro: "CORS error" ou "Invalid API Key"
**Causa**: NEXT_PUBLIC_GOOGLE_API_KEY errada ou não configurada  
**Solução**:
1. Verifique `.env.local`
2. Reinicie `npm run dev`
3. Confirme se API Key é válida no Console

### Dados não atualizam
**Causa**: Browser cache ou sheet pública não acessível  
**Solução**:
1. Hard refresh (Ctrl+Shift+R)
2. Verifique permissões da sheet (deve ser acessível com API Key)
3. Aguarde próxima execução do workflow

---

## 🔒 Segurança

⚠️ **AVISO**: `NEXT_PUBLIC_GOOGLE_API_KEY` fica visível no cliente!

### Recomendado para produção:
```
1. Use Server-side fetch (API Route)
2. Ou use Supabase com função edge
3. Oculte a chave em variável privada
```

### Setup atual é OK para:
- ✅ Desenvolvimento local
- ✅ Acesso interno apenas (dashboard privado)
- ⚠️ NOT recomendado para produção pública

---

## 📈 Próximas Melhorias

- [ ] Auto-refresh a cada 5 minutos
- [ ] Histórico de dados (últimos 30 dias)
- [ ] Export CSV dos dados
- [ ] Notificações de status crítico
- [ ] Integração com Slack para alertas
- [ ] Gráficos de performance por período

---

## 📞 Resumo Rápido

```bash
1. Obtenha Google Sheets API Key
2. Adicione em .env.local (NEXT_PUBLIC_GOOGLE_API_KEY)
3. Reinicie dashboard (npm run dev)
4. Aguarde execução do workflow n8n (seg 5am)
5. Acesse /ab-tracking e veja os dados!
```

---

**Tudo pronto!** Seu dashboard agora exibe análise 7 dias de todos os clientes. 🚀
