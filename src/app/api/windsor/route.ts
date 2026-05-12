import { NextResponse } from 'next/server';

// Cache da rota inteira por 5 minutos (Next.js ISR)
export const revalidate = 300;

const WINDSOR_API_KEY = process.env.WINDSOR_API_KEY!;

const CLIENTES = [
  { nome: 'Instituto Cimas',       google_id: '217-131-4772', meta_id: '231031214994583',   plataformas: 'ambas', eur: false },
  { nome: 'My Best Houses',        google_id: '982-097-7350', meta_id: '1360266785067452',  plataformas: 'ambas', eur: true  },
  { nome: 'Tecnolabs',             google_id: '402-894-7491', meta_id: '1166079854149378',  plataformas: 'ambas', eur: false },
  { nome: 'Village Heaven',        google_id: '817-623-4490', meta_id: '1455168599430187',  plataformas: 'ambas', eur: false },
  { nome: 'Natal Beach',           google_id: '385-977-4060', meta_id: '940023343050488',   plataformas: 'ambas', eur: false },
  { nome: 'Dr Vitor Aquiles',      google_id: '319-198-8839', meta_id: '608144271782836',   plataformas: 'ambas', eur: false },
  { nome: 'AG Móveis',             google_id: '219-034-3178', meta_id: null,                plataformas: 'google', eur: false },
  { nome: 'Store Energy',          google_id: '858-770-3987', meta_id: null,                plataformas: 'google', eur: false },
  { nome: 'A Despensa',            google_id: '748-583-5125', meta_id: null,                plataformas: 'google', eur: false },
  { nome: 'Habittus RH',           google_id: '966-105-4617', meta_id: null,                plataformas: 'google', eur: false },
  { nome: 'Regiane Issi',          google_id: '650-051-8479', meta_id: null,                plataformas: 'google', eur: false },
  { nome: 'Cura com Amor',         google_id: '155-513-9122', meta_id: null,                plataformas: 'google', eur: false },
  { nome: 'Donna Obra Materiais',  google_id: '254-020-6031', meta_id: null,                plataformas: 'google', eur: false },
  { nome: 'Dra Hevelem Borrielo',  google_id: '561-356-9970', meta_id: null,                plataformas: 'google', eur: false },
  { nome: 'Dr Chrystiam Amorim',   google_id: '701-433-2095', meta_id: null,                plataformas: 'google', eur: false },
  { nome: 'Lucas Pereira',         google_id: '565-222-6478', meta_id: null,                plataformas: 'google', eur: false },
  { nome: '9CincoPrec',            google_id: '303-229-2631', meta_id: null,                plataformas: 'google', eur: false },
  { nome: 'Clínica Joana Ozi',     google_id: '887-336-0674', meta_id: null,                plataformas: 'google', eur: false },
  { nome: 'A Tecnica CEO',         google_id: null,           meta_id: '1224216173174585',  plataformas: 'meta',   eur: false },
  { nome: 'Menu Confiança',        google_id: null,           meta_id: '435984013235984',   plataformas: 'meta',   eur: false },
  { nome: 'Dra Gislaine Pereira',  google_id: null,           meta_id: '1323185036347591',  plataformas: 'meta',   eur: false },
  { nome: 'HS Sports',             google_id: null,           meta_id: '2150788065325704',  plataformas: 'meta',   eur: false },
  { nome: 'MelBaby PT',            google_id: null,           meta_id: '1489413834942609',  plataformas: 'meta',   eur: true  },
];

const MAPA_NOMES: Record<string, string> = {
  'IMAGENOLOGIA': 'Instituto Cimas',
  'Portugal Online Oficial': 'My Best Houses',
  'Tecnolabs - Agência Digital': 'Tecnolabs',
  'CA - Village Heaven Óculos': 'Village Heaven',
  'CA - Victor Aquiles': 'Dr Vitor Aquiles',
};

const GOOGLE_ID_MAP = new Map(CLIENTES.filter(c => c.google_id).map(c => [c.google_id!, c]));
const META_ID_MAP   = new Map(CLIENTES.filter(c => c.meta_id).map(c => [c.meta_id!, c]));

