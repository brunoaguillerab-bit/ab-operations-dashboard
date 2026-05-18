import { supabase, supabaseConfigured } from '@/lib/supabase';
import { ClienteDemanda, FiltrosPorColuna, SortState } from '@/types/demandasCentral';

export type DashboardFiltersPayload = {
  activeTab: 'Todos' | 'Workana' | 'AB Tracking' | 'Pontuais';
  quick?: string;
  globalSearch: string;
  sort: SortState;
  columnFilters: FiltrosPorColuna;
  boardOrderIds?: string[];
};
const TABLE = 'demandas_central';
const PREF_TABLE = 'dashboard_user_preferences';
const VIEW_KEY = 'demandas-central-v1';

function normalizeRow(row: Record<string, unknown>): ClienteDemanda {
  const toStr = (value: unknown) => (typeof value === 'string' ? value : '');
  const toNum = (value: unknown) => (typeof value === 'number' ? value : null);
  const toBool = (value: unknown) => value === true;
  const toTags = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);

  return {
    id: toStr(row.id),
    categoria: (toStr(row.categoria) as ClienteDemanda['categoria']) || 'AB Tracking',
    nomeCliente: toStr(row.nome_cliente),
    empresa: toStr(row.empresa),
    midia: (toStr(row.midia) as ClienteDemanda['midia']) || 'Outros',
    urlGoogleAds: toStr(row.url_google_ads),
    urlMetaAds: toStr(row.url_meta_ads),
    urlDashboard: toStr(row.url_dashboard),
    tarefaDemanda: toStr(row.tarefa_demanda),
    andamentoObservacao: toStr(row.andamento_observacao),
    status: (toStr(row.status) as ClienteDemanda['status']) || 'A fazer',
    prazoEntrega: toStr(row.prazo_entrega),
    dataRelatorio: toStr(row.data_relatorio),
    dataOtimizacao: toStr(row.data_otimizacao),
    ultimaMensagem: toStr(row.ultima_mensagem),
    valorMensalidade: toNum(row.valor_mensalidade),
    saldoContaGoogleAds: toNum(row.saldo_conta_google_ads),
    saldoContaMetaAds: toNum(row.saldo_conta_meta_ads),
    responsavel: toStr(row.responsavel),
    prioridade: (toStr(row.prioridade) as ClienteDemanda['prioridade']) || 'Media',
    tags: toTags(row.tags),
    arquivado: toBool(row.arquivado),
    deletedAt: typeof row.deleted_at === 'string' ? row.deleted_at : null,
    deletedBy: typeof row.deleted_by === 'string' ? row.deleted_by : null,
  };
}

function toInsert(row: ClienteDemanda) {
  return {
    id: row.id,
    categoria: row.categoria,
    nome_cliente: row.nomeCliente,
    empresa: row.empresa,
    midia: row.midia,
    url_google_ads: row.urlGoogleAds,
    url_meta_ads: row.urlMetaAds,
    url_dashboard: row.urlDashboard,
    tarefa_demanda: row.tarefaDemanda,
    andamento_observacao: row.andamentoObservacao,
    status: row.status,
    prazo_entrega: row.prazoEntrega || null,
    data_relatorio: row.dataRelatorio || null,
    data_otimizacao: row.dataOtimizacao || null,
    ultima_mensagem: row.ultimaMensagem || null,
    valor_mensalidade: row.valorMensalidade,
    saldo_conta_google_ads: row.saldoContaGoogleAds,
    saldo_conta_meta_ads: row.saldoContaMetaAds,
    responsavel: row.responsavel,
    prioridade: row.prioridade,
    tags: row.tags,
    arquivado: row.arquivado,
    deleted_at: row.deletedAt || null,
    deleted_by: row.deletedBy || null,
  };
}

export async function listDemandasCentral(includeDeleted = false): Promise<ClienteDemanda[]> {
  if (!supabaseConfigured) return [];
  let query = (supabase as any).from(TABLE).select('*');

  // ─── Filter out soft-deleted items by default ───
  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: Record<string, unknown>) => normalizeRow(row));
}

export async function upsertDemandaCentral(row: ClienteDemanda): Promise<void> {
  if (!supabaseConfigured) return;
  const { error } = await (supabase as any).from(TABLE).upsert(toInsert(row), { onConflict: 'id' });
  if (error) throw error;
}

