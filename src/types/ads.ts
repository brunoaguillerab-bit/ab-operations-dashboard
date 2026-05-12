// ─── Google Ads ──────────────────────────────────────────────────────────────

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: 'ativa' | 'pausada' | 'removida';
  type: 'Search' | 'PMax' | 'Display' | 'Shopping' | 'Video';
  investimento: number;
  cliques: number;
  impressoes: number;
  ctr: number;
  cpc: number;
  conversoes: number;
  cpa: number;
  roas: number;
}

export interface GoogleAdsSearchTerm {
  term: string;
  cliques: number;
  impressoes: number;
  ctr: number;
  cpc: number;
  conversoes: number;
}

export interface GoogleAdsSummary {
  investimento: number;
  cliques: number;
  impressoes: number;
  ctr: number;
  cpc: number;
  conversoes: number;
  cpa: number;
  roas: number;
  performanceScore: number;
  campanhas: GoogleAdsCampaign[];
  termosDePesquisa: GoogleAdsSearchTerm[];
}

// ─── Meta Ads ─────────────────────────────────────────────────────────────────

export interface MetaAdsCampaign {
  id: string;
  name: string;
  status: 'ativa' | 'pausada' | 'encerrada';
  objetivo: string;
  investimento: number;
  alcance: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  cpc: number;
  leads: number;
  mensagensWhatsApp: number;
  compras: number;
  cpa: number;
  frequencia: number;
  cpm: number;
}

export interface MetaAdsCreative {
  id: string;
  name: string;
  type: 'image' | 'video' | 'carousel';
  impressoes: number;
  cliques: number;
  ctr: number;
  conversoes: number;
}

export interface MetaAdsSummary {
  investimento: number;
  alcance: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  cpc: number;
  leads: number;
  mensagensWhatsApp: number;
  compras: number;
  cpa: number;
  cpm: number;
  frequencia: number;
  performanceScore: number;
  campanhas: MetaAdsCampaign[];
  criativos: MetaAdsCreative[];
}

// ─── AB Overview ──────────────────────────────────────────────────────────────

export interface ProjectPerformance {
  projeto: string;
  canal: 'Google' | 'Meta' | 'Google + Meta';
  investimento: number;
  cliques: number;
  conversoes: number;
  cpa: number;
  roas: number;
  status: 'otimo' | 'bom' | 'atencao' | 'critico';
}

export interface AIInsight {
  tipo: 'alerta' | 'oportunidade' | 'info';
  mensagem: string;
  projeto?: string;
}

export interface OverviewSummary {
  investimentoTotal: number;
  conversoesTotais: number;
  cliqueTotal: number;
  cpaMedio: number;
  roasGeral: number;
  performanceScore: number;
  googleInvestimento: number;
  metaInvestimento: number;
  projetos: ProjectPerformance[];
  insights: AIInsight[];
}
