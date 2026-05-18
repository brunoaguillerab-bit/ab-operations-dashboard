export type ClienteCategoria = 'Workana' | 'AB Tracking' | 'Pontuais';

export type ClienteMidia =
  | 'Google Ads'
  | 'Meta Ads'
  | 'Google e Meta'
  | 'LinkedIn Ads'
  | 'TikTok Ads'
  | 'Outros';

export type DemandaClienteStatus =
  | 'A fazer'
  | 'Em andamento'
  | 'Aguardando cliente'
  | 'Aguardando pagamento'
  | 'Feito'
  | 'Recorrente'
  | 'Pausado'
  | 'Cancelado';

export type DemandaPrioridade = 'Baixa' | 'Media' | 'Alta' | 'Urgente';

export type SaudeCliente = 'verde' | 'amarelo' | 'vermelho';

export interface ClienteDemanda {
  id: string;
  categoria: ClienteCategoria;
  nomeCliente: string;
  empresa: string;
  midia: ClienteMidia;
  urlGoogleAds: string;
  urlMetaAds: string;
  urlDashboard: string;
  tarefaDemanda: string;
  andamentoObservacao: string;
  status: DemandaClienteStatus;
  prazoEntrega: string;
  dataRelatorio: string;
  dataOtimizacao: string;
  ultimaMensagem: string;
  valorMensalidade: number | null;
  saldoContaGoogleAds: number | null;
  saldoContaMetaAds: number | null;
  responsavel: string;
  prioridade: DemandaPrioridade;
  tags: string[];
  arquivado: boolean;
  // Soft delete fields (optional — default null nos novos registros)
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface ColunaFiltro {
  text: string;
  selected: string[];
  onlyEmpty: boolean;
  onlyNonEmpty: boolean;
  dateFrom: string;
  dateTo: string;
  min: string;
  max: string;
}

export type FiltrosPorColuna = {
  [K in keyof ClienteDemanda]?: ColunaFiltro;
};

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: keyof ClienteDemanda;
  direction: SortDirection;
}
