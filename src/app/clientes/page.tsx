'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import KPICardsAB from '@/components/KPICardsAB';
import ClientsTable from '@/components/ClientsTable';
import InsightsPanel from '@/components/InsightsPanel';
import ClientEditModal from '@/components/ClientEditModal';
import { mockClients, Client } from '@/data/mockClients';
import { Users, Search, Filter, ChevronDown, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientesPage() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedMedia, setSelectedMedia] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [showMediaFilter, setShowMediaFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        client.company.toLowerCase().includes(searchValue.toLowerCase()) ||
        client.demanda.toLowerCase().includes(searchValue.toLowerCase());
      const matchesMedia = !selectedMedia || client.media === selectedMedia;
      const matchesStatus = !selectedStatus || client.status === selectedStatus;
      return matchesSearch && matchesMedia && matchesStatus;
    });
  }, [clients, searchValue, selectedMedia, selectedStatus]);

  const handleSaveClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={Users}
          iconColor="from-blue-600 to-blue-700"
          title="Clientes"
          subtitle="Gestão completa de contas, saldos e performance"
          actions={
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition text-sm font-semibold text-white"
            >
              <Plus size={14} strokeWidth={3} />
              Novo Cliente
            </motion.button>
          }
        />

        {/* Filter bar */}
        <div className="px-8 lg:px-12 py-4 border-b border-[#2A2F3A] bg-[#0F1117] flex flex-wrap gap-3 items-center flex-shrink-0">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Buscar cliente ou empresa..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="w-full bg-[#181C25] border border-[#2A2F3A] rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-[#A1A1AA] focus:outline-none focus:border-red-500/50"
            />
          </div>

          {/* Mídia filter */}
          <div className="relative">
            <button
              onClick={() => setShowMediaFilter(!showMediaFilter)}
              className="flex items-center gap-2 px-3 py-2 bg-[#181C25] border border-[#2A2F3A] rounded-xl text-sm text-[#A1A1AA] hover:border-[#3A3F4A] transition"
            >
              <Filter size={13} />
              Mídia
              {selectedMedia && <span className="text-red-400">•</span>}
              <ChevronDown size={13} />
            </button>
            {showMediaFilter && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-0 bg-[#181C25] border border-[#2A2F3A] rounded-xl shadow-xl z-50 min-w-44"
              >
                {['', 'Google Ads', 'Meta Ads', 'Google + Meta'].map(m => (
                  <button
                    key={m}
                    onClick={() => { setSelectedMedia(m); setShowMediaFilter(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm border-b border-[#2A2F3A] last:border-0 transition ${selectedMedia === m ? 'text-red-400 bg-red-500/10' : 'text-[#A1A1AA] hover:bg-white/5'}`}
                  >
                    {m || 'Todos'}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              onClick={() => setShowStatusFilter(!showStatusFilter)}
              className="flex items-center gap-2 px-3 py-2 bg-[#181C25] border border-[#2A2F3A] rounded-xl text-sm text-[#A1A1AA] hover:border-[#3A3F4A] transition"
            >
              <Filter size={13} />
              Status
              {selectedStatus && <span className="text-red-400">•</span>}
              <ChevronDown size={13} />
            </button>
            {showStatusFilter && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-0 bg-[#181C25] border border-[#2A2F3A] rounded-xl shadow-xl z-50 min-w-44"
              >
                {[
                  { v: '', l: 'Todos' },
                  { v: 'feito', l: '✓ Feito' },
                  { v: 'a_fazer', l: '○ A Fazer' },
                  { v: 'cliente', l: '⊗ Cliente' },
                  { v: 'pausado', l: '∥ Pausado' },
                  { v: 'urgente', l: '! Urgente' },
                ].map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => { setSelectedStatus(v); setShowStatusFilter(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm border-b border-[#2A2F3A] last:border-0 transition ${selectedStatus === v ? 'text-red-400 bg-red-500/10' : 'text-[#A1A1AA] hover:bg-white/5'}`}
                  >
                    {l}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <span className="ml-auto text-xs text-[#A1A1AA]">
            {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main */}
          <div className="flex-1 p-8 lg:p-12 overflow-auto">
            <KPICardsAB clients={filteredClients} />
            <ClientsTable
              clients={filteredClients}
              onEditClient={client => {
                setEditingClient(client);
                setIsEditModalOpen(true);
              }}
            />
            <div className="h-20" />
          </div>

          {/* Side panel */}
          <div className="w-80 border-l border-[#2A2F3A] bg-[#0F1117] hidden lg:block overflow-y-auto">
            <InsightsPanel clients={filteredClients} />
          </div>
        </div>
      </div>

      <ClientEditModal
        client={editingClient}
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingClient(null); }}
        onSave={handleSaveClient}
      />
    </DashboardLayout>
  );
}
