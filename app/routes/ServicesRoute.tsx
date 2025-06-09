import React from 'react';
import type { ServiceOutput } from '../api'; // Importa tipos da API
import { DataTable } from '../components/DataTable'; // Importa o componente DataTable

interface ServicesRouteProps {
    onViewServiceDetail: (serviceId: string) => void;
    onOpenServiceModal: (editMode: boolean, service?: ServiceOutput) => void;
    services: ServiceOutput[];
    loading: boolean;
    error: string | null;
    onDeleteService: (serviceId: string) => Promise<void>;
}

export const ServicesRoute: React.FC<ServicesRouteProps> = ({ onViewServiceDetail, onOpenServiceModal, services, loading, error, onDeleteService }) => (
    <div id="services-screen">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Lista de Serviços</h2>
            <div className="flex items-center space-x-4">
                <input type="text" placeholder="Buscar serviço..." className="bg-[#262626] border border-[#2E2E2E] rounded-md p-3 text-white text-base w-64 placeholder:text-[#777777] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/50" />
                <button className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold cursor-pointer transition-colors duration-200 bg-[#06B6D4] text-white hover:opacity-90 border-none" onClick={() => onOpenServiceModal(false)}>
                    <i className="fas fa-plus mr-2"></i> Novo Serviço
                </button>
            </div>
        </div>

        <DataTable
            headers={[
                { key: '_id', label: 'ID', className: 'font-mono text-gray-400' },
                { key: 'name', label: 'Nome do Serviço' },
                { key: 'image', label: 'Imagem', className: 'font-mono' },
                { key: 'dependenciesCount', label: 'Dependências' },
                { key: 'createdAt', label: 'Criado Em' },
            ]}
            data={services.map(s => ({
                ...s,
                name: s.docker_config.name,
                image: s.docker_config.image || 'N/A',
                dependenciesCount: Array.isArray(s.docker_config.depends_on) ? s.docker_config.depends_on.length : 0,
                createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(s.created_at).toLocaleTimeString('pt-BR') : 'N/A',
            }))}
            onRowClick={(item) => item._id && onViewServiceDetail(item._id as string)}
            renderCell={(item, key) => {
                if (key === '_id') return item._id?.substring(0, 8) + '...' + item._id?.substring(item._id.length - 4);
                return item[key as keyof typeof item];
            }}
            renderActions={(item) => (
                <>
                    <button className="text-gray-400 hover:text-white mr-3" onClick={(e) => { e.stopPropagation(); onOpenServiceModal(true, item); }}><i className="fas fa-edit"></i></button>
                    <button className="text-gray-400 hover:text-red-500" onClick={async (e) => { e.stopPropagation(); if (item._id) await onDeleteService(item._id as string); }}><i className="fas fa-trash-alt"></i></button>
                </>
            )}
            loading={loading}
            error={error}
        />
    </div>
);
