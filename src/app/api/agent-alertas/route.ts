import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SPREADSHEET_ID = process.env.AGENT_ALERTAS_SPREADSHEET_ID || '1qk1i6Vtcu69Ouclgvbx-7paihaTDfKfnwIMdTNezQEs';
const SHEET_NAME = process.env.AGENT_ALERTAS_SHEET_NAME || '02 Agent - Alertas AB Tracking';

type Status = 'Crítico' | 'Atenção' | 'Bom';

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  return rows;
}

function num(value: unknown) {
  const parsed = Number(String(value ?? '').replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function pct(curr: number, prev: number): number | null {
  if (!prev) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function mapStatus(value: string): Status {
  const status = normalizeText(value);
  if (status === 'critico') return 'Crítico';
  if (status === 'atencao') return 'Atenção';
  return 'Bom';
}

function platformType(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('facebook') || normalized.includes('meta')) return 'meta';
  if (normalized.includes('google')) return 'google';
  return normalized || 'google';
}

export async function GET() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
    const response = await fetch(url, { cache: 'no-store' });
    const csv = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Google Sheets retornou ${response.status}`, detail: csv.slice(0, 300) },
        { status: 502 }
      );
    }

    const [header = [], ...rows] = parseCsv(csv);
    const data = rows
      .map(cells => Object.fromEntries(header.map((key, index) => [key, cells[index] ?? ''])))
      .filter(row => row.dashboard_key || row.cliente)
      .filter(row => {
        const cliente = normalizeText(String(row.cliente || ''));
        const plataforma = platformType(String(row.plataforma || ''));
        return !(cliente === 'tecnolabs' && plataforma === 'meta');
      })
      .map(row => {
        const plataforma = platformType(String(row.plataforma || ''));
        const custoAtual = num(row.custo_atual);
        const convAtual = num(row.conv_atual);
        const cpaAtual = num(row.cpa_atual);
        const custoComp = num(row.custo_comp);
        const convComp = num(row.conv_comp);
        const cpaComp = num(row.cpa_comp);
        const status = mapStatus(String(row.status || 'ok'));
        const tags: string[] = [];

        return {
          cliente: String(row.cliente || ''),
          account_id: String(row.account_id || ''),
          status,
          g_spend: plataforma === 'google' ? custoAtual : 0,
          g_conversions: plataforma === 'google' ? convAtual : 0,
          g_cpa: plataforma === 'google' ? cpaAtual : 0,
          m_spend: plataforma === 'meta' ? custoAtual : 0,
          m_freq: 0,
          m_results: plataforma === 'meta' ? convAtual : 0,
          delta_conv: pct(convAtual, convComp),
          delta_cpa: cpaAtual > 0 && cpaComp > 0 ? pct(cpaAtual, cpaComp) : null,
          delta_freq: null,
          delta_spend: pct(custoAtual, custoComp),
          plataformas: plataforma,
          eur: false,
          insight: String(row.alertas || row.mensagem || 'Sem alerta crítico.'),
          tags,
          updated_at: String(row.updated_at || ''),
        };
      });
    const dedupedData = Array.from(data.reduce((acc, item) => {
      const key = [
        normalizeText(item.cliente),
        item.plataformas,
        item.account_id,
      ].join('|');
      const current = acc.get(key);
      const itemTime = Date.parse(item.updated_at || '');
      const currentTime = Date.parse(current?.updated_at || '');
      if (!current || itemTime >= currentTime) acc.set(key, item);
      return acc;
    }, new Map<string, typeof data[number]>()).values());
    const latestUpdatedAt = dedupedData.reduce((latest, item) => {
      const itemTime = Date.parse(item.updated_at || '');
      const latestTime = Date.parse(latest || '');
      return itemTime > latestTime ? item.updated_at : latest;
    }, '');

    return NextResponse.json({
      data: dedupedData,
      periodo: {
        atual: { from: '', to: '' },
        anterior: { from: '', to: '' },
        dateFrom: '',
        dateTo: '',
      },
      sheetName: SHEET_NAME,
      updatedAt: latestUpdatedAt || new Date().toISOString(),
    });
  } catch (err) {
    console.error('[agent-alertas/route]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