function normalizar(nome: string) { return MAPA_NOMES[nome] ?? nome; }

function datePeriods() {
  const hoje = new Date();
  const fmt = (n: number) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  };
  return {
    dateFrom:  fmt(-14), // 14 dias atrás (início do período anterior)
    dateTo:    fmt(-1),  // ontem
    splitDate: fmt(-7),  // 7 dias atrás (divisor: curr >= splitDate, prev < splitDate)
    periodoAtual:    { from: fmt(-7),  to: fmt(-1) },
    periodoAnterior: { from: fmt(-14), to: fmt(-8) },
  };
}

async function windsorFetch(params: URLSearchParams) {
  const url = `https://connectors.windsor.ai/all?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Windsor error ${res.status}`);
  const json = await res.json();
  return json.data as Record<string, unknown>[];
}

function pct(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

type Status = 'Crítico' | 'Atenção' | 'Bom';

interface Bucket { spend: number; conv: number; }
interface BucketMeta { spend: number; freq_total: number; freq_count: number; results: number; }

function classificar(opts: {
  curr: { g_spend: number; g_conv: number; g_cpa: number; m_spend: number; m_freq: number; m_results: number };
  prev: { g_spend: number; g_conv: number; g_cpa: number; m_spend: number; m_freq: number; m_results: number };
  plataformas: string; eur: boolean;
}): { status: Status; insight: string; tags: string[] } {
  const { curr, prev, plataformas, eur } = opts;
  const moeda = eur ? '€' : 'R$';
  const limiteGasto = eur ? 30 : 100;
  const tags: string[] = [];
  let status: Status = 'Bom';

  const googleAtivo = plataformas !== 'meta';
  const metaAtivo   = plataformas !== 'google';

  const dConv = googleAtivo ? pct(curr.g_conv, prev.g_conv) : null;
  const dCPA  = googleAtivo && curr.g_cpa > 0 && prev.g_cpa > 0 ? pct(curr.g_cpa, prev.g_cpa) : null;
  const dFreq = metaAtivo && curr.m_freq > 0 && prev.m_freq > 0 ? pct(curr.m_freq, prev.m_freq) : null;

  // ── Crítico ──────────────────────────────────────────────
  if (googleAtivo && curr.g_spend > limiteGasto && curr.g_conv === 0) {
    status = 'Crítico'; tags.push('Zero Conversões');
  }
  if (metaAtivo && curr.m_freq > 4.5) {
    status = 'Crítico'; tags.push('Freq Alta');
  }
  if (googleAtivo && dConv !== null && prev.g_conv >= 3 && dConv <= -40) {
    status = 'Crítico'; tags.push('Queda Abrupta');
  }
  if (googleAtivo && dCPA !== null && dCPA >= 50) {
    if (status !== 'Crítico') status = 'Crítico';
    tags.push('CPA Disparou');
  }

  // ── Atenção ───────────────────────────────────────────────
  if (status !== 'Crítico') {
    if (googleAtivo && curr.g_spend > limiteGasto * 0.5 && curr.g_conv === 0) {
      status = 'Atenção'; tags.push('Gasto sem Conversão');
    }
    if (metaAtivo && curr.m_freq >= 3.5) {
      status = 'Atenção'; tags.push('Freq Elevada');
    }
    if (googleAtivo && curr.g_cpa > (eur ? 100 : 300)) {
      status = 'Atenção'; tags.push('CPA Alto');
    }
    if (googleAtivo && dConv !== null && prev.g_conv >= 3 && dConv <= -20) {
      status = 'Atenção'; tags.push('Queda de Conversões');
    }
    if (googleAtivo && dCPA !== null && dCPA >= 25) {
      status = 'Atenção'; tags.push('CPA Subindo');
    }
    if (metaAtivo && dFreq !== null && dFreq >= 20 && curr.m_freq >= 2.5) {
      status = 'Atenção'; tags.push('Freq Crescendo');
    }
  }

  // ── Insight ───────────────────────────────────────────────
  const parts: string[] = [];

  if (status !== 'Bom') {
    if (googleAtivo && curr.g_conv === 0 && curr.g_spend > 0) {
      parts.push(`${moeda}${curr.g_spend.toFixed(0)} no Google sem conversão`);
    } else if (googleAtivo && dConv !== null && prev.g_conv >= 3 && dConv <= -20) {
      parts.push(`Conversões Google ${dConv}% (${prev.g_conv.toFixed(0)} → ${curr.g_conv.toFixed(0)})`);
    }
    if (googleAtivo && dCPA !== null && dCPA >= 25) {
      parts.push(`CPA ${dCPA > 0 ? '+' : ''}${dCPA}% vs ant. (${moeda}${prev.g_cpa.toFixed(0)} → ${moeda}${curr.g_cpa.toFixed(0)})`);
    }
    if (metaAtivo && curr.m_freq >= 3.5) {
      const freqComp = dFreq !== null && Math.abs(dFreq) >= 5
        ? ` (${dFreq > 0 ? '+' : ''}${dFreq}% vs ant.)`
        : '';
      parts.push(`Freq Meta ${curr.m_freq.toFixed(1)}${freqComp}`);
    }
  } else {
    if (googleAtivo && curr.g_conv > 0) {
      const convComp = dConv !== null && prev.g_conv > 0 && Math.abs(dConv) >= 5
        ? ` (${dConv > 0 ? '+' : ''}${dConv}% vs ant.)`
        : '';
      parts.push(`${curr.g_conv} conv Google${convComp} · CPA ${moeda}${curr.g_cpa.toFixed(0)}`);
    }
    if (metaAtivo && curr.m_results > 0) {
      parts.push(`${curr.m_results} results Meta`);
    }
  }

  const insight = parts.length
    ? (status === 'Bom' ? `Boa performance: ${parts.join(' · ')}` : parts.join(' · '))
    : (status === 'Bom' ? 'Campanhas ativas sem alertas' : 'Atenção necessária — monitorar');

  return { status, insight, tags: [...new Set(tags)].slice(0, 3) };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'http://localhost:3001',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const { dateFrom, dateTo, splitDate, periodoAtual, periodoAnterior } = datePeriods();

    const googleIds = CLIENTES.filter(c => c.google_id).map(c => `google_ads__${c.google_id}`);
    const metaIds   = CLIENTES.filter(c => c.meta_id).map(c => `facebook__${c.meta_id}`);

    // Busca 14 dias com campo date — Windsor retorna uma linha por dia por conta
    const [googleRaw, metaRaw] = await Promise.all([
      windsorFetch(new URLSearchParams({
        api_key:         WINDSOR_API_KEY,
        date_from:       dateFrom,
        date_to:         dateTo,
        fields:          'date,account_id,account_name,spend,conversions,clicks,impressions',
        select_accounts: googleIds.join(','),
      })),
      windsorFetch(new URLSearchParams({
        api_key:         WINDSOR_API_KEY,
        date_from:       dateFrom,
        date_to:         dateTo,
        fields:          'date,account_id,account_name,spend,frequency,reach,impressions,results',
        select_accounts: metaIds.join(','),
      })),
    ]);

    // Agregar Google por cliente × período (curr = últimos 7 dias, prev = 7 dias anteriores)
    const google: Record<string, { curr: Bucket; prev: Bucket }> = {};
    for (const row of googleRaw) {
      const rawId   = String(row.account_id ?? '').replace(/[^0-9\-]/g, '');
      const cliente = GOOGLE_ID_MAP.get(rawId) ?? CLIENTES.find(c => normalizar(String(row.account_name)) === c.nome);
      if (!cliente) continue;
      const nome = cliente.nome;
      if (!google[nome]) google[nome] = {
        curr: { spend: 0, conv: 0 },
        prev: { spend: 0, conv: 0 },
      };
      const b = String(row.date ?? '') >= splitDate ? 'curr' : 'prev';
      google[nome][b].spend += Number(row.spend ?? 0);
      google[nome][b].conv  += Number(row.conversions ?? 0);
    }

    // Agregar Meta por cliente × período
    const meta: Record<string, { curr: BucketMeta; prev: BucketMeta }> = {};
    for (const row of metaRaw) {
      const rawId   = String(row.account_id ?? '').replace(/[^0-9]/g, '');
      const cliente = META_ID_MAP.get(rawId) ?? CLIENTES.find(c => normalizar(String(row.account_name)) === c.nome);
      if (!cliente) continue;
      const nome = cliente.nome;
      if (!meta[nome]) meta[nome] = {
        curr: { spend: 0, freq_total: 0, freq_count: 0, results: 0 },
        prev: { spend: 0, freq_total: 0, freq_count: 0, results: 0 },
      };
      const b = String(row.date ?? '') >= splitDate ? 'curr' : 'prev';
      meta[nome][b].spend   += Number(row.spend ?? 0);
      meta[nome][b].results += Number(row.results ?? 0);
      const freq = Number(row.frequency ?? 0);
      if (freq > 0) { meta[nome][b].freq_total += freq; meta[nome][b].freq_count++; }
    }

    // Montar resultado final com deltas
    const resultado = CLIENTES.map(c => {
      const g = google[c.nome] ?? { curr: { spend: 0, conv: 0 }, prev: { spend: 0, conv: 0 } };
      const m = meta[c.nome]   ?? {
        curr: { spend: 0, freq_total: 0, freq_count: 0, results: 0 },
        prev: { spend: 0, freq_total: 0, freq_count: 0, results: 0 },
      };

      const g_cpa_curr  = g.curr.conv > 0 ? g.curr.spend / g.curr.conv : 0;
      const g_cpa_prev  = g.prev.conv > 0 ? g.prev.spend / g.prev.conv : 0;
      const m_freq_curr = m.curr.freq_count > 0 ? m.curr.freq_total / m.curr.freq_count : 0;
      const m_freq_prev = m.prev.freq_count > 0 ? m.prev.freq_total / m.prev.freq_count : 0;

      const { status, insight, tags } = classificar({
        curr: { g_spend: g.curr.spend, g_conv: g.curr.conv, g_cpa: g_cpa_curr, m_spend: m.curr.spend, m_freq: m_freq_curr, m_results: m.curr.results },
        prev: { g_spend: g.prev.spend, g_conv: g.prev.conv, g_cpa: g_cpa_prev, m_spend: m.prev.spend, m_freq: m_freq_prev, m_results: m.prev.results },
        plataformas: c.plataformas, eur: c.eur,
      });

      return {
        cliente: c.nome,
        status,
        // Período atual
        g_spend:       parseFloat(g.curr.spend.toFixed(2)),
        g_conversions: g.curr.conv,
        g_cpa:         parseFloat(g_cpa_curr.toFixed(2)),
        m_spend:       parseFloat(m.curr.spend.toFixed(2)),
        m_freq:        parseFloat(m_freq_curr.toFixed(2)),
        m_results:     m.curr.results,
        // Deltas vs período anterior (null = sem dado anterior suficiente)
        delta_conv:  pct(g.curr.conv, g.prev.conv),
        delta_cpa:   g_cpa_curr > 0 && g_cpa_prev > 0 ? pct(g_cpa_curr, g_cpa_prev) : null,
        delta_freq:  m_freq_curr > 0 && m_freq_prev > 0 ? pct(m_freq_curr, m_freq_prev) : null,
        delta_spend: pct(g.curr.spend + m.curr.spend, g.prev.spend + m.prev.spend),
        plataformas: c.plataformas,
        eur:         c.eur,
        insight,
        tags,
      };
    });

    return NextResponse.json({
      data: resultado,
      periodo:   { atual: periodoAtual, anterior: periodoAnterior, dateFrom, dateTo },
      updatedAt: new Date().toISOString(),
    }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error('[windsor/route]', err);
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS_HEADERS });
  }
}
