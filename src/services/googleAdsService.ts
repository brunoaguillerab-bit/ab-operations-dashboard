import { GoogleAdsSummary, GoogleAdsCampaign } from '@/types/ads';
import { mockGoogleAds } from '@/data/mockGoogleAds';

// Simula delay de API real
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const googleAdsService = {
  /**
   * Retorna resumo completo de Google Ads.
   * TODO: Substituir por chamada real à Google Ads API ou Windsor.ai
   */
  async getSummary(clienteId?: string, periodo?: string): Promise<GoogleAdsSummary> {
    await delay(300);
    // TODO: filtrar por clienteId e periodo quando conectar API real
    return mockGoogleAds;
  },

  /**
   * Retorna lista de campanhas ativas.
   */
  async getCampanhas(clienteId?: string): Promise<GoogleAdsCampaign[]> {
    await delay(200);
    const data = await this.getSummary(clienteId);
    return data.campanhas;
  },

  /**
   * Retorna termos de pesquisa.
   */
  async getTermosDePesquisa(clienteId?: string) {
    await delay(200);
    const data = await this.getSummary(clienteId);
    return data.termosDePesquisa;
  },
};
