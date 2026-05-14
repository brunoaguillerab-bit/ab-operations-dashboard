import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { terms } = await req.json();
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY não configurada' }, { status: 500 });
    }

    const dataString = terms.map((t: any) => 
      `Termo: ${t.st} | Cliques: ${t.clicks} | Conversões: ${t.conv} | Custo: R$ ${t.spend.toFixed(2)} | CPA: ${t.conv > 0 ? (t.spend/t.conv).toFixed(2) : 'N/A'}`
    ).join('\n');

    const prompt = `
Você é um Especialista Sênior em Google Ads da AB Tracking.
Analise os termos de pesquisa e classifique em:
✅ POSITIVAR (manter e escalar)
❌ NEGATIVAR (irrelevante)
⚠️ NEUTRO / TESTAR

DADOS:
${dataString}

Responda com uma tabela Markdown (Termo | Classificação | Motivo | Ação) e Insights estratégicos.
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
        temperature: 0.5
      })
    });

    const result = await response.json();
    
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      analysis: result.choices[0].message.content
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
