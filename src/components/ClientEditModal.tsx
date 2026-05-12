'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Client, TaskStatus } from '@/data/mockClients';
import { X, Save } from 'lucide-react';

interface ClientEditModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
}

export default function ClientEditModal({
  client,
  isOpen,
  onClose,
  onSave,
}: ClientEditModalProps) {
  const [formData, setFormData] = useState<Client | null>(client);

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  if (!formData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#181C25] border border-[#2A2F3A] rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Editar Demanda</h2>
                <p className="text-[#A1A1AA] text-sm mt-1">
                  {formData.name} • {formData.company}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition text-[#A1A1AA]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5 mb-8">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as TaskStatus })
                  }
                  className="w-full bg-[#0F1117] border border-[#2A2F3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="feito">✓ Feito</option>
                  <option value="a_fazer">○ A Fazer</option>
                  <option value="cliente">⊗ Cliente</option>
                  <option value="pausado">∥ Pausado</option>
                  <option value="urgente">! Urgente</option>
                </select>
              </div>

              {/* Demanda */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Demanda
                </label>
                <textarea
                  value={formData.demanda}
                  onChange={(e) =>
                    setFormData({ ...formData, demanda: e.target.value })
                  }
                  className="w-full bg-[#0F1117] border border-[#2A2F3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50 resize-none h-20"
                  placeholder="Descreva a demanda..."
                />
              </div>

              {/* Andamento */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Andamento
                </label>
                <input
                  type="text"
                  value={formData.andamento}
                  onChange={(e) =>
                    setFormData({ ...formData, andamento: e.target.value })
                  }
                  className="w-full bg-[#0F1117] border border-[#2A2F3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                  placeholder="Ex: A fazer, Em andamento..."
                />
              </div>

              {/* Prazo */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Prazo de Entrega
                </label>
                <input
                  type="text"
                  value={formData.prazoEntrega}
                  onChange={(e) =>
                    setFormData({ ...formData, prazoEntrega: e.target.value })
                  }
                  className="w-full bg-[#0F1117] border border-[#2A2F3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                  placeholder="DD/MM/YYYY"
                />
              </div>

              {/* Saldos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Saldo Google Ads (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.saldoGoogle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        saldoGoogle: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#0F1117] border border-[#2A2F3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Saldo Meta Ads (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.saldoMeta}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        saldoMeta: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#0F1117] border border-[#2A2F3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              {/* Valor Mensal */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Valor Mensal (R$)
                </label>
                <input
                  type="number"
                  value={formData.valorMensal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      valorMensal: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#0F1117] border border-[#2A2F3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-[#0F1117] border border-[#2A2F3A] text-white hover:bg-[#181C25] transition font-semibold"
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition font-semibold"
              >
                <Save size={16} />
                Salvar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
