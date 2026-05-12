import { NextResponse } from 'next/server';

export const revalidate = 300;

const WINDSOR_API_KEY = process.env.WINDSOR_API_KEY!;

// Atualizar orcamento com os valores reais do Google Sheets / Clientes
const CLIENTES = [
  { nome: 'Instituto Cimas',       google_id: '217-131-4772', meta_id: '231031214994583',   plataformas: 'ambas',  eur: false, orcamento: 0 },
  { nome: 'My Best Houses',        google_id: '982-097-7350', meta_id: '1360266785067452',  plataformas: 'ambas',  eur: true,  orcamento: 0 },
  { nome: 'Tecnolabs',             google_id: '402-894-7491', meta_id: '1166079854149378',  plataformas: 'ambas',  eur: false, orcamento: 0 },
  { nome: 'Village Heaven',        google_id: '817-623-4490', meta_id: '1455168599430187',  plataformas: 'ambas',  eur: false, orcamento: 0 },
  { nome: 'Natal Beach',           google_id: '385-977-4060', meta_id: '940023343050488',   plataformas: 'ambas',  eur: false, orcamento: 0 },
  { nome: 'Dr Vitor Aquiles',      google_id: '319-198-8839', meta_id: '608144271782836',   plataformas: 'ambas',  eur: false, orcamento: 0 },
  { nome: 'AG Móveis',             google_id: '219-034-3178', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: 'Store Energy',          google_id: '858-770-3987', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: 'A Despensa',            google_id: '748-583-5125', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: 'Habittus RH',           google_id: '966-105-4617', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: 'Regiane Issi',          google_id: '650-051-8479', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: 'Cura com Amor',         google_id: '155-513-9122', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: 'Donna Obra Materiais',  google_id: '254-020-6031', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: 'Dra Hevelem Borrielo',  google_id: '561-356-9970', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: 'Dr Chrystiam Amorim',   google_id: '701-433-2095', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: 'Lucas Pereira',         google_id: '565-222-6478', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: '9CincoPrec',            google_id: '303-229-2631', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: 'Clínica Joana Ozi',     google_id: '887-336-0674', meta_id: null,                plataformas: 'google', eur: false, orcamento: 0 },
  { nome: 'A Tecnica CEO',         google_id: null,           meta_id: '1224216173174585',  plataformas: 'meta',   eur: false, orcamento: 0 },
  { nome: 'Menu Confiança',        google_id: null,           meta_id: '435984013235984',   plataformas: 'meta',   eur: false, orcamento: 0 },
  { nome: 'Dra Gislaine Pereira',  google_id: null,           meta_id: '1323185036347591',  plataformas: 'meta',   eur: false, orcamento: 0 },
  { nome: 'HS Sports',             google_id: null,           meta_id: '2150788065325704',  plataformas: 'meta',   eur: false, orcamento: 0 },
  { nome: 'MelBaby PT',            google_id: null,           meta_id: '1489413834942609',  plataformas: 'meta',   eur: true,  orcamento: 0 },
];

const GOOGLE_ID_MAP = new Map(CLIENTES.filter(c => c.google_id).map(c => [c.google_id!, c]));
const META_ID_MAP   = new Map(CLIENTES.filter(c => c.meta_id).map(c => [c.meta_id!, c]));

const MAPA_NOMES: Record<string, string> = {
  'IMAGENOLOGIA': 'Instituto Cimas',
  'Portugal Online Oficial': 'My Best Houses',
  'Tecnolabs - Agência Digital': 'Tecnolabs',
  'CA - Village Heaven Óculos': 'Village Heaven',
  'CA - Victor Aquiles': 'Dr Vitor Aquiles',
};
function normalizar(nome: string) { return MAPA_NOMES[nome] ?? nome; }

function currentMonthRange() {
  const hoje = new Date();
  const y = hoje.getFullYear();
  const m = String(hoje.getMonth() + 1).padStart(2, '0');
  const d = String(hoje.getDate()).padStart(2, '0');
  return {
    dateFrom: `${y}-${m}-01`,
    dateTo:   `${y}-${m}-${d}`,
    diasNoMes: hoje.getDate(),
    totalDias: new Date(y, hoje.getMonth() + 1, 0).getDate(),
  };
}

async function windsorFetch(params: URLSearchParams) {
  const url = `https://connectors.windsor.ai/all?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Windsor ${res.status}`);
  const json = await res.json();
  return (json.data ?? []) as Record<string, unknown>[];
}

export type StatusSaldo = 'CRÍTICO' | 'ATENÇÃO' | 'OK' | 'Sem orçamento';

