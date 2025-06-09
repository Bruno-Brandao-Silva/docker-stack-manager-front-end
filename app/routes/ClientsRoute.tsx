import React from 'react';
import type { ClientOutput } from '../api'; // Importa tipos da API
import { DataTable } from '../components/DataTable'; // Importa o componente DataTable

interface ClientsRouteProps {
    onViewClientDetail: (clientId: string) => void;
    onOpenClientModal: (editMode: boolean, client?: ClientOutput) => void;
    clients: ClientOutput[];
    loading: boolean;
    error: string | null;
    onDeleteClient: (clientId: string) => Promise<void>;
}

export const ClientsRoute: React.FC<ClientsRouteProps> = ({ onViewClientDetail, onOpenClientModal, clients, loading, error, onDeleteClient }) => (
    <div id="clients-screen">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Lista de Clientes</h2>
            <div className="flex items-center space-x-4">
                <input type="text" placeholder="Buscar cliente..." className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-64 placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" />
                <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none" onClick={() => onOpenClientModal(false)}>
                    <i className="fas fa-plus mr-2"></i> Novo Cliente
                </button>
            </div>
        </div>

        <DataTable
            headers={[
                { key: '_id', label: 'ID', className: 'font-mono text-gray-400' },
                { key: 'name', label: 'Nome' },
                { key: 'stacksCount', label: 'Qtd. Stacks' },
                { key: 'status', label: 'Status Compose' },
                { key: 'lastUpdate', label: 'Última Atualização' },
            ]}
            data={clients.map(c => ({
                ...c,
                stacksCount: c.stacks?.length || 0,
                status: c.deployment?.status === 'up' ? 'UP' : 'DOWN', // Status mockado baseado no deploy
                lastUpdate: c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(c.created_at).toLocaleTimeString('pt-BR') : 'N/A',
            }))}
            onRowClick={(item) => item._id && onViewClientDetail(item._id as string)}
            renderCell={(item, key) => {
                if (key === '_id') return item._id?.substring(0, 8) + '...' + item._id?.substring(item._id.length - 4);
                if (key === 'status') {
                    return (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase ${item.status === 'UP' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'} text-white`}>
                            {item.status}
                        </span>
                    );
                }
                return item[key as keyof typeof item];
            }}
            renderActions={(item) => (
                <>
                    <button className="text-gray-400 hover:text-white mr-3" onClick={(e) => { e.stopPropagation(); onOpenClientModal(true, item); }}><i className="fas fa-edit"></i></button>
                    <button className="text-gray-400 hover:text-red-500" onClick={async (e) => { e.stopPropagation(); if (item._id) await onDeleteClient(item._id as string); }}><i className="fas fa-trash-alt"></i></button>
                </>
            )}
            loading={loading}
            error={error}
            pagination={
                <div className="flex justify-center">
                    <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none mr-2">Anterior</button>
                    <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none">1</button>
                    <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#2A2A2A] text-[#EEEEEE] hover:bg-[#2E2E2E] border-none ml-2">Próximo</button>
                </div>
            }
        />
    </div>
);
