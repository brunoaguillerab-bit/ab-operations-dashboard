'use client';

import { ClienteDemanda } from '@/types/demandasCentral';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface TrashViewProps {
  items: ClienteDemanda[];
  onRestore: (id: string) => Promise<void>;
  onHardDelete: (id: string) => Promise<void>;
}

export function TrashView({ items, onRestore, onHardDelete }: TrashViewProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    setLoading(id);
    try {
      await onRestore(id);
    } finally {
      setLoading(null);
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    const confirmed = confirm(
      `ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n` +
      `Você está prestes a deletar permanentemente "${name}".\n` +
      `Tem certeza?`
    );
    if (!confirmed) return;

    setLoading(id);
    try {
      await onHardDelete(id);
    } finally {
      setLoading(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <Trash2 size={48} className="text-[#6B7280]" />
        <div>
          <h3 className="text-lg font-semibold text-[#F3F4F6] mb-1">Lixeira vazia</h3>
          <p className="text-sm text-[#9CA3AF]">Nenhuma tarefa deletada no momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
        <Trash2 size={20} className="text-[#EF4444]" />
        <h2 className="text-lg font-semibold text-[#F3F4F6]">Lixeira</h2>
        <span className="ml-auto text-sm text-[#9CA3AF]">{items.length} item(ns)</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-white/10">
          {items.map((item) => (
            <div
              key={item.id}
              className="px-6 py-4 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#F3F4F6] truncate">
                    {item.tarefaDemanda}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-[#9CA3AF]">
                    <span>{item.nomeCliente}</span>
                    <span>•</span>
                    <span>{item.empresa}</span>
                    <span>•</span>
                    <span className="text-[#6B7280]">
                      {item.deletedAt
                        ? `Deletado ${new Date(item.deletedAt).toLocaleDateString('pt-BR')}`
                        : 'Data desconhecida'
                      }
                    </span>
                  </div>
                  {item.deletedBy && (
                    <div className="text-xs text-[#6B7280] mt-1">
                      por {item.deletedBy}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(item.id)}
                    disabled={loading === item.id}
                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                    title="Restaurar"
                  >
                    <RotateCcw size={16} />
                    {loading === item.id ? 'Restaurando...' : 'Restaurar'}
                  </button>

                  <button
                    onClick={() => handlePermanentDelete(item.id, item.tarefaDemanda)}
                    disabled={loading === item.id}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                    title="Deletar permanentemente"
                  >
                    <AlertTriangle size={16} />
                    {loading === item.id ? 'Deletando...' : 'Deletar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
