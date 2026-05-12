import { Demanda, DemandaFilters, DemandaStats } from '@/types/demandas';
import { mockDemandas } from '@/data/mockDemandas';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const demandasService = {
  /**
   * Retorna lista de demandas com filtros opcionais.
   * TODO: Conectar com Supabase
   */
  async getDemandas(filters?: DemandaFilters): Promise<Demanda[]> {
    await delay(200);
    let demandas = [...mockDemandas];

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      demandas = demandas.filter(d =>
        d.titulo.toLowerCase().includes(s) ||
        d.clienteNome.toLowerCase().includes(s)
      );
    }
    if (filters?.status) {
      demandas = demandas.filter(d => d.status === filters.status);
    }
    if (filters?.prioridade) {
      demandas = demandas.filter(d => d.prioridade === filters.prioridade);
    }
    if (filters?.responsavel) {
      demandas = demandas.filter(d => d.responsavel === filters.responsavel);
    }
    if (filters?.clienteId) {
      demandas = demandas.filter(d => d.clienteId === filters.clienteId);
    }

    return demandas;
  },

  /**
   * Retorna stats consolidados das demandas.
   */
  async getStats(): Promise<DemandaStats> {
    await delay(100);
    return {
      total: mockDemandas.length,
      abertas: mockDemandas.filter(d => d.status === 'aberta').length,
      emAndamento: mockDemandas.filter(d => d.status === 'em_andamento').length,
      aguardandoCliente: mockDemandas.filter(d => d.status === 'aguardando_cliente').length,
      concluidas: mockDemandas.filter(d => d.status === 'concluida').length,
      urgentes: mockDemandas.filter(d => d.prioridade === 'urgente').length,
    };
  },
};
