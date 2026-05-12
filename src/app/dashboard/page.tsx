'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import KPICardsAB from '@/components/KPICardsAB';
import ClientsTable from '@/components/ClientsTable';
import InsightsPanel from '@/components/InsightsPanel';
import ClientEditModal from '@/components/ClientEditModal';
import { mockClients, Client } from '@/data/mockClients';

export default function DashboardPage() {
  const [searchValue, setSearchValue]     = useState('');
  const [selectedMedia, setSelectedMedia] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>(mockClients);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        client.company.toLowerCase().includes(searchValue.toLowerCase()) ||
        client.demanda.toLowerCase().includes(searchValue.toLowerCase());
      const matchesMedia  = !selectedMedia  || client.media   === selectedMedia;
      const matchesStatus = !selectedStatus || client.status  === selectedStatus;
      return matchesSearch && matchesMedia && matchesStatus;
    });
  }, [clients, searchValue, selectedMedia, selectedStatus]);

  const handleSaveClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <DashboardHeader
          onSearchChange={setSearchValue}
          onMediaFilterChange={setSelectedMedia}
          onStatusFilterChange={setSelectedStatus}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Main content */}
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
