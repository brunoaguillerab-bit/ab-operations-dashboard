import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy bruto → Windsor.
 * Usado pelo marketing-dashboard (localhost:3001).
 *
 * Query params:
 *   date_from  YYYY-MM-DD  obrigatório
 *   date_to    YYYY-MM-DD  obrigatório
 *   client     string      opcional — se informado, filtra pelas contas desse cliente
 *   fallback   "1"         opcional — se hoje não tiver spend, repete com ontem automático
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

const WINDSOR_API_KEY = process.env.WINDSOR_API_KEY!;

const FIELDS = [
  'account_name', 'campaign', 'ad_name', 'date', 'clicks', 'datasource', 'source',
  'spend', 'roas', 'conversions', 'purchases', 'leads', 'all_conversions',
  'conversions_value', 'complete_registration', 'registrations', 'add_to_cart',
  'cost_per_conversion', 'cost', 'keyword', 'search_term', 'impressions', 'reach',
  'results', 'cost_per_result', 'actions_total', 'action_values_total', 'actions_lead',
  'frequency',
  'actions_offsite_conversion_fb_pixel_lead',
  'actions_onsite_conversion_messaging_conversation_started_7d',
  'actions_offsite_conversion_fb_pixel_purchase',
  'cost_per_action_type_lead',
  'cost_per_action_type_offsite_conversion_fb_pixel_lead',
  'cost_per_action_type_onsite_conversion_messaging_conversation_started_7d',
  'cost_per_action_type_offsite_conversion_fb_pixel_purchase',
].join(',');

// Mapeamento cliente → IDs de conta (mesmo do route.ts principal)
const CLIENTES = [
  { nome: 'Instituto Cimas',       google_id: '217-131-4772', meta_id: '231031214994583'  },
  { nome: 'My Best Houses',        google_id: '982-097-7350', meta_id: '1360266785067452' },
  { nome: 'Tecnolabs',             google_id: '402-894-7491', meta_id: '1166079854149378' },
  { nome: 'Village Heaven',        google_id: '817-623-4490', meta_id: '1455168599430187' },
  { nome: 'Natal Beach',           google_id: '385-977-4060', meta_id: '940023343050488'  },
  { nome: 'Dr Vitor Aquiles',      google_id: '319-198-8839', meta_id: '608144271782836'  },
  { nome: 'AG Móveis',             google_id: '219-034-3178', meta_id: null               },
  { nome: 'Store Energy',          google_id: '858-770-3987', meta_id: null               },
  { nome: 'A Despensa',            google_id: '748-583-5125', meta_id: null               },
  { nome: 'Habittus RH',           google_id: '966-105-4617', meta_id: null               },
  { nome: 'Regiane Issi',          google_id: '650-051-8479', meta_id: null               },
  { nome: 'Cura com Amor',         google_id: '155-513-9122', meta_id: null               },
  { nome: 'Donna Obra Materiais',  google_id: '254-020-6031', meta_id: null               },
  { nome: 'Dra Hevelem Borrielo',  google_id: '561-356-9970', meta_id: null               },
  { nome: 'Dr Chrystiam Amorim',   google_id: '701-433-2095', meta_id: null               },
  { nome: 'Lucas Pereira',         google_id: '565-222-6478', meta_id: null               },
  { nome: '9CincoPrec',            google_id: '303-229-2631', meta_id: null               },
  { nome: 'Clínica Joana Ozi',     google_id: '887-336-0674', meta_id: null               },
  { nome: 'A Tecnica CEO',         google_id: null,           meta_id: '1224216173174585' },
  { nome: 'Menu Confiança',        google_id: null,           meta_id: '435984013235984'  },
  { nome: 'Dra Gislaine Pereira',  google_id: null,           meta_id: '1323185036347591' },
  { nome: 'HS Sports',             google_id: null,           meta_id: '2150788065325704' },
  { nome: 'MelBaby PT',            google_id: null,           meta_id: '1489413834942609' },
];

