import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      periodo, 
      filtro_cliente, 
      investimento, 
      cliques, 
      impressoes, 
      ctr, 
      cpc, 
      leads, 
      cpl, 
      mensagens, 
      custo_mensagem, 
      compras, 
      custo_compra,
      campanhas 
    } = body;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY não configurada' }, { status: 500 });
    }

    const dataString = `
    PERÍODO: ${periodo}
    CLIENTE: ${filtro_cliente}
    INVESTIMENTO TOTAL: R$ ${investimento.toFixed(2)}
    CLIQUES: ${cliques}
    IMPRESSÕES: ${impressoes}
    CTR: ${ctr.toFixed(2)}%
    CPC: R$ ${cpc.toFixed(2)}
    LEADS: ${leads}
    CPL: R$ ${cpl.toFixed(2)}
    MENSAGENS WHATSAPP: ${mensagens}
    CUSTO/MENSAGEM: R$ ${custo_mensagem.toFixed(2)}
    COMPRAS: ${compras}
    CUSTO/COMPRA: R$ ${custo_compra.toFixed(2)}

    DETALHE CAMPANHAS:
    ${campanhas.map((c: any) => `- ${c.name}: R$ ${c.spend.toFixed(2)}, Leads: ${c.leads}, Msgs: ${c.msgs}, Compras: ${c.purchases}, CTR: ${c.ctr.toFixed(2)}%`).join('\n')}
    `;

    const prompt = `
    Você é um Consultor de Marketing Digital Sênior da AB Tracking.
    Analise os dados abaixo e gere um relatório executivo de alta qualidade.
    
    ESTRUTURA DO RELATÓRIO:
    1. **📊 Resumo Executivo**: Um parágrafo direto sobre a performance geral.
    2. **✅ Pontos Positivos**: O que funcionou bem.
    3. **⚠️ Oportunidades e Atenção**: O que precisa de ajuste ou escala.
    4. **🚀 Próximos Passos**: Recomendações práticas.
    5. **📱 Mensagem WhatsApp (AB Tracking)**: Uma versão resumida e amigável para enviar ao cliente (use emojis).
    
    DADOS:
    ${dataString}
    
    Responda em Português do Brasil. Use um tom profissional, analítico e focado em ROI.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const result = await response.json();
    
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      analysis: result.choices[0].message.content,
      model: 'gpt-4o-mini'
    });

  } catch (error: any) {
    console.error('[AI Analysis Error]', error);
    return NextResponse.json({ error: 'Erro interno ao processar análise' }, { status: 500 });
  }
}
