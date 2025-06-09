import React from 'react';
import type { StackOutput } from '../api'; // Importa tipos da API
import { DataTable } from '../components/DataTable'; // Importa o componente DataTable

interface StacksRouteProps {
    onViewStackDetail: (stackId: string) => void;
    onOpenStackModal: (editMode: boolean, stack?: StackOutput) => void;
    stacks: StackOutput[];
    loading: boolean;
    error: string | null;
    onDeleteStack: (stackId: string) => Promise<void>;
}

export const StacksRoute: React.FC<StacksRouteProps> = ({ onViewStackDetail, onOpenStackModal, stacks, loading, error, onDeleteStack }) => (
    <div id="stacks-screen">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Lista de Stacks</h2>
            <div className="flex items-center space-x-4">
                <input type="text" placeholder="Buscar stack..." className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-64 placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" />
                <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none" onClick={() => onOpenStackModal(false)}>
                    <i className="fas fa-plus mr-2"></i> Nova Stack
                </button>
            </div>
        </div>

        <DataTable
            headers={[
                { key: '_id', label: 'ID', className: 'font-mono text-gray-400' },
                { key: 'name', label: 'Nome da Stack' },
                { key: 'servicesCount', label: 'Qtd. Serviços' },
                { key: 'createdAt', label: 'Criado Em' },
            ]}
            data={stacks.map(s => ({
                ...s,
                servicesCount: s.services?.length || 0,
                createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(s.created_at).toLocaleTimeString('pt-BR') : 'N/A',
            }))}
            onRowClick={(item) => item._id && onViewStackDetail(item._id as string)}
            renderCell={(item, key) => {
                if (key === '_id') return item._id?.substring(0, 8) + '...' + item._id?.substring(item._id.length - 4);
                return item[key as keyof typeof item];
            }}
            renderActions={(item) => (
                <>
                    <button className="text-gray-400 hover:text-white mr-3" onClick={(e) => { e.stopPropagation(); onOpenStackModal(true, item); }}><i className="fas fa-edit"></i></button>
                    <button className="text-gray-400 hover:text-red-500" onClick={async (e) => { e.stopPropagation(); if (item._id) await onDeleteStack(item._id as string); }}><i className="fas fa-trash-alt"></i></button>
                </>
            )}
            loading={loading}
            error={error}
        />
    </div>
);