export async function updateDemandaCentral(id: string, updates: Partial<ClienteDemanda>): Promise<void> {
  if (!supabaseConfigured) return;
  const payload: Record<string, unknown> = {};
  if (updates.categoria !== undefined) payload.categoria = updates.categoria;
  if (updates.nomeCliente !== undefined) payload.nome_cliente = updates.nomeCliente;
  if (updates.empresa !== undefined) payload.empresa = updates.empresa;
  if (updates.midia !== undefined) payload.midia = updates.midia;
  if (updates.urlGoogleAds !== undefined) payload.url_google_ads = updates.urlGoogleAds;
  if (updates.urlMetaAds !== undefined) payload.url_meta_ads = updates.urlMetaAds;
  if (updates.urlDashboard !== undefined) payload.url_dashboard = updates.urlDashboard;
  if (updates.tarefaDemanda !== undefined) payload.tarefa_demanda = updates.tarefaDemanda;
  if (updates.andamentoObservacao !== undefined) payload.andamento_observacao = updates.andamentoObservacao;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.prazoEntrega !== undefined) payload.prazo_entrega = updates.prazoEntrega || null;
  if (updates.dataRelatorio !== undefined) payload.data_relatorio = updates.dataRelatorio || null;
  if (updates.dataOtimizacao !== undefined) payload.data_otimizacao = updates.dataOtimizacao || null;
  if (updates.ultimaMensagem !== undefined) payload.ultima_mensagem = updates.ultimaMensagem || null;
  if (updates.valorMensalidade !== undefined) payload.valor_mensalidade = updates.valorMensalidade;
  if (updates.saldoContaGoogleAds !== undefined) payload.saldo_conta_google_ads = updates.saldoContaGoogleAds;
  if (updates.saldoContaMetaAds !== undefined) payload.saldo_conta_meta_ads = updates.saldoContaMetaAds;
  if (updates.responsavel !== undefined) payload.responsavel = updates.responsavel;
  if (updates.prioridade !== undefined) payload.prioridade = updates.prioridade;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.arquivado !== undefined) payload.arquivado = updates.arquivado;
  if (updates.deletedAt !== undefined) payload.deleted_at = updates.deletedAt || null;
  if (updates.deletedBy !== undefined) payload.deleted_by = updates.deletedBy || null;

  const { error } = await (supabase as any).from(TABLE).update(payload).eq('id', id);
  if (error) throw error;
}

export async function createDemandaCentral(seed?: Partial<ClienteDemanda>): Promise<ClienteDemanda> {
  const today = new Date().toISOString().slice(0, 10);
  const newRow: ClienteDemanda = {
    id: crypto.randomUUID(),
    categoria: 'AB Tracking',
    nomeCliente: 'Novo Cliente',
    empresa: 'Nova Empresa',
    midia: 'Outros',
    urlGoogleAds: '',
    urlMetaAds: '',
    urlDashboard: '',
    tarefaDemanda: 'Nova demanda',
    andamentoObservacao: '',
    status: 'A fazer',
    prazoEntrega: today,
    dataRelatorio: '',
    dataOtimizacao: '',
    ultimaMensagem: today,
    valorMensalidade: null,
    saldoContaGoogleAds: null,
    saldoContaMetaAds: null,
    responsavel: 'Bruno',
    prioridade: 'Media',
    tags: [],
    arquivado: false,
    // ─── Initialize soft delete fields ───
    deletedAt: null,
    deletedBy: null,
    ...seed,
  };
  await upsertDemandaCentral(newRow);
  return newRow;
}

export async function saveDemandasFilters(userKey: string, payload: DashboardFiltersPayload): Promise<void> {
  if (!supabaseConfigured) return;
  const { error } = await (supabase as any).from(PREF_TABLE).upsert({ user_key: userKey, view_key: VIEW_KEY, payload }, { onConflict: 'user_key,view_key' });
  if (error) throw error;
}

export async function loadDemandasFilters(userKey: string): Promise<DashboardFiltersPayload | null> {
  if (!supabaseConfigured) return null;
  const { data, error } = await supabase
    .from(PREF_TABLE)
    .select('payload')
    .eq('user_key', userKey)
    .eq('view_key', VIEW_KEY)
    .maybeSingle();
  if (error) throw error;
  return ((data as any)?.payload as DashboardFiltersPayload | null) || null;
}

/**
 * Soft delete: mark a demand as deleted without removing it from the database
 * This allows recovery from the trash and maintains full history
 */
export async function deleteDemandaCentral(id: string, deletedBy: string = 'Sistema'): Promise<void> {
  if (!supabaseConfigured) return;
  const now = new Date().toISOString();
  const { error } = await (supabase as any)
    .from(TABLE)
    .update({ deleted_at: now, deleted_by: deletedBy })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Restore a soft-deleted demand from trash
 */
export async function restoreDemandaCentral(id: string): Promise<void> {
  if (!supabaseConfigured) return;
  const { error } = await (supabase as any)
    .from(TABLE)
    .update({ deleted_at: null, deleted_by: null })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Permanently delete a demand from the database (hard delete)
 * Use with caution - this is irreversible
 */
export async function hardDeleteDemandaCentral(id: string): Promise<void> {
  if (!supabaseConfigured) return;
  const { error } = await (supabase as any).from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

/**
 * Get all soft-deleted demands for the trash view
 */
export async function listDeletedDemandasCentral(): Promise<ClienteDemanda[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .select('*')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: Record<string, unknown>) => normalizeRow(row));
}





