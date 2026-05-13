'use client';

import { ClienteDemanda } from '@/types/demandasCentral';
import { ExternalLink, TrendingUp } from 'lucide-react';

interface MetaAdsContentProps {
  demandas: ClienteDemanda[];
}

export default function MetaAdsContent({ demandas }: MetaAdsContentProps) {
  const metaCampaigns = demandas.filter(d => d.midia === 'Meta Ads' || d.midia === 'Google e Meta');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Feito':
        return 'bg-green-500/10 text-green-300 border-green-500/30';
      case 'Em andamento':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'A fazer':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
      case 'Aguardando cliente':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/10 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-white/10 bg-blue-500/5 p-4 backdrop-blur-sm">
            <p className="text-sm text-[#A1A1AA]">Total de Campanhas</p>
            <p className="text-3xl font-bold text-white mt-2">{metaCampaigns.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-green-500/5 p-4 backdrop-blur-sm">
            <p className="text-sm text-[#A1A1AA]">Ativas</p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {metaCampaigns.filter(d => d.status === 'Em andamento').length}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-purple-500/5 p-4 backdrop-blur-sm">
            <p className="text-sm text-[#A1A1AA]">Saldo Total</p>
            <p className="text-3xl font-bold text-purple-400 mt-2">
              R$ {metaCampaigns.reduce((sum, d) => sum + (d.saldoContaMetaAds || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Campanhas List */}
        {metaCampaigns.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
            <TrendingUp size={32} className="text-[#A1A1AA] mx-auto mb-3" />
            <p className="text-[#A1A1AA]">Nenhuma campanha Meta Ads cadastrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metaCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      {campaign.tarefaDemanda}
                      {campaign.urlMetaAds && (
                        <a
                          href={campaign.urlMetaAds}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                          title="Abrir no Meta Ads"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </h3>
                    <p className="text-sm text-[#A1A1AA] mt-1">{campaign.nomeCliente}</p>
                    <p className="text-xs text-[#6B7280] mt-1">{campaign.empresa}</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <div className="text-right">
                      <p className="text-xs text-[#A1A1AA]">Saldo da Conta</p>
                      <p className="text-lg font-semibold text-white">
                        R$ {(campaign.saldoContaMetaAds || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {campaign.status && (
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium border whitespace-nowrap ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {campaign.status}
                      </span>
                    )}
                  </div>
                </div>

                {campaign.andamentoObservacao && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-[#A1A1AA]">Observações:</p>
                    <p className="text-sm text-white mt-1">{campaign.andamentoObservacao}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
