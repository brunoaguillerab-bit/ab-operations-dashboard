// ─── Status ────────────────────────────────────────────────────────────────

export type DemandaStatus =
  | 'aberta'
  | 'em_andamento'
  | 'aguardando_cliente'
  | 'em_revisao'
  | 'concluida'
  | 'arquivada';

export interface StatusConfig {
  id: DemandaStatus;
  label: string;
  color: string;       // tailwind text color
  bg: string;          // tailwind bg color
  dot: string;         // tailwind dot color
  order: number;
}

export const STATUS_CONFIG: Record<DemandaStatus, StatusConfig> = {
  aberta:             { id: 'aberta',             label: 'Aberta',              color: 'text-blue-400',    bg: 'bg-blue-500/10',    dot: 'bg-blue-400',    order: 0 },
  em_andamento:       { id: 'em_andamento',       label: 'Em Andamento',        color: 'text-amber-400',   bg: 'bg-amber-500/10',   dot: 'bg-amber-400',   order: 1 },
  aguardando_cliente: { id: 'aguardando_cliente', label: 'Aguard. Cliente',     color: 'text-orange-400',  bg: 'bg-orange-500/10',  dot: 'bg-orange-400',  order: 2 },
  em_revisao:         { id: 'em_revisao',         label: 'Em Revisão',          color: 'text-purple-400',  bg: 'bg-purple-500/10',  dot: 'bg-purple-400',  order: 3 },
  concluida:          { id: 'concluida',          label: 'Concluída',           color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400', order: 4 },
  arquivada:          { id: 'arquivada',          label: 'Arquivada',           color: 'text-zinc-400',    bg: 'bg-zinc-500/10',    dot: 'bg-zinc-400',    order: 5 },
};

export const KANBAN_COLUMNS: DemandaStatus[] = [
  'aberta', 'em_andamento', 'aguardando_cliente', 'em_revisao', 'concluida',
];

// ─── Priority ──────────────────────────────────────────────────────────────

export type DemandaPrioridade = 'baixa' | 'media' | 'alta' | 'urgente';

export interface PrioridadeConfig {
  label: string;
  color: string;
  bg: string;
  order: number;
}

export const PRIORIDADE_CONFIG: Record<DemandaPrioridade, PrioridadeConfig> = {
  baixa:   { label: 'Baixa',   color: 'text-zinc-400',   bg: 'bg-zinc-500/10',   order: 0 },
  media:   { label: 'Média',   color: 'text-blue-400',   bg: 'bg-blue-500/10',   order: 1 },
  alta:    { label: 'Alta',    color: 'text-amber-400',  bg: 'bg-amber-500/10',  order: 2 },
  urgente: { label: 'Urgente', color: 'text-red-400',    bg: 'bg-red-500/10',    order: 3 },
};

// ─── Type ───────────────────────────────────────────────────────────────────

export type DemandaTipo =
  | 'criativo' | 'campanha' | 'relatorio' | 'otimizacao'
  | 'reuniao'  | 'pixel'    | 'auditoria' | 'outro';

// ─── View ───────────────────────────────────────────────────────────────────

export type ViewMode = 'lista' | 'kanban' | 'calendario';

// ─── Sub-entities ───────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
  criadoEm: string;
}

export interface Subtarefa {
  id: string;
  titulo: string;
  concluida: boolean;
  responsavel?: string;
  prazo?: string;
  criadaEm: string;
}

export interface Comentario {
  id: string;
  autor: string;
  avatar: string;   // initials fallback
  texto: string;
  criadoEm: string;
  editado?: boolean;
}

export type HistoricoTipo = 'criacao' | 'edicao' | 'status' | 'comentario' | 'checklist' | 'checklist_deletado' | 'arquivo' | 'exclusao' | 'restauracao';

export interface HistoricoItem {
  id: string;
  tipo: HistoricoTipo;
  campo?: string;
  valorAnterior?: string;
  valorNovo?: string;
  autor: string;
  descricao: string;
  criadoEm: string;
}

export type RecorrenciaTipo = 'diaria' | 'semanal' | 'quinzenal' | 'mensal';

// ─── Main Entity ────────────────────────────────────────────────────────────

export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  clienteId: string;
  clienteNome: string;
  responsavel: string;
  prioridade: DemandaPrioridade;
  status: DemandaStatus;
  tipo: DemandaTipo;
  tags: string[];
  prazo: string;
  criadaEm: string;
  atualizadaEm: string;
  arquivada: boolean;
  ordem: number;
  checklist: ChecklistItem[];
  subtarefas: Subtarefa[];
  comentarios: Comentario[];
  historico: HistoricoItem[];
  recorrencia?: RecorrenciaTipo;
  templateId?: string;
  links?: string[];
  // Soft delete fields
  deletedAt: string | null;
  deletedBy: string | null;
}

export type NovaDemanda = Omit<
  Demanda,
  'id' | 'criadaEm' | 'atualizadaEm' | 'arquivada' | 'ordem' |
  'checklist' | 'subtarefas' | 'comentarios' | 'historico' |
  'deletedAt' | 'deletedBy'   // soft delete — sempre null em novos registros
> & {
  checklist?: string[];   // plain text items for quick creation
};

// ─── Filters ────────────────────────────────────────────────────────────────

export interface DemandaFilters {
  search: string;
  status: DemandaStatus | 'todas';
  prioridade: DemandaPrioridade | 'todas';
  tipo: DemandaTipo | 'todos';
  clienteId: string;
  responsavel: string;
  mostrarArquivadas: boolean;
  mostrarDeletadas: boolean;  // show deleted/restored tasks
  vencidas: boolean;
  prazoHoje: boolean;
}

export const DEFAULT_FILTERS: DemandaFilters = {
  search: '',
  status: 'todas',
  prioridade: 'todas',
  tipo: 'todos',
  clienteId: '',
  responsavel: '',
  mostrarArquivadas: false,
  mostrarDeletadas: false,  // by default, hide deleted tasks
  vencidas: false,
  prazoHoje: false,
};

// ─── Stats ──────────────────────────────────────────────────────────────────

export interface DemandaStats {
  total: number;
  abertas: number;
  emAndamento: number;
  aguardandoCliente: number;
  emRevisao: number;
  concluidas: number;
  urgentes: number;
  vencidas: number;
  prazoHoje: number;
  semAtualizacao: number;
}

// ─── Template ───────────────────────────────────────────────────────────────

export interface TaskTemplate {
  id: string;
  nome: string;
  descricao: string;
  tipo: DemandaTipo;
  prioridade: DemandaPrioridade;
  checklistItems: string[];
  tags: string[];
  icone: string;
}
