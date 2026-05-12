import { OverviewSummary } from '@/types/ads';

export const mockOverview: OverviewSummary = {
  investimentoTotal: 3047.70,
  conversoesTotais: 374,
  cliqueTotal: 6094,
  cpaMedio: 8.15,
  roasGeral: 7.84,
  performanceScore: 84,
  googleInvestimento: 1842.30,
  metaInvestimento: 1205.40,
  projetos: [
    { projeto: 'Store Energy', canal: 'Google', investimento: 320.26, cliques: 540, conversoes: 28, cpa: 11.44, roas: 6.3, status: 'bom' },
    { projeto: 'AG Móveis', canal: 'Google', investimento: 396.82, cliques: 680, conversoes: 41, cpa: 9.68, roas: 9.2, status: 'otimo' },
    { projeto: 'Instituto Cimas', canal: 'Google + Meta', investimento: 756.81, cliques: 1400, conversoes: 154, cpa: 4.91, roas: 12.6, status: 'otimo' },
    { projeto: 'MelBaby', canal: 'Meta', investimento: 385.20, cliques: 890, conversoes: 24, cpa: 16.05, roas: 4.8, status: 'atencao' },
    { projeto: 'Ozonioterapia', canal: 'Meta', investimento: 210.00, cliques: 620, conversoes: 98, cpa: 2.14, roas: 14.2, status: 'otimo' },
    { projeto: 'Habitus RH', canal: 'Google', investimento: 152.99, cliques: 245, conversoes: 15, cpa: 10.2, roas: 7.8, status: 'bom' },
    { projeto: 'HS Sports', canal: 'Meta', investimento: 320.80, cliques: 740, conversoes: 36, cpa: 8.91, roas: 6.9, status: 'bom' },
    { projeto: 'Dr Victor Aquiles', canal: 'Google', investimento: 289.77, cliques: 667, conversoes: 32, cpa: 9.06, roas: 9.1, status: 'otimo' },
    { projeto: 'Village Heaven', canal: 'Google + Meta', investimento: 215.05, cliques: 312, conversoes: 19, cpa: 11.32, roas: 5.6, status: 'bom' },
  ],
  insights: [
    { tipo: 'oportunidade', mensagem: 'Ozonioterapia tem CPA de R$2,14 — melhor da carteira. Escalar budget.', projeto: 'Ozonioterapia' },
    { tipo: 'alerta', mensagem: 'MelBaby com ROAS 4.8x abaixo da meta (7x). Revisar criativos e segmentação.', projeto: 'MelBaby' },
    { tipo: 'oportunidade', mensagem: 'Instituto Cimas ROAS 12.6x — considerar aumento de 20% no budget.', projeto: 'Instituto Cimas' },
    { tipo: 'info', mensagem: 'Performance Score geral 84/100. 6 projetos acima de 80 pontos.' },
    { tipo: 'alerta', mensagem: 'Store Energy CTR Google Search abaixo de 7%. Otimizar títulos dos anúncios.', projeto: 'Store Energy' },
  ],
};
