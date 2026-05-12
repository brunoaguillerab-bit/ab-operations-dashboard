import { OverviewSummary } from '@/types/ads';
import { mockOverview } from '@/data/mockOverview';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const overviewService = {
  /**
   * Retorna dados consolidados de todos os canais.
   * TODO: Agregar dados de Google Ads API + Meta Ads API
   */
  async getSummary(clienteId?: string, periodo?: string): Promise<OverviewSummary> {
    await delay(400);
    return mockOverview;
  },

  /**
   * Retorna insights de IA sobre a performance geral.
   * TODO: Conectar com OpenAI ou análise local
   */
  async getInsights(clienteId?: string) {
    await delay(500);
    const data = await this.getSummary(clienteId);
    return data.insights;
  },
};
