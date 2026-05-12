import { MetaAdsSummary, MetaAdsCampaign, MetaAdsCreative } from '@/types/ads';
import { mockMetaAds } from '@/data/mockMetaAds';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const metaAdsService = {
  /**
   * Retorna resumo completo de Meta Ads.
   * TODO: Substituir por chamada real à Meta Ads API ou Windsor.ai
   */
  async getSummary(clienteId?: string, periodo?: string): Promise<MetaAdsSummary> {
    await delay(300);
    // TODO: filtrar por clienteId e periodo quando conectar API real
    return mockMetaAds;
  },

  /**
   * Retorna lista de campanhas ativas.
   */
  async getCampanhas(clienteId?: string): Promise<MetaAdsCampaign[]> {
    await delay(200);
    const data = await this.getSummary(clienteId);
    return data.campanhas;
  },

  /**
   * Retorna criativos.
   */
  async getCriativos(clienteId?: string): Promise<MetaAdsCreative[]> {
    await delay(200);
    const data = await this.getSummary(clienteId);
    return data.criativos;
  },
};
