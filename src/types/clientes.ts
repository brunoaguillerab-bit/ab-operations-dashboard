export type ClienteStatus = 'ativo' | 'pausado' | 'inativo' | 'prospecto';
export type ClienteGrupo = 'Workana' | 'Recorrentes' | 'Pontuais';
export type ClienteMidia = 'Google Ads' | 'Meta Ads' | 'Google + Meta';

export interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  email?: string;
  telefone?: string;
  midia: ClienteMidia;
  grupo: ClienteGrupo;
  status: ClienteStatus;
  valorMensal: number;
  saldoGoogle: number;
  saldoMeta: number;
  dashboardLink?: string;
  prazoEntrega: string;
  ultimoRelatorio: string;
  ultimaOtimizacao: string;
  observacoes?: string;
}

export interface ClienteFilters {
  search?: string;
  midia?: ClienteMidia;
  grupo?: ClienteGrupo;
  status?: ClienteStatus;
}

export interface ClienteStats {
  total: number;
  ativos: number;
  pausados: number;
  receitaMensal: number;
  saldoTotalGoogle: number;
  saldoTotalMeta: number;
}
