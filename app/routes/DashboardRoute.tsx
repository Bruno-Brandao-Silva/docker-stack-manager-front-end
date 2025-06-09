import React from 'react';
import type { ClientOutput, StackOutput, ServiceOutput } from '../api'; // Importa tipos da API
import { DataTable } from '../components/DataTable'; // Importa o componente DataTable

interface DashboardRouteProps {
    onViewClientDetail: (clientId: string) => void;
    clients: ClientOutput[];
    stacks: StackOutput[];
    services: ServiceOutput[];
    loading: { clients: boolean; stacks: boolean; services: boolean };
    error: { clients: string | null; stacks: string | null; services: string | null };
}

export const DashboardRoute: React.FC<DashboardRouteProps> = ({ onViewClientDetail, clients, stacks, services, loading, error }) => (
    <div id="dashboard-screen">
        <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl flex flex-col items-start">
                <p className="text-lg text-gray-400 mb-2">Clientes cadastrados</p>
                {loading.clients ? <span className="text-5xl font-bold text-gray-500">...</span> : <span className="text-5xl font-bold text-white">{clients.length}</span>}
            </div>
            <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl flex flex-col items-start">
                <p className="text-lg text-gray-400 mb-2">Stacks cadastradas</p>
                {loading.stacks ? <span className="text-5xl font-bold text-gray-500">...</span> : <span className="text-5xl font-bold text-white">{stacks.length}</span>}
            </div>
            <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl flex flex-col items-start">
                <p className="text-lg text-gray-400 mb-2">Serviços cadastrados</p>
                {loading.services ? <span className="text-5xl font-bold text-gray-500">...</span> : <span className="text-5xl font-bold text-white">{services.length}</span>}
            </div>
        </div>

        <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Status dos Contêineres</h3>
            <DataTable
                headers={[
                    { key: 'name', label: 'Cliente' },
                    { key: 'status', label: 'Status Compose' },
                    { key: 'activeContainers', label: 'Contêineres Ativos' },
                    { key: 'lastUpdate', label: 'Última Atualização' },
                ]}
                data={clients.map(c => ({
                    _id: c._id,
                    name: c.name,
                    status: c.deployment?.status === 'up' ? 'UP' : 'DOWN', // Status mockado baseado no deploy
                    activeContainers: c.deployment?.status === 'up' ? Math.floor(Math.random() * 10) + 1 : 0, // Contêineres ativos mockados
                    lastUpdate: c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(c.created_at).toLocaleTimeString('pt-BR') : 'N/A',
                }))}
                onRowClick={(item) => item._id && onViewClientDetail(item._id as string)}
                renderCell={(item, key) => {
                    if (key === 'status') {
                        return (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase ${item.status === 'UP' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'} text-white`}>
                                {item.status}
                            </span>
                        );
                    }
                    return item[key as keyof typeof item];
                }}
                loading={loading.clients}
                error={error.clients}
            />
        </div>
    </div>
);