// Nomes que o Windsor usa nas contas → nome canônico no CLIENTES
// Mantém o select_accounts funcionando quando o usuário seleciona pelo nome Windsor
const WINDSOR_ALIASES: Record<string, string> = {
  // Meta prefixo "CA - "
  'ca - a tecnica ceo':                         'a tecnica ceo',
  'ca - village heaven óculos':                 'village heaven',
  'ca - victor aquiles':                        'dr vitor aquiles',
  'dr. victor aquiles':                         'dr vitor aquiles',
  'ca - gislaine pereira':                      'dra gislaine pereira',
  'ca 1 - menu confiança floripa':              'menu confiança',
  'ca01 - hs sports':                           'hs sports',
  'mel baby - ca ativa':                        'melbaby pt',
  // Google / nomes parciais
  'imagenologia':                               'instituto cimas',
  'portugal online oficial':                    'my best houses',
  'tecnolabs - agência digital':                'tecnolabs',
  'store energy no-breaks e energia':           'store energy',
  'clinica joana ozi 2025':                     'clínica joana ozi',
  'habittus gente e gestão - habittus.com.br':  'habittus rh',
  'hevelem borriero':                           'dra hevelem borrielo',
  'dr. chrystian amorim - advogado':            'dr chrystiam amorim',
  'donna obra materiais para contrução':        'donna obra materiais',
};

function buildSelectAccounts(clientName: string): string[] {
  const key = clientName.toLowerCase().trim();
  // 1. Tenta match exato no CLIENTES
  let c = CLIENTES.find(x => x.nome.toLowerCase() === key);
  // 2. Tenta via alias (nome Windsor → nome canônico)
  if (!c) {
    const canonical = WINDSOR_ALIASES[key];
    if (canonical) c = CLIENTES.find(x => x.nome.toLowerCase() === canonical);
  }
  if (!c) return [];
  const ids: string[] = [];
  if (c.google_id) ids.push(`google_ads__${c.google_id}`);
  if (c.meta_id)   ids.push(`facebook__${c.meta_id}`);
  return ids;
}

// Soma total de spend dos dados retornados
function totalSpend(data: Record<string, unknown>[]): number {
  return data.reduce((sum, r) => sum + parseFloat(String(r.spend ?? r.cost ?? 0)), 0);
}

function yesterday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function windsorFetch(params: URLSearchParams): Promise<Record<string, unknown>[]> {
  const url = `https://connectors.windsor.ai/all?${params.toString()}`;
  const res  = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Windsor ${res.status}`);
  const json = await res.json() as { data?: Record<string, unknown>[] };
  return json.data ?? [];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let date_from     = searchParams.get('date_from') ?? '';
  let date_to       = searchParams.get('date_to')   ?? '';
  const clientName  = searchParams.get('client')    ?? '';
  const withFallback = searchParams.get('fallback') === '1';

  if (!date_from || !date_to) {
    return NextResponse.json(
      { error: 'date_from e date_to são obrigatórios' },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  try {
    const params = new URLSearchParams({
      api_key:   WINDSOR_API_KEY,
      fields:    FIELDS,
      date_from,
      date_to,
    });

    // Filtra pelas contas do cliente selecionado (menos dados, mais rápido)
    if (clientName && clientName !== '__all__') {
      const accounts = buildSelectAccounts(clientName);
      if (accounts.length > 0) {
        params.set('select_accounts', accounts.join(','));
      }
    }

    let data = await windsorFetch(params);

    // Fallback automático: se hoje sem spend, repete com ontem
    if (withFallback && totalSpend(data) === 0 && date_from === date_to) {
      const d = yesterday(date_from);
      params.set('date_from', d);
      params.set('date_to',   d);
      date_from = date_to = d;
      data = await windsorFetch(params);
    }

    return NextResponse.json(
      { data, _date_from: date_from, _date_to: date_to },
      { headers: CORS_HEADERS },
    );
  } catch (err) {
    console.error('[windsor-proxy]', err);
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS_HEADERS });
  }
}