export interface ClienteSaldo {
  cliente:    string;
  orcamento:  number;
  gasto:      number;
  saldo:      number;
  pct_gasto:  number;
  status:     StatusSaldo;
  plataformas: string;
  eur:        boolean;
  g_spend:    number;
  m_spend:    number;
}

function calcStatus(saldo: number, orcamento: number, eur: boolean): StatusSaldo {
  if (orcamento <= 0) return 'Sem orçamento';
  const limCritico = eur ? 20 : 50;
  const limAtencao = eur ? 50 : 150;
  if (saldo <= limCritico) return 'CRÍTICO';
  if (saldo <= limAtencao) return 'ATENÇÃO';
  return 'OK';
}

export async function GET() {
  try {
    const { dateFrom, dateTo, diasNoMes, totalDias } = currentMonthRange();

    const googleIds = CLIENTES.filter(c => c.google_id).map(c => `google_ads__${c.google_id}`);
    const metaIds   = CLIENTES.filter(c => c.meta_id).map(c => `facebook__${c.meta_id}`);

    const [googleRaw, metaRaw] = await Promise.all([
      windsorFetch(new URLSearchParams({
        api_key:         WINDSOR_API_KEY,
        date_from:       dateFrom,
        date_to:         dateTo,
        fields:          'date,account_id,account_name,spend',
        select_accounts: googleIds.join(','),
      })),
      windsorFetch(new URLSearchParams({
        api_key:         WINDSOR_API_KEY,
        date_from:       dateFrom,
        date_to:         dateTo,
        fields:          'date,account_id,account_name,spend',
        select_accounts: metaIds.join(','),
      })),
    ]);

    const gasto: Record<string, { google: number; meta: number }> = {};

    for (const row of googleRaw) {
      const rawId   = String(row.account_id ?? '').replace(/[^0-9\-]/g, '');
      const cliente = GOOGLE_ID_MAP.get(rawId) ?? CLIENTES.find(c => normalizar(String(row.account_name)) === c.nome);
      if (!cliente) continue;
      if (!gasto[cliente.nome]) gasto[cliente.nome] = { google: 0, meta: 0 };
      gasto[cliente.nome].google += Number(row.spend ?? 0);
    }

    for (const row of metaRaw) {
      const rawId   = String(row.account_id ?? '').replace(/[^0-9]/g, '');
      const cliente = META_ID_MAP.get(rawId) ?? CLIENTES.find(c => normalizar(String(row.account_name)) === c.nome);
      if (!cliente) continue;
      if (!gasto[cliente.nome]) gasto[cliente.nome] = { google: 0, meta: 0 };
      gasto[cliente.nome].meta += Number(row.spend ?? 0);
    }

    const data: ClienteSaldo[] = CLIENTES.map(c => {
      const g       = gasto[c.nome] ?? { google: 0, meta: 0 };
      const g_spend = parseFloat(g.google.toFixed(2));
      const m_spend = parseFloat(g.meta.toFixed(2));
      const gatoTotal = parseFloat((g_spend + m_spend).toFixed(2));
      const saldo     = c.orcamento > 0 ? parseFloat((c.orcamento - gatoTotal).toFixed(2)) : 0;
      const pct_gasto = c.orcamento > 0 ? parseFloat(((gatoTotal / c.orcamento) * 100).toFixed(1)) : 0;
      const status    = calcStatus(saldo, c.orcamento, c.eur);

      return {
        cliente:     c.nome,
        orcamento:   c.orcamento,
        gasto:       gatoTotal,
        saldo,
        pct_gasto,
        status,
        plataformas: c.plataformas,
        eur:         c.eur,
        g_spend,
        m_spend,
      };
    });

    // Sort: CRÍTICO → ATENÇÃO → Sem orçamento → OK
    const ORDER: Record<StatusSaldo, number> = { 'CRÍTICO': 0, 'ATENÇÃO': 1, 'Sem orçamento': 2, 'OK': 3 };
    data.sort((a, b) => ORDER[a.status] - ORDER[b.status]);

    const criticos  = data.filter(d => d.status === 'CRÍTICO').length;
    const atencao   = data.filter(d => d.status === 'ATENÇÃO').length;
    const ok        = data.filter(d => d.status === 'OK').length;
    const semOrc    = data.filter(d => d.status === 'Sem orçamento').length;

    return NextResponse.json({
      data,
      resumo: { criticos, atencao, ok, semOrc, total: data.length },
      periodo: { dateFrom, dateTo, diasNoMes, totalDias },
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[alertas-saldos]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
