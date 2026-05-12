import { Cliente, ClienteFilters, ClienteStats } from '@/types/clientes';
import { mockClients } from '@/data/mockClients';

// Adapta os dados existentes do mockClients para o tipo Cliente
function adaptarCliente(c: (typeof mockClients)[0]): Cliente {
  return {
    id: c.id,
    nome: c.name,
    empresa: c.company,
    midia: c.media as Cliente['midia'],
    grupo: c.group as Cliente['grupo'],
    status: c.status === 'pausado' ? 'pausado' : 'ativo',
    valorMensal: c.valorMensal,
    saldoGoogle: c.saldoGoogle,
    saldoMeta: c.saldoMeta,
    dashboardLink: c.dashboardLink,
    prazoEntrega: c.prazoEntrega,
    ultimoRelatorio: c.ultimoRelatorio,
    ultimaOtimizacao: c.ultimaOtimizacao,
  };
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const clientesService = {
  /**
   * Retorna lista de clientes com filtros opcionais.
   * TODO: Conectar com Supabase
   */
  async getClientes(filters?: ClienteFilters): Promise<Cliente[]> {
    await delay(200);
    let clientes = mockClients.map(adaptarCliente);

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      clientes = clientes.filter(c =>
        c.nome.toLowerCase().includes(s) ||
        c.empresa.toLowerCase().includes(s)
      );
    }
    if (filters?.midia) {
      clientes = clientes.filter(c => c.midia === filters.midia);
    }
    if (filters?.grupo) {
      clientes = clientes.filter(c => c.grupo === filters.grupo);
    }
    if (filters?.status) {
      clientes = clientes.filter(c => c.status === filters.status);
    }

    return clientes;
  },

  /**
   * Retorna stats consolidados dos clientes.
   */
  async getStats(): Promise<ClienteStats> {
    await delay(150);
    const clientes = mockClients.map(adaptarCliente);
    return {
      total: clientes.length,
      ativos: clientes.filter(c => c.status === 'ativo').length,
      pausados: clientes.filter(c => c.status === 'pausado').length,
      receitaMensal: clientes.reduce((s, c) => s + c.valorMensal, 0),
      saldoTotalGoogle: clientes.reduce((s, c) => s + c.saldoGoogle, 0),
      saldoTotalMeta: clientes.reduce((s, c) => s + c.saldoMeta, 0),
    };
  },
};
