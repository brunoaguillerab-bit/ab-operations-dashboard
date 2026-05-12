'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Download,
  MoreHorizontal,
  ChevronDown,
  BrainCircuit,
} from 'lucide-react';

interface DashboardHeaderProps {
  onSearchChange: (value: string) => void;
  onMediaFilterChange: (media: string) => void;
  onStatusFilterChange: (status: string) => void;
}

export default function DashboardHeader({
  onSearchChange,
  onMediaFilterChange,
  onStatusFilterChange,
}: DashboardHeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showMediaFilter, setShowMediaFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

  const handleMediaFilter = (media: string) => {
    setSelectedMedia(selectedMedia === media ? null : media);
    onMediaFilterChange(selectedMedia === media ? '' : media);
    setShowMediaFilter(false);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(selectedStatus === status ? null : status);
    onStatusFilterChange(selectedStatus === status ? '' : status);
    setShowStatusFilter(false);
  };

  return (
    <div className="bg-[#0F1117] border-b border-[#2A2F3A] sticky top-0 z-40">
      {/* Main Header */}
      <div className="px-8 py-6 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
              <span className="text-white font-bold">AB</span>
            </div>
            Gestão Operacional AB Tracking
          </h1>
          <p className="text-[#A1A1AA] text-sm">
            Controle completo de clientes, demandas e performance em tempo real
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-xs">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
              />
              <input
                type="text"
                placeholder="Buscar cliente, empresa, demanda..."
                value={searchValue}
                onChange={handleSearch}
                className="w-full bg-[#181C25] border border-[#2A2F3A] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition placeholder:text-[#A1A1AA]"
              />
            </div>

            {/* Media Filter */}
            <div className="relative">
              <button
                onClick={() => setShowMediaFilter(!showMediaFilter)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#181C25] border border-[#2A2F3A] rounded-xl hover:border-[#3A3F4A] transition text-sm font-medium text-[#A1A1AA]"
              >
                <Filter size={14} />
                Mídia
                {selectedMedia && <span className="ml-1 text-red-400">•</span>}
                <ChevronDown size={14} />
              </button>
              {showMediaFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-0 bg-[#181C25] border border-[#2A2F3A] rounded-xl shadow-lg z-50 min-w-48"
                >
                  {['Google Ads', 'Meta Ads', 'Google + Meta'].map(media => (
                    <button
                      key={media}
                      onClick={() => handleMediaFilter(media)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition border-b border-[#2A2F3A] last:border-0 ${
                        selectedMedia === media
                          ? 'bg-red-500/10 text-red-400 font-semibold'
                          : 'text-[#A1A1AA] hover:bg-white/5'
                      }`}
                    >
                      {media}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowStatusFilter(!showStatusFilter)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#181C25] border border-[#2A2F3A] rounded-xl hover:border-[#3A3F4A] transition text-sm font-medium text-[#A1A1AA]"
              >
                <Filter size={14} />
                Status
                {selectedStatus && <span className="ml-1 text-red-400">•</span>}
                <ChevronDown size={14} />
              </button>
              {showStatusFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-0 bg-[#181C25] border border-[#2A2F3A] rounded-xl shadow-lg z-50 min-w-48"
                >
                  {['feito', 'a_fazer', 'cliente', 'pausado', 'urgente'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusFilter(status)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition border-b border-[#2A2F3A] last:border-0 ${
                        selectedStatus === status
                          ? 'bg-red-500/10 text-red-400 font-semibold'
                          : 'text-[#A1A1AA] hover:bg-white/5'
                      }`}
                    >
                      {status === 'feito' && '✓ Feito'}
                      {status === 'a_fazer' && '○ A Fazer'}
                      {status === 'cliente' && '⊗ Cliente'}
                      {status === 'pausado' && '∥ Pausado'}
                      {status === 'urgente' && '! Urgente'}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#181C25] border border-[#2A2F3A] rounded-xl hover:border-[#3A3F4A] transition text-sm font-medium text-[#A1A1AA] hover:text-white whitespace-nowrap">
              <BrainCircuit size={14} />
              <span className="hidden sm:inline">Análise IA</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#181C25] border border-[#2A2F3A] rounded-xl hover:border-[#3A3F4A] transition text-sm font-medium text-[#A1A1AA] hover:text-white whitespace-nowrap">
              <Download size={14} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition text-sm font-bold text-white shadow-lg shadow-red-500/30 whitespace-nowrap"
            >
              <Plus size={14} strokeWidth={3} />
              <span className="hidden sm:inline">Nova Demanda</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
